// controllers/productController.js
const Product = require('../model/productModel');
const User = require('../model/userModel'); // استيراد نموذج المستخدم


// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a product
const addProduct = async (req, res) => {
    const { name, category, images, description, quantity, cover, sizes } = req.body;

    try {
        const product = await Product.create({
            name,
            category,
            images,
            description,
            quantity,
            cover,
            sizes // يجب أن يكون array من objects: [{ size: "S", price: 100 }, ...]
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
};




const updateDiscount = async (req, res) => {
    const { productId } = req.params;
    const { discount, startDate, endDate } = req.body;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // تحديث الحقول المطلوبة
        product.discount = discount || product.discount;
        product.startDate = startDate || product.startDate;
        product.endDate = endDate || product.endDate;

        // تطبيق الديسكاونت إذا كان فعّال
        product.applyDiscount();

        // حفظ التعديلات
        await product.save();

        res.status(200).json({ message: 'Discount updated successfully', product });
    } catch (error) {
        res.status(400).json({ message: 'Error updating discount', error: error.message });
    }
};


const addToCard = async (req, res) => {
    const { userId, productId, size } = req.body; // Extract userId, productId, and size from the request body

    // Validate the presence of userId, productId, and size
    if (!userId || !productId || !size) {
        return res.status(400).json({ message: 'userId, productId, and size are required' });
    }

    try {
        // Find the product in the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the selected size is valid for this product
        const sizeDetails = product.sizes.find(s => s.size === size);
        if (!sizeDetails) {
            return res.status(400).json({ message: 'Invalid size selected for this product' });
        }

        // Find the user and update the cart
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product is already in the cart
        const isAlreadyAdded = user.Addtocard.some(item => item.ProductId.toString() === productId && item.size === size);
        if (isAlreadyAdded) {
            return res.status(400).json({ message: 'This product with the selected size is already in the cart' });
        }

        // Add the product and size to the cart
        user.Addtocard.push({ ProductId: productId, size, usageDate: new Date() });
        await user.save();

        res.status(200).json({ message: 'Product added to cart successfully', Addtocard: user.Addtocard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};



const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        // Log the error for debugging purposes
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params; // Extract the category from request parameters
        const products = await Product.find({ category }); // Use Mongoose to query the database
        res.status(200).json(products); // Send the products in the response
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ 
            message: 'Error fetching products by category', 
            error: error.message || error 
        });
    }
};


const deleteProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

const getUserCartById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('Addtocard.ProductId'); // Ensure correct population
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Access the Addtocard array
        const cartItems = user.Addtocard;
        return res.status(200).json(cartItems);
    } catch (error) {
        console.error('Error fetching user cart:', error.message);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    const { userId, productId } = req.params;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { Addtocard: { ProductId: productId } } },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({ message: 'Product removed from cart', cart: user.Addtocard });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal Server Error', error });
    }
};


const updateProductPricesByCategory = async (req, res) => {
    const { category, discountPercentage } = req.params;

    try {
        // Calculate the discount multiplier (e.g., for 10% off, use 0.9)
        const discountMultiplier = 1 - (discountPercentage / 100);

        // Find products in the specified category
        console.log(`Searching for products in category: ${category}`);
        const products = await Product.find({ category: category });

        if (products.length === 0) {
            return res.status(200).json({
                success: true,
                message: `No products found in category ${category}.`,
            });
        }

        // Update the price for each product
        for (let product of products) {
            const newPrice = product.price * discountMultiplier;
            await Product.findByIdAndUpdate(product._id, { price: newPrice }, { new: true });
        }

        res.status(200).json({
            success: true,
            message: `${products.length} products in category ${category} have had their prices updated.`,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product prices.",
            error: error.message,
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { size, newSize, newPrice } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }

        // ابحث عن الحجم داخل المصفوفة وعدّل قيمته
        const sizeToUpdate = product.sizes.find(s => s.size === size);
        if (!sizeToUpdate) {
            return res.status(404).json({ message: 'الحجم غير موجود داخل المنتج' });
        }

        sizeToUpdate.size = newSize || sizeToUpdate.size;
        sizeToUpdate.price = newPrice || sizeToUpdate.price;

        await product.save();

        res.status(200).json({
            message: 'تم تعديل الحجم والسعر بنجاح',
            product,
        });
    } catch (error) {
        res.status(500).json({
            message: 'حدث خطأ أثناء تعديل المنتج',
            error: error.message,
        });
    }
};
// Controller to update the price of a product
const updateProductPrice = async (req, res) => {
    try {
        const productId = req.params.id; // Get the product ID from the route
        const { price } = req.body; // Get the new price from the request body

        // Validate the price
        if (!price || typeof price !== 'number' || price < 0) {
            return res.status(400).json({ message: 'Invalid price value' });
        }

        // Update only the price field of the product
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { price }, // Update only the price field
            { new: true, runValidators: true } // Return the updated product and validate
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product price updated successfully',
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating product price',
            error: error.message,
        });
    }
};

const getRecentProducts = async (req, res) => {
    try {
        // Calculate the date 7 days ago from now
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Query products created in the last 7 days
        const recentProducts = await Product.find({
            createdAt: { $gte: sevenDaysAgo },
        });

        res.status(200).json({
            message: 'Recent products fetched successfully',
            products: recentProducts,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching recent products',
            error: error.message,
        });
    }
};


const getCategories = async (req, res) => {
    try {
        // استخدام distinct للحصول على الفئات الفريدة
        const categories = await Product.distinct('category'); 

        // إرسال الفئات في الاستجابة
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            message: 'Error fetching categories', 
            error: error.message || error 
        });
    }
};

const searchProduct = async (req, res) => {
    try {
      const { query } = req.query; // Get the search query from the URL
  
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
  
      // Search products by name, category, or description
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },  // case-insensitive search on name
          { category: { $regex: query, $options: 'i' } },  // case-insensitive search on category
          { description: { $regex: query, $options: 'i' } }  // case-insensitive search on description
        ]
      });
  
      if (products.length === 0) {
        return res.status(404).json({ message: 'No products found' });
      }
  
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };




// Controller function to update the discount (priceindescond)
const updateProductDiscount = async (req, res) => {
    const { id } = req.params;  // استلام الـ id من الرابط
    const { discountValue } = req.body;  // استلام قيمة الخصم من الجسم

    if (discountValue === undefined) {
        return res.status(400).json({ message: 'Discount value is required' });
    }

    try {
        // البحث عن المنتج باستخدام الـ id
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // تحديث قيمة `priceindescond`
        product.priceindescond = discountValue;

        // حفظ التغييرات
        await product.save();

        // إرجاع المنتج المحدث مع رسالة نجاح
        res.status(200).json({
            message: 'Product discount updated successfully',
            product: product,
        });
    } catch (error) {
        console.error('Error updating product discount:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
     getProducts,
     addProduct , 
     addToCard,
     getProductById,
     getProductsByCategory,
     deleteProductById,
     getUserCartById,
    updateProductPricesByCategory,
    updateProduct,
    updateProductPrice,
    getRecentProducts,
    updateDiscount,
    getCategories,
    searchProduct,
    updateProductDiscount,
    removeFromCart
    
};