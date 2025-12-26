// Firestore helper utility functions
// Handles all Firestore database operations for cart, orders, and user data
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ==================== CART OPERATIONS ====================

// Get user's cart from Firestore
export const getCartFromFirestore = async (userId) => {
  try {
    if (!userId) return [];
    
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    
    if (cartSnap.exists()) {
      return cartSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting cart from Firestore:', error);
    return [];
  }
};

// Save cart to Firestore
export const saveCartToFirestore = async (userId, cartItems) => {
  try {
    if (!userId) {
      console.warn('No userId provided to saveCartToFirestore');
      return false;
    }
    
    if (!db) {
      console.error('Firestore database not initialized');
      return false;
    }
    
    const cartRef = doc(db, 'carts', userId);
    await setDoc(cartRef, {
      items: cartItems || [],
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error saving cart to Firestore:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId
    });
    return false;
  }
};

// Add item to cart in Firestore
export const addToCartFirestore = async (userId, product) => {
  try {
    if (!userId) {
      console.warn('No userId provided to addToCartFirestore');
      return [];
    }
    
    if (!db) {
      console.error('Firestore database not initialized');
      return [];
    }
    
    const cart = await getCartFromFirestore(userId);
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    const saved = await saveCartToFirestore(userId, cart);
    if (!saved) {
      console.error('Failed to save cart to Firestore');
      return cart; // Return updated cart even if save failed
    }
    
    return cart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      userId,
      productId: product?.id
    });
    throw error; // Re-throw to allow fallback handling
  }
};

// Remove item from cart in Firestore
export const removeFromCartFirestore = async (userId, productId) => {
  try {
    if (!userId) return [];
    
    const cart = await getCartFromFirestore(userId);
    const updatedCart = cart.filter(item => item.id !== productId);
    
    await saveCartToFirestore(userId, updatedCart);
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return [];
  }
};

// Update cart item quantity in Firestore
export const updateCartQuantityFirestore = async (userId, productId, quantity) => {
  try {
    if (!userId) return [];
    
    const cart = await getCartFromFirestore(userId);
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(0, quantity) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    await saveCartToFirestore(userId, updatedCart);
    return updatedCart;
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return [];
  }
};

// Clear cart in Firestore
export const clearCartFirestore = async (userId) => {
  try {
    if (!userId) return;
    
    await saveCartToFirestore(userId, []);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// Get cart item count from Firestore
export const getCartItemCountFirestore = async (userId) => {
  try {
    if (!userId) return 0;
    
    const cart = await getCartFromFirestore(userId);
    return cart.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

// Get cart total from Firestore
export const getCartTotalFirestore = async (userId) => {
  try {
    if (!userId) return 0;
    
    const cart = await getCartFromFirestore(userId);
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  } catch (error) {
    console.error('Error getting cart total:', error);
    return 0;
  }
};

// Listen to cart changes in real-time
export const subscribeToCart = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  const cartRef = doc(db, 'carts', userId);
  
  return onSnapshot(cartRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data().items || []);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error listening to cart:', error);
    callback([]);
  });
};

// Migrate guest cart from localStorage to Firestore
export const migrateGuestCartToFirestore = async (userId) => {
  try {
    if (!userId) return;
    
    // Get guest cart from localStorage
    const guestCartStr = localStorage.getItem('greengo_cart');
    if (!guestCartStr) return;
    
    const guestCart = JSON.parse(guestCartStr);
    if (guestCart.length === 0) return;
    
    // Get existing Firestore cart
    const firestoreCart = await getCartFromFirestore(userId);
    
    // Merge carts (prefer Firestore items, add guest items that don't exist)
    const mergedCart = [...firestoreCart];
    
    guestCart.forEach(guestItem => {
      const existingItem = mergedCart.find(item => item.id === guestItem.id);
      if (existingItem) {
        // If item exists, increase quantity
        existingItem.quantity += guestItem.quantity;
      } else {
        // If item doesn't exist, add it
        mergedCart.push(guestItem);
      }
    });
    
    // Save merged cart to Firestore
    await saveCartToFirestore(userId, mergedCart);
    
    // Clear localStorage cart
    localStorage.removeItem('greengo_cart');
    
    return mergedCart;
  } catch (error) {
    console.error('Error migrating guest cart:', error);
  }
};

// ==================== ORDER OPERATIONS ====================

// Save order to Firestore
export const saveOrderToFirestore = async (order) => {
  try {
    const ordersRef = collection(db, 'orders');
    const orderData = {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(ordersRef, orderData);
    return { ...order, id: docRef.id };
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    throw error;
  }
};

// Get all orders for a user from Firestore
export const getUserOrdersFromFirestore = async (userEmail) => {
  try {
    if (!userEmail) return [];
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userEmail', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by date (newest first)
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || a.date ? new Date(a.date) : new Date(0);
      const dateB = b.createdAt?.toDate() || b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting user orders from Firestore:', error);
    return [];
  }
};

// Listen to user orders in real-time
export const subscribeToUserOrders = (userEmail, callback) => {
  if (!userEmail) {
    callback([]);
    return () => {};
  }
  
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userEmail', '==', userEmail));
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date (newest first)
      const sortedOrders = orders.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || a.date ? new Date(a.date) : new Date(0);
        const dateB = b.createdAt?.toDate() || b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
      });
      
      callback(sortedOrders);
    }, (error) => {
      console.error('Error listening to user orders:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up user orders listener:', error);
    callback([]);
    return () => {};
  }
};

