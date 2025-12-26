import React, { useState, useEffect } from 'react';
import { getAllOrdersFromFirestore, updateOrderStatusInFirestore } from '../../utils/firestoreHelper';
import { isAdmin } from '../../utils/adminHelper';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

// Admin Orders component - manage all customer orders
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, delivered
  const navigate = useNavigate();

  // Load all orders
  useEffect(() => {
    const loadOrders = async () => {
      // Check if user is admin
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const allOrders = await getAllOrdersFromFirestore();
        setOrders(allOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const success = await updateOrderStatusInFirestore(orderId, newStatus);
      if (success) {
        // Update local state
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  // Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date not available';
    let date;
    if (dateValue.toDate) {
      date = dateValue.toDate();
    } else {
      date = new Date(dateValue);
    }
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1 className="admin-title">Manage Orders</h1>
          <div className="loading-message">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Manage Orders</h1>
          <button 
            className="back-btn"
            onClick={() => navigate('/admin')}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders ({orders.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
            onClick={() => setFilter('delivered')}
          >
            Delivered ({orders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card-admin">
                <div className="order-header-admin">
                  <div>
                    <h3 className="order-id">Order ID: {order.orderId}</h3>
                    <p className="order-date">{formatDate(order.createdAt || order.date)}</p>
                  </div>
                  <span className={`status-badge ${order.status}`}>
                    {order.status || 'pending'}
                  </span>
                </div>

                <div className="order-details-admin">
                  <div className="detail-row">
                    <span className="detail-label">Customer:</span>
                    <span className="detail-value">{order.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{order.userEmail}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{order.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{order.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-value">{order.delivery || 'Cash on Delivery'}</span>
                  </div>
                </div>

                <div className="order-items-admin">
                  <h4>Items:</h4>
                  <ul>
                    {order.items?.map((item, index) => (
                      <li key={index}>
                        {item.name} - Qty: {item.quantity} × ₹{item.price} = ₹{item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-footer-admin">
                  <div className="order-total-admin">
                    <strong>Total: ₹{order.total}</strong>
                  </div>
                  {order.status === 'pending' && (
                    <button
                      className="mark-delivered-btn"
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

