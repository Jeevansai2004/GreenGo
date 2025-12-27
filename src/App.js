import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSupport from './pages/admin/AdminSupport';
import Support from './pages/Support';
import './App.css';

// Inner component that uses useLocation hook
const AppContent = () => {
  const location = useLocation();
  
  // Pages where footer should be hidden
  const hideFooterPaths = ['/products', '/account', '/support'];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="App">
      {/* Navbar appears on all pages */}
      <Navbar />
      
      {/* Main content area */}
      <main className="main-content">
        {/* Routes for different pages */}
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes - require admin authentication */}
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedAdminRoute>
                <AdminOrders />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedAdminRoute>
                <AdminProducts />
              </ProtectedAdminRoute>
            } 
          />
          <Route 
            path="/admin/support" 
            element={
              <ProtectedAdminRoute>
                <AdminSupport />
              </ProtectedAdminRoute>
            } 
          />
        </Routes>
      </main>
      
      {/* Footer appears on all pages except products, account, and support */}
      {shouldShowFooter && <Footer />}
    </div>
  );
};

// Main App component - sets up routing for all pages
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

