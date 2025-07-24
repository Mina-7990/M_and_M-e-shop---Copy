// src/pages/AdminPage/AdminDashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './style/admin.css'

const AdminDashboardPage = () => {
  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      <div className="button-container">
        <Link to="/admin/add-product" className="button">
          Add product
        </Link>
       
        <Link to="/admin/add-offer" className="button">
          Add offer
        </Link>

        <Link to="/admin/add-promo-code" className="button">
          Manage Promo Codes
        </Link>

        <Link to="/admin/all-products5" className="button">
          allproducts
        </Link>
       <Link to="/admin/see-orders" className="button">
        see orders
       </Link>
       
      </div>
    </div>
  );
};

export default AdminDashboardPage;
