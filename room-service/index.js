const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const { auth } = require('express-oauth2-jwt-bearer');

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

// user authentication
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
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
app.post('/api/v1/room', checkJwt, async (req, res) => {
    try {

        // get ID of authenticated user
        const partnerId = req.auth.payload.sub;

        const roomData = new Room({
            title: req.body.title,
            capacity: req.body.capacity,
            basePrice: req.body.basePrice,
            location: req.body.location,
            pictures: [], // empty for now
            partnerId
        });

        // check if room already exists
        const {title} = roomData;
        const roomExist = await Room.findOne({title, partnerId});
        if (roomExist) {
            return res.status(400).json({message: "Room already exists or unauthorized user."})
        }

        // if not, save in DB (for partner)
        await roomData.save()
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

// route to get all rooms by partner
app.get('/api/v1/rooms/by-partner', checkJwt, async (req, res) => {
    try {
        const partnerId = req.auth.payload.sub;
        const rooms = await Room.find({partnerId});
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching rooms for partner:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to update specific room (for partner)
app.put('/api/v1/rooms/:id', checkJwt, async (req, res) => {
    try {
        
        const partnerId = req.auth.payload.sub;
        const id = req.params.id;
        const roomExist = await Room.findOne({_id: id, partnerId});

        if (!roomExist) {
            return res.status(404).json({message: "Room Not Found or Unauthorized User."})
        }

        const updatedRoom = await Room.findByIdAndUpdate(id, req.body, {new: true});
        res.status(201).json(updatedRoom);

    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to delete specific room
app.delete('/api/v1/rooms/:id', checkJwt, async (req, res) => {
    try {

        const partnerId = req.auth.payload.sub;
        const id = req.params.id;
        const roomExist = await Room.findOne({_id: id, partnerId});

        if (!roomExist) {
            return res.status(404).json({message: "Room Not Found or Unauthorized User."})
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