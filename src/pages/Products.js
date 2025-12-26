import React, { useState } from 'react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import './Products.css';

// Products page component - displays all available products
const Products = () => {
  // Get addToCart function from context
  const { addToCart } = useCart();
  
  // State to control toast visibility
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle Add to Cart button click
  const handleAddToCart = async (product) => {
    // Add product to cart using context function (updates navbar automatically)
    await addToCart(product);
    
    // Show toast notification
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  // Close toast notification
  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <div className="products-page">
      <div className="products-container">
        <h1 className="products-title">Our Fresh Products</h1>
        <p className="products-subtitle">Choose from our wide selection of fresh vegetables and fruits</p>

        {/* Products grid */}
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {/* Product image */}
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.src = 'https://via.placeholder.com/300x300?text=' + product.name;
                  }}
                />
              </div>

              {/* Product info */}
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₹{product.price}</p>
                
                {/* Add to Cart button */}
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <Toast message={toastMessage} onClose={handleCloseToast} />
      )}
    </div>
  );
};

export default Products;

