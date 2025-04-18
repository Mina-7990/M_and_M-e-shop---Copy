import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/OrdersPage.css"; // Import the CSS file for styling

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Extract userInfo from localStorage
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        
        // Check if userInfo and userId exist
        if (!userInfo || !userInfo.userId) {
          setError("User not logged in. Please log in and try again.");
          setLoading(false);
          return;
        }
  
        const userId = userInfo.userId; // Extract userId from userInfo
        console.log("User ID:", userId);

        const response = await axios.get(`http://localhost:5000/api/orders/myorders/${userId}`);
        const modifiedOrders = response.data.map(order => ({
          userId: order.userId,
          products: order.products.map(product => ({
            name: product.name,
            category: product.category,
            price: product.price,
            images: product.images,
            description: product.description,
            quantity: product.quantity,
            discount: product.discount,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            startDate: product.startDate,
            endDate: product.endDate,
            size: product.size, // Added size
            usageDate: product.usageDate, // Added usageDate
          })),
          location: order.location,
          totalAmount: order.totalAmount,
          phoneNumber: order.phoneNumber,
          orderNumber: order.orderNumber,
          success: order.success,
          cash: order.cash,
          createdAt: order.createdAt,
          orderstatus: order.orderstatus,
        }));
        console.log("Modified Orders:", modifiedOrders);

        // Sort the orders by createdAt date in descending order
        modifiedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setOrders(modifiedOrders);
      } catch (error) {
        setError("Your orders not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="orders-loading">Loading...</p>;
  if (error) return <p className="orders-error">{error}</p>;

  return (
    <div className="orders-container">
      <h1 className="orders-title">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="orders-empty">No orders found.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order, index) => (
            <li key={index} className="order-item">
              <h3 className="order-number">Order Number: {order.orderNumber}</h3>
              <p className="order-location">Location: {order.location}</p>
              <p className="order-phone">Phone Number: {order.phoneNumber}</p>
              <p className="order-total">Total Amount: {order.totalAmount}</p>
              <p className="order-cash">Cash: {order.cash ? 'Yes' : 'No'}</p>
              <p className="order-total">order status:{order.orderstatus}</p>

              <ul className="order-products">
                {order.products.map((product, idx) => (
                  <li key={idx} className="product-item">
                    <h4 className="product-name">{product.name}</h4>
                    <p className="product-price">Price: ${product.price}</p>
                    <p className="product-size">Size: {product.size}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
