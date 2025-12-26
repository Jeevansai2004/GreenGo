import React, { useEffect } from 'react';
import './Toast.css';

// Toast component - displays temporary success/notification messages
const Toast = ({ message, onClose }) => {
  // Automatically close toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="toast">
      <span className="toast-icon">✓</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default Toast;

