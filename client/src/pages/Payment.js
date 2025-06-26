import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from '../components/Loading';

const UserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const storedOrderId = localStorage.getItem("orderId");
    if (storedOrderId) {
      setOrderId(storedOrderId);
    } else {
      setError("Order ID not found in localStorage.");
      setLoading(false);
    }

    const fetchUserInfo = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo || !userInfo.token) {
          setError("User is not authenticated. Please login first.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get("http://localhost:5000/api/auth/info", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        setUserData(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred. Please try again.");
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handlePayment = async () => {
    try {
      setProcessingPayment(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.token) {
        setError("User is not authenticated. Please login first.");
        setProcessingPayment(false);
        return;
      }

      if (!orderId) {
        setError("Order ID is missing.");
        setProcessingPayment(false);
        return;
      }

      const responseLocation = localStorage.getItem("location");
      if (!responseLocation) {
        setError("Location data is missing.");
        setProcessingPayment(false);
        return;
      }

      const paymentData = {
        orderId: orderId,
        firstName: userData.firstName,
        phone: userData.phone,
        lastName: userData.lastName,
        email: userData.email,
        location: responseLocation,
      };

      const response = await axios.post(
        "http://localhost:5000/api/paymob/create-payment",
        paymentData,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      const iframeUrl = response.data.iframeUrl;
      window.location.href = iframeUrl;
    } catch (err) {
      console.error("Error making payment:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCashPayment = async () => {
    // نافذة التأكيد قبل المضي في الدفع النقدي
    const isConfirmed = window.confirm("Are you sure you want to proceed with cash payment?");
    if (!isConfirmed) {
      return; // إذا رفض المستخدم، لا يتم تنفيذ أي شيء
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.token) {
        setError("User is not authenticated. Please login first.");
        return;
      }

      if (!orderId) {
        setError("Order ID is missing.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/activate-cash-payment`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      console.log("Cash payment activated:", response.data);

      // توجيه المستخدم إلى صفحة أخرى بعد نجاح العملية
      navigate("/cash-success");
    } catch (err) {
      console.error("Error activating cash payment:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  if (loading) {
    return <Loading />;
  }
  if (error) return <p>{error}</p>;

  return (
    <div className="payment-container">
      <h2>Payment Method</h2>
      <div className="payment-options">
        <button onClick={() => navigate("/mobilewallet")} className="payment-button">
          <img
            src="https://corefy.com/user/pages/02.glossary/mobile-wallet/Mobile_wallet.svg"
            width="100px"
            alt="Mobile Wallet"
          />
          <br /> PAY With Mobile Wallet <br />(coming soon)
        </button>
        <button
          onClick={handlePayment}
          className="payment-button"
          disabled={processingPayment}
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrl7vhZvYIwtEW1UR3kCrMpAbK0sYeRlBHOQ&s"
            width="120px"
            alt="Credit Card"
          />
          <br /> {processingPayment ? "Processing..." : "PAY with Credit Card Buy Now"}
        </button>

        <button onClick={handleCashPayment} className="payment-button">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRqjl2TLDhXPpVwVuD8BBo-zDJffpVSTw5EQ&s"
            width="100px"
            alt="Cash Payment"
          />
          <br /> cash <br />
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default UserInfo;
