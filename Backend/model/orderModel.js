const mongoose = require('mongoose');

// Define the order schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    premocodeinorder: {
        type: String,
        default: null,
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        usageDate: {
            type: Date,
            required: true,
        },
    }],
    fullAddress: {
        type: String,
        required: true,
    },
    apartment: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    governorate: {
        type: String,
        required: true,
    },
    floor: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    building: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderNumber: {
        type: String,
        unique: true,
        default: () => `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    sendemail: {
        type: Boolean,
        default: false,
    },
    cash: {
        type: Boolean,
        default: false,
    },
    orderstatus: {
        type: String,
        default: 'under review',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
