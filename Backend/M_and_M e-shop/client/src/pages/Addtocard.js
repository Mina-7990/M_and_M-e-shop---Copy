import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/CartPage.css'; // Import CSS for styling

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo && userInfo.userId) {
      axios
        .get(`http://localhost:5000/api/product/cart/${userInfo.userId}`)
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
      const response = await axios.delete(`http://localhost:5000/api/product/remove/${userInfo.userId}/${productId}`);
      
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
    return <div className="cart-loading">Loading products...</div>;
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
              <h3 className="cart-product-name">{item.ProductId.name}</h3>
              <p className="cart-product-category">Category: {item.ProductId.category}</p>
              <p className="cart-product-price">Price: {item.ProductId.price} EGP</p>
              <p className="cart-product-description">Description: {item.ProductId.description}</p>
              <p className="cart-product-usage">
                Usage Date: {new Date(item.usageDate).toLocaleString()}
              </p>
              <div className="cart-product-images">
                <h4>Images:</h4>
                {item.ProductId.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`product-image-${index}`}
                    className="cart-product-image"
                  />
                ))}
              </div>
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