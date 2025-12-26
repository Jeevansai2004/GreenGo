import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Home page component - landing page with intro and CTA
const Home = () => {
  return (
    <div className="home">
      {/* Hero banner section */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">GreenGo</h1>
          <h2 className="hero-subtitle">Fresh Eats on Wheels</h2>
          <p className="hero-description">
            Get the freshest vegetables and fruits delivered right to your door. 
            Farm-fresh quality, delivered with care.
          </p>
          {/* Call to Action button */}
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features section */}
      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🥬</div>
            <h3>Fresh Produce</h3>
            <p>Hand-picked fresh vegetables and fruits daily</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable delivery to your doorstep</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Affordable prices for quality produce</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

