import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from '../components/Loading';

const ProcessOrderPage = () => {
  const [orderId, setOrderId] = useState(null); // To store orderId
  const [products, setProducts] = useState([]); // To store the list of products
  const [selectedProducts, setSelectedProducts] = useState([]); // To store selected products for deletion
  const navigate = useNavigate(); // To create a redirect function
  const [orderStatus, setOrderStatus] = useState(null); // To store order status
  const [error, setError] = useState(null); // To store error status
  const [isProcessing, setIsProcessing] = useState(false); // State to know if processing is ongoing
  const [loading, setLoading] = useState(true); // State to know if data is being loaded

  // Fetch orderId from localStorage when the page loads
  useEffect(() => {
    const storedOrderId = localStorage.getItem("orderId");
    if (storedOrderId) {
      setOrderId(storedOrderId);
    } else {
      // If orderId is not found, redirect to the home page or another page
      navigate("/");
    }
  }, [navigate]);

  // Fetch all products from the backend
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      axios
        .get(`http://localhost:5000/api/product/cart/${userId}`)
        .then((response) => {
          setProducts(response.data); // Update products state with fetched data
          setLoading(false); // Stop loading
        })
        .catch((error) => {
          console.error("Error fetching cart items", error);
          setError("Failed to fetch cart items. Please try again later."); // Display error message
          setLoading(false); // Stop loading
        });
    } else {
      setLoading(false); // Stop loading
      navigate("/login"); // Redirect to login page
    }
  }, [navigate]);

  // Function to delete a specific product
  const handleDeleteProduct = async (productId) => {
    const orderId = localStorage.getItem("orderId");
    if (!orderId || !productId) {
      alert("Order ID or Product ID is missing");
      return;
    }

    try {
      const response = await axios.delete(
        `https://m-and-m-e-shop-copy-3.onrender.com/api/orders/remove/${orderId}/${productId}`,
        {
        }
      );

      if (response.data.success) {
        alert("Product removed successfully!");
        // Update the UI by removing the product from the list
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error.response) {
        alert(`Failed to delete product: ${error.response.data.message}`);
      } else if (error.request) {
        alert("Failed to connect to the server. Please check your internet connection.");
      } else {
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  // Function to process the order after user confirmation
  const handleProcessOrder = async () => {
    if (!orderId) return; // Check for orderId

    setIsProcessing(true); // Set processing to ongoing
    try {
      const response = await axios.post(
        `https://m-and-m-e-shop-copy-3.onrender.com/api/orders/process/${orderId}`,
        {
          productsToRemove: selectedProducts, // Send selected products to remove
        }
      );

      // If processing is successful
      if (response.data.success) {
        setOrderStatus({
          success: true,
          message: response.data.message,
          order: response.data.order,
        });
        setError(null); // Clear error in case of success

        // Redirect to another page
        navigate(`/Payment`);
      }
    } catch (error) {
      // If there is an error in processing
      if (error.response && error.response.data) {
        setError({
          success: false,
          message: error.response.data.message,
          productDetails: error.response.data.productDetails,
        });
      } else {
        setError({
          success: false,
          message: "An unexpected error occurred.",
        });
      }
    } finally {
      setIsProcessing(false); // End processing after completing the request (whether successful or not)
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Processing Order</h2>
      {orderId ? <p>Order ID: {orderId}</p> : <p>Loading Order ID...</p>}

      <h3>Products in Cart</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((item, index) => (
          <li
            key={item._id}
            style={{
              marginBottom: "20px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <h4>{item.ProductId.name}</h4>
            <p>
              <strong>Description:</strong> {item.ProductId.description}
            </p>
            <p>
              <strong>Price:</strong> ${item.ProductId.price}
            </p>
            <p>
              <strong>Quantity:</strong> {item.ProductId.quantity}
            </p>
            <p>
              <strong>Usage Date:</strong>{" "}
              {new Date(item.usageDate).toLocaleDateString()}
            </p>
            <div>
              <strong>Images:</strong>
              {item.ProductId.images.map((image, imgIndex) => (
                <img
                  key={imgIndex}
                  src={image}
                  alt={`Product ${index + 1} - Image ${imgIndex + 1}`}
                  style={{ width: "100px", height: "100px", margin: "5px" }}
                />
              ))}
            </div>
            <button
              onClick={() => handleDeleteProduct(item._id)}
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                fontSize: "14px",
                backgroundColor: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete Product
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={handleProcessOrder}
        disabled={isProcessing || !orderId} // Disable the button during processing or if orderId is not loaded
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: isProcessing ? "not-allowed" : "pointer",
        }}
      >
        {isProcessing ? "Processing..." : "Process Order"}
      </button>

      {orderStatus && orderStatus.success && (
        <div style={{ color: "green" }}>
          <h3>{orderStatus.message}</h3>
        </div>
      )}

      {error && !error.success && (
        <div style={{ color: "red" }}>
          <h3>{error.message}</h3>
          {error.productDetails && (
            <div>
              <p>
                <strong>Product Name:</strong> {error.productDetails.name}
              </p>
              <p>
                <strong>Description:</strong> {error.productDetails.description}
              </p>
              <p>
                <strong>Price:</strong> ${error.productDetails.price}
              </p>
              <p>
                <strong>Quantity Available:</strong>{" "}
                {error.productDetails.quantityAvailable}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessOrderPage;