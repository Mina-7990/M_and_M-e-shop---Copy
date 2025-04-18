import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './Component/Header';
import Footer from './Component/Footer';
import Home from './pages/Home';
import Catigory from './pages/Catigory';
import Productbycategory from './pages/Productbycategory';
import Offer from './pages/Offer';
import ProductPage from './pages/Productpage';
import Allproduct from './pages/Allproduct';
import Register from './pages/Register';
import Login from './pages/Login';
import Addtocard from './pages/Addtocard';
import Checkout from './pages/Checkout';
import ProcessOrderPage from './pages/Chickproduct';
import Payment from './pages/Payment';
import Respons from './pages/respons';
import Myorder from './pages/Myorder';
import SearchResults from './pages/SearchResults';
import PageNotFound from './pages/PageNotFound';
import AdminPage from './admins/AdminPage';
import VerifyEmail from './pages/VerifyEmail';
import Delet from './pages/Delet';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const App = () => {
  // التحقق من حالة المستخدم من localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Catigory />} />
          <Route path="/products/:categoryName" element={<Productbycategory />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/allproduct" element={<Allproduct />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Addtocard" element={<Addtocard />} />
          <Route path="/Checkout" element={<Checkout />} />
          <Route path="/process-order" element={<ProcessOrderPage />} />
          <Route path="/Payment" element={<Payment />} />
          <Route path="/res" element={<Respons />} />
          <Route path="/myorder" element={<Myorder />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/delete/:orderId" element={<Delet />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* إضافة التحقق من حالة المسؤول هنا */}
          <Route 
            path="/admin/*" 
            element={userInfo?.isAdmin ? <AdminPage /> : <Navigate to="/" />} 
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
