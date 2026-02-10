const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();

// load environment variables
dotenv.config();
const port = process.env.PORT || 3000; 


// connect to database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Database connected successfully'))
.catch((err) => {
    console.error('Database connection error', err);
    process.exit(1); // stop app if db fails
});

// user authentication
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});
// enforce on all endpoints
app.use(jwtCheck);
app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

// routes
app.get('/', (req, res) => {
    res.send('Hello World!')
});

// start server
app.listen(port, () => {
    console.log(`Listening at localhost:${port}`);
});