import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // استيراد useNavigate
import axios from 'axios';

const ResponsePage = () => {
  const [statusMessage, setStatusMessage] = useState('Processing your response...');
  const [transactionCode, setTransactionCode] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const navigate = useNavigate(); // إنشاء navigate

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    // قراءة المعلمات من رابط URL
    const id = queryParams.get('id');
    const pending = queryParams.get('pending');
    const amountCents = queryParams.get('amount_cents');
    const success = queryParams.get('success');
    const currency = queryParams.get('currency');
    const txnResponseCode = queryParams.get('txn_response_code');
    const dataMessage = queryParams.get('data.message');
    const orderNumberParam = queryParams.get('order'); // رقم الطلب

    // التحقق إذا لم يتم إرسال الطلب مسبقًا
    if (!isRequestSent && (success === 'true' || pending === 'true')) {
      setIsRequestSent(true); // تعيين الحالة لإيقاف الطلبات المتكررة

      axios
        .post('http://localhost:5000/api/orders/update-transaction', {
          id,
          pending,
          amount_cents: amountCents,
          success,
          currency,
          txn_response_code: txnResponseCode,
          data_message: dataMessage,
          orderNumber: orderNumberParam,
        })
        .then((response) => {
          console.log('Response from backend:', response.data);

          if (response.data.order?.success) {
            setStatusMessage('Payment Successful!');
            setTransactionCode(response.data.order.txn_response_code);
            setOrderNumber(response.data.order.orderNumber);
          } else if (response.data.order?.pending) {
            setStatusMessage('Payment is Pending.');
          } else {
            setStatusMessage('Payment Failed2!');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
    }
  }, [isRequestSent]); // الاعتماد على isRequestSent فقط لتجنب طلبات متكررة

 

  const handleNavigate = () => {
    navigate('/myorder'); // توجيه المستخدم إلى صفحة "My Order"
  };

  return (
    <div className="custom-response">
      <h2
        className={`response-title ${
          statusMessage.includes('Failed') ? 'error' : ''
        }`}
      >
        {statusMessage}
      </h2>
      {transactionCode && (
        <>
          <p className="response-code">Transaction Code: {transactionCode}</p>
        </>
      )}
      {orderNumber && (
        <p className="order-number">Order Number: {orderNumber}</p>
      )}
      
      {/* إظهار زر التنقل إذا كانت البيانات موجودة */}
      {transactionCode && orderNumber && (
        <button onClick={handleNavigate} className="navigate-button">
          الانتقال إلى طلباتي
        </button>
      )}
    </div>
  );
};

export default ResponsePage;
