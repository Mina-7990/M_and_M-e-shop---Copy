import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteOrder = () => {
  const { orderId } = useParams(); // Get orderId from URL
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const deleteOrder = async () => {
    try {
      const response = await axios.delete(`https://m-and-m-e-shop-copy-3.onrender.com/api/orders/orders/${orderId}`);
      setMessage(response.data.message);

      // Optional: Redirect after 2 seconds
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Error occurred');
      } else {
        setMessage('Server error or not reachable');
      }
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Delete Order</h2>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={deleteOrder}
      >
        cancel Order
      </button>
      <p>{message}</p>
    </div>
  );
};

export default DeleteOrder;