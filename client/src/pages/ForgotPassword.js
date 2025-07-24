import React, { useState } from 'react';
import axios from 'axios';
import '../style/register.css'; // Reuse the same styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://m-and-m-e-shop-copy-1.onrender.com/api/auth/forgot-password', { email });
      setMessage(res.data.message);
      setError('');
    } catch (err) {
      setMessage('');
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleForgotPassword}>
        <h2 className="signup-title">Forgot Password</h2>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <input
          type="email"
          className="input-field"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
