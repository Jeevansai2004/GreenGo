import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main footer columns */}
        <div className="footer-columns">
          {/* Column 1: Get to Know Us */}
          <div className="footer-column">
            <h3 className="footer-heading">Get to Know Us</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about" className="footer-link">About GreenGo</Link>
              </li>
              <li>
                <Link to="/mission" className="footer-link">Our Mission</Link>
              </li>
              <li>
                <Link to="/fresh-safe" className="footer-link">Fresh & Safe Promise</Link>
              </li>
              <li>
                <Link to="/delivery" className="footer-link">Delivery Coverage</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Connect With Us */}
          <div className="footer-column">
            <h3 className="footer-heading">Connect With Us</h3>
            <ul className="footer-links">
              <li>
                <a 
                  href="https://wa.me/1234567890" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-link"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a 
                  href="https://instagram.com/greengo" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-link"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@greengo.com" 
                  className="footer-link"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="footer-column">
            <h3 className="footer-heading">Customer Support</h3>
            <ul className="footer-links">
              <li>
                <Link to="/help" className="footer-link">Help Center</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="footer-link">Refund / Replacement Policy</Link>
              </li>
              <li>
                <Link to="/order-issues" className="footer-link">Order Issues</Link>
              </li>
              <li>
                <Link to="/faqs" className="footer-link">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Partner With Us */}
          <div className="footer-column">
            <h3 className="footer-heading">Partner With Us</h3>
            <ul className="footer-links">
              <li>
                <Link to="/sell" className="footer-link">Sell on GreenGo</Link>
              </li>
              <li>
                <Link to="/deliver" className="footer-link">Deliver With Us</Link>
              </li>
              <li>
                <Link to="/list-farm" className="footer-link">List Your Farm</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="footer-bottom">
          {/* Logo/Name */}
          <div className="footer-logo">
            <Link to="/" className="footer-logo-link">
              🥬 GreenGo
            </Link>
          </div>

          {/* Language and Country */}
          <div className="footer-locale">
            <div className="locale-selector">
              <span className="locale-label">Language:</span>
              <select className="locale-select" aria-label="Select language">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="te">తెలుగు</option>
              </select>
            </div>
            <div className="locale-selector">
              <span className="locale-label">Country:</span>
              <select className="locale-select" aria-label="Select country">
                <option value="in">India</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
              </select>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-copyright">
            <p>© 2025 GreenGo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

