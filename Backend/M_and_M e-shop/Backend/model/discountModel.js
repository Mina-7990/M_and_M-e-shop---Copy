const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',  // الربط بنموذج المنتج
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

const Discount = mongoose.model('Discount', discountSchema);
module.exports = Discount;
