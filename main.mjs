import express from "express";
import expressSession from "express-session";
import { body, query, validationResult } from "express-validator";
import bodyParser from "body-parser";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword, comparePassword } from "./backend/bcryptUtils.mjs";
import {
    handleClientError,
    handleSuccessOK,
    validateRequestBody,
    handleServerError,
    handleUnauthorizedError,
    handleNotFoundError,
    handleInvalidRequestError,
    handleSuccessCreated
} from "./backend/errorHandler.mjs";

const app = express();
app.use(bodyParser.json());

// URL strings
const studentID = "/M00950516";
const users = "/users";
const login = "/login";
const contents = "/contents";
const follow = "/follow";
const search = "/search";

// MongoDB Connection
const connectionURI = "mongodb://127.0.0.1:27017/cst2120";
const client = new MongoClient(connectionURI);

client.connect()
    .then(async () => {
        console.log("Connected to MongoDB");
        const db = client.db("cst2120");
        app.locals.db = db;
        app.listen(8080, () => console.log("Server running on port 8080"));
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Cookie
app.use(expressSession({
    secret: "cst2120 secret",
    cookie: { maxAge: 600_000 },
    resave: false,
    saveUninitialized: true
}));

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        return res.redirect(studentID + login);
    }
};

app.use(express.static("public"));

// Registration Route
app.post(studentID + users,
    body("username").notEmpty().withMessage("Username must be filled."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("email").isEmail().withMessage("Invalid email address."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        }

        const { username, password, email } = req.body;
        const db = req.app.locals.db;

        if (!validateRequestBody(res, req.body, ["username", "password", "email"])) return;

        try {
            const existingUser = await db.collection("users").findOne({
                $or: [{ username }, { email }],
            });

            if (existingUser) {
                return handleClientError(res, 400, "Username or email already exists.");
            }

            const hashedPass = await hashPassword(password);

            await db.collection("users").insertOne({
                username,
                password: hashedPass,
                email: email.toLowerCase(),
                follows: [],
            });

            handleSuccessCreated(res, null, "Registration successful!");
        } catch (err) {
            handleServerError(res, err, "Error during registration.");
        }
    }
);

// Login Routes
app.get(studentID + login, (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false, user: null });
    }
});

app.post(studentID + login,
    body("username").notEmpty().withMessage("Username is required."),
    body("password").notEmpty().withMessage("Password is required."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        }

        const { username, password } = req.body;
        const db = req.app.locals.db;

        if (!validateRequestBody(res, req.body, ["username", "password"])) return;

        try {
            const user = await db.collection("users").findOne({ username });
            if (!user) {
                return handleUnauthorizedError(res, "Invalid credentials.");
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return handleUnauthorizedError(res, "Invalid credentials.");
            }

            req.session.isAuth = true;
            req.session.user = { username: user.username };
            handleSuccessOK(res, null, "Login successful!");
        } catch (err) {
            handleServerError(res, err, "Error during login.");
        }
    }
);

app.delete(studentID + login, isAuth, (req, res) => {
    if (req.session.isAuth) {
        req.session.destroy(err => {
            if (err) {
                return handleServerError(res, err, "Failed to log out. Please try again.");
            }
            handleSuccessOK(res, null, "Logout successful!");
        });
    } else {
        handleClientError(res, 400, "No active session to log out.");
    }
});

// Post Routes
app.post(studentID + contents, isAuth, async (req, res) => {
    const username = req.session.user.username;
    const { text } = req.body;

    if (!text) {
        return handleClientError(res, 400, "Content is required.");
    }

    try {
        const db = req.app.locals.db;
        const post = {
            username,
            text,
            createdAt: new Date(),
        };

        const result = await db.collection("posts").insertOne(post);

        handleSuccessCreated(res, { id: result.insertedId, username, text }, "Content posted successfully!");
    } catch (err) {
        handleServerError(res, err, "Failed to post content. Please try again.");
    }
});

