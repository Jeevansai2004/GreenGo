import React, { useState, useEffect } from 'react';
import { getAllSupportTicketsFromFirestore, updateSupportTicketStatusInFirestore, addReplyToTicket, subscribeToAllTickets } from '../../utils/firestoreHelper';
import { getCurrentFirebaseUser } from '../../utils/firebaseAuth';
import { isAdmin } from '../../utils/adminHelper';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

// Admin Support Tickets component - manage all support tickets
const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, Open, In Progress, Resolved
  const navigate = useNavigate();

  // Load all support tickets
  useEffect(() => {
    const loadTickets = async () => {
      // Check if user is admin
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const allTickets = await getAllSupportTicketsFromFirestore();
        setTickets(allTickets);
        setLoading(false);
      } catch (error) {
        console.error('Error loading support tickets:', error);
        setLoading(false);
      }
    };

    loadTickets();
    
    // Subscribe to real-time ticket updates
    const unsubscribe = subscribeToAllTickets((updatedTickets) => {
      setTickets(updatedTickets);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Filter tickets based on status
  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  // Handle status update
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const success = await updateSupportTicketStatusInFirestore(ticketId, newStatus);
      if (success) {
        // Update local state
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        ));
      } else {
        alert('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Error updating ticket status');
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

  // Get status badge class
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

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1 className="admin-title">Support Tickets</h1>
          <div className="loading-message">Loading tickets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Support Tickets</h1>
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
            All Tickets ({tickets.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'Open' ? 'active' : ''}`}
            onClick={() => setFilter('Open')}
          >
            Open ({tickets.filter(t => t.status === 'Open').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'In Progress' ? 'active' : ''}`}
            onClick={() => setFilter('In Progress')}
          >
            In Progress ({tickets.filter(t => t.status === 'In Progress').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'Resolved' ? 'active' : ''}`}
            onClick={() => setFilter('Resolved')}
          >
            Resolved ({tickets.filter(t => t.status === 'Resolved').length})
          </button>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="empty-state">
            <p>No support tickets found</p>
          </div>
        ) : (
          <div className="tickets-list">
            {filteredTickets.map((ticket) => (
              <TicketCardAdmin 
                key={ticket.id} 
                ticket={ticket}
                onStatusUpdate={handleStatusUpdate}
                formatDate={formatDate}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Admin Ticket Card Component with Reply Functionality
const TicketCardAdmin = ({ ticket, onStatusUpdate, formatDate, getStatusBadgeClass }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSubmitting(true);
    try {
      const adminUser = getCurrentFirebaseUser();
      if (!adminUser || !adminUser.uid) {
        alert('Please login as admin');
        setSubmitting(false);
        return;
      }

      console.log('Sending reply:', {
        ticketId: ticket.id,
        userId: adminUser.uid,
        message: replyMessage.trim()
      });

      const success = await addReplyToTicket(ticket.id, adminUser.uid, replyMessage.trim());
      
      if (success) {
        setReplyMessage('');
        // The ticket will update via real-time listener
        console.log('Reply sent successfully');
      } else {
        console.error('Failed to send reply - addReplyToTicket returned false');
        alert('Failed to send reply. Please check console for details and verify Firestore security rules allow admin updates.');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Error sending reply';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules allow admin to update tickets.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-card-admin">
      <div className="ticket-header-admin">
        <div>
          <h3 className="ticket-id">Ticket #{ticket.id.substring(0, 8)}</h3>
          <p className="ticket-date">{formatDate(ticket.createdAt)}</p>
        </div>
        <div className="ticket-status-section">
          <span className={`status-badge ${getStatusBadgeClass(ticket.status)}`}>
            {ticket.status || 'Open'}
          </span>
          <select
            className="status-select"
            value={ticket.status || 'Open'}
            onChange={(e) => onStatusUpdate(ticket.id, e.target.value)}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="ticket-details-admin">
        <div className="detail-row">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{ticket.name}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Email:</span>
          <span className="detail-value">{ticket.email}</span>
        </div>
        {ticket.orderId && (
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value">{ticket.orderId}</span>
          </div>
        )}
      </div>

      <div className="ticket-message-admin">
        <h4>Customer Message:</h4>
        <p className="ticket-message-text">{ticket.message}</p>
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
              {ticket.replies.map((reply, index) => {
                const adminUser = getCurrentFirebaseUser();
                const isAdminReply = reply.userId !== ticket.userId;
                return (
                  <div key={index} className={`reply-item ${isAdminReply ? 'reply-admin' : 'reply-user'}`}>
                    <div className="reply-header">
                      <strong>{isAdminReply ? 'Admin' : 'Customer'}</strong>
                      <span className="reply-date">{formatDate(reply.timestamp)}</span>
                    </div>
                    <div className="reply-message">{reply.message}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {ticket.status !== 'Resolved' && (
        <form className="reply-form" onSubmit={handleReply}>
          <textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply to the customer..."
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

export default AdminSupport;

