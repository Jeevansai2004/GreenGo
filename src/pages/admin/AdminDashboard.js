import React, { useState, useEffect } from 'react';
import { getAllOrdersFromFirestore } from '../../utils/firestoreHelper';
import { getProductsFromFirestore } from '../../utils/firestoreHelper';
import { isAdmin } from '../../utils/adminHelper';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

// Admin Dashboard component - shows statistics and overview
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      // Check if user is admin
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        // Get all orders
        const orders = await getAllOrdersFromFirestore();
        
        // Get all products
        const products = await getProductsFromFirestore();
        
        // Calculate statistics
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
        const totalRevenue = orders
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + (order.total || 0), 0);
        const totalProducts = products.length;

        setStats({
          totalOrders,
          pendingOrders,
          deliveredOrders,
          totalRevenue,
          totalProducts
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="loading-message">Loading statistics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">Admin Dashboard</h1>
        
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3 className="stat-label">Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3 className="stat-label">Pending Orders</h3>
              <p className="stat-value">{stats.pendingOrders}</p>
            </div>
          </div>

          <div className="stat-card delivered">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-label">Delivered Orders</h3>
              <p className="stat-value">{stats.deliveredOrders}</p>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="stat-label">Total Revenue</h3>
              <p className="stat-value">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card products">
            <div className="stat-icon">🛍️</div>
            <div className="stat-content">
              <h3 className="stat-label">Total Products</h3>
              <p className="stat-value">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/orders')}
            >
              Manage Orders
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/products')}
            >
              Manage Products
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/admin/support')}
            >
              Support Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

