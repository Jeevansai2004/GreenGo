import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginWithFirebase, signInWithGoogle } from '../utils/firebaseAuth';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

// Login page component - allows users to log in
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Field-level error messages
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  
  // General error message state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get redirect path and message from location state (if user was redirected from checkout)
  const from = location.state?.from?.pathname || '/';
  const redirectMessage = location.state?.message || '';
  
  // Show redirect message if user was redirected from a protected route
  const [showRedirectMessage, setShowRedirectMessage] = useState(!!redirectMessage);
  
  // Hide redirect message when user starts typing
  useEffect(() => {
    if (formData.email || formData.password) {
      setShowRedirectMessage(false);
    }
  }, [formData.email, formData.password]);

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
        }
        break;
      case 'password':
        if (!value.trim()) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear general error when user starts typing
    if (error) setError('');
    
    // Validate field in real-time (only after user has interacted)
    if (fieldErrors[name]) {
      const fieldError = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  // Handle blur event (when user leaves a field)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validate all fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    setFieldErrors({
      email: emailError,
      password: passwordError
    });
    
    // Check if there are any validation errors
    if (emailError || passwordError) {
      setError('Please fix the errors below');
      setLoading(false);
      return;
    }
    
    // Attempt to login with Firebase
    const result = await loginWithFirebase(formData.email, formData.password);
    
    if (result.success) {
      // Update auth context
      login(result.user);
      
      // Redirect to the page user was trying to access, or home
      navigate(from, { replace: true });
    } else {
      // Show error message
      setError(result.message);
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Update auth context
        login(result.user);
        
        // Redirect to the page user was trying to access, or home
        navigate(from, { replace: true });
      } else {
        // Show error message
        setError(result.message);
        setLoading(false);
      }
    } catch (error) {
      setError('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back!</h1>
            <p className="auth-subtitle">Login to continue shopping</p>
          </div>

          {/* Redirect message (if user was redirected from protected route) */}
          {showRedirectMessage && redirectMessage && (
            <div className="info-message">
              {redirectMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login form */}
          <form className="auth-form" onSubmit={handleSubmit}>
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
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="Enter your password (min 6 characters)"
                required
                disabled={loading}
              />
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* Google Sign-In button */}
          <button 
            type="button"
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Register link */}
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

