import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/catigory.css";
import Loading from '../components/Loading';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token'); // الحصول على التوكن من localStorage
        const response = await axios.get("http://localhost:5000/api/product/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Categories data:", response.data); // تحقق من البيانات هنا
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    localStorage.setItem("selectedCategoryName", categoryName); // Store categoryName in localStorage
    navigate(`/products`); // Navigate without categoryName in the URL
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>; // عرض رسالة الخطأ إذا حدثت
  }

  return (
    <div className="categories">
      {categories.map((categoryName, index) => (
        <div
          key={index} // استخدم index كـ key لأن البيانات عبارة عن أسماء فقط
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={() => handleCategoryClick(categoryName)}
        >
          <h3>{categoryName}</h3>
        </div>
      ))}
    </div>
  );
};

export default CategoriesPage;