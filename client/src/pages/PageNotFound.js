// PageNotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/PageNotFound.css';  // Optional: For styling the 404 page

const PageNotFound = () => {
  return (
    <div className="page-not-found">
      <h2>404 - Page Not Found</h2>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <br />
      <Link to="/" className="back-home">Go Back to Home</Link>
    </div>
  );
};

export default PageNotFound;
