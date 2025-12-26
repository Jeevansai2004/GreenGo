// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration object
// Using environment variables for security, with fallback to direct config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAnsunl-bI_GVfJ2QvMTSvu81nf-JQzTw4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "greengo-db761.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "greengo-db761",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "greengo-db761.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "756370299286",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:756370299286:web:c038f3eb696630ca6d25b7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-5P36RDS20G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

// Export analytics (can be null if initialization failed)
export { analytics };

// Export the app instance (in case needed elsewhere)
export default app;

