const express = require('express');
const router = express.Router();
const {
    addPromoCode,
    getAllPromoCodes,
    updatePromoCode,
    deletePromoCode
} = require('../controllers/premocode');

// Add new promo code
router.post('/add', addPromoCode);

// Get all promo codes
router.get('/all', getAllPromoCodes);

// Update promo code
router.put('/update/:id', updatePromoCode);

// Delete promo code
router.delete('/delete/:id', deletePromoCode);

module.exports = router;