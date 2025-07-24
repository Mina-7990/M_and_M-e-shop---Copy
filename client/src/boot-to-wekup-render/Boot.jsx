import React, { useEffect } from 'react';

const Boot = () => {
    useEffect(() => {
        const keepAlive = () => {
            fetch('https://m-and-m-e-shop-copy-3.onrender.com/api/orders/send-order-email', {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
        };

        // تشغيل الفانكشن كل 5 دقايق
        const intervalId = setInterval(keepAlive, 300000); // 300000 ميلي ثانية = 5 دقايق

        // تنظيف الـ interval لما الـ component يتقفل
        return () => clearInterval(intervalId);
    }, []);

    return null; // مافيش حاجة هتظهر على الصفحة
};

export default Boot;
