import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboard'; // تأكد من صحة اسم الملف ومساره
import AddProduct from './Addproduct'; // تأكد من صحة اسم الملف ومساره
import AddOffer from './Addoffer'; // تأكد من صحة اسم الملف ومساره
import Allproductadmin from './Allproductadmin'; // تأكد من صحة اسم الملف ومساره
import Seeorders from './Seeaorders';

const AdminPage = () => {
  return (
    <div>
      <Routes>
        <Route path="dashboard" element={<AdminDashboardPage />} />
       
        <Route path="add-product" element={<AddProduct />} />

        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="add-offer" element={<AddOffer />} />
        <Route path="all-products5" element={<Allproductadmin />} />
        <Route path="see-orders" element={<Seeorders />} />
      </Routes>
    </div>
  );
};

export default AdminPage;

