const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { auth } = require('express-oauth2-jwt-bearer');
const axios = require('axios');
const cors = require('cors')

const Booking = require('./Booking');

const app = express();

// load environment variables
dotenv.config();

const PORT = process.env.PORT || 3002;

const MONGO_URI = process.env.MONGO_URI


app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));


// connect to database
mongoose.connect(MONGO_URI)
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

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const DOMAIN = process.env.BOOKING_API_URL
const FRONTEND_URL = process.env.FRONTEND_URL
const ROOM_API_URL = process.env.ROOM_API_URL
const WEATHER_API_URL = process.env.WEATHER_API_URL

// const YOUR_DOMAIN = 'http://localhost:3002';
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173/booking-system/tree/main/frontend/vite-booking-system';
// endpoint that creates a checkout session
// app.post('/create-checkout-session', async (req, res) => {

//   const session = await stripe.checkout.sessions.create({
//     // add try catch block after
//     line_items: [
//       {
//         // Provide the exact Price ID (for example, price_1234) of the product you want to sell
//         // price: '{{PRICE_ID}}', 
//         price: 'price_1T2XbuEAhxJTB6pG2Tfnh96F', // for testing
//         quantity: 1,
//       },
//     ],
//     mode: 'payment',
//     success_url: `${DOMAIN}?success=true`,
//   });

// //   res.redirect(303, session.url);
//   res.status(200).json({ url: session.url }); // for testing
// });

// route to create new booking
// make room ID parameter not body
app.post('/api/v1/booking', checkJwt, async (req, res) => {

    try {

        // extract room from request
        const roomId = req.body.roomId;

        // get user auth ID and role
        const userId = req.auth.payload.sub;

        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${userId}`);
        // const user = userData.data
        // // Check if user is client
        // if (user.role != 'client') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }
        
        // get room details
        const roomData = await axios.get(`${ROOM_API_URL}/api/v1/rooms/${roomId}`);
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

        const weatherCharge = await axios.get(`${WEATHER_API_URL}/api/weather?location=${room.location}`);

        const charge = weatherCharge.data.charge;

        const finalPrice = basePrice * (1 + charge);

        // stripe session for checkout
        const session = await stripe.checkout.sessions.create({
            // add try catch block later naybe
            payment_method_types: ['card'],
            line_items: [
            {
                price_data: {
                    currency: 'GBP',
                    product_data: {
                        name: `${room.title} - Booking`,
                        description: `Location: ${room.location} - Weather Charge: ${charge}`
                    },
                    // prevents decimal errors - stripe needs cents
                    unit_amount: Math.round(finalPrice * 100)
                },
                quantity: 1
            },
            ],
            mode: 'payment',
            success_url: `${FRONTEND_URL}/my-bookings?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/`
        });

        const bookingData = new Booking({
            finalPrice,
            basePrice,
            weatherCharge,
            clientId: userId,
            roomId,
            roomName: room.title,
            stripeSessionId: session.id
        });

        await bookingData.save();

        // res.status(201).json(bookingData);
        // return stripe URL to client
        res.status(201).json({
            message: 'Booking Initiated',
            url: session.url,
            bookingId: bookingData._id
        });

    
    } catch(error) {
        console.error("Error making the booking:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }

    //
});

// route to cancel booking
app.delete('/api/v1/bookings/:id', checkJwt, async (req, res) => {
    try {

        const clientId = req.auth.payload.sub;
        
        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${clientId}`);
        // const user = userData.data
        
        // if (!user) {
        //     res.status(404).json({message: "User not found."});
        // }
        
        // // Check if user is client
        // if (user.role != 'client') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }

        const id = req.params.id;

        // for error handling - check if booking exists / today's booking only
        const today = new Date();
        const startDay = new Date(today.setHours(0, 0, 0, 0));
        const endDay = new Date(today.setHours(23, 59, 59, 999));

        const bookingExist = await Booking.findOne({
            _id: id,
            clientId,
            createdAt: {$gte: startDay, $lte: endDay}
        });

        if (!bookingExist) {
            return res.status(404).json({message: "Booking Not Found, Unauthorized User or Old Booking."})
        }

        await Booking.findByIdAndDelete(id);
        res.status(201).json({message: "Booking Cancelled successfully."});


    } catch (error) {
        console.error("Error canceling the booking:", error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// route to view bookings for client
app.get('/api/v1/bookings/by-client', checkJwt, async (req, res) => {
    try {
        const clientId = req.auth.payload.sub;

        // // call user API to get user
        // const userData = await axios.get(`http://localhost:3000/api/v1/user/${clientId}`);
        // const user = userData.data
        
        // if (!user) {
        //     res.status(404).json({message: "User not found."});
        // }
        
        // // Check if user is client
        // if (user.role != 'client') {
        //     return res.status(400).json({message: "Unauthorized User."})
        // }

        const bookingData = await Booking.find({clientId});
        res.status(200).json(bookingData);

    } catch(error) {
        console.error('Error fetching bookings for client:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


// start server
app.listen(PORT, () => {
    console.log(`Listening at localhost:${PORT}`);
});