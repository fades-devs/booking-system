const mongoose = require("mongoose");
const {Schema} = mongoose;

const bookingSchema = new Schema({
    finalPrice: Number,
    basePrice: Number,
    weatherFee: Number, 
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    clientId: {
        type: String,
        required: true
    },
    roomId: {
        type: String,
        required: true
    },
    roomName: String
}, {timestamps: true});

module.exports = mongoose.model('Booking', bookingSchema);