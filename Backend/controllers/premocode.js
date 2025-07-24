
const PromoCode = require('../model/premocode');

// Add new promo code
const addPromoCode = async (req, res) => {
    try {
        const { code, discountValue, usageLimit, startDate, endDate } = req.body;

        // Validate required fields
        if (!code  || !discountValue || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if code already exists
        const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return res.status(400).json({ message: 'Promo code already exists' });
        }

        const promoCode = new PromoCode({
            code: code.toUpperCase(),
            discountValue,
            usageLimit,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });

        await promoCode.save();

        res.status(201).json({
            message: 'Promo code created successfully',
            promoCode
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating promo code', error: error.message });
    }
};

// Get all promo codes
const getAllPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
        res.status(200).json(promoCodes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching promo codes', error: error.message });
    }
};

// Update promo code
const updatePromoCode = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const promoCode = await PromoCode.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        res.status(200).json({
            message: 'Promo code updated successfully',
            promoCode
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating promo code', error: error.message });
    }
};

// Delete promo code
const deletePromoCode = async (req, res) => {
    try {
        const { id } = req.params;

        const promoCode = await PromoCode.findByIdAndDelete(id);

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        res.status(200).json({
            message: 'Promo code deleted successfully',
            promoCode
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting promo code', error: error.message });
    }
};


module.exports = {
    addPromoCode,
    getAllPromoCodes,
    updatePromoCode,
    deletePromoCode,
    
};

