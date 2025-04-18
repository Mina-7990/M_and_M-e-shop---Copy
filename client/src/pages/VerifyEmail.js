import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/ver.css';

const VerifyEmail = () => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify', { email, code });
            setMessage(response.data.msg);

            // Remove email from localStorage after verification
            localStorage.removeItem('email');

            // Store user info in localStorage
            const { token, id, isAdmin } = response.data.user;
            localStorage.setItem("userInfo", JSON.stringify({ token, userId: id, isAdmin }));

            // Redirect to home page after verification
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'An error occurred');
        }
    };

    return (
        <div className="verify-container">
            <h2 className="verify-header">Verify Your Email</h2>
            <form onSubmit={handleSubmit} className="verify-form">
                <div className="input-wrapper">
                    <label htmlFor="email" className="input-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        readOnly
                        className="input-field"
                    />
                </div>
                <div className="input-wrapper">
                    <label htmlFor="code" className="input-label">Verification Code:</label>
                    <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="input-field"
                    />
                </div>
                <button type="submit" className="verify-button">Verify</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default VerifyEmail;