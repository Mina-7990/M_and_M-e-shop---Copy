import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/ProductPagev.css';

const SearchResults = () => {
  const location = useLocation();
  const { products } = location.state || {};
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // التنقل إلى صفحة المنتج باستخدام المعرف
  };

  return (
    <div className="search-results-unique">
      <h2>Search Results</h2>
      {products && products.length > 0 ? (
        <div className="product-list-unique">
          {products.map((product, index) => (
            <div
              key={index}
              className="product-item-unique"
              onClick={() => handleProductClick(product._id)} // عند الضغط على المنتج، يتم التنقل
            >
              <img src={product.cover} alt={product.name} className="product-cover-unique" />
              <h3>{product.name}</h3>
              <p><strong>Category:</strong> {product.category}</p>
              <br />
              <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default SearchResults;