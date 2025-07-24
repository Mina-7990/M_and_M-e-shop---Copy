import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';  // Use 'useNavigate' for React Router v6

const ResetPassword = () => {
  const { token } = useParams();  // Get the token from the URL
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // Use 'useNavigate' instead of 'useHistory'

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setMessage('Please enter a new password');
      return;
    }

    try {
      const res = await axios.post(
        `https://m-and-m-e-shop-copy-1.onrender.com/api/auth/reset-password/${token}`,
        { newPassword },
        {
          headers: {
            'Content-Type': 'application/json', // Ensure the content type is set to JSON
          },
        }
      );
      setMessage(res.data.message); // Success message from the backend
      navigate('/login');  // Redirect to the login page after successful password reset
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    }
};


  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 border rounded mb-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full p-2 bg-green-600 text-white rounded">
          Reset Password
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default ResetPassword;
