const express = require('express');
const { getProducts, addProduct,addToCard,getProductById,getProductsByCategory,deleteProductById,getUserCartById ,updateProduct
    ,updateProductPricesByCategory,updateDiscount,searchProduct,updateProductDiscount,
    updateProductPrice,getRecentProducts,getCategories,removeFromCart,uploadExcel ,addDefaultSizesToAllProducts,renameProducts} = require('../controllers/productController');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // تأكد من وجود موديل المستخدم
const router = express.Router();

// Middleware لحماية المسارات (تأكد أن المستخدم لديه توكن)
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware للتحقق من أن المستخدم هو admin
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Route to get all products (Public)
router.get('/allproducts', getProducts); //done

// Route to add a product (Protected for admin only)
router.post('/newproduct',  addProduct);  //done
router.post('/add-to-card', addToCard,protect);//done
router.get('/productbyid/:id', getProductById);//done
router.get('/category/:category', getProductsByCategory);//done
router.delete('/productdelet/:id', deleteProductById,admin);//done

router.get('/cart/:userId', getUserCartById,protect);//done

router.patch('/update-prices/:category/:discountPercentage', updateProductPricesByCategory);

router.put('/update/:id', updateProduct);
router.put('/update-price/:id', updateProductPrice);//done

router.get('/recent', getRecentProducts);
router.patch('/discount/:productId', updateDiscount);

router.get('/categories', getCategories);//Done

router.get('/search', searchProduct);//done

router.put('/product/discount/:id', updateProductDiscount);
router.delete('/remove/:userId/:productId',removeFromCart);//done 



// routes/productRoutes.js
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-excel', upload.single('file'), uploadExcel);

router.get('/rename', renameProducts);

router.post('/add-default-sizes', addDefaultSizesToAllProducts);



module.exports = router;
