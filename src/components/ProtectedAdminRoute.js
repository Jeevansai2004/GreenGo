import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../utils/adminHelper';

// Protected Admin Route component - only allows admin users
const ProtectedAdminRoute = ({ children }) => {
  const [isAdminUser, setIsAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAdminUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;

