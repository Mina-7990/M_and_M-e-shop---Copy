import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/CreateOrderPage.css'; // Import the CSS file

const CreateOrderPage = () => {
  const [formData, setFormData] = useState({
    userId: '',
    building: '',
    street: '',
    floor: '',
    governorate: 'Cairo',
    city: 'Obour',
    apartment: '',
    fullAddress: '',
    cash: false,
  });

  const [message, setMessage] = useState('');
  const [order, setOrder] = useState(null);
  const [warning, setWarning] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.userId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        userId: userInfo.userId,
      }));
    } else {
      setWarning("User not logged in. Please log in first.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show warning before creating order
    const userConfirmed = window.confirm("Are you sure you want to create this order with cash payment?");
    if (!userConfirmed) {
      setWarning("Order creation was canceled by the user.");
      return;
    }
    setWarning(''); // Clear warning if user confirms

    // Debug: Log form data before submission
    console.log("Form Data before submission:", formData);

    try {
      const response = await axios.post('http://localhost:5000/api/orders/create', formData);

      if (response.data.message) {
        setMessage(response.data.message);
      }
      if (response.data.order) {
        setOrder(response.data.order);
      }

      // Navigate to MyOrderPage after successful order creation
      navigate('/myorder');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="all">
      <div className="create-order-container">
        <h1 className="create-order-heading">Create Order</h1>
        {warning && <p className="create-order-warning">{warning}</p>}
        <form className="create-order-form" onSubmit={handleSubmit}>
          <div>
            <label className="create-order-label">Building:</label>
            <input className="create-order-input" type="text" name="building" value={formData.building} onChange={handleChange} required />
          </div>
          <div>
            <label className="create-order-label">Street:</label>
            <input className="create-order-input" type="text" name="street" value={formData.street} onChange={handleChange} required />
          </div>
          <div>
            <label className="create-order-label">Floor:</label>
            <input className="create-order-input" type="text" name="floor" value={formData.floor} onChange={handleChange} required />
          </div>
          <div>
            <label className="create-order-label">Governorate:</label>
            <select className="create-order-input" name="governorate" value={formData.governorate} onChange={handleChange} required>
              <option value="Cairo">Cairo</option>
            </select>
          </div>
          <div>
            <label className="create-order-label">City:</label>
            <select className="create-order-input" name="city" value={formData.city} onChange={handleChange} required>
              <option value="Obour">Obour</option>
            </select>
          </div>
          <div>
            <label className="create-order-label">Apartment:</label>
            <input className="create-order-input" type="text" name="apartment" value={formData.apartment} onChange={handleChange} required />
          </div>
          <div>
            <label className="create-order-label">Full Address:</label>
            <input className="create-order-input" type="text" name="fullAddress" value={formData.fullAddress} onChange={handleChange} required />
          </div>
          <div>
            <label className="create-order-label">
              <input
                className="create-order-input"
                type="radio"
                name="cash"
                value={true}
                checked={formData.cash === true}
                onChange={() => setFormData({ ...formData, cash: true })}
                required
              />
              Pay on Cash
            </label>
          </div>
          <button className="create-order-button" type="submit">Create Order</button>
        </form>
        {message && <p className="create-order-message">{message}</p>}
      </div>
    </div>
  );
};

export default CreateOrderPage;
