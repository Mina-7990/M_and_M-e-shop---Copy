import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import '../style/products.css'

const ProductsPage = () => {
  const { categoryName } = useParams(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `https://m-and-m-e-shop-copy-3.onrender.com/api/product/category/${categoryName}`,
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
  

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="products-page">
      <h4 className="category-title">Products in category: {categoryName}</h4>
      {products.map((product) => (
        <div
          key={product._id}
          className="product-card"
          onClick={() => handleProductClick(product._id)}
        >
          <img src={product.cover} alt={product.name} className="product-cover" />
          <h3>{product.name}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductsPage;