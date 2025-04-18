import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('https://m-and-m-e-shop-copy-3.onrender.com/api/product/allproducts')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  const handleDelete = (productId) => {
    axios.delete(`https://m-and-m-e-shop-copy-3.onrender.comapi/product/productdelet/${productId}`)
      .then(() => {
        setProducts(products.filter(product => product._id !== productId));
      })
      .catch(error => {
        console.error('Error deleting product:', error);
      });
  };

  const handleUpdateSizeAndPrice = (productId) => {
    const size = prompt('أدخل الحجم الذي تريد تعديله:');
    const newSize = prompt('أدخل الحجم الجديد:');
    const newPrice = prompt('أدخل السعر الجديد:');

    if (!size || !newSize || !newPrice || isNaN(newPrice)) {
      alert('الرجاء إدخال بيانات صحيحة');
      return;
    }

    axios.put(`https://m-and-m-e-shop-copy-3.onrender.com/api/product/update/${productId}`, {
      size,
      newSize,
      newPrice: parseFloat(newPrice)
    })
      .then(response => {
        if (response.status === 200) {
          const updated = response.data.product;
          setProducts(products.map(p => p._id === productId ? updated : p));
        }
      })
      .catch(error => {
        console.error('خطأ أثناء التعديل:', error);
        alert('حدث خطأ أثناء تعديل المنتج');
      });
  };

  return (
    <div className="product-list-container">
      <h1 className="product-list-title">قائمة المنتجات</h1>
      <ul className="product-list">
        {products.map(product => (
          <li key={product._id} className="product-item">
            <span className="product-name">
              {product.name}
            </span>

            <ul>
              {product.sizes.map((s, index) => (
                <li key={index}>
                  الحجم: {s.size} - السعر: {s.price} جنيه
                </li>
              ))}
            </ul>

            <div className="product-actions">
              <button className="delete-button" onClick={() => handleDelete(product._id)}>حذف</button>
              <button className="update-button" onClick={() => handleUpdateSizeAndPrice(product._id)}>
                تعديل الحجم والسعر
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
