// Cart helper utility functions
// Now uses Firestore instead of localStorage
// Falls back to localStorage if user is not logged in (for guest users)

import { 
  getCartFromFirestore,
  saveCartToFirestore,
  addToCartFirestore,
  removeFromCartFirestore,
  updateCartQuantityFirestore,
  clearCartFirestore,
  getCartItemCountFirestore,
  getCartTotalFirestore
} from './firestoreHelper';
import { getCurrentUser } from './authHelper';
import { getCurrentFirebaseUser } from './firebaseAuth';

// Helper to get current user ID
const getUserId = () => {
  // Try Firebase auth first (for real-time updates)
  const firebaseUser = getCurrentFirebaseUser();
  if (firebaseUser && firebaseUser.uid) {
    return firebaseUser.uid;
  }
  
  // Fallback to localStorage user
  const user = getCurrentUser();
  if (user && user.id) {
    return user.id;
  }
  
  return null;
};

// Get cart items (from Firestore if logged in, localStorage if guest)
export const getCartItems = async () => {
  const userId = getUserId();
  console.log('getCartItems - userId:', userId); // Debug log
  
  if (userId) {
    // User is logged in - use Firestore
    try {
      const cart = await getCartFromFirestore(userId);
      console.log('getCartItems - Firestore cart:', cart); // Debug log
      return cart || [];
    } catch (error) {
      console.error('Error getting cart from Firestore, falling back to localStorage:', error);
      // Fallback to localStorage if Firestore fails
      const cart = localStorage.getItem('greengo_cart');
      return cart ? JSON.parse(cart) : [];
    }
  } else {
    // Guest user - fallback to localStorage
    const cart = localStorage.getItem('greengo_cart');
    const parsedCart = cart ? JSON.parse(cart) : [];
    console.log('getCartItems - localStorage cart:', parsedCart); // Debug log
    return parsedCart;
  }
};

// Save cart items (to Firestore if logged in, localStorage if guest)
export const saveCartItems = async (cart) => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    await saveCartToFirestore(userId, cart);
  } else {
    // Guest user - fallback to localStorage
    localStorage.setItem('greengo_cart', JSON.stringify(cart));
  }
};

// Add item to cart
export const addToCart = async (product) => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    try {
      const cart = await addToCartFirestore(userId, product);
      return cart;
    } catch (error) {
      console.error('Error adding to cart (Firestore):', error);
      // Fallback to localStorage if Firestore fails
      const cart = getCartItemsSync();
      const existingItem = cart.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('greengo_cart', JSON.stringify(cart));
      return cart;
    }
  } else {
    // Guest user - fallback to localStorage
    const cart = getCartItemsSync();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('greengo_cart', JSON.stringify(cart));
    return cart;
  }
};

// Helper for synchronous localStorage operations (guest users)
const getCartItemsSync = () => {
  const cart = localStorage.getItem('greengo_cart');
  return cart ? JSON.parse(cart) : [];
};

// Remove item from cart
export const removeFromCart = async (productId) => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    return await removeFromCartFirestore(userId, productId);
  } else {
    // Guest user - fallback to localStorage
    const cart = getCartItemsSync();
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('greengo_cart', JSON.stringify(updatedCart));
    return updatedCart;
  }
};

// Update item quantity in cart
export const updateCartItemQuantity = async (productId, quantity) => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    return await updateCartQuantityFirestore(userId, productId, quantity);
  } else {
    // Guest user - fallback to localStorage
    const cart = getCartItemsSync();
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(0, quantity) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    localStorage.setItem('greengo_cart', JSON.stringify(updatedCart));
    return updatedCart;
  }
};

// Clear entire cart
export const clearCart = async () => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    await clearCartFirestore(userId);
  } else {
    // Guest user - fallback to localStorage
    localStorage.removeItem('greengo_cart');
  }
};

// Get total number of items in cart
export const getCartItemCount = async () => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    return await getCartItemCountFirestore(userId);
  } else {
    // Guest user - fallback to localStorage
    const cart = getCartItemsSync();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }
};

// Get total price of all items in cart
export const getCartTotal = async () => {
  const userId = getUserId();
  
  if (userId) {
    // User is logged in - use Firestore
    return await getCartTotalFirestore(userId);
  } else {
    // Guest user - fallback to localStorage
    const cart = getCartItemsSync();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};

