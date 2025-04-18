import React from 'react';
import '../style/Footer.css'; // ملف CSS الخاص بـ Footer
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        {/* روابط التنقل */}
      

       

        {/* وسائل التواصل الاجتماعي */}
        <div className="footer__social">
          <h4>Follow Us</h4>
          <div className="footer__social-icons">
       
            <a href="https://www.instagram.com/mmsce.nts?igsh=NWRtMW01MWlza3Fh" target="_blank" rel="noopener noreferrer"><img src='https://img.freepik.com/free-vector/instagram-logo_1199-122.jpg?semt=ais_hybrid' width="30px"></img></a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        
      </div>
    </footer>
  );
};

export default Footer;
