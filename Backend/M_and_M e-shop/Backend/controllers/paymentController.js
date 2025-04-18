const mongoose = require('mongoose');
const Order = require('../model/orderModel');
const axios = require('axios');

// Load environment variables
const PAYMOB_API_URL = process.env.PAYMOB_API_URL;
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

// Step 1: Get authentication token
async function getAuthToken() {
    try {
        const response = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
            api_key: PAYMOB_API_KEY,
        });
        return response.data.token; // Return the auth token
    } catch (error) {
        console.error("Error getting auth token:", error.response?.data || error.message);
        throw new Error('Failed to get authentication token');
    }
}

// Step 2: Create an order in Paymob
async function createOrder(authToken, amount) {
    try {
        const response = await axios.post(
            `${PAYMOB_API_URL}/ecommerce/orders`,
            {
                auth_token: authToken,
                delivery_needed: "false",
                amount_cents: Math.round(amount * 100),
                currency: "EGP",
                items: [],
            }
        );
        return response.data.id; // Return Paymob order ID
    } catch (error) {
        console.error("Error creating order:", error.response?.data || error.message);
        throw new Error('Failed to create order');
    }
}

// Step 3: Create a payment key
async function createPaymentKey(authToken, orderId, amount, billingData) {
    try {
        const response = await axios.post(
            `${PAYMOB_API_URL}/acceptance/payment_keys`,
            {
                auth_token: authToken,
                amount_cents: Math.round(amount * 100),
                expiration: 3600, // Expiration in seconds
                order_id: orderId,  
                billing_data: billingData,
                currency: "EGP",
                integration_id: PAYMOB_INTEGRATION_ID,
            }
        );
        return response.data.token; // Return the payment key
    } catch (error) {
        console.error("Error creating payment key:", error.response?.data || error.message);
        throw new Error('Failed to create payment key');
    }
}

async function createPayment(req, res) {
    try {
        const { orderId } = req.body;

        // Fetch the order from the database
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found." });
        }

        // ✅ إذا كان الطلب ناجحًا بالفعل، لا تنفذ الدفع
        if (order.success === true) {
            return res.status(400).json({
                success: false,
                error: "This order has already been completed. Payment is not allowed.",
            });
        }

        const authToken = await getAuthToken();
        console.log("Auth Token:", authToken); // ✅ تحقق من صحة التوكن

        // إنشاء الطلب في Paymob
        const paymobOrderId = await createOrder(authToken, order.totalAmount);
        console.log("Created Paymob Order ID:", paymobOrderId);

        // تحديث orderNumber ليكون نفس paymobOrderId
        order.orderNumber = paymobOrderId;
        await order.save();
        console.log("Updated Order Number:", order.orderNumber);

        // تقسيم الاسم
        const username = order.userId?.username || "Unknown User"; 
        const [firstName, lastName] = username.split(' ') || ["Unknown", "User"];

        const billingData = {
            first_name: firstName,
            last_name: lastName || "N/A",
            phone_number: order.phoneNumber || "0000000000",
            email: order.userId?.email || "unknown@example.com",
            country: "EG",
            city: order.City || "Unknown City",
            street: order.street || "Unknown Street",
            building: order.building ? order.building : "Not Provided",
            floor: order.floor || "Unknown Floor",
            apartment: order.Apartment || "Unknown Apartment",
        };

        // ✅ استخدم paymobOrderId الصحيح بعد التحديث
        const paymentKey = await createPaymentKey(authToken, paymobOrderId, order.totalAmount, billingData);
        console.log("Payment Key:", paymentKey); // ✅ تحقق من payment key

        const iframeUrl = `https://accept.paymobsolutions.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

        res.status(200).json({
            success: true,
            iframeUrl,
            orderNumber: order.orderNumber, 
        });

    } catch (error) {
        console.error("Error during payment creation:", error);
        res.status(500).json({ success: false, error: error.message || "Payment creation failed." });
    }
}

module.exports = { createPayment };

