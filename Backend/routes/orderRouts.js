const express = require('express');
const { createOrder,processOrderController,getAllSuccessfulOrders ,
    sendOrderEmails,removeProductFromOrder,updateOrderTxnResponse,getOrdersByUserId,
    activateCashPayment,getSuccessfulOrders,
    updateOrderStatus,deleteOrder
} = require('../controllers/orderController');
const router = express.Router();

// إضافة طلب
router.post('/create', createOrder);//done
router.post('/process/:orderId', processOrderController);//done
router.delete('/remove/:orderId/:productId', removeProductFromOrder);//done

router.post('/update-transaction', updateOrderTxnResponse);//done

router.get('/myorders/:userId', getOrdersByUserId);//done

router.put("/activate-cash/:orderId", activateCashPayment);//done
router.get('/orders/successful', getSuccessfulOrders);
router.get("/send-order-email", sendOrderEmails);

router.get('/admin/orders/success', getAllSuccessfulOrders);
router.put('/update-status', updateOrderStatus);
router.delete('/orders/:orderId', deleteOrder);




module.exports = router;
