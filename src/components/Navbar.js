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
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand name */}
        <Link to="/" className="navbar-logo">
          🥬 GreenGo
        </Link>

        {/* Navigation links and user section */}
        <div className="navbar-right">
          {/* Navigation links */}
          <ul className="navbar-menu">
            <li className="navbar-item">
              <Link to="/" className="navbar-link">
                Home
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/products" className="navbar-link">
                Products
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/cart" className="navbar-link">
                Cart
                {/* Show cart count badge if items exist */}
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="navbar-item">
                  <Link to="/account" className="navbar-link">
                    Account
                  </Link>
                </li>
                <li className="navbar-item">
                  <Link to="/support" className="navbar-link">
                    Support
                  </Link>
                </li>
              </>
            )}
            {isAdminUser && (
              <li className="navbar-item">
                <Link to="/admin" className="navbar-link admin-link">
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
              <Link to="/login" className="auth-link-btn">
                Login
              </Link>
              <Link to="/register" className="auth-link-btn register-btn">
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