// Get a single order by ID from Firestore
export const getOrderByIdFromFirestore = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting order from Firestore:', error);
    return null;
  }
};

// Get all orders from Firestore (admin only)
export const getAllOrdersFromFirestore = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const querySnapshot = await getDocs(ordersRef);
    
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by date (newest first)
    return orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || a.date ? new Date(a.date) : new Date(0);
      const dateB = b.createdAt?.toDate() || b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting all orders from Firestore:', error);
    return [];
  }
};

// Update order status in Firestore (admin only)
export const updateOrderStatusInFirestore = async (orderId, status) => {
  try {
    if (!orderId || !status) return false;
    
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// ==================== PRODUCT OPERATIONS (ADMIN) ====================

// Get all products from Firestore
export const getProductsFromFirestore = async () => {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const products = [];
    querySnapshot.forEach((doc) => {
      const productData = doc.data();
      // Remove numeric 'id' from productData if it exists (to avoid overwriting Firestore doc ID)
      const { id: numericId, ...restData } = productData;
      products.push({
        id: doc.id, // Firestore document ID (this is the one we need for deletion)
        originalId: numericId, // Keep original numeric ID if it exists (for reference)
        ...restData // Rest of product data without the numeric id
      });
    });
    
    // Sort by id
    return products.sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
      const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
      return idA - idB;
    });
  } catch (error) {
    console.error('Error getting products from Firestore:', error);
    return [];
  }
};

// Add product to Firestore (admin only)
export const addProductToFirestore = async (product) => {
  try {
    const productsRef = collection(db, 'products');
    const productData = {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(productsRef, productData);
    return { ...product, id: docRef.id };
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
    throw error;
  }
};

// Update product in Firestore (admin only)
export const updateProductInFirestore = async (productId, productData) => {
  try {
    if (!productId) return false;
    
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating product in Firestore:', error);
    return false;
  }
};

// Delete product from Firestore (admin only)
export const deleteProductFromFirestore = async (productId) => {
  try {
    if (!productId) {
      console.error('No productId provided to deleteProductFromFirestore');
      return false;
    }
    
    if (!db) {
      console.error('Firestore database not initialized');
      return false;
    }
    
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    
    console.log('Product deleted successfully:', productId);
    return true;
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      productId
    });
    throw error; // Re-throw to allow caller to handle
  }
};

// ==================== USER PROFILE OPERATIONS ====================

// Save user profile to Firestore
export const saveUserProfileToFirestore = async (userId, userData) => {
  try {
    if (!userId) return false;
    
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
    return false;
  }
};

// Get user profile from Firestore
export const getUserProfileFromFirestore = async (userId) => {
  try {
    if (!userId) return null;
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile from Firestore:', error);
    return null;
  }
};

// Update user profile in Firestore
export const updateUserProfileInFirestore = async (userId, updatedData) => {
  try {
    if (!userId) return false;
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile in Firestore:', error);
    return false;
  }
};

// ==================== SUPPORT TICKET OPERATIONS ====================

