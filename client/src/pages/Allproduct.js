import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../style/products.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4); // عدد المنتجات المعروضة
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
        setProducts(response.data);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId) => {
    localStorage.setItem("selectedProductId", productId); // حفظ الـ productId
    navigate("/product"); // التوجيه بدون تمرير ID في الرابط
  };
  

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4); // زيادة عدد المنتجات المعروضة
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="products-page">
      <h4 className="category-title">All Products</h4>
      <div className="products-container">
        {products.slice(0, visibleCount).map((product) => (
          <div
            key={product._id}
            className="product-card"
            onClick={() => handleProductClick(product._id)}
          >
            <img 
              src={product.cover} 
              alt={product.name} 
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>

      {/* زر "Show More" يظهر فقط إذا كان هناك المزيد من المنتجات */}
      {visibleCount < products.length && (
        <button className="show-more-button" onClick={handleShowMore}>
          Show More
        </button>
      )}
    </div>
  );
};

export default ProductsPage;
