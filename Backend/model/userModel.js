const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 15,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 30
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        maxlength: 11
    },
    verificationCode: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: { type: Boolean, default: false },
    Addtocard: [
        {
          ProductId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product',
            required: true 
          }, // Correctly reference the Product model
          size: { 
            type: String, 
            required: true 
          }, // Store the size selected for the product
          usageDate: { 
            type: Date 
          },
        }
      ],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
