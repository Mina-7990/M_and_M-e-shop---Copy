const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    images: [
        {
            type: String,
            required: true,
        },
    ],
    description: {
        type: String,
        required: true,
    },

    // 👇 تعديل هنا
    sizes: [
        {
            size: { type: String, required: true },
            price: { type: Number, required: true },
        }
    ],

    quantity: { 
        type: Number,
        required: true,
        default: 0,
    },

    cover: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
