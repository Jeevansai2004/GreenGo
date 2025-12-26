import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCurrentUser } from '../utils/authHelper';
import { saveOrder } from '../utils/orderHelper';
import './Checkout.css';

// Checkout page component - order form and success message
const Checkout = () => {
  const navigate = useNavigate();
  const { getCart, clearCart } = useCart();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    delivery: 'Cash on Delivery'
  });

  // Order success state
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Check if cart is empty on mount
  useEffect(() => {
    const checkCart = async () => {
      const cartItems = await getCart();
      if (cartItems.length === 0 && !orderSuccess) {
        // Redirect to products if cart is empty (but not if order is successful)
        navigate('/products');
      }
    };
    checkCart();
  }, [navigate, getCart, orderSuccess]);

  // Hide navbar when showing order confirmation
  useEffect(() => {
    if (orderSuccess) {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.style.display = 'none';
      }
      return () => {
        if (navbar) {
          navbar.style.display = '';
        }
      };
    }
  }, [orderSuccess]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // State to store order details
  const [orderDetails, setOrderDetails] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Get cart items before clearing
      const cartItems = await getCart();
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Get current user for order
      const currentUser = getCurrentUser();
      
      // Store order details
      const newOrderDetails = {
        orderId: `ORD-${Date.now()}`,
        userEmail: currentUser ? currentUser.email : '', // Store user email for filtering
        userId: currentUser ? currentUser.id : null, // Store user ID
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        items: cartItems,
        total: total,
        delivery: formData.delivery,
        status: 'pending', // Order status: pending, delivered
        date: new Date().toISOString() // Store order date
      };
      
      // Save order to Firestore
      await saveOrder(newOrderDetails);
      
      // Set both states - React will batch these updates
      setOrderDetails(newOrderDetails);
      setOrderSuccess(true);
      
      // Clear cart after successful order
      await clearCart();
      
      // Redirect to home after 6 seconds (longer to see confirmation)
      setTimeout(() => {
        navigate('/');
      }, 6000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  // If order is successful, show success message with order details
  if (orderSuccess && orderDetails) {
    return (
      <div className="order-confirmation-page">
        <div className="order-confirmation-container">
          {/* Animated tick mark */}
          <div className="success-icon-wrapper">
            <svg className="success-icon-svg" viewBox="0 0 100 100">
              {/* Circle background */}
              <circle
                className="success-circle"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="4"
              />
              {/* Checkmark */}
              <path
                className="success-checkmark"
                d="M30 50 L45 65 L70 35"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Success message */}
          <h1 className="order-success-title">Order Placed Successfully!</h1>
          <p className="order-success-subtitle">Thank you for your order, {orderDetails.name}!</p>
          
          {/* Order details card */}
          <div className="order-details-card">
            <h2 className="order-details-title">Order Details</h2>
            
            <div className="order-info-section">
              <div className="order-info-item">
                <span className="order-label">Order ID:</span>
                <span className="order-value">{orderDetails.orderId}</span>
              </div>
              
              <div className="order-info-item">
                <span className="order-label">Total Amount:</span>
                <span className="order-value highlight">₹{orderDetails.total}</span>
              </div>
              
              <div className="order-info-item">
                <span className="order-label">Payment Method:</span>
                <span className="order-value">{orderDetails.delivery}</span>
              </div>
              
              <div className="order-info-item">
                <span className="order-label">Phone Number:</span>
                <span className="order-value">{orderDetails.phone}</span>
              </div>
              
              <div className="order-info-item address-item">
                <span className="order-label">Delivery Address:</span>
                <span className="order-value address-text">{orderDetails.address}</span>
              </div>
            </div>
          </div>

          {/* Delivery message */}
          <p className="delivery-message">🚚 We'll deliver your fresh produce soon!</p>
          <p className="redirect-message">Redirecting to home page in a few seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>
        
        {/* Order form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          {/* Name field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Phone field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Address field */}
          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Address <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Enter your delivery address"
              rows="4"
              required
            />
          </div>

          {/* Delivery method field */}
          <div className="form-group">
            <label htmlFor="delivery" className="form-label">
              Delivery Method
            </label>
            <select
              id="delivery"
              name="delivery"
              value={formData.delivery}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>

          {/* Submit button */}
          <button type="submit" className="submit-order-btn">
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

