const express = require('express');
const app = express()
const port = 3002

// routes
app.get('/', (req, res) => {
    res.send('BOOKING SERVICE NODE APP');
});

// start server
app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});