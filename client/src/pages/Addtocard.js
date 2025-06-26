import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/CartPage.css'; // Import CSS for styling
import Loading from '../components/Loading';

// Custom image proxy URL (replace with your own proxy server if needed)
const IMAGE_PROXY_URL = "https://images.weserv.nl/?url=https://drive.google.com/uc?id=";

const cleanDriveId = (id) => {
  if (!id) return null;
  // More robust ID extraction
  const match = id.match(/[-\w]{25,}/);
  return match ? match[0] : null;
};

const getImageUrl = (cover) => {
  const cleanId = cleanDriveId(cover);
  if (!cleanId) return '/default-image.png'; // Local fallback
  return `${IMAGE_PROXY_URL}${cleanId}&w=400&h=300&fit=cover`;
};

const handleImageError = (e) => {
  console.warn('Image failed to load:', e.target.src);
  e.target.src = '/default-image.png';
  e.target.style.objectFit = 'contain';
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && userInfo.userId) {
      axios
        .get(`https://m-and-m-e-shop-copy-3.onrender.com/api/product/cart/${userInfo.userId}`)
        .then((response) => {
          setCartItems(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching cart items', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
      alert('User not found! Please log in.');
    }
  }, []);

  const handleRemoveProduct = async (productId) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.userId) {
      alert('User not found! Please log in.');
      return;
    }

    try {
      const response = await axios.delete(`https://m-and-m-e-shop-copy-3.onrender.com/api/product/remove/${userInfo.userId}/${productId}`);
      
      if (response.data.message === 'Product removed from cart') {
        setCartItems(cartItems.filter((item) => item.ProductId._id !== productId));
      } else {
        alert('Failed to remove product');
      }
    } catch (error) {
      console.error('Error removing product', error);
      alert('An error occurred while removing the product.');
    }
  };

  const handleOrder = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.userId) {
      alert('User not found! Please log in.');
      return;
    }

    navigate('/Checkout', { state: { cartItemsFromCartPage: cartItems } });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Cart Items</h1>
      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty</p>
      ) : (
        <ul className="cart-list">
          {cartItems.map((item) => (
            <li key={item._id} className="cart-item">
              <div className="cart-product-cover">
                <img
                  src={getImageUrl(item.ProductId.cover)}
                  alt={item.ProductId.name || 'Product cover'}
                  className="cart-product-cover-image"
                  onError={handleImageError}
                  loading="lazy"
                  style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
              <h3 className="cart-product-name">{item.ProductId.name}</h3>
              <p className="cart-product-category">Category: {item.ProductId.category}</p>
              <p className="cart-product-price">
                Price: {item.ProductId.price} EGP{item.size ? ` - ${item.size}` : ''}
              </p>
              <p className="cart-product-description">Description: {item.ProductId.description}</p>
              <p className="cart-product-usage">
                Usage Date: {new Date(item.usageDate).toLocaleString()}
              </p>
              <button
                onClick={() => handleRemoveProduct(item.ProductId._id)}
                className="cart-remove-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleOrder} className="cart-checkout-button">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartPage;