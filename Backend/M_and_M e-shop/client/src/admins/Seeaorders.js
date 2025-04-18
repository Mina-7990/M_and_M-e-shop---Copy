import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style/SuccessfulOrdersPage.css';

const SuccessfulOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders/orders/successful');
                setOrders(response.data.orders);
                console.log(response.data.orders);
            } catch (err) {
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await axios.put('http://localhost:5000/api/orders/update-status', {
                orderId,
                status
            });
            // Update the local state to reflect the change
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, orderstatus: status } : order
                )
            );
        } catch (err) {
            console.error('Failed to update order status', err);
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="successful-orders-page">
            <h2 className="title">Successful Orders</h2>
            <ul className="orders-list">
                {orders.map(order => (
                    <li key={order._id} className="order-item">
                        <strong>Order Number:</strong> {order.orderNumber} <br />
                        <strong>Total Amount:</strong> {order.totalAmount} EGP <br />
                        <strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()} <br />
                        <strong>Username:</strong> {order.userId?.username || 'Not Available'} <br />
                        <strong>Phone Number:</strong> {order.phoneNumber} <br />
                        <h4>Address Details</h4>
                        <strong>Full Address:</strong> {order.fullAddress} <br />
                        <strong>City:</strong> {order.city} <br />
                        <strong>Governorate:</strong> {order.governorate} <br />
                        <strong>Street:</strong> {order.street} <br />
                        <strong>Building:</strong> {order.building} <br />
                        <strong>Floor:</strong> {order.floor} <br />
                        <strong>Apartment:</strong> {order.apartment} <br />
                        <hr />
                        <h4>Product Details</h4>
                        {/* Map through the products in the order */}
                        {order.products && order.products.map((product, index) => (
                            <div key={index} className="product-item">
                                <strong>Size:</strong> {product.size} <br />
                                <strong>Price:</strong> {product.price} EGP <br />
                                <strong>Usage Date:</strong> {new Date(product.usageDate).toLocaleString()} <br />
                            </div>
                        ))}
                        <hr />
                        <div className="order-actions">
                            <button onClick={() => updateOrderStatus(order._id, 'preparing')}>
                                Mark as Preparing
                            </button>
                            <button onClick={() => updateOrderStatus(order._id, 'completed')}>
                                Mark as Completed
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SuccessfulOrdersPage;
