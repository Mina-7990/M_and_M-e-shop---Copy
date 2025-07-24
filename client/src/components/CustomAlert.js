import React from 'react';
import '../style/CustomAlert.css';

const CustomAlert = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-container">
        <h3 className="alert-title">{title}</h3>
        <p className="alert-message">{message}</p>
        <div className="alert-buttons">
          {onCancel && (
            <button className="alert-btn alert-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="alert-btn alert-btn-confirm" onClick={onConfirm}>
            {onCancel ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
