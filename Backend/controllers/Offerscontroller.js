const Offer = require('../model/Offers');

const addOffer = async (req, res) => {
    const { name, images } = req.body;

    // تحقق من وجود البيانات الأساسية
    if (!name || !images || images.length === 0) {
        return res.status(400).json({ message: 'Name and at least one image are required' });
    }

    try {
        // إنشاء عرض جديد
        const newOffer = await Offer.create({
            name,
            images,
        });

        // إرسال الاستجابة بنجاح
        res.status(201).json(newOffer);
    } catch (error) {
        // التعامل مع الأخطاء
        console.error('Error creating offer:', error);
        res.status(500).json({
            message: 'Error creating offer',
            error: error.message,
        });
    }
};


const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find(); // جلب كل العروض من قاعدة البيانات
        res.status(200).json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error.message);
        res.status(500).json({ message: 'Error fetching offers', error: error.message });
    }
};

const deleteOffer = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedOffer = await Offer.findByIdAndDelete(id); // حذف العرض باستخدام المعرف
        if (!deletedOffer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer deleted successfully', offer: deletedOffer });
    } catch (error) {
        console.error('Error deleting offer:', error.message);
        res.status(500).json({ message: 'Error deleting offer', error: error.message });
    }
};

module.exports = {
     addOffer
     ,deleteOffer
     ,getOffers
    };
