const express = require('express');
const router = express.Router();
const { addOffer ,getOffers,deleteOffer} = require('../controllers/Offerscontroller');

// راوت للتسجيل
router.post('/add-Offer', addOffer);//done
router.get('/offers', getOffers); //done        // جلب جميع العروض
router.delete('/offers/:id', deleteOffer); //done



module.exports = router;