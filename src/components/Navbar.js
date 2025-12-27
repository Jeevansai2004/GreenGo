import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { isAdminSync } from '../utils/adminHelper';
import './Navbar.css';

// Navbar component - displays navigation links, cart count, and user info
const Navbar = () => {
  // Get cart count from context (updates automatically)
  const { cartCount } = useCart();
  
  // Get auth state from context
  const { user, isAuthenticated, logout } = useAuth();
  
  // Check if user is admin
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Mobile menu toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        // Check from localStorage first (faster)
        const adminFromLocal = isAdminSync();
        setIsAdminUser(adminFromLocal);
        
        // Also check from Firestore to ensure it's up to date
        const { isAdmin } = await import('../utils/adminHelper');
        const adminFromFirestore = await isAdmin();
        if (adminFromFirestore !== adminFromLocal) {
          setIsAdminUser(adminFromFirestore);
        }
      } else {
        setIsAdminUser(false);
      }
    };
    
    checkAdmin();
  }, [isAuthenticated, user]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); // Close mobile menu on logout
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside or on a link
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand name */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          🥬 GreenGo
        </Link>

        {/* Mobile menu toggle button */}
        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation links and user section */}
        <div className={`navbar-right ${isMobileMenuOpen ? 'active' : ''}`}>
          {/* Navigation links */}
          <ul className="navbar-menu">
            <li className="navbar-item">
              <Link to="/" className="navbar-link" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/products" className="navbar-link" onClick={closeMobileMenu}>
                Products
              </Link>
            </li>
            {/* Only show cart link if cart has items */}
            {cartCount > 0 && (
              <li className="navbar-item">
                <Link to="/cart" className="navbar-link" onClick={closeMobileMenu}>
                  Cart
                  {/* Show cart count badge */}
                  <span className="cart-badge">{cartCount}</span>
                </Link>
              </li>
            )}
            {isAuthenticated && (
              <>
                <li className="navbar-item">
                  <Link to="/account" className="navbar-link" onClick={closeMobileMenu}>
                    Account
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/support" className="navbar-link" onClick={closeMobileMenu}>
                    Support
                  </Link>
                </li>
              </>
            )}
            {isAdminUser && (
              <li className="navbar-item">
                <Link to="/admin" className="navbar-link admin-link" onClick={closeMobileMenu}>
                  Admin
                </Link>
              </li>
            )}
          </ul>

          {/* User section */}
          {isAuthenticated ? (
            <div className="navbar-user">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="auth-link-btn" onClick={closeMobileMenu}>
                Login
              </Link>
              <Link to="/register" className="auth-link-btn register-btn" onClick={closeMobileMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

