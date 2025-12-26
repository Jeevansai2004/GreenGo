// Firebase Authentication helper functions
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { saveUserProfileToFirestore } from './firestoreHelper';

// Register a new user with Firebase
export const registerWithFirebase = async (name, email, password) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: name
    });

    // Create user object for our app
    const userData = {
      id: user.uid,
      name: name,
      email: user.email,
      emailVerified: user.emailVerified
    };

    // Store user data in localStorage for compatibility
    localStorage.setItem('greengo_currentUser', JSON.stringify(userData));

    // Save user profile to Firestore
    await saveUserProfileToFirestore(user.uid, {
      name: name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: new Date().toISOString()
    });

    return { 
      success: true, 
      message: 'Registration successful!',
      user: userData
    };
  } catch (error) {
    // Handle Firebase errors
    let errorMessage = 'Registration failed. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email already registered!';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address!';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters!';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled!';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { 
      success: false, 
      message: errorMessage 
    };
  }
};

// Login user with Firebase
export const loginWithFirebase = async (email, password) => {
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user object for our app
    const userData = {
      id: user.uid,
      name: user.displayName || user.email.split('@')[0], // Use displayName or email prefix
      email: user.email,
      emailVerified: user.emailVerified
    };

    // Get user profile from Firestore to include admin role
    const { getUserProfileFromFirestore } = await import('./firestoreHelper');
    const userProfile = await getUserProfileFromFirestore(user.uid);
    
    // Update userData with admin role from Firestore
    const userDataWithRole = {
      ...userData,
      role: userProfile?.role || null,
      isAdmin: userProfile?.isAdmin || userProfile?.role === 'admin' || false
    };

    // Store user data in localStorage for compatibility (with admin role)
    localStorage.setItem('greengo_currentUser', JSON.stringify(userDataWithRole));

    // Save user profile to Firestore (if not already exists, preserves admin role)
    await saveUserProfileToFirestore(user.uid, {
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      emailVerified: user.emailVerified
    });

    return { 
      success: true, 
      message: 'Login successful!',
      user: userDataWithRole
    };
  } catch (error) {
    // Handle Firebase errors
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Email not found!';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password!';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address!';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled!';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later!';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { 
      success: false, 
      message: errorMessage 
    };
  }
};

// Logout user from Firebase
export const logoutFromFirebase = async () => {
  try {
    await signOut(auth);
    // Remove user from localStorage
    localStorage.removeItem('greengo_currentUser');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: error.message };
  }
};

// Get current Firebase user
export const getCurrentFirebaseUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in - get full profile from Firestore including admin role
      try {
        const { getUserProfileFromFirestore } = await import('./firestoreHelper');
        const userProfile = await getUserProfileFromFirestore(firebaseUser.uid);
        
        // Create user object with admin role from Firestore
        const userData = {
          id: firebaseUser.uid,
          name: userProfile?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: userProfile?.role || null,
          isAdmin: userProfile?.isAdmin || userProfile?.role === 'admin' || false
        };
        
        // Update localStorage with admin role
        localStorage.setItem('greengo_currentUser', JSON.stringify(userData));
        callback(userData);
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback if Firestore fails
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified
        };
        localStorage.setItem('greengo_currentUser', JSON.stringify(userData));
        callback(userData);
      }
    } else {
      // User is signed out
      localStorage.removeItem('greengo_currentUser');
      callback(null);
    }
  });
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Create Google Auth Provider
    const provider = new GoogleAuthProvider();
    
    // Sign in with popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create user object for our app
    const userData = {
      id: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      emailVerified: user.emailVerified
    };

    // Get user profile from Firestore to include admin role
    const { getUserProfileFromFirestore } = await import('./firestoreHelper');
    const userProfile = await getUserProfileFromFirestore(user.uid);
    
    // Update userData with admin role from Firestore
    const userDataWithRole = {
      ...userData,
      role: userProfile?.role || null,
      isAdmin: userProfile?.isAdmin || userProfile?.role === 'admin' || false
    };

    // Store user data in localStorage for compatibility (with admin role)
    localStorage.setItem('greengo_currentUser', JSON.stringify(userDataWithRole));

    // Save user profile to Firestore (if not already exists, preserves admin role)
    await saveUserProfileToFirestore(user.uid, {
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: new Date().toISOString()
    });

    return { 
      success: true, 
      message: 'Login with Google successful!',
      user: userDataWithRole
    };
  } catch (error) {
    // Handle Firebase errors
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed. Please try again.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Only one popup request is allowed at a time.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with this email. Please use email/password login.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    return { 
      success: false, 
      message: errorMessage 
    };
  }
};

// Update user profile in Firebase
export const updateFirebaseProfile = async (displayName, email) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, message: 'No user logged in' };
    }

    // Update display name
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    // Note: Email update requires re-authentication in Firebase
    // For now, we'll just update the display name
    // Email updates should be handled separately with email verification

    // Update localStorage
    const userData = {
      id: user.uid,
      name: displayName || user.displayName,
      email: user.email,
      emailVerified: user.emailVerified
    };
    localStorage.setItem('greengo_currentUser', JSON.stringify(userData));

    return { success: true, user: userData };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

