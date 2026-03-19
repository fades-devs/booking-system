const express = require('express');
const { handler } = require('./index');
const dotenv = require('dotenv');
const helmet = require('helmet');

const app = express();
dotenv.config();

app.use(express.json());
app.use(helmet());

const PORT = process.env.PORT || 3003;

// route to test the weather api locally without aws
app.get('/api/weather', async (req, res) => {

    const testEvent = {
        queryStringParameters: { location: req.query.location }
    }

    try {
        const testResult = await handler(testEvent);
        // parse string back into JSON for express
        const parsed = JSON.parse(testResult.body);
        res.status(testResult.statusCode).json(parsed);
    } catch (error) {
        res.status(500).json({message: "Local lambda test failed."});
    }
});

app.listen(PORT, () => {
    console.log(`Local weather app test running at localhost:${PORT}`);
});

