// Admin helper utility functions
// Handles admin authentication and admin operations

import { getCurrentFirebaseUser } from './firebaseAuth';
import { getUserProfileFromFirestore } from './firestoreHelper';

// Check if current user is an admin
export const isAdmin = async () => {
  try {
    const user = getCurrentFirebaseUser();
    if (!user) return false;
    
    // Get user profile from Firestore
    const userProfile = await getUserProfileFromFirestore(user.uid);
    
    // Check if user has admin role
    return userProfile?.role === 'admin' || userProfile?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Check if user is admin synchronously (from localStorage)
export const isAdminSync = () => {
  try {
    const userStr = localStorage.getItem('greengo_currentUser');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user?.role === 'admin' || user?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Set user as admin (for initial admin setup)
export const setUserAsAdmin = async (userId, isAdmin = true) => {
  try {
    const { updateUserProfileInFirestore } = await import('./firestoreHelper');
    await updateUserProfileInFirestore(userId, { 
      role: 'admin',
      isAdmin: isAdmin 
    });
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
};

