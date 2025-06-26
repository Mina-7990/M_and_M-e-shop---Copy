import React, { useState, useEffect } from 'react';
import '../style/home.css';
import Allproduct from './Allproduct';
import Catigory from './Catigory';
import Offer from './Offer';
import Loading from '../components/Loading';

function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for components
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="home-loading-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="home-container">
    <Offer />
      <Catigory />
      <Allproduct />
    </div>
  );
}

export default Home;
