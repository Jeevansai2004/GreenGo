import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../utils/authHelper';

// Protected Route component - redirects to login if user is not authenticated
// Explicitly checks localStorage for currentUser to block access
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Explicitly check localStorage for currentUser
  const currentUser = getCurrentUser();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 80px)' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Block access if no currentUser in localStorage (even if context says authenticated)
  // This ensures localStorage is the source of truth
  if (!currentUser || !isAuthenticated) {
    // Redirect to login with return path and message
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please login to access checkout. You need to be logged in to place an order.'
        }} 
        replace 
      />
    );
  }

  // If authenticated and currentUser exists, render the protected component
  return children;
};

export default ProtectedRoute;

