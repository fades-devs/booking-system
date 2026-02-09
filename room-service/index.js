const express = require('express');
const app = express()
const port = 3001

// routes
app.get('/', (req, res) => {
    res.send('ROOM SERVICE NODE APP');
});

// start server
app.listen(port, () => {
    console.log(`Server running at localhost:${port}`);
});