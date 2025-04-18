import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../style/ProductPage.css';

const ProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverImage, setCoverImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [price, setPrice] = useState(0);

  const productId = localStorage.getItem("selectedProductId");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product selected.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://m-and-m-e-shop-copy-3.onrender.com/api/product/productbyid/${productId}`);
        setProduct(response.data);
        setCoverImage(response.data.cover);
        setPrice(response.data.sizes[0].price);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
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
      const response = await axios.post("https://m-and-m-e-shop-copy-3.onrender.com/api/product/add-to-card", {
        userId: userInfo.userId,
        productId,
        size: selectedSize.size,
        price: selectedSize.price,
      });

      alert(response.data.message);
      navigate("/Addtocard");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("حدث خطأ ما، يرجى المحاولة مرة أخرى.");
      navigate("/login");
    }
  };

  const handleSizeChange = (sizeOption) => {
    setSelectedSize(sizeOption);
    setPrice(sizeOption.price);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!product) return <div className="error">Product not found.</div>;

  return (
    <div className="product-page">
      <div className="card">
        <img
          src={coverImage || product.images[0]}
          alt="Product"
          className="main-img"
          id="main-img"
        />
        <div className="thumbnail-container">
          {product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className="thumbnail"
              onClick={() => changeImage(img)}
            />
          ))}
        </div>

        <div className="card-content">
          <h2 className="card-title">{product.name}</h2>
          <p>{product.description}</p>

          <p className="card-price">Price: ${price}</p>

          <div className="size-selection">
            <p><strong>Select Size:</strong></p>
            {product.sizes.map((sizeOption, index) => (
              <button
                key={index}
                className={`size-btn ${selectedSize === sizeOption ? 'selected' : ''}`}
                onClick={() => handleSizeChange(sizeOption)}
              >
                {sizeOption.size} - ${sizeOption.price}
              </button>
            ))}
          </div>

          <button className="buy-now-btn" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
