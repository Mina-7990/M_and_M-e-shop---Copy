import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboard';
import AddProduct from './Addproduct';
import AddOffer from './Addoffer';
import AddPromoCode from './AddPromoCode';
import Allproductadmin from './Allproductadmin';
import Seeorders from './Seeaorders';

const AdminPage = () => {
  return (
    <div>
      <Routes>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="add-offer" element={<AddOffer />} />
        <Route path="add-promo-code" element={<AddPromoCode />} />
        <Route path="all-products5" element={<Allproductadmin />} />
        <Route path="see-orders" element={<Seeorders />} />
      </Routes>
    </div>
  );
};

export default AdminPage;

