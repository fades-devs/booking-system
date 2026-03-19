const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const User = require('./User');


const app = express();

app.use(express.json());


// load environment variables
dotenv.config();
const PORT = process.env.PORT || 3000; 

const MONGO_URI = process.env.MONGO_URI


// connect to database
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB Database connected successfully'))
.catch((err) => {
    console.error('Database connection error', err);
    process.exit(1); // stop app if db fails
});


// user authentication
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// enforce on all endpoints
// app.use(jwtCheck);

// add health check ?

// Public route - no authentication required
app.get('/api/public', (req, res) => {
  res.json({
    message: 'Hello from a public endpoint! No authentication required.',
  });
});

// Protected route - requires valid JWT
app.get('/api/private', checkJwt, (req, res) => {
  res.json({
    message: 'Hello from a private endpoint!',
    user: req.auth.payload.sub,
  });
});

app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

// route to sync user (register or login)
app.post('/api/v1/auth/sync', checkJwt, async (req, res) => {
    try {

        // get the auth0 id from the request token (will be passed by frontend)
        const auth0Id = req.auth.payload.sub;

        // MORE OPTIMISED - RETURN EARLY -> APPLY THIS LOGIC TO ALL API
        // if existing user, update (later)
        const userExist = await User.findOne({auth0Id});
        if (userExist) {
            return res.status(200).json(userExist);
        }

        // if new user, add to db
        // get user info from request body (will be passed by frontend)
        const {name, email} = req.body;
        const userData = new User({
            auth0Id,
            email,
            name
        });
        await userData.save();
        res.status(201).json(userData);
        }

    catch (error) {
        console.error("Error in user sync:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to get specific user (for other services)
app.get('/api/v1/user/:authid', async(req, res) => {
    const user = await User.findOne({auth0Id: req.params.authid});
    res.status(200).json(user);
});

// routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// start server
app.listen(PORT, () => {
    console.log(`Listening at localhost:${PORT}`);
});