// Authentication helper utility functions
// Handles all localStorage operations for user authentication

// Register a new user
export const registerUser = (name, email, password) => {
  // Get existing users from localStorage
  const users = getUsers();
  
  // Check if email already exists
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return { success: false, message: 'Email already registered!' };
  }
  
  // Create new user object
  const newUser = {
    id: Date.now(), // Simple ID generation
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password, // In real app, this should be hashed
    createdAt: new Date().toISOString()
  };
  
  // Add new user to users array
  users.push(newUser);
  
  // Save updated users array to localStorage
  localStorage.setItem('greengo_users', JSON.stringify(users));
  
  return { success: true, message: 'Registration successful!' };
};

// Login user
export const loginUser = (email, password) => {
  // Get all users from localStorage
  const users = getUsers();
  
  // Find user with matching email
  const user = users.find(u => u.email === email.trim().toLowerCase());
  
  // Check if user exists
  if (!user) {
    return { success: false, message: 'Email not found!' };
  }
  
  // Check if password matches (in real app, compare hashed passwords)
  if (user.password !== password) {
    return { success: false, message: 'Incorrect password!' };
  }
  
  // Create user session object (without password)
  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email
  };
  
  // Store current user in localStorage
  localStorage.setItem('greengo_currentUser', JSON.stringify(sessionUser));
  
  return { success: true, message: 'Login successful!', user: sessionUser };
};

// Logout user
export const logoutUser = () => {
  // Remove current user from localStorage
  localStorage.removeItem('greengo_currentUser');
};

// Get current logged-in user
export const getCurrentUser = () => {
  // Get current user from localStorage
  const userStr = localStorage.getItem('greengo_currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is logged in
export const isLoggedIn = () => {
  // Check if current user exists in localStorage
  return getCurrentUser() !== null;
};

// Update user profile in users array
export const updateUserProfile = (userId, updatedData) => {
  // Get all users from localStorage
  const users = getUsers();
  
  // Find user by ID
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    // Update user data (preserve password and other fields)
    users[userIndex] = {
      ...users[userIndex],
      ...updatedData
    };
    
    // Save updated users array to localStorage
    localStorage.setItem('greengo_users', JSON.stringify(users));
    return true;
  }
  
  return false;
};

// Get all registered users (for internal use)
const getUsers = () => {
  // Get users array from localStorage, return empty array if not found
  const usersStr = localStorage.getItem('greengo_users');
  return usersStr ? JSON.parse(usersStr) : [];
};

