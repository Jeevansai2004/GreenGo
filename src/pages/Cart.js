import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCartTotal } from '../utils/cartHelper';
import './Cart.css';

// Cart page component - displays cart items with quantity controls
const Cart = () => {
  // Get cart functions from context
  const { getCart, updateCartItemQuantity, removeFromCart, cartItems: contextCartItems } = useCart();
  
  // State to store cart items
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load cart items from context on component mount and when cart updates
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const items = await getCart();
        console.log('Cart items loaded:', items); // Debug log
        setCartItems(items || []);
        
        // Calculate total
        const cartTotal = await getCartTotal();
        setTotal(cartTotal);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    
    // Load initial cart
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [getCart]);

  // Also use cartItems from context if available (for real-time updates)
  useEffect(() => {
    if (contextCartItems && contextCartItems.length > 0) {
      setCartItems(contextCartItems);
      const calculatedTotal = contextCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotal(calculatedTotal);
    }
  }, [contextCartItems]);

  // Handle quantity increase
  const handleIncreaseQuantity = async (productId) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      await updateCartItemQuantity(productId, item.quantity + 1);
      // Cart will update via event listener
    }
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = async (productId) => {
    const item = cartItems.find(item => item.id === productId);
    if (item && item.quantity > 1) {
      await updateCartItemQuantity(productId, item.quantity - 1);
      // Cart will update via event listener
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
    // Cart will update via event listener
  };

  // Navigate to checkout
  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Cart</h1>
          <div className="loading-message">Loading cart...</div>
        </div>
      </div>
    );
  }

  // If cart is empty, show empty state
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Cart</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some fresh products to get started!</p>
            <Link to="/products" className="shop-now-btn">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>

        {/* Cart items list */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              {/* Item image */}
              <div className="cart-item-image">
                <img 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=' + item.name;
                  }}
                />
              </div>

              {/* Item details */}
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">₹{item.price} each</p>
              </div>

              {/* Quantity controls */}
              <div className="cart-item-quantity">
                <button 
                  className="quantity-btn decrease"
                  onClick={() => handleDecreaseQuantity(item.id)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button 
                  className="quantity-btn increase"
                  onClick={() => handleIncreaseQuantity(item.id)}
                >
                  +
                </button>
              </div>

              {/* Item total */}
              <div className="cart-item-total">
                <p className="item-total-price">
                  ₹{item.price * item.quantity}
                </p>
              </div>

              {/* Remove button */}
              <button 
                className="remove-btn"
                onClick={() => handleRemoveItem(item.id)}
                title="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Cart summary */}
        <div className="cart-summary">
          <div className="summary-row">
            <span className="summary-label">Total:</span>
            <span className="summary-value">₹{total}</span>
          </div>
          
          {/* Go to Checkout button */}
          <button className="checkout-btn" onClick={handleCheckout}>
            Go to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