// Save support ticket to Firestore
export const saveSupportTicketToFirestore = async (ticketData) => {
  try {
    const ticketsRef = collection(db, 'support_tickets');
    const ticketDoc = {
      ...ticketData,
      status: ticketData.status || 'Open',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(ticketsRef, ticketDoc);
    return { ...ticketData, id: docRef.id };
  } catch (error) {
    console.error('Error saving support ticket to Firestore:', error);
    throw error;
  }
};

// Get all support tickets for a user from Firestore
export const getUserSupportTicketsFromFirestore = async (userId) => {
  try {
    if (!userId) return [];
    
    const ticketsRef = collection(db, 'support_tickets');
    const q = query(ticketsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by date (newest first)
    return tickets.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting user support tickets from Firestore:', error);
    return [];
  }
};

// Get all support tickets from Firestore (admin only)
export const getAllSupportTicketsFromFirestore = async () => {
  try {
    const ticketsRef = collection(db, 'support_tickets');
    const querySnapshot = await getDocs(ticketsRef);
    
    const tickets = [];
    querySnapshot.forEach((doc) => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by date (newest first)
    return tickets.sort((a, b) => {
      const dateA = a.createdAt?.toDate() || new Date(0);
      const dateB = b.createdAt?.toDate() || new Date(0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting all support tickets from Firestore:', error);
    return [];
  }
};

// Update support ticket status in Firestore (admin only)
export const updateSupportTicketStatusInFirestore = async (ticketId, status) => {
  try {
    if (!ticketId || !status) return false;
    
    const ticketRef = doc(db, 'support_tickets', ticketId);
    await updateDoc(ticketRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating support ticket status:', error);
    return false;
  }
};

// Add reply to support ticket
export const addReplyToTicket = async (ticketId, userId, message) => {
  try {
    if (!ticketId || !userId || !message) {
      console.error('Missing required parameters:', { ticketId, userId, message: !!message });
      return false;
    }
    
    if (!db) {
      console.error('Firestore database not initialized');
      return false;
    }
    
    const ticketRef = doc(db, 'support_tickets', ticketId);
    const ticketSnap = await getDoc(ticketRef);
    
    if (!ticketSnap.exists()) {
      console.error('Ticket does not exist:', ticketId);
      return false;
    }
    
    const ticketData = ticketSnap.data();
    const replies = Array.isArray(ticketData.replies) ? [...ticketData.replies] : [];
    
    // Add new reply with regular Date (serverTimestamp() cannot be used inside arrays)
    replies.push({
      userId: userId,
      message: message,
      timestamp: new Date() // Use regular Date instead of serverTimestamp() for array items
    });
    
    // Update ticket with new reply
    await updateDoc(ticketRef, {
      replies: replies,
      updatedAt: serverTimestamp() // serverTimestamp() is fine for document-level fields
    });
    
    console.log('Reply added successfully to ticket:', ticketId);
    return true;
  } catch (error) {
    console.error('Error adding reply to ticket:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      ticketId,
      userId
    });
    throw error; // Re-throw to allow caller to handle
  }
};

// Listen to user support tickets in real-time
export const subscribeToUserTickets = (userId, callback) => {
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  try {
    const ticketsRef = collection(db, 'support_tickets');
    const q = query(ticketsRef, where('userId', '==', userId));
    
    return onSnapshot(q, (querySnapshot) => {
      const tickets = [];
      querySnapshot.forEach((doc) => {
        tickets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date (newest first)
      const sortedTickets = tickets.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      callback(sortedTickets);
    }, (error) => {
      console.error('Error listening to user tickets:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up user tickets listener:', error);
    callback([]);
    return () => {};
  }
};

// Listen to all support tickets in real-time (admin only)
export const subscribeToAllTickets = (callback) => {
  try {
    const ticketsRef = collection(db, 'support_tickets');
    
    return onSnapshot(ticketsRef, (querySnapshot) => {
      const tickets = [];
      querySnapshot.forEach((doc) => {
        tickets.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by date (newest first)
      const sortedTickets = tickets.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      callback(sortedTickets);
    }, (error) => {
      console.error('Error listening to all tickets:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up all tickets listener:', error);
    callback([]);
    return () => {};
  }
};

