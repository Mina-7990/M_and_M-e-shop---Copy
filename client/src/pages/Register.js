import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../style/register.css';
import Loading from '../components/Loading';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await axios.post(
        'https://m-and-m-e-shop-copy-3.onrender.com/api/auth/register', 
        formData
      );
      
      // Save email in localStorage for verification
      localStorage.setItem('email', formData.email);
  
      // Redirect user to the email verification page
      navigate('/verify-email');
    } catch (err) {
      // console.error('Error during signup:', err);
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="signup-title">Create a New Account</h2>
        {error && <p className="error-message">{error}</p>}
        
        <input
          type="text"
          name="username"
          className="input-field"
          placeholder="Full Name"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          className="input-field"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          className="input-field"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phoneNumber"
          className="input-field"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        
        <button type="submit" className="submit-btn">Register</button>

        <ul className="signup-footer">
          <li>
            <Link to="/login" className="login-link">Already have an account? Login</Link>
          </li>
        </ul>
      </form>
    </div>
  );
};

export default SignupPage;
