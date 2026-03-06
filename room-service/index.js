const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const { auth } = require('express-oauth2-jwt-bearer');


const Room = require('./Room');


// Doing this means a monolithic application / no separation / coupling!
// const User = require('../user-service/User');


const app = express();

app.use(cors());

// const s3 = new S3Client({
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     },
//     region: 'eu-west-1'
// });

app.use(express.json());

// load environment variables
dotenv.config();
const upload = require('./upload');

const port = process.env.PORT || 3001; 

// const bucketName = process.env.AWS_BUCKET_NAME
// const region = process.env.AWS_BUCKET_REGION
// const accessKeyId = process.env.AWS_ACCESS_KEY
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY


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

// route to test file upload
app.post('/api/upload', upload.array('files', 3), async (req, res) => {
    try {
        res.status(201).json({files: req.files})

    } catch(error) {
        res.status(500).json(error);
    }
});

// route to create new room
app.post('/api/v1/room', checkJwt, async (req, res) => {
    try {

        // get ID of authenticated user
        const partnerId = req.auth.payload.sub;

        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${partnerId}`);
        // const user = userData.data

        // if (!user) {
        //     res.status(404).json({message: "User not found."});
        // }

        // // Check if user is partner
        // if (user.role != 'partner') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }

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

// // route to get all rooms
// app.get('/api/v1/rooms', async (req, res) => {

//     try {
//         const rooms = await Room.find();
//         res.status(200).json(rooms);

//     } catch (error) {
//         console.error("Error fetching rooms:", error);
//         res.status(500).json({ error: 'Internal Server Error'});
//     }
// });

// route to get all rooms (search/filter logic)
app.get('/api/v1/rooms', async (req, res) => {

    try {

        // Extract parameters from request query
        const title = req.query.title
        const location = req.query.location
        const capacity = req.query.capacity
        const price = req.query.price

        // Dynamic query based on parameters
        const query = {}

        // Search for specific title
        if (title) {
            query.title = {$regex: title, $options: 'i'}
        }

        // Search for specific location
        if (location) {
            query.location = {$regex: location, $options: 'i'}
        }

        // Filter by capacity
        if (capacity) {
            query.capacity = capacity
        }

        // Filter by price
        if (price) {
            query.basePrice = price
        }

        // Perform final query
        const rooms = await Room.find(query)

        // // if (!search) {
        // //     const rooms = await Room.find();
        // //     return res.status(200).json(rooms);
        // // }

        // // const rooms = await Room.find({title: search});
        // const rooms = await Room.find({
        //     $text: {$search: search},
        //     location: location
        // });
        // const rooms = await Room.find({$text: {$search: search}}, {location: location},
        //     {capacity: {$gte: capMin, $lte: capMax}}, {basePrice: {$gte: priceMin, $lte: priceMax}});
        
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

        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${partnerId}`);
        // const user = userData.data

        // if (!user) {
        //     res.status(404).json({message: "User not found."});
        // }

        // // Check if user is partner
        // if (user.role != 'partner') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }


        const rooms = await Room.find({partnerId});
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching rooms for partner:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to get specific room by ID (during booking)
app.get('/api/v1/rooms/:id', async(req, res) => {
    try {
        id = req.params.id;
        const roomData = await Room.findOne({_id: id});

        if (!roomData) {
            return res.status(404).json({message: "Room Not Found."})
        }

        res.status(200).json(roomData);

    } catch(error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});


// route to update specific room (for partner)
app.put('/api/v1/rooms/:id', checkJwt, async (req, res) => {
    try {
        
        const partnerId = req.auth.payload.sub;

        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${partnerId}`);
        // const user = userData.data

        // if (!user) {
        //     res.status(404).json({message: "User not found."});
        // }

        // // Check if user is partner
        // if (user.role != 'partner') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }

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

        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${partnerId}`);
        // const user = userData.data

        // if (!user) {
        //     res.status(404).json({message: "User not found."});
        // }

        // // Check if user is partner
        // if (user.role != 'partner') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }
        
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