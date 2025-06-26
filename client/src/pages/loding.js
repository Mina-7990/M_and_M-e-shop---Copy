import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="mm-loading-container">
      <div className="mm-loading-spinner">
        <div className="mm-loading-circle"></div>
        <div className="mm-loading-circle"></div>
        <div className="mm-loading-circle"></div>
      </div>
      <p className="mm-loading-text">Loading...</p>
    </div>
  );
};

export default Loading; 
