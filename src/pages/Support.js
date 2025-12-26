import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../utils/authHelper';
import { saveSupportTicketToFirestore } from '../utils/firestoreHelper';
import './Support.css';

// Support page component - allows users to submit support tickets
const Support = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    message: ''
  });
  
  // State for form validation errors
  const [errors, setErrors] = useState({});
  
  // State for submission
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load user data on mount
  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: 'Please login to submit a support ticket',
          from: { pathname: '/support' }
        }
      });
      return;
    }

    // Get current user and auto-fill name and email
    const currentUser = getCurrentUser();
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        email: currentUser.email || ''
      }));
    }
  }, [isAuthenticated, navigate]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success message when user starts typing
    if (success) {
      setSuccess(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        setError('Please login to submit a support ticket');
        setLoading(false);
        return;
      }

      // Save ticket to Firestore
      await saveSupportTicketToFirestore({
        userId: currentUser.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        orderId: formData.orderId.trim() || null,
        message: formData.message.trim(),
        status: 'Open'
      });

      // Show success message
      setSuccess(true);
      
      // Clear form
      setFormData(prev => ({
        ...prev,
        orderId: '',
        message: ''
      }));
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      setError('Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-container">
        <h1 className="support-title">Contact Support</h1>
        <p className="support-subtitle">
          Have a question or need help? Fill out the form below and we'll get back to you as soon as possible.
        </p>

        {/* Success message */}
        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>Your support ticket has been submitted successfully! We'll get back to you soon.</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Support form */}
        <form className="support-form" onSubmit={handleSubmit}>
          {/* Name field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter your name"
              disabled={loading}
            />
            {errors.name && (
              <span className="field-error">{errors.name}</span>
            )}
          </div>

          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter your email"
              disabled={loading}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* Order ID field (optional) */}
          <div className="form-group">
            <label htmlFor="orderId" className="form-label">
              Order ID <span className="optional">(Optional)</span>
            </label>
            <input
              type="text"
              id="orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., ORD-1234567890"
              disabled={loading}
            />
            <span className="field-hint">If your question is about a specific order, please enter the Order ID</span>
          </div>

          {/* Message field */}
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Message <span className="required">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`form-textarea ${errors.message ? 'input-error' : ''}`}
              placeholder="Please describe your issue or question in detail..."
              rows="6"
              disabled={loading}
            />
            {errors.message && (
              <span className="field-error">{errors.message}</span>
            )}
            <span className="field-hint">Minimum 10 characters required</span>
          </div>

          {/* Submit button */}
          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;

