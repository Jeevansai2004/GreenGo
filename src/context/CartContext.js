import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getCartItems, 
  getCartItemCount,
  addToCart as addItemToCart,
  removeFromCart as removeItemFromCart,
  updateCartItemQuantity as updateItemQuantity,
  clearCart as clearCartItems
} from '../utils/cartHelper';
import { subscribeToCart } from '../utils/firestoreHelper';

// Create Cart Context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Cart Provider component - wraps the app and provides cart state
export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State to track cart items count (for triggering re-renders)
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Load cart count on mount and when user changes
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const items = await getCartItems();
        setCartItems(items);
        const count = await getCartItemCount();
        setCartCount(count);
      } catch (error) {
        console.error('Error loading cart data:', error);
      }
    };
    
    loadCartData();
    
    // If user is logged in, subscribe to real-time cart updates from Firestore
    if (isAuthenticated && user?.id) {
      const unsubscribe = subscribeToCart(user.id, (items) => {
        setCartItems(items || []);
        const count = items ? items.reduce((total, item) => total + item.quantity, 0) : 0;
        setCartCount(count);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      // Guest user - listen for localStorage changes
      const updateCart = async () => {
        try {
          const items = await getCartItems();
          setCartItems(items);
          const count = await getCartItemCount();
          setCartCount(count);
        } catch (error) {
          console.error('Error updating cart:', error);
        }
      };
      
      window.addEventListener('storage', updateCart);
      window.addEventListener('cartUpdated', updateCart);
      
      return () => {
        window.removeEventListener('storage', updateCart);
        window.removeEventListener('cartUpdated', updateCart);
      };
    }
  }, [isAuthenticated, user?.id]);

  // Add item to cart
  const addToCart = async (product) => {
    try {
      const updatedCart = await addItemToCart(product);
      
      // Update cartItems state immediately with the returned cart
      if (updatedCart && Array.isArray(updatedCart)) {
        setCartItems(updatedCart);
        const count = updatedCart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } else {
        // Fallback: reload cart data
        const items = await getCartItems();
        setCartItems(items);
        const count = await getCartItemCount();
        setCartCount(count);
      }
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Still try to update count
      try {
        const items = await getCartItems();
        setCartItems(items);
        const count = await getCartItemCount();
        setCartCount(count);
      } catch (e) {
        console.error('Error reloading cart after add error:', e);
      }
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await removeItemFromCart(productId);
      
      // Update cartItems state immediately
      if (updatedCart && Array.isArray(updatedCart)) {
        setCartItems(updatedCart);
        const count = updatedCart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } else {
        // Fallback: reload cart data
        const items = await getCartItems();
        setCartItems(items);
        const count = await getCartItemCount();
        setCartCount(count);
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Still try to update
      const items = await getCartItems();
      setCartItems(items);
      const count = await getCartItemCount();
      setCartCount(count);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Update item quantity
  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const updatedCart = await updateItemQuantity(productId, quantity);
      
      // Update cartItems state immediately
      if (updatedCart && Array.isArray(updatedCart)) {
        setCartItems(updatedCart);
        const count = updatedCart.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } else {
        // Fallback: reload cart data
        const items = await getCartItems();
        setCartItems(items);
        const count = await getCartItemCount();
        setCartCount(count);
      }
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Still try to update
      const items = await getCartItems();
      setCartItems(items);
      const count = await getCartItemCount();
      setCartCount(count);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  // Clear cart
  const clearCart = async () => {
    await clearCartItems();
    setCartCount(0);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Get cart items
  const getCart = async () => {
    const items = await getCartItems();
    return items;
  };

  // Value object to provide to consumers
  const value = {
    cartCount,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

