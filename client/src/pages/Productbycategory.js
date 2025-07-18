import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../style/products.css'
import Loading from '../components/Loading';

const ProductsPage = () => {
  const categoryName = localStorage.getItem("selectedCategoryName"); 
  console.log(categoryName);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/product/category/${categoryName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  const handleProductClick = (productId) => {
    localStorage.setItem("selectedProductId", productId); // حفظ الـ productId
    navigate("/product"); // التوجيه بدون تمرير ID في الرابط
  };
  
  // --- Image handling logic from Allproduct.js ---
  const IMAGE_PROXY_URL = "https://images.weserv.nl/?url=https://drive.google.com/uc?id=";

  const cleanDriveId = (id) => {
    if (!id) return null;
    const match = id.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  };

  const getImageUrl = (cover) => {
    const cleanId = cleanDriveId(cover);
    if (!cleanId) return '/default-image.png';
    return `${IMAGE_PROXY_URL}${cleanId}&w=400&h=300&fit=cover`;
  };

  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/default-image.png';
    e.target.style.objectFit = 'contain';
  };
  // --- End image handling logic ---

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div className="products-page">
      <h4 className="category-title">Products in category: {categoryName}</h4>
      <div className="products-container">
        {products.map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => handleProductClick(product._id)}
          >
            <div className="image-container">
              <img
                src={getImageUrl(product.cover)}
                alt={product.name}
                className="product-image"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <h3>{product.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;