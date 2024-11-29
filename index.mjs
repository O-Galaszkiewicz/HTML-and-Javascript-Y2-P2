// Imports
import express, { query } from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

const app = express();
app.use(bodyParser.json());

// URL strings
const studentID = '/M00950516';
const register = '/users';
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
})

const database = client.db("cst2120");
const userCollection = database.collection("user");

// Cookie
app.use(expressSession({
    secret: "cst2120 secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}))

app.use(express.static("./frontend"));

/* Demo Code

// JSON Text on screen
app.get(studentID + home, (req, res) => {
    res.send({"Hello": true});
    })

    // Store data into an array
    app.post(studentID + home, (req, res) => {
    console.log(req.path);
    console.log(req.body);
    usersArray.push(req.body);
    res.send(usersArray);
})
*/

// Main Code

// Registration
app.post(studentID + register, (req, res) => {
    /* Client sends user registration data in JSON format to web service with a POST request.
       User data is stored in MongoDB. Web service replies with the result of the operation
       in JSON format.
       */
    const data = req.body;
    console.log(data);
    res.send({ message: true });
});

/*
app.get(studentID + register, async (req, res) => {
    if (req.query.q === undefined) {
        res.send({error: true, message: "No query parameter"})
        return;
    }
    const query = {name: req.query.q};

    const results = await userCollection.find(query).toArray();
    res.send(results);
})
*/

app.get(studentID + register, (req, res) => {
    const query = { $text : { $search: $username_text} }
})

// Login
/* Session management is applied correctly to track user’s login status across multiple HTTP
   requests.
*/
app.get(studentID + login, (req, res) => {
    /* Client sends GET request for login status to web service. Web service returns login
    status in JSON format.
    */
})

app.post(studentID + login, (req, res) => {
    /* Client sends user’s login data in JSON format to web service with a POST request.
    User’s login data is checked against user records in MongoDB. Web service replies
    with the result of the operation in JSON format.
    */
})

app.delete(studentID + login, (req, res) => {
    /* Client sends DELETE request to log the user out. Web service replies with confirmation
       message in JSON format.
    */
})

// Social networking
app.post(studentID + contents, (req, res) => {
    /* Client sends text contents, such as blog or recipe, in JSON format to web service with
       POST request. Contents are stored in MongoDB. Web service replies with the result of
       the operation in JSON format.
    */
})

app.get(studentID + contents, (req, res) => {
    /* Client sends GET request to web service for contents that have been uploaded by other
       users that the user is following. The web service retrieves the contents from MongoDB
       and sends them to client in JSON format.
    */
})

app.post(studentID + follow, (req, res) => {
    /* Client sends a request to follow another user to web service using POST request.
    The user who is being followed can be sent in JSON format in the body of the message
    or appended to the path, for example: POST ../follow/tom23. The follow information is
       stored in MongoDB. Web service replies with confirmation message in JSON format.
    */
})

app.delete(studentID + follow, (req, res) => {
    /* Client sends a request to stop following another user to web service using POST
       request. The user who is being unfollowed can be sent in JSON format in the body of
       the message or appended to the path, for example: DELETE ../follow/tom23. The database
       is updated, and the web service replies with a confirmation message in JSON format.
    */
})

// Search
app.get(studentID + search, (req, res) => {
    /* Client sends GET request to search for users that match a query. The query is encoded
       as a URL query parameter, for example: GET …/users/search?q=tom. Database is searched
       for users who match query, and the results are sent back to the client in JSON format.
       */
})

app.get(studentID + search, (req, res) => {
    /* Client sends GET request to search for contents of posts, recipes, etc. that match a
       query. The search does not have to be limited to users that are being followed – they
       can be shared by any user. The query is encoded as a URL query parameter, for example:
       GET …/contents/search?q=football. Database is searched for contents that match query,
       and the results are sent back to the client in JSON format.
       */
})

app.listen(8080);