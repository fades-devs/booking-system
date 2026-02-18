const express = require('express');
const { handler } = require('./index');

const app = express();
const port = 3003;
app.use(express.json());

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

app.listen(port, () => {
    console.log(`Local weather app test running at localhost:${port}`);
});

