import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../style/register.css';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('https://m-and-m-e-shop-copy-3.onrender.com/api/auth/register', {
        email,
        password,
        username,
        phoneNumber,
      });
  
      // Extract token and userId correctly
      const {  userId } = data; 
  
      // Save login info in localStorage
      localStorage.setItem("userInfo", JSON.stringify({ userId }));
  
      // Save user email separately
      localStorage.setItem('email', email);
  
      // Redirect user to the email verification page
      navigate('/verify-email');
    } catch (err) {
      console.error('Error during signup:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };
  

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="signup-title">Create a New Account</h2>
        {error && <p className="error-message">{error}</p>}
        
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <input
          type="text"
          className="input-field"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="tel"
          className="input-field"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        
        <button type="submit" className="submit-btn">Next Step</button>

        <ul className="signup-footer">
          <li>
            <Link to="/login" className="login-link">Login</Link>
          </li>
        </ul>
      </form>
    </div>
  );
};

export default SignupPage;
