const jwt = require('jsonwebtoken');

const generateToken = (id, isAdmin) => {
    return jwt.sign(
        { id, isAdmin }, // البيانات التي سيتم تشفيرها داخل التوكن
        process.env.JWT_SECRET, // المفتاح السري من متغيرات البيئة
        { expiresIn: '30d' } // مدة صلاحية التوكن
    );
};

module.exports = generateToken;