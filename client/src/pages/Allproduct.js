import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../style/products.css';
import Loading from '../components/Loading';

// Custom image proxy URL (replace with your own proxy server if needed)
const IMAGE_PROXY_URL = "https://images.weserv.nl/?url=https://drive.google.com/uc?id=";

const Allproduct = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12); // Start with more items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://m-and-m-e-shop-copy-3.onrender.com/api/product/allproducts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(response.data || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const cleanDriveId = (id) => {
    if (!id) return null;
    // More robust ID extraction
    const match = id.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  };

  const getImageUrl = (cover) => {
    const cleanId = cleanDriveId(cover);
    if (!cleanId) return '/default-image.png'; // Local fallback
    // تحقق من أن الـ ID ليس منتهيًا بصورة غير مدعومة
    // يمكن إضافة تحقق إضافي لاحقًا
    return `${IMAGE_PROXY_URL}${cleanId}&w=400&h=300&fit=cover`;
  };

  const handleImageError = (e) => {
    // اطبع رسالة في الكونسول مع رابط الصورة
    // console.warn('Image failed to load:', e.target.src);
    e.target.src = '/default-image.png';
    e.target.style.objectFit = 'contain';
  };

  const handleProductClick = (productId) => {
    localStorage.setItem("selectedProductId", productId);
    navigate("/product");
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 12, products.length));
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '$0.00';
    const num = typeof price === 'number' ? price : parseFloat(price);
    return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="no-products-message">No products available</div>;
  }

  return (
    <div className="products-page">
      <h4 className="category-title">All Products ({products.length})</h4>
      <div className="products-container">
        {products.slice(0, visibleCount).map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => handleProductClick(product._id)}
          >
            <div className="image-container">
              <img
                src={getImageUrl(product.cover)}
                alt={product.name || 'Product image'}
                className="product-image"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <div className="product-info">
              <h3>{product.name || 'Unnamed Product'}</h3>
              
            </div>
          </div>
        ))}
      </div>

      {visibleCount < products.length && (
        <button 
          className="show-more-button" 
          onClick={handleShowMore}
          aria-label="Show more products"
        >
          عرض المزيد
        </button>
      )}
    </div>
  );
};

export default Allproduct;