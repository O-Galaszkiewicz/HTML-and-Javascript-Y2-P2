// Imports
import express from "express";
import expressSession from "express-session";
import { body, validationResult } from "express-validator";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "../models/user.mjs";
import Post from "../models/post.mjs";
import { hashPassword, comparePassword } from "./bcryptUtils.mjs";
import {
    handleClientError,
    handleSuccessOK,
    validateRequestBody,
    handleServerError,
    handleUnauthorizedError,
    handleNotFoundError,
    handleSuccessCreated,
} from "./errorHandler.mjs";

const app = express();
app.use(bodyParser.json());

// URL strings
const studentID = "/M00950516";
const users = "/users";
const login = "/login";
const contents = "/contents";
const follow = "/follow";
const search = "/search";

// MongoDB Connection (Mongoose)
const connectionURI = "mongodb://127.0.0.1:27017/cst2120";

mongoose.connect(connectionURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB using Mongoose"))
    .catch(err => console.error("MongoDB connection error:", err));

// Cookie
app.use(expressSession({
    secret: "cst2120 secret",
    cookie: { maxAge: 60_000 },
    resave: false,
    saveUninitialized: true
}));

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        return res.redirect(studentID + login);
    };
};

app.use(express.static("../frontend"));

// Registration
app.post(studentID + users,
    // Validation
    body("username").isAlphanumeric().withMessage("Username must be alphanumeric."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("email").isEmail().withMessage("Invalid email address"),
    async (req, res) => {
        /* Client sends user registration data in JSON format to web service with a POST request.
           User data is stored in MongoDB. Web service replies with the result of the operation
           in JSON format.
        */

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        };

        const { username, password, email } = req.body;

        if (!validateRequestBody(res, req.body, ["username", "password", "email"])) return;

        try {
            // Check if the username or email already exists
            const existingUser = await User.findOne({
                $or: [{ username }, { email }],
            });

            if (existingUser) {
                return handleClientError(res, 400, "Username or email already exists.");
            };

            const hashedPass = await hashPassword(password);

            // Insert new user into the database
            const newUser = new User({ username, password: hashedPass, email, follows: [] });
            await newUser.save();

            handleSuccessCreated(res, null, "Registration successful!");
        } catch (err) {
            handleServerError(res, err, "Error during registration.");
        }
    });

// Login
/* Session management is applied correctly to track user’s login status across multiple HTTP
   requests.
*/
app.get(studentID + login, isAuth, (req, res) => {
    /* Client sends GET request for login status to web service. Web service returns login
       status in JSON format.
    */
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false, user: null });
    };
});

app.post(studentID + login,
    // Validation
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    async (req, res) => {
        /* Client sends user’s login data in JSON format to web service with a POST request.
           User’s login data is checked against user records in MongoDB. Web service replies
           with the result of the operation in JSON format.
        */

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        };

        const { username, password } = req.body;

        if (!validateRequestBody(res, req.body, ["username", "password"])) return;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                return handleUnauthorizedError(res, "Invalid credentials.");
            };

            const isMatch = await comparePassword(password, user.password);

            if (!isMatch) {
                return handleUnauthorizedError(res, "Invalid credentials.");
            };

            req.session.user = { username: user.username };

            handleSuccessOK(res, null, "Login Successful!");
        } catch (err) {
            handleServerError(res, err, "Error during login.");
        };
    });

app.delete(studentID + login, isAuth, (req, res) => {
    /* Client sends DELETE request to log the user out. Web service replies with confirmation
       message in JSON format.
    */
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return handleServerError(res, err, "Failed to log out. Please try again.");
            };
            handleSuccessOK(res, null, "Logout Successful!");
        });
    } else {
        handleClientError(res, 400, "No active session to log out.");
    };
});

// Social networking
app.post(studentID + contents, isAuth, async (req, res) => {
    /* Client sends text contents, such as blog or recipe, in JSON format to web service with
       POST request. Contents are stored in MongoDB. Web service replies with the result of
       the operation in JSON format.
    */
    const { username, text } = req.body;

    if (!text) {
        return handleClientError(res, 400, "Content is required.");
    };

    try {
        const newPost = new Post({ username, text, createdAt: new Date() });
        await newPost.save();
        handleSuccessCreated(res, { id: newPost._id, username, text }, "Content posted successfully!");
    } catch (err) {
        handleServerError(res, err, "Failed to post content. Please try again.");
    };
});

