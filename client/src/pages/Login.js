// src/pages/LoginPage.js

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import '../style/register.css';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.userId) {
      if (userInfo.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://m-and-m-e-shop-copy-3.onrender.com/api/auth/login", { email, password });
      const { token, userId, isAdmin } = response.data;
      localStorage.setItem("userInfo", JSON.stringify({ token, userId, isAdmin }));

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleLogin}>
        <h2 className="signup-title">Login</h2>
        {error && <p className="error">{error}</p>}
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
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">Login</button>
        <p className="signup-link">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>

        
      </form>
    </div>
  );
};

export default LoginPage;