app.get(studentID + contents, isAuth, async (req, res) => {
    const username = req.session.user.username;

    try {
        const db = req.app.locals.db;
        const user = await db.collection("users").findOne({ username });

        if (!user || !user.follows) {
            return handleNotFoundError(res, "No followed users found.");
        }

        const posts = await db.collection("posts")
            .find({ username: { $in: user.follows } })
            .sort({ createdAt: -1 })
            .toArray();

        handleSuccessOK(res, posts, "Found content!");
    } catch (err) {
        handleServerError(res, err, "Failed to retrieve content. Please try again.");
    }
});

// Follow a User
app.post(studentID + follow,
    body("usernameToFollow").notEmpty().withMessage("Username to follow is required"),
    isAuth,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        }

        const currentUser = req.session.user.username;
        const { usernameToFollow } = req.body;

        if (usernameToFollow === currentUser) {
            return handleClientError(res, 400, "You cannot follow yourself.");
        }

        try {
            const db = req.app.locals.db;

            const userToFollow = await db.collection("users").findOne({ username: usernameToFollow });
            if (!userToFollow) {
                return handleClientError(res, 400, "User doesn't exist.");
            }

            await db.collection("users").updateOne(
                { username: currentUser },
                { $addToSet: { follows: usernameToFollow } }
            );

            handleSuccessOK(res, null, `Now following: ${usernameToFollow}.`);
        } catch (err) {
            handleServerError(res, err, "Failed to follow user. Please try again.");
        }
    }
);

// Check if a specific user is followed by the current logged-in user
app.get(studentID + follow, isAuth, async (req, res) => {
    const currentUser = req.session.user.username;
    const { username } = req.query; // Get the username from the query parameter

    try {
        const db = req.app.locals.db;
        const user = await db.collection("users").findOne({ username: currentUser });
        if (!user) {
            return handleNotFoundError(res, "User not found.");
        }

        // Check if the username is in the current user's follows list
        const isFollowed = username ? user.follows.includes(username) : false;

        handleSuccessOK(
            res,
            { isFollowed, follows: user.follows },
            "Fetched followed users."
        );
    } catch (err) {
        handleServerError(res, err, "Failed to retrieve followed users.");
    }
});


// Unfollow a User
app.delete(studentID + follow, isAuth, async (req, res) => {
    const currentUser = req.session.user.username;
    const { usernameToUnfollow } = req.body;

    if (!usernameToUnfollow) {
        return handleClientError(res, 400, "Username to unfollow is required.");
    }

    try {
        const db = req.app.locals.db;

        // Check if the user to unfollow exists
        const userToUnfollow = await db.collection("users").findOne({ username: usernameToUnfollow });
        if (!userToUnfollow) {
            return handleNotFoundError(res, `User "${usernameToUnfollow}" does not exist.`);
        }

        // Proceed to remove the user from the current user's follows list
        const updateResult = await db.collection("users").updateOne(
            { username: currentUser },
            { $pull: { follows: usernameToUnfollow } }
        );

        if (updateResult.modifiedCount === 0) {
            return handleClientError(res, 400, `You were not following "${usernameToUnfollow}".`);
        }

        handleSuccessOK(res, null, `Unfollowed: ${usernameToUnfollow}.`);
    } catch (err) {
        handleServerError(res, err, "Failed to unfollow user. Please try again.");
    }
});

// Search Users
app.get(studentID + users + search,
    query("q").notEmpty().withMessage("Search query is required"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        }

        const searchTerm = req.query.q;

        try {
            const db = req.app.locals.db;

            const results = await db.collection("users")
                .find({ username: { $regex: searchTerm, $options: "i" } })
                .project({ username: 1}) // Return only specific fields
                .toArray();

            handleSuccessOK(res, results, "Users found.");
        } catch (err) {
            handleServerError(res, err, "Failed to search users.");
        }
    }
);

// Search Posts
app.get(studentID + contents + search,
    query("q").notEmpty().withMessage("Search query is required"),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return handleInvalidRequestError(res, errors.array());
        }

        const searchTerm = req.query.q;

        try {
            const db = req.app.locals.db;

            const results = await db.collection("posts")
                .find({ text: { $regex: searchTerm, $options: "i" } })
                .sort({ createdAt: -1 }) // Sort posts by most recent
                .toArray();

            handleSuccessOK(res, results, "Posts found.");
        } catch (err) {
            handleServerError(res, err, "Failed to search posts.");
        }
    }
);