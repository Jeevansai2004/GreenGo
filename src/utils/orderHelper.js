// Order helper utility functions
// Now uses Firestore instead of localStorage
import { 
  saveOrderToFirestore,
  getUserOrdersFromFirestore,
  getOrderByIdFromFirestore
} from './firestoreHelper';

// Save a new order to Firestore
export const saveOrder = async (order) => {
  try {
    return await saveOrderToFirestore(order);
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Get all orders (deprecated - use getUserOrders instead)
// Kept for backward compatibility
export const getOrders = async () => {
  // This function is deprecated - orders should be fetched by user email
  console.warn('getOrders() is deprecated. Use getUserOrders(userEmail) instead.');
  return [];
};

// Get orders for a specific user (by email) from Firestore
export const getUserOrders = async (userEmail) => {
  try {
    return await getUserOrdersFromFirestore(userEmail);
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

// Get a single order by order ID from Firestore
export const getOrderById = async (orderId) => {
  try {
    return await getOrderByIdFromFirestore(orderId);
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return null;
  }
};

