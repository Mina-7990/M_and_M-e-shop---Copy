const express = require('express');
const router = express.Router();
const { register, verifyCode ,login,getUserById,getAllUsers,getUserInfo,forgotPassword,resetPassword} = require('../controllers/authControlle');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // تأكد من وجود موديل المستخدم

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





// راوت للتسجيل
router.post('/register', register);//done

router.post('/login', login);//done

// راوت للتحقق من كود التفعيل
router.post('/verify', verifyCode);
router.get('/users/:id',protect,admin, getUserById);
router.get('/users', getAllUsers,admin,protect);
//paymob info from user
router.get('/info',protect, getUserInfo);//done

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;