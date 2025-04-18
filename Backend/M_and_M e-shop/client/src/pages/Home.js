import React from 'react';
import '../style/home.css';
import Allproduct from './Allproduct';
import Catigory from './Catigory';
import Offer from './Offer';
function Home() {
  return (
   <div>
    <Offer />
      <Catigory />
      <Allproduct />



     
    </div>
  );
}

export default Home;
