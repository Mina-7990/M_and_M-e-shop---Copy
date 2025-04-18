const Product = require('../model/productModel');
const Discount = require('../model/discountModel');

// دالة لإضافة خصم لمنتج
const addDiscountToProduct = async (req, res) => {
    const { productId, discountValue, startDate, endDate } = req.body;

    try {
        // التحقق إذا كان المنتج موجودًا
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // إضافة الخصم
        const newDiscount = new Discount({
            productId,
            discountValue,
            startDate,
            endDate,
        });

        // حفظ الخصم
        await newDiscount.save();

        // تحديث قيمة `priceindescond` للمنتج
        product.priceindescond = discountValue;
        product.startDate = new Date(startDate);
        product.endDate = new Date(endDate);
        await product.save();

        res.status(200).json({
            message: 'Discount applied to product successfully',
            product: product,
            discount: newDiscount,
        });
    } catch (error) {
        console.error('Error applying discount to product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// دالة للتحقق من انتهاء الخصومات وتحديث المنتجات
const checkAndUpdateDiscounts = async () => {
    try {
        const currentDate = new Date();

        // الحصول على جميع الخصومات
        const discounts = await Discount.find();

        for (let discount of discounts) {
            // إذا انتهت فترة الخصم
            if (currentDate > discount.endDate) {
                // العثور على المنتج المرتبط
                const product = await Product.findById(discount.productId);
                if (product) {
                    // إعادة قيمة `priceindescond` إلى null
                    product.priceindescond = null;
                    await product.save();

                    // يمكن إزالة الخصم من الـ Database إذا أردت
                    await Discount.findByIdAndDelete(discount._id);
                }
            }
        }
    } catch (error) {
        console.error('Error checking and updating discounts:', error);
    }
};

module.exports = { addDiscountToProduct, checkAndUpdateDiscounts };
