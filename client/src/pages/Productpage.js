import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../style/ProductPage.css';
import Loading from '../components/Loading';

// Custom image proxy URL to bypass Google Drive limits
const IMAGE_PROXY_URL = "https://images.weserv.nl/?url=https://drive.google.com/uc?id=";

const ProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverImage, setCoverImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [price, setPrice] = useState(0);

  const productId = localStorage.getItem("selectedProductId");

  const cleanDriveId = (id) => {
    if (!id) return null;
    // More robust ID extraction
    const match = id.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  };

  const getImageUrl = (cover) => {
    const cleanId = cleanDriveId(cover);
    if (!cleanId) return '/default-image.png'; // Local fallback
    
    // Use proxy server with resizing parameters
    return `${IMAGE_PROXY_URL}${cleanId}&w=600&h=600&fit=cover`;
  };

  const handleImageError = (e) => {
    e.target.src = '/default-image.png';
    e.target.style.objectFit = 'contain';
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product selected.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://m-and-m-e-shop-copy-3.onrender.com/api/product/productbyid/${productId}`
        );
        setProduct(response.data);
        setCoverImage(response.data.cover);
        if (response.data.sizes && response.data.sizes.length > 0) {
          setSelectedSize(response.data.sizes[0]);
          setPrice(response.data.sizes[0].price);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const changeImage = (imageUrl) => {
    setCoverImage(imageUrl);
  };

  const handleBuyNow = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo.userId) {
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      alert("Please select a size before buying.");
      return;
    }

    try {
      const response = await axios.post(
        "https://m-and-m-e-shop-copy-3.onrender.com/api/product/add-to-card",
        {
          userId: userInfo.userId,
          productId,
          size: selectedSize.size,
          price: selectedSize.price,
        }
      );

      alert(response.data.message);
      navigate("/Addtocard");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("An error occurred. Please try again.");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleSizeChange = (sizeOption) => {
    setSelectedSize(sizeOption);
    setPrice(sizeOption.price);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-container">
        <p>Product not found.</p>
        <button onClick={() => navigate("/")} className="back-button">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-card">
        <div className="main-image-container">
          <img
            src={getImageUrl(coverImage)}
            alt={product.name || 'Product image'}
            className="main-img"
            onError={handleImageError}
            loading="lazy"
          />
        </div>

        <div className="thumbnail-container">
          {product.images?.map((img, index) => (
            <img
              key={index}
              src={getImageUrl(img)}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${coverImage === img ? 'active' : ''}`}
              onClick={() => changeImage(img)}
              onError={handleImageError}
              loading="lazy"
            />
          ))}
        </div>

        <div className="product-details">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-description">{product.description}</p>

          <div className="price-section">
            <span className="price-label">Price:</span>
            <span className="price-value">EGP {price.toFixed(2)}</span>
          </div>

          <div className="size-selection">
            {product.sizes?.length > 0 ? (
              <>
                <h3 className="size-title">Select Size:</h3>
                <div className="size-options">
                  {product.sizes.map((sizeOption, index) => (
                    <button
                      key={index}
                      className={`size-btn ${
                        selectedSize?.size === sizeOption.size ? 'selected' : ''
                      }`}
                      onClick={() => handleSizeChange(sizeOption)}
                    >
                      {sizeOption.size} - EGP {sizeOption.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="no-sizes">No sizes available for this product</p>
            )}
          </div>

          <button
            className={`buy-now-btn ${
              !product.sizes || product.sizes.length === 0 ? 'disabled' : ''
            }`}
            onClick={handleBuyNow}
            disabled={!product.sizes || product.sizes.length === 0}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;