app.get(studentID + contents, isAuth, async (req, res) => {
    /* Client sends GET request to web service for contents that have been uploaded by other
       users that the user is following. The web service retrieves the contents from MongoDB
       and sends them to client in JSON format.
    */
    const username = req.session.user.username;

    try {
        const user = await User.findOne({ username });

        if (!user || !user.follows) {
            return handleNotFoundError(res, "No followed users found.");
        };

        const posts = await Post.find({ username: { $in: user.follows } });
        handleSuccessOK(res, posts, "Found Content!");
    } catch (err) {
        handleServerError(res, err, "Failed to retrieve content. Please try again.");
    };
});

app.post(studentID + follow,
    // Validation
    body("usernameToFollow").notEmpty().withMessage("Username to follow is required"),
    isAuth,
    async (req, res) => {
        /* Client sends a request to follow another user to web service using POST request.
           The user who is being followed can be sent in JSON format in the body of the message
           or appended to the path, for example: POST ../follow/tom23. The follow information is
           stored in MongoDB. Web service replies with confirmation message in JSON format.
        */

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        };

        const { usernameToFollow } = req.body;
        const currentUser = req.session.user.username;

        if (usernameToFollow === currentUser) {
            return handleClientError(res, 400, "You cannot follow yourself.");
        };

        try {
            const userToFollow = await User.findOne({ username: usernameToFollow });

            if (!userToFollow) {
                return handleClientError(res, 400, "User doesn't exist.");
            };

            await User.updateOne(
                { username: currentUser },
                { $addToSet: { follows: usernameToFollow } },
            );

            handleSuccessOK(res, null, `Now Following: ${usernameToFollow}.`);
        } catch (err) {
            handleServerError(res, err, "Failed to follow user. Please try again.");
        };
    });

app.delete(studentID + follow, isAuth, async (req, res) => {
    /* Client sends a request to stop following another user to web service using POST
       request. The user who is being unfollowed can be sent in JSON format in the body of
       the message or appended to the path, for example: DELETE ../follow/tom23. The database
       is updated, and the web service replies with a confirmation message in JSON format.
    */
    const { usernameToUnfollow } = req.body;
    const currentUser = req.session.user.username;

    if (!usernameToUnfollow) {
        return handleClientError(res, 400, "Username to unfollow is required.");
    };

    try {
        await User.updateOne(
            { username: currentUser },
            { $pull: { follows: usernameToUnfollow } },
        );

        handleSuccessOK(res, null, `Unfollowed: ${usernameToUnfollow}.`);
    } catch (err) {
        handleServerError(res, err, "Failed to unfollow user. Please try again.");
    };
});

// Search
app.get(studentID + users + search,
    // Validation
    query("q").notEmpty().withMessage("Search query is required"),
    async (req, res) => {
        /* Client sends GET request to search for users that match a query. The query is encoded
           as a URL query parameter, for example: GET …/users/search?q=tom. Database is searched
           for users who match query, and the results are sent back to the client in JSON format.
        */

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        };

        const searchTerm = req.query.q;

        const results = await User.find({
            username: { $regex: searchTerm, $options: "i" }
        });

        res.send(results);
    });

app.get(studentID + contents + search,
    // Validation
    query("q").notEmpty().withMessage("Search query is required"),
    async (req, res) => {
        /* Client sends GET request to search for contents of posts, recipes, etc. that match a
           query. The search does not have to be limited to users that are being followed – they
           can be shared by any user. The query is encoded as a URL query parameter, for example:
           GET …/contents/search?q=football. Database is searched for contents that match query,
           and the results are sent back to the client in JSON format.
        */

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        };

        const searchTerm = req.query.q;

        if (!searchTerm) {
            return handleClientError(res, 400, "No query specified");
        };

        const results = await Post.find({
            text: { $regex: searchTerm, $options: "i" }
        });

        res.send(results);
    });

app.listen(8080, () => console.log("Server running on port 8080"));