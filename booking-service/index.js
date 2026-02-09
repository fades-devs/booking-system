const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = express();

// load environment variables
dotenv.config();
const port = process.env.PORT || 3002; 


// connect to database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Database connected successfully'))
.catch((err) => {
    console.error('Database connection error', err);
    process.exit(1); // stop app if db fails
});

// routes
app.get('/', (req, res) => {
    res.send('Hello World!')
});

// start server
app.listen(port, () => {
    console.log(`Listening at localhost:${port}`);
});