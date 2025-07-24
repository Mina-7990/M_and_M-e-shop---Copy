const Order = require('../model/orderModel');
const User = require('../model/userModel');
const Product = require('../model/productModel');
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");
const PromoCode = require('../model/premocode');

const createOrder = async (req, res) => {
  try {
    const { userId, building, street, floor, governorate, city, apartment, fullAddress, cash, promoCode } = req.body;

    console.log('Received promoCode:', promoCode); // Add this for debugging

    // Validate required fields
    if (!userId || !building || !street || !floor || !governorate || !city || !apartment || !fullAddress) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    // Fetch user and cart items
    const user = await User.findById(userId).populate('Addtocard.ProductId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const phoneNumber = user.phoneNumber;
    const cartItems = user.Addtocard;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'No products in cart' });
    }

    const productDetails = [];
    let totalAmount = 0;

    // Fetch all products concurrently using Promise.all for better performance
    const products = await Promise.all(cartItems.map(item => Product.findById(item.ProductId._id).exec()));

    // Process cart items and push the necessary product data into productDetails array
    for (const [index, item] of cartItems.entries()) {
      const product = products[index];
      if (!product) continue;

      const selectedSize = item.size;
      const sizeDetails = product.sizes.find(s => s.size === selectedSize);

      if (!sizeDetails) continue;

      totalAmount += sizeDetails.price;
      productDetails.push({
        productId: product._id,
        size: selectedSize,
        price: sizeDetails.price,
        usageDate: item.usageDate,
      });
    }

    if (productDetails.length === 0) {
      return res.status(400).json({ message: 'No valid products found' });
    }

    // Promo code validation and discount calculation
    let promoCodeApplied = null;
    let discountAmount = 0;
    let priceBeforeDiscount = totalAmount;
    let priceAfterDiscount = totalAmount;

    if (promoCode && promoCode.trim()) {
      console.log('Processing promo code:', promoCode); // Add this for debugging
      
      const promoCodeDoc = await PromoCode.findOne({ 
        code: promoCode.trim().toUpperCase(),
        isActive: true 
      });

      if (!promoCodeDoc) {
        return res.status(400).json({ message: 'Invalid promo code' });
      }

      const currentDate = new Date();
      
      // Check if promo code is within valid date range
      if (currentDate < promoCodeDoc.startDate || currentDate > promoCodeDoc.endDate) {
        return res.status(400).json({ message: 'Promo code is not valid at this time' });
      }

      // Check usage limit
      if (promoCodeDoc.usageLimit && promoCodeDoc.usedCount >= promoCodeDoc.usageLimit) {
        return res.status(400).json({ message: 'Promo code usage limit exceeded' });
      }

      // Calculate percentage-based discount
      discountAmount = (totalAmount * promoCodeDoc.discountValue) / 100;
      priceAfterDiscount = Math.max(0, totalAmount - discountAmount);
      promoCodeApplied = promoCodeDoc.code;

      console.log('Discount calculation:', {
        totalAmount,
        discountPercentage: promoCodeDoc.discountValue,
        discountAmount,
        priceAfterDiscount
      });

      // Update promo code usage count
      promoCodeDoc.usedCount += 1;
      await promoCodeDoc.save();
    }

    // Generate a unique order number
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the order
    const order = new Order({
      userId,
      phoneNumber,
      products: productDetails,
      building,
      totalAmount: priceAfterDiscount,
      street,
      floor,
      governorate,
      city,
      apartment,
      fullAddress,
      orderNumber,
      cash,
      premocodeinorder: promoCodeApplied,
    });

    // Save the order to the database
    await order.save();

    // Clear the user's cart after the order is created
    user.Addtocard = [];
    await user.save();

    res.status(201).json({
      message: 'Order created successfully',
      orderId: order._id,
      order,
      priceBeforeDiscount,
      priceAfterDiscount,
      discountAmount,
      promoCodeApplied
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};





const processOrderController = async (req, res) => {
  const { orderId } = req.params;

  try {
    // 1. جلب الطلب من قاعدة البيانات باستخدام orderId
    const order = await Order.findById(orderId).populate('products');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 2. التحقق من توفر المنتجات والكميات
    for (const product of order.products) {
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with ID ${product._id} not found` });
      }

      if (product.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `This product is not available: ${product.name}`,
          productDetails: {
            name: product.name,
            id: product._id,
            description: product.description, // Assuming the product has a description field
            price: product.price, // Assuming the product has a price field
            quantityAvailable: product.quantity,
          },
        });
      }
    }

    // 3. تحديث الكميات - خصم 1 من الكمية لكل منتج
    for (const product of order.products) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { quantity: -1 }, // تقليل الكمية بمقدار 1
      });
    }

    // 4. تحديث حالة الطلب إلى success
    await order.save();

    // 5. إرسال الرد
    res.status(200).json({ success: true, message: 'Order processed successfully', order });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ success: false, message: 'Error processing order', error: error.message });
  }
};




const removeProductFromOrder = async (req, res) => {
  const { orderId, productId } = req.params;

  try {
    // 1. العثور على الطلب وتحديث قائمة المنتجات
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // 2. تحقق إذا كان المنتج موجودًا في الطلب
    const productIndex = order.products.indexOf(productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in the order' });
    }

    // 3. إزالة المنتج من القائمة
    order.products.splice(productIndex, 1);

    // 4. حفظ التحديث
    await order.save();

    // 5. إرسال الرد
    res.status(200).json({ success: true, message: 'Product removed from the order', order });
  } catch (error) {
    console.error('Error removing product from order:', error);
    res.status(500).json({ success: false, message: 'Error removing product from order' });
  }
};


const updateOrderTxnResponse = async (req, res) => {
  try {
    const {
      id,
      pending,
      amount_cents,
      success,
      currency,
      txn_response_code,
      data_message,
      orderNumber,
    } = req.body;

    console.log("Received Order Number:", orderNumber);

    // البحث عن الطلب باستخدام orderNumber
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // التحقق إذا تمت معالجة الطلب مسبقًا
    if (order.success || order.isProcessed) {
      return res.status(400).json({
        message: 'Order has already been processed',
        orderNumber,
      });
    }

    console.log("Order found:", order);

    // تحديث بيانات الطلب
    order.txn_response_code = txn_response_code || order.txn_response_code;
    order.success = success === 'true';
    order.pending = pending === 'true';
    order.isProcessed = order.success || order.pending; // تعيين الحقل إذا تمت المعالجة

    await order.save();

    // إذا كان الطلب ناجحًا أو في حالة انتظار
    if (order.success || order.pending) {
      const user = await User.findById(order.userId);
      if (user) {
        user.Addtocard = [];
        await user.save();
      }
    }

    return res.status(200).json({
      message: 'Order updated successfully',
      order,
      orderNumber,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId }).populate('products').exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


// Activate cash payment for an order
const activateCashPayment = async (req, res) => {
  const { orderId } = req.params;

  // تحقق من صحة الـ orderId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "Invalid order ID format" });
  }

  try {
    // تحديث حقل cash وحذف الحقول الأخرى باستخدام $unset
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        cash: true,
        $unset: { // حذف الحقول
          success: "",
          pending: "",
          txn_response_code: ""
        }
      },
      { new: true } // إعادة الوثيقة المحدثة
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Cash payment activated successfully and fields removed",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error activating cash payment:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




const getSuccessfulOrders = async (req, res) => {
  try {
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // حساب التاريخ والوقت منذ 12 ساعة
      
      const orders = await Order.find({ 
          cash: true,
          createdAt: { $lt: twelveHoursAgo }, // شرط للتاريخ
          orderstatus: { $ne: 'completed' } // استبعاد الطلبات التي حالتها "completed"
      })
          .sort({ createdAt: -1 }) // ترتيب تنازلي من الأحدث إلى الأقدم
          .populate('userId') // جلب جميع بيانات المستخدم المرتبط بالطلب
          .populate('products'); // جلب جميع بيانات المنتجات المرتبطة بالطلب
      
      res.status(200).json({ success: true, orders });
  } catch (error) {
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب الطلبات', error });
  }
};


const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Define valid statuses
    const validStatuses = ['preparing', 'completed'];

    // Check if the provided status is valid
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Find the order by ID and update its status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderstatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status', error });
  }
};



const sendOrderEmails = async (req, res) => {
  try {
    // 🔹 جلب جميع الطلبات التي تحقق الشروط
    const orders = await Order.find({ cash: true, sendemail: false })
      .populate("userId")
      .populate({ path: "products", model: "Product" });

    if (orders.length === 0) {
      return res.status(404).json({ message: "لا توجد طلبات تحتاج إلى إرسال بريد إلكتروني" });
    }

    // 🔹 إعداد SMTP عبر Gmail
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD, // استخدم App Password إذا كان التحقق بخطوتين مفعلًا
      },
    });

    // 🔹 إرسال بريد إلكتروني لكل طلب
    for (let order of orders) {
      const userEmail = order.userId.email;
      if (!userEmail) continue;

      // 🔹 تجهيز تفاصيل المنتجات
      let productDetails = order.products.map(p => `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px; text-align: center;">${p.name}</td>
          <td style="padding: 10px; text-align: center;">${p.category}</td>
          <td style="padding: 10px; text-align: center; color: #007BFF;"><strong>${p.price} EGP</strong></td>
        </tr>
      `).join("");

      // 🔹 تجهيز محتوى البريد الإلكتروني
      let emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center;">تم تأكيد طلبك! 🎉</h2>
            <p style="text-align: center; font-size: 16px; color: #555;">شكرًا لك على طلبك! إليك تفاصيل طلبك:</p>
            
            <h3 style="color: #007BFF;">🛒 تفاصيل الطلب:</h3>
            <p><strong>رقم الطلب:</strong> ${order.orderNumber}</p>
            <p><strong>المبلغ الإجمالي:</strong> <span style="color: #28a745; font-weight: bold;">${order.totalAmount} EGP</span></p>
            
            <h3 style="color: #28a745;">📦 المنتجات:</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
              <tr style="background-color: #007BFF; color: white;">
                <th style="padding: 10px;">الاسم</th>
                <th style="padding: 10px;">التصنيف</th>
                <th style="padding: 10px;">السعر</th>
              </tr>
              ${productDetails}
            </table>

            <h3 style="color: #FF5722;">🚚 تفاصيل الشحن:</h3>
            <p><strong>العنوان:</strong> ${order.fullAddress}, ${order.city}, ${order.governorate}</p>
            <p><strong>رقم الهاتف:</strong> ${order.phoneNumber}</p>

            <p style="text-align: center; margin-top: 20px; color: #555;">شكرًا لتسوقك معنا! 😊</p>
          </div>
        <p style="text-align: center; margin-top: 30px;">
  <a href="https://mmscentsperfume.netlify.app/delete/${order._id}" 
     style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
     ❌ إلغاء الطلب
  </a>
</p>

        </div>
      `;

      // 🔹 خيارات البريد الإلكتروني
      let mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "تأكيد الطلب - eShop",
        html: emailBody,
      };

      // 🔹 إرسال البريد الإلكتروني
      await transporter.sendMail(mailOptions);

      // 🔹 تحديث حالة الإرسال في قاعدة البيانات
      await Order.updateOne({ _id: order._id }, { sendemail: true });
    }

    res.status(200).json({ message: "تم إرسال جميع رسائل البريد الإلكتروني بنجاح" });

  } catch (error) {
    console.error("خطأ أثناء إرسال البريد الإلكتروني:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إرسال البريد الإلكتروني" });
  }
};

const XLSX = require('xlsx');
const fs = require('fs');

// Email transporter setup using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // Replace with your email from .env
    pass: process.env.PASSWORD  // Replace with your email password from .env
  }
});

// Function to fetch successful orders and export to Excel
const getAllSuccessfulOrders = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const orders = await Order.find({
            cash: true,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('userId').populate('products');

        if (orders.length === 0) {
            return res.status(200).json({ message: 'No successful orders today.' });
        }

        // Convert orders to Excel-friendly format
        const orderData = orders.map(order => ({
            OrderNumber: order.orderNumber,
            User: order.userId.username,
            
            Products: order.products.map(p => p.name).join(', '),
            TotalAmount: order.totalAmount,
            Address: order.fullAddress,
            building: order.building,
            street: order.street,
            floor: order.floor,
            apartment: order.apartment,
            City: order.city,
            Governorate: order.governorate,
            PhoneNumber: order.phoneNumber,
            Date: order.createdAt.toISOString()
        }));

        // Create Excel file
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(orderData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        const filePath = `orders_report_${Date.now()}.xlsx`;
        XLSX.writeFile(workbook, filePath);

        // Send email with the report
        const mailOptions = {
            from: 'minaboles129@gmail.com',
            to: 'minalol2111@gmail.com',
            subject: 'Daily Successful Orders Report',
            text: 'Please find attached the daily report for successful orders.',
            attachments: [{ filename: 'orders_report.xlsx', path: filePath }]
        };

        await transporter.sendMail(mailOptions);
        fs.unlinkSync(filePath); // Delete the file after sending

        res.status(200).json({ message: 'Report generated and sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Function to be run by cron job
const scheduleDailyOrderReport = async () => {
    console.log('Running daily order report task...');
    await getAllSuccessfulOrders();
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 🔍 التأكد من وجود الطلب
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    // ⏱️ حساب عمر الطلب
    const twelveHours = 12 * 60 * 60 * 1000; // 12 ساعة بالميلي ثانية
    const now = new Date();
    const orderAge = now - new Date(order.createdAt);

    // 🛑 منع حذف الطلب إذا مر عليه أكثر من 12 ساعة
    if (orderAge > twelveHours) {
      return res.status(400).json({ message: 'لا يمكن إلغاء الطلب بعد مرور 12 ساعة من تقديمه' });
    }

    // ✅ حذف الطلب
    await Order.deleteOne({ _id: orderId });

    return res.status(200).json({ message: 'تم إلغاء الطلب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
  }
};



module.exports = { createOrder,processOrderController
   ,removeProductFromOrder,updateOrderTxnResponse
   ,getOrdersByUserId,activateCashPayment,
   getSuccessfulOrders,sendOrderEmails,
   getAllSuccessfulOrders,scheduleDailyOrderReport
  ,updateOrderStatus,deleteOrder
};









