const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const axios = require('axios');

const Booking = require('./Booking');

const app = express();

// load environment variables
dotenv.config();
const port = process.env.PORT || 3002; 

app.use(express.json());


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
app.get('/', (req, res) => {
    res.send('Hello World!')
});

// route to create new booking
app.post('/api/v1/booking', checkJwt, async (req, res) => {

    try {

        // extract room from request
        const roomId = req.body.roomId;

        // get user auth ID and role
        const userId = req.auth.payload.sub;

        // call user API to get user
        const userData = await axios.get(`http://localhost:3000/api/v1/user/${userId}`);
        const user = userData.data
        // Check if user is client
        if (user.role != 'client') {
            return res.status(400).json({message: "Unauthorized User."})
        }
        
        // get room details
        const roomData = await axios.get(`http://localhost:3001/api/v1/rooms/${roomId}`);
        const room = roomData.data

                
        // check if room already booked for the day
        const today = new Date();
        const startDay = new Date(today.setHours(0, 0, 0, 0));
        const endDay = new Date(today.setHours(23, 59, 59, 999));

        const bookingExist = await Booking.findOne({
            roomId,
            createdAt: {$gte: startDay, $lte: endDay}
        });

        if (bookingExist) {
            return res.status(400).json({message: 'This room is already booked.'});
        }

        // extract price data and calculate final price
        const basePrice = room.basePrice;

        const weatherCharge = await axios.get(`http://localhost:3003/api/weather?location=${room.location}`);

        const charge = weatherCharge.data.charge;

        const finalPrice = basePrice * (1 + charge);

        const bookingData = new Booking({
            finalPrice,
            basePrice,
            weatherCharge,
            clientId: userId,
            roomId,
            roomName: room.title
        });

        await bookingData.save();

        res.status(201).json(bookingData);

    
    } catch(error) {
        console.error("Error making the booking:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }

    



    //
});


// start server
app.listen(port, () => {
    console.log(`Listening at localhost:${port}`);
});