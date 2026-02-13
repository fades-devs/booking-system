const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    location: {
        type: String,
    },
    partnerId: {
        type: String,
        required: true
    },
    pictures: [
        {
            type: String
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema)
