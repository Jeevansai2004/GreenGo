import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../utils/authHelper';
import { updateFirebaseProfile } from '../utils/firebaseAuth';
import { saveUserProfileToFirestore } from '../utils/firestoreHelper';
import { getUserOrders } from '../utils/orderHelper';
import { subscribeToUserOrders, getUserSupportTicketsFromFirestore, subscribeToUserTickets } from '../utils/firestoreHelper';
import './Account.css';

// Account page component - displays user profile and order history
const Account = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State for user and orders
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for collapsible sections
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [ticketsExpanded, setTicketsExpanded] = useState(false);
  
  // State for edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: ''
  });
  const [editErrors, setEditErrors] = useState({
    name: '',
    email: ''
  });
  const [editError, setEditError] = useState('');

  // Check authentication and load data on mount
  useEffect(() => {
    // Get current user from localStorage
    const currentUser = getCurrentUser();
    
    // If no user, redirect to login
    if (!currentUser || !isAuthenticated) {
      navigate('/login', { 
        state: { 
          message: 'Please login to view your account',
          from: { pathname: '/account' }
        } 
      });
      return;
    }
    
    // Set user state
    setUser(currentUser);
    
    // Get user's orders and tickets from Firestore
    const loadData = async () => {
      try {
        const userOrders = await getUserOrders(currentUser.email);
        setOrders(userOrders);
        
        const userTickets = await getUserSupportTicketsFromFirestore(currentUser.id);
        setTickets(userTickets);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setOrders([]);
        setTickets([]);
        setLoading(false);
      }
    };
    
    loadData();
    
    // Subscribe to real-time order updates (so status changes appear immediately)
    const unsubscribeOrders = subscribeToUserOrders(currentUser.email, (updatedOrders) => {
      setOrders(updatedOrders);
    });
    
    // Subscribe to real-time ticket updates
    const unsubscribeTickets = subscribeToUserTickets(currentUser.id, (updatedTickets) => {
      setTickets(updatedTickets);
    });
    
    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeTickets) unsubscribeTickets();
    };
  }, [navigate, isAuthenticated]);

  // Show loading state
  if (loading) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="loading-message">Loading...</div>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateValue) => {
    if (!dateValue) return 'Date not available';
    try {
      // Handle Firestore Timestamp or ISO string
      let date;
      if (dateValue?.toDate) {
        // Firestore Timestamp
        date = dateValue.toDate();
      } else if (typeof dateValue === 'string') {
        // ISO string
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  // Open edit profile modal
  const handleEditProfile = () => {
    setEditFormData({
      name: user.name,
      email: user.email
    });
    setEditErrors({ name: '', email: '' });
    setEditError('');
    setShowEditModal(true);
  };

  // Close edit profile modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditFormData({ name: '', email: '' });
    setEditErrors({ name: '', email: '' });
    setEditError('');
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (editErrors[name]) {
      setEditErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const errors = { name: '', email: '' };
    let isValid = true;

    if (!editFormData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (editFormData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!editFormData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }

    setEditErrors(errors);
    return isValid;
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    // Validate form
    if (!validateEditForm()) {
      return;
    }

    // Get current user from localStorage
    const currentUser = getCurrentUser();
    
    if (currentUser) {
      setLoading(true);
      
      // Update user profile in Firebase Auth
      const result = await updateFirebaseProfile(
        editFormData.name.trim(),
        editFormData.email.trim().toLowerCase()
      );
      
      if (result.success) {
        // Also save to Firestore users collection
        if (currentUser.id) {
          await saveUserProfileToFirestore(currentUser.id, {
            name: editFormData.name.trim(),
            email: editFormData.email.trim().toLowerCase()
          });
        }
        
        // Update state with new user data
        setUser(result.user);
        
        // Update auth context (trigger re-render)
        window.dispatchEvent(new Event('authUpdated'));
        
        // Close modal
        handleCloseModal();
      } else {
        setEditError(result.message || 'Failed to update profile');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="section-card">
            <div className="profile-header">
              <h2 className="section-title">My Profile</h2>
              <button className="edit-profile-btn" onClick={handleEditProfile}>
                Edit Profile
              </button>
            </div>
            <div className="profile-content">
              <div className="profile-info">
                <div className="profile-item">
                  <span className="profile-label">Name:</span>
                  <span className="profile-value">{user.name}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-label">Email:</span>
                  <span className="profile-value">{user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Edit Profile</h3>
                <button className="modal-close" onClick={handleCloseModal}>
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                {/* Error message */}
                {editError && (
                  <div className="error-message">
                    {editError}
                  </div>
                )}

                {/* Name field */}
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.name ? 'input-error' : ''}`}
                    placeholder="Enter your name"
                  />
                  {editErrors.name && (
                    <span className="field-error">{editErrors.name}</span>
                  )}
                </div>

                {/* Email field */}
                <div className="form-group">
                  <label htmlFor="edit-email" className="form-label">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className={`form-input ${editErrors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                  />
                  {editErrors.email && (
                    <span className="field-error">{editErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="modal-btn cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="modal-btn save-btn" onClick={handleSaveProfile}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="section-divider"></div>

        {/* Orders Section */}
        <div className="orders-section">
          <div className="section-card">
            <div className="section-header-collapsible">
              <h2 className="section-title">My Orders</h2>
              <button 
                className="toggle-btn"
                onClick={() => setOrdersExpanded(!ordersExpanded)}
              >
                {ordersExpanded ? '▼' : '▶'} {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </button>
            </div>
            
            {ordersExpanded && (
              <>
                {orders.length === 0 ? (
                  // No orders message
                  <div className="no-orders">
                    <div className="no-orders-icon">📦</div>
                    <p className="no-orders-text">You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  // Orders list
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id || order.orderId} className="order-card">
                        {/* Order header */}
                        <div className="order-header">
                          <div className="order-header-left">
                            <h3 className="order-id">Order ID: {order.orderId || order.id}</h3>
                            <p className="order-date">{formatDate(order.createdAt || order.date)}</p>
                          </div>
                          <div className="order-header-right">
                            <span className={`order-status-badge ${order.status || 'pending'}`}>
                              {order.status === 'delivered' ? '✅ Delivered' : '⏳ Pending'}
                            </span>
                            <span className="order-total">₹{order.total}</span>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="order-items">
                          <h4 className="order-items-title">Items:</h4>
                          <ul className="order-items-list">
                            {order.items.map((item, index) => (
                              <li key={index} className="order-item">
                                <span className="order-item-name">{item.name}</span>
                                <span className="order-item-details">
                                  Qty: {item.quantity} × ₹{item.price} = ₹{item.price * item.quantity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Order footer */}
                        <div className="order-footer">
                          <div className="order-footer-item">
                            <span className="order-footer-label">Payment:</span>
                            <span className="order-footer-value">{order.delivery || 'Cash on Delivery'}</span>
                          </div>
                          {order.address && (
                            <div className="order-footer-item">
                              <span className="order-footer-label">Address:</span>
                              <span className="order-footer-value">{order.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ticket History Section */}
        <div className="tickets-section">
          <div className="section-card">
            <div className="section-header-collapsible">
              <h2 className="section-title">Ticket History</h2>
              <button 
                className="toggle-btn"
                onClick={() => setTicketsExpanded(!ticketsExpanded)}
              >
                {ticketsExpanded ? '▼' : '▶'} {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
              </button>
            </div>
            
            {ticketsExpanded && (
              <>
                {tickets.length === 0 ? (
                  <div className="no-orders">
                    <div className="no-orders-icon">🎫</div>
                    <p className="no-orders-text">You haven't submitted any support tickets yet.</p>
                  </div>
                ) : (
                  <div className="tickets-list">
                    {tickets.map((ticket) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ ticket, currentUserId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open':
        return 'status-open';
      case 'In Progress':
        return 'status-progress';
      case 'Resolved':
        return 'status-resolved';
      default:
        return 'status-open';
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmitting(true);
    try {
      const { addReplyToTicket } = await import('../utils/firestoreHelper');
      await addReplyToTicket(ticket.id, currentUserId, replyMessage.trim());
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <div>
          <h3 className="ticket-id">Ticket #{ticket.id.substring(0, 8)}</h3>
          <p className="ticket-date">{formatDate(ticket.createdAt)}</p>
        </div>
        <span className={`order-status-badge ${getStatusBadgeClass(ticket.status)}`}>
          {ticket.status || 'Open'}
        </span>
      </div>

      <div className="ticket-content">
        <div className="ticket-message">
          <strong>Your Message:</strong>
          <p>{ticket.message}</p>
        </div>
        {ticket.orderId && (
          <div className="ticket-order-id">
            <strong>Order ID:</strong> {ticket.orderId}
          </div>
        )}
      </div>

      {ticket.replies && ticket.replies.length > 0 && (
        <div className="ticket-replies-section">
          <button 
            className="toggle-replies-btn"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? '▼' : '▶'} {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
          </button>
          
          {showReplies && (
            <div className="replies-list">
              {ticket.replies.map((reply, index) => (
                <div key={index} className={`reply-item ${reply.userId === currentUserId ? 'reply-user' : 'reply-admin'}`}>
                  <div className="reply-header">
                    <strong>{reply.userId === currentUserId ? 'You' : 'Admin'}</strong>
                    <span className="reply-date">{formatDate(reply.timestamp)}</span>
                  </div>
                  <div className="reply-message">{reply.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {ticket.status !== 'Resolved' && (
        <form className="reply-form" onSubmit={handleReply}>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply..."
            rows="3"
            className="reply-textarea"
            disabled={submitting}
          />
          <button 
            type="submit" 
            className="reply-submit-btn"
            disabled={submitting || !replyMessage.trim()}
          >
            {submitting ? 'Sending...' : 'Send Reply'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Account;

