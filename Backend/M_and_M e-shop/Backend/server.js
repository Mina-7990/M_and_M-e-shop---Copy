const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const authRoutes = require('./routes/authRoute'); // Import authentication routes
const productRoutes = require('./routes/productRoutes'); // Import product routes
const offerRoutes = require('./routes/OfferRoute'); // Import offer routes
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRouts');
const { scheduleDailyOrderReport } = require('./controllers/orderController');


// Initialize dotenv to load environment variables
dotenv.config();

const app = express();
cron.schedule('0 0 * * *', scheduleDailyOrderReport);
// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/paymob', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));

// Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
