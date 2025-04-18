// models/Product.js
const mongoose = require('mongoose');

const OfferSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        },
    ],
    
}, {
    timestamps: true,
});

const Offer = mongoose.model('Offer', OfferSchema);
module.exports = Offer;