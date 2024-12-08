// Imports
import express, { query } from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { handleClientError, handleSuccessOK, validateRequestBody, handleServerError, handleUnauthorizedError, handleNotFoundError, handleSuccessCreated } from './errorHandler.mjs';

const app = express();
app.use(bodyParser.json());

// URL strings
const studentID = '/M00950516';
const users = '/users';
const login = '/login';
const contents = '/contents';
const follow = '/follow';
const search = '/search';

// MongoDB
const connectionURI = 'mongodb://127.0.0.1:27017?retryWrites=true&w=majority';

const client = new MongoClient(connectionURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true
    }
});

// Database and Collections
const database = client.db("cst2120");
const usersCollection = database.collection("users");
const postsCollection = database.collection("posts");

// Cookie
app.use(expressSession({
    secret: "cst2120 secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("./frontend"));

// Registration
app.post(studentID + users, async (req, res) => {
    /* Client sends user registration data in JSON format to web service with a POST request.
       User data is stored in MongoDB. Web service replies with the result of the operation
       in JSON format.
    */
    const { username, password, email } = req.body;

    if (!validateRequestBody(res, req.body, ["username", "password", "email"])) return;

    try {
        // Check if the username or email already exists
        const existingUser = await usersCollection.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            return handleClientError(res, 400, "Username or email already exists.");
        };

        // Insert new user into the database
        await usersCollection.insertOne({
            username,
            password,
            email,
            follows: []
        });

        handleSuccessCreated(res, null, "Registration successful!");
    } catch (err) {
        handleServerError(res, err, "Error during registration.");
    };
});

// Login
/* Session management is applied correctly to track user’s login status across multiple HTTP
   requests.
*/
app.get(studentID + login, (req, res) => {
    /* Client sends GET request for login status to web service. Web service returns login
       status in JSON format.
    */
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false, user: null });
    };
});

app.post(studentID + login, async (req, res) => {
    /* Client sends user’s login data in JSON format to web service with a POST request.
       User’s login data is checked against user records in MongoDB. Web service replies
       with the result of the operation in JSON format.
    */
    const { username, password } = req.body;

    if (!validateRequestBody(res, req.body, ["username", "password"])) return;

    try {
        const user = await usersCollection.findOne({ username });

        if (!user || user.password !== password) {
            return handleUnauthorizedError(res, "Invalid credentials.");
        };

        // Create a session for the logged-in user
        req.session.user = { username: user.username, email: user.email };

        // Send success response
        handleSuccessOK(res, null, "Login Successful!");
    } catch (err) {
        handleServerError(res, err, "Error during login.");
    };
});

app.delete(studentID + login, (req, res) => {
    /* Client sends DELETE request to log the user out. Web service replies with confirmation
       message in JSON format.
    */
    if (req.session) {
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                return handleServerError(res, err, "Failed to log out. Please try again.");
            }
            handleSuccessOK(res, null, "Logout Successful!");
        });
    } else {
        handleClientError(res, 400, "No active session to log out.");
    };
});

// Social networking
app.post(studentID + contents, async (req, res) => {
    /* Client sends text contents, such as blog or recipe, in JSON format to web service with
       POST request. Contents are stored in MongoDB. Web service replies with the result of
       the operation in JSON format.
    */
    const { username, text, image } = req.body;

    if (!text && !image) {
        return handleClientError(res, 400, "Content is required.");
    };

    if (image && !isValidImage(image)) {
        return handleClientError(res, 400, "Invalid image format.");
    };

    try {
        // Insert the content into the database
        const result = await postsCollection.insertOne({ username, text, image, createdAt: new Date() });
        handleSuccessCreated(res, { id: result.insertedId, username, text, image }, "Content posted successfully!");
    } catch (err) {
        handleServerError(res, err, "Failed to post content. Please try again.");
    };
});

