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
                const response = await axios.get('https://m-and-m-e-shop-copy-3.onrender.com/api/orders/orders/successful');
                setOrders(response.data.orders);
            } catch (err) {
                setError('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Group orders by status
    const groupedOrders = {
        'under review': orders.filter(order => order.orderstatus === 'under review'),
        'preparing': orders.filter(order => order.orderstatus === 'preparing'),
        'completed': orders.filter(order => order.orderstatus === 'completed')
    };

    const updateOrderStatus = async (orderId, status) => {
        const confirmMessage = `Are you sure you want to change this order status to "${status}"?`;
        
        if (window.confirm(confirmMessage)) {
            try {
                await axios.put('https://m-and-m-e-shop-copy-3.onrender.com/api/orders/update-status', {
                    orderId,
                    status
                });
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, orderstatus: status } : order
                    )
                );
                alert(`Order status successfully updated to "${status}"`);
            } catch (err) {
                alert('Failed to update order status. Please try again.');
            }
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="successful-orders-page">
            <h2 className="title">All Orders</h2>
            
            <div className="orders-sections">
                {/* Under Review Section */}
                <div className="orders-section under-review-section">
                    <h3>Under Review ({groupedOrders['under review'].length})</h3>
                    <ul className="orders-list">
                        {groupedOrders['under review'].map(order => (
                            <li key={order._id} className="order-item under-review-order">
                                <span className="status-badge under-review">Under Review</span>
                                <strong>Order Number:</strong> {order.orderNumber} <br />
                                <strong>Total Amount:</strong> {order.totalAmount} EGP <br />
                                <strong>Username:</strong> {order.userId?.username || 'Not Available'} <br />
                                <strong>Phone:</strong> {order.phoneNumber} <br />
                                <div className="order-actions">
                                    <button className="preparing-btn" onClick={() => updateOrderStatus(order._id, 'preparing')}>
                                        Mark as Preparing
                                    </button>
                                    <button className="completed-btn" onClick={() => updateOrderStatus(order._id, 'completed')}>
                                        Mark as Completed
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Preparing Section */}
                <div className="orders-section preparing-section">
                    <h3>Preparing ({groupedOrders['preparing'].length})</h3>
                    <ul className="orders-list">
                        {groupedOrders['preparing'].map(order => (
                            <li key={order._id} className="order-item preparing-order">
                                <span className="status-badge preparing">Preparing</span>
                                <strong>Order Number:</strong> {order.orderNumber} <br />
                                <strong>Total Amount:</strong> {order.totalAmount} EGP <br />
                                <strong>Username:</strong> {order.userId?.username || 'Not Available'} <br />
                                <strong>Phone:</strong> {order.phoneNumber} <br />
                                <div className="order-actions">
                                    <button className="completed-btn" onClick={() => updateOrderStatus(order._id, 'completed')}>
                                        Mark as Completed
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Completed Section */}
                <div className="orders-section completed-section">
                    <h3>Completed ({groupedOrders['completed'].length})</h3>
                    <ul className="orders-list">
                        {groupedOrders['completed'].map(order => (
                            <li key={order._id} className="order-item completed-order">
                                <span className="status-badge completed">Completed</span>
                                <strong>Order Number:</strong> {order.orderNumber} <br />
                                <strong>Total Amount:</strong> {order.totalAmount} EGP <br />
                                <strong>Username:</strong> {order.userId?.username || 'Not Available'} <br />
                                <strong>Phone:</strong> {order.phoneNumber} <br />
                                <div className="order-final">
                                    ✅ Order Completed
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SuccessfulOrdersPage;
