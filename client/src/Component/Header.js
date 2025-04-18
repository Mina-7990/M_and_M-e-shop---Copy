import React, { useState, useEffect } from 'react';
import '../style/header.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHome, FaShoppingCart, FaListAlt, FaUserShield, FaSignOutAlt, FaSignInAlt, FaSearch } from "react-icons/fa"; // استيراد أيقونات إضافية

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // حالة المسؤول
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setIsLoggedIn(true);
      setIsAdmin(userInfo.isAdmin); // تحقق إذا كان المستخدم مسؤولًا باستخدام isAdmin
    }
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // منع البحث الفارغ
    try {
      const response = await axios.get(`http://localhost:5000/api/product/search?query=${searchQuery}`);
      if (response.data.message === 'No products found') {
        alert('No products found!');
      } else {
        navigate('/search-results', { state: { products: response.data } });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo'); // حذف بيانات المستخدم
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/login'); // توجيه المستخدم إلى صفحة تسجيل الدخول
  };

  return (
    <header className="header">
      <div className="header__logo">
        <Link to="/">E-Shop</Link>
      </div>

      <div className="header__menu-icon" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`header__sidebar ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)} className="home-link">
              <FaHome className="home-icon" />
            </Link>
          </li>
        
          <li>
            <Link to="/myorder" onClick={() => setMenuOpen(false)} className="nav-link">
              <FaListAlt className="nav-icon" /> My Orders
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="nav-link">
                <FaUserShield className="nav-icon" /> Admin Dashboard
              </Link> {/* فقط للمسؤولين */}
            </li>
          )}
          {isLoggedIn ? (
            <li>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt className="nav-icon" /> Logout
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="nav-link">
                <FaSignInAlt className="nav-icon" /> Login / Sign Up
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="header__search-cart">
        <div className="header__search">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
        <div className="header__cart">
          <Link to="/Addtocard">
            <FaShoppingCart className="cart-icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;