app.get(studentID + contents, async (req, res) => {
    /* Client sends GET request to web service for contents that have been uploaded by other
       users that the user is following. The web service retrieves the contents from MongoDB
       and sends them to client in JSON format.
    */
    if (!req.session || !req.session.user) {
        return handleUnauthorizedError(res, "Unauthorized. Please log in.");
    };

    const username = req.session.user.username;

    try {
        // Find the logged-in user's follows list
        const user = await usersCollection.findOne({ username });

        if (!user || !user.follows) {
            return handleNotFoundError(res, "No followed users found.");
        };

        // Fetch posts from followed users
        const posts = await postsCollection.find({ username: { $in: user.follows } }).toArray();

        handleSuccessOK(res, posts, "Found Content!");
    } catch (err) {
        handleServerError(res, err, "Failed to retrieve content. Please try again.");
    };
});

app.post(studentID + follow, async (req, res) => {
    /* Client sends a request to follow another user to web service using POST request.
       The user who is being followed can be sent in JSON format in the body of the message
       or appended to the path, for example: POST ../follow/tom23. The follow information is
       stored in MongoDB. Web service replies with confirmation message in JSON format.
    */
    if (!req.session || !req.session.user) {
        return handleUnauthorizedError(res, "Unauthorized. Please log in.");
    };

    const { usernameToFollow } = req.body;
    const currentUser = req.session.user.username;
    const userToFollow = await usersCollection.findOne({ username: usernameToFollow });

    if (!usernameToFollow) {
        return handleClientError(res, 400, "Username to follow is required.");
    };

    if (!userToFollow) {
        return handleClientError(res, 400, "User doesn't exist.");
    };

    if (usernameToFollow === currentUser) {
        return handleClientError(res, 400, "You cannot follow yourself.");
    };

    try {
        // Add the username to the current user's follows list
        await usersCollection.updateOne(
            { username: currentUser },
            { $addToSet: { follows: usernameToFollow } } // $addToSet avoids duplicates
        );

        handleSuccessOK(res, null, `Now Following: ${usernameToFollow}.`);
    } catch (err) {
        handleServerError(res, err, "Failed to follow user. Please try again.");
    };
});

app.delete(studentID + follow, async (req, res) => {
    /* Client sends a request to stop following another user to web service using POST
       request. The user who is being unfollowed can be sent in JSON format in the body of
       the message or appended to the path, for example: DELETE ../follow/tom23. The database
       is updated, and the web service replies with a confirmation message in JSON format.
    */
    if (!req.session || !req.session.user) {
        return handleUnauthorizedError(res, "Unauthorized. Please log in.");
    };

    const { usernameToUnfollow } = req.body;
    const currentUser = req.session.user.username;

    if (!usernameToUnfollow) {
        return handleClientError(res, 400, "Username to unfollow is required.");
    };

    try {
        // Remove the username from the current user's follows list
        await usersCollection.updateOne(
            { username: currentUser },
            { $pull: { follows: usernameToUnfollow } } // $pull removes the user
        );

        handleSuccessOK(res, null, `Unfollowed: ${usernameToUnfollow}.`);
    } catch (err) {
        handleServerError(res, err, "Failed to unfollow user. Please try again.")
    };
});

// Search
app.get(studentID + users + search, async (req, res) => {
    /* Client sends GET request to search for users that match a query. The query is encoded
       as a URL query parameter, for example: GET …/users/search?q=tom. Database is searched
       for users who match query, and the results are sent back to the client in JSON format.
    */
    const searchTerm = req.query.q;
    if (!searchTerm) {
        return handleClientError(res, 400, "No query specified");
    };

    const results = await postsCollection.find({
        $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } }
        ]
    }).toArray();

    res.send(results);
});

app.get(studentID + contents + search, async (req, res) => {
    /* Client sends GET request to search for contents of posts, recipes, etc. that match a
       query. The search does not have to be limited to users that are being followed – they
       can be shared by any user. The query is encoded as a URL query parameter, for example:
       GET …/contents/search?q=football. Database is searched for contents that match query,
       and the results are sent back to the client in JSON format.
    */
    const searchTerm = req.query.q;
    if (!searchTerm) {
        return handleClientError(res, 400, "No query specified");
    };

    const results = await postsCollection.find({
        $or: [
            { username: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
            { text: { $regex: searchTerm, $options: "i" } }
        ]
    }).toArray();

    res.send(results);
});

function isValidImage(image) {
    return /^(https?;\/\/.*\.(?:png|jpe?g|gif|webp|svg))$/i.test(image);
};

app.listen(8080, () => console.log("Server running on port 8080"));