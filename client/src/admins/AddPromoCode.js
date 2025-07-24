import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style/PromoCode.css';

const AddPromoCode = () => {
    const [formData, setFormData] = useState({
        code: '',
        discountValue: '',
        usageLimit: '',
        startDate: '',
        endDate: ''
    });
    const [promoCodes, setPromoCodes] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/promocodes/all');
            setPromoCodes(response.data);
        } catch (error) {
            console.error('Error fetching promo codes:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingId) {
                // Update existing promo code
                await axios.put(`http://localhost:5000/api/promocodes/update/${editingId}`, formData);
                setMessage('Promo code updated successfully!');
                setEditingId(null);
            } else {
                // Add new promo code
                await axios.post('http://localhost:5000/api/promocodes/add', formData);
                setMessage('Promo code added successfully!');
            }
            
            setIsSuccess(true);
            setFormData({
                code: '',
                discountValue: '',
                usageLimit: '',
                startDate: '',
                endDate: ''
            });
            fetchPromoCodes();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error processing promo code');
            setIsSuccess(false);
        }
    };

    const handleEdit = (promoCode) => {
        setFormData({
            code: promoCode.code,
            discountValue: promoCode.discountValue,
            usageLimit: promoCode.usageLimit || '',
            startDate: new Date(promoCode.startDate).toISOString().split('T')[0],
            endDate: new Date(promoCode.endDate).toISOString().split('T')[0]
        });
        setEditingId(promoCode._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promo code?')) {
            try {
                await axios.delete(`http://localhost:5000/api/promocodes/delete/${id}`);
                setMessage('Promo code deleted successfully!');
                setIsSuccess(true);
                fetchPromoCodes();
            } catch (error) {
                setMessage('Error deleting promo code');
                setIsSuccess(false);
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            code: '',
            discountValue: '',
            usageLimit: '',
            startDate: '',
            endDate: ''
        });
    };

    return (
        <div className="promo-code-container">
            <h1 className="promo-code-title">Manage Promo Codes</h1>
            
            {message && (
                <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="promo-code-form">
                <h2>{editingId ? 'Edit Promo Code' : 'Add New Promo Code'}</h2>
                
                <div className="form-group">
                    <label>Code:</label>
                    <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter promo code"
                    />
                </div>

                <div className="form-group">
                    <label>Discount Value (%):</label>
                    <input
                        type="number"
                        name="discountValue"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                        min="0"
                        max="100"
                        placeholder="Enter discount percentage"
                    />
                </div>

                <div className="form-group">
                    <label>Usage Limit (optional):</label>
                    <input
                        type="number"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="Enter usage limit"
                    />
                </div>

                <div className="form-group">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>End Date:</label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-buttons">
                    <button type="submit" className="submit-button">
                        {editingId ? 'Update Promo Code' : 'Add Promo Code'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="cancel-button">
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="promo-codes-list">
                <h2>All Promo Codes ({promoCodes.length})</h2>
                {promoCodes.length === 0 ? (
                    <p>No promo codes available</p>
                ) : (
                    <div className="promo-codes-grid">
                        {promoCodes.map((promoCode) => (
                            <div key={promoCode._id} className="promo-code-card">
                                <div className="promo-code-header">
                                    <h3>{promoCode.code}</h3>
                                    <span className={`status ${promoCode.isActive ? 'active' : 'inactive'}`}>
                                        {promoCode.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="promo-code-details">
                                    <p><strong>Discount:</strong> {promoCode.discountValue}%</p>
                                    <p><strong>Usage:</strong> {promoCode.usedCount}/{promoCode.usageLimit || '∞'}</p>
                                    <p><strong>Start:</strong> {new Date(promoCode.startDate).toLocaleDateString()}</p>
                                    <p><strong>End:</strong> {new Date(promoCode.endDate).toLocaleDateString()}</p>
                                </div>
                                <div className="promo-code-actions">
                                    <button onClick={() => handleEdit(promoCode)} className="edit-button">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(promoCode._id)} className="delete-button">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddPromoCode;
