const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const Room = require('./Room');

const app = express();

app.use(express.json());

// load environment variables
dotenv.config();
const port = process.env.PORT || 3001; 


// connect to database
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Database connected successfully'))
.catch((err) => {
    console.error('Database connection error', err);
    process.exit(1); // stop app if db fails
});


// routes
app.get('/api/fetch', (req, res) => {
    try {
        res.json('Yes it works!')
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error'})
    }
});

// route to create new room
app.post('/api/v1/room', async (req, res) => {
    try {

        // Create new object from request body
        const roomData = new Room(req.body);
        // Extract title from object
        const {title} = roomData;

        // Check if room already exists
        const roomExist = await Room.findOne({title});
        if (roomExist) {
             return res.status(400).json({message: 'Room already exists.'})
        }

        // Save in DB
        await roomData.save();
        res.status(201).json(roomData);

    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ error: 'Internal Server Error'})
    }
});

// route to get all rooms
app.get('/api/v1/rooms', async (req, res) => {

    try {
        const rooms = await Room.find();
        res.status(200).json(rooms);

    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to update specific room
app.put('/api/v1/rooms/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const roomExist = await Room.findOne({_id: id});

        if (!roomExist) {
            return res.status(404).json({message: "Room Not Found."})
        }

        const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {new: true});
        res.status(201).json(updatedRoom);

    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to delete specific room
app.delete('/api/v1/rooms/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const roomExist = await Room.findOne({_id: id});

        if (!roomExist) {
            return res.status(404).json({message: "Room Not Found."})
        }

        await Room.findByIdAndDelete(id);
        res.status(201).json({message: "Room deleted successfully."});

    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});


// start server
app.listen(port, () => {
    console.log(`Listening at localhost:${port}`);
});