import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, logoutFromFirebase } from '../utils/firebaseAuth';
import { migrateGuestCartToFirestore } from '../utils/firestoreHelper';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider component - wraps the app and provides auth state
export const AuthProvider = ({ children }) => {
  // State to track current user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChange(async (userData) => {
      setUser(userData);
      
      // If user just logged in, migrate guest cart to Firestore
      if (userData?.id) {
        await migrateGuestCartToFirestore(userData.id);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Login function - updates user state (called after successful Firebase login)
  const login = (userData) => {
    setUser(userData);
  };

  // Logout function - clears user state using Firebase
  const logout = async () => {
    try {
      await logoutFromFirebase();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if Firebase logout fails
      setUser(null);
    }
  };

  // Value object to provide to consumers
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

