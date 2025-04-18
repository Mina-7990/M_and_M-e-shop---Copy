const express = require('express');
const { createPayment } = require('../controllers/paymentController');


const router = express.Router();


// مسار إنشاء رابط الدفع
router.post('/create-payment', createPayment);//done

module.exports = router;
