import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/ProductPagev.css';

// Custom image proxy URL (same as Allproduct.js)
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

const SearchResults = () => {
  const location = useLocation();
  const { products } = location.state || {};
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    localStorage.setItem("selectedProductId", productId);
    navigate("/product");
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
              <img
                src={getImageUrl(product.cover)}
                alt={product.name}
                className="product-cover-unique"
                onError={handleImageError}
                loading="lazy"
              />
              <h3>{product.name}</h3>
              <p><strong>Category:</strong> {product.category}</p>
              <br />
              <p><strong>Price:</strong> {product.sizes && product.sizes[0] && product.sizes[0].price !== undefined ? `$${product.sizes[0].price.toFixed(2)}` : 'N/A'}</p>
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