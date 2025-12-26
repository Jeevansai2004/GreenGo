import React, { useState, useEffect } from 'react';
import { 
  getProductsFromFirestore, 
  addProductToFirestore, 
  updateProductInFirestore, 
  deleteProductFromFirestore 
} from '../../utils/firestoreHelper';
import { isAdmin } from '../../utils/adminHelper';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

// Admin Products component - manage products (add, edit, delete)
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: 'vegetable'
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      // Check if user is admin
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const allProducts = await getProductsFromFirestore();
        console.log('Products loaded from Firestore:', allProducts);
        console.log('Product IDs:', allProducts.map(p => ({ id: p.id, type: typeof p.id })));
        
        // If no products in Firestore, use default products from data file
        if (allProducts.length === 0) {
          console.log('No products in Firestore, loading default products');
          const { products: defaultProducts } = await import('../../data/products');
          setProducts(defaultProducts);
        } else {
          setProducts(allProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [navigate]);

  // Handle form input change
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
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        image: formData.image.trim(),
        category: formData.category
      };

      if (editingProduct) {
        // Update existing product
        const success = await updateProductInFirestore(editingProduct.id, productData);
        if (success) {
          setProducts(products.map(p => 
            p.id === editingProduct.id ? { ...p, ...productData } : p
          ));
          handleCloseModal();
        } else {
          alert('Failed to update product');
        }
      } else {
        // Add new product
        const newProduct = await addProductToFirestore(productData);
        setProducts([...products, newProduct]);
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category
    });
    setShowModal(true);
  };

  // Check if product ID is from Firestore (alphanumeric string) vs default (numeric)
  const isFirestoreProduct = (productId) => {
    // Firestore document IDs are alphanumeric strings (typically 20+ chars, but can vary)
    // Default products from products.js have numeric IDs (1, 2, 3, etc.)
    
    console.log('Checking if product is Firestore product:', productId, typeof productId);
    
    // If it's a number, it's definitely from products.js
    if (typeof productId === 'number') {
      console.log('  -> Number, not Firestore');
      return false;
    }
    
    // If it's a string
    if (typeof productId === 'string') {
      // If it's all digits (like "1", "2", "123"), it's from products.js
      if (/^\d+$/.test(productId)) {
        console.log('  -> All digits, not Firestore');
        return false;
      }
      // Firestore IDs are alphanumeric strings - if it has any letters or special chars, it's Firestore
      // Even short Firestore IDs (like "abc123") are valid
      console.log('  -> String with letters/mixed, is Firestore');
      return true;
    }
    
    // If it's undefined or null, not Firestore
    console.log('  -> Unknown type, not Firestore');
    return false;
  };

  // Handle delete product
  const handleDelete = async (productId) => {
    // Check if this is a Firestore product (can be deleted) or default product (cannot be deleted)
    if (!isFirestoreProduct(productId)) {
      alert('Default products from products.js cannot be deleted. Only products added through the admin panel (stored in Firestore) can be deleted.\n\nTo delete products, first add them to Firestore using the "Add Product" button.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Deleting product from Firestore:', productId);
      console.log('Product details:', products.find(p => p.id === productId));
      
      const success = await deleteProductFromFirestore(productId);
      if (success) {
        // Remove from local state
        setProducts(products.filter(p => p.id !== productId));
        console.log('Product deleted successfully from UI');
        alert('Product deleted successfully!');
      } else {
        console.error('Failed to delete product - deleteProductFromFirestore returned false');
        alert('Failed to delete product. Please check:\n1. Firestore security rules allow admin to delete products\n2. Product exists in Firestore\n3. Check browser console for details');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        productId
      });
      
      // Provide user-friendly error messages
      let errorMessage = 'Error deleting product';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules allow admin to delete products.\n\nGo to Firebase Console → Firestore → Rules and ensure the products collection allows delete for admins.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Product not found in Firestore. It may have already been deleted or doesn\'t exist.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      image: '',
      category: 'vegetable'
    });
    setErrors({});
  };

  // Handle add new product
  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      image: '',
      category: 'vegetable'
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1 className="admin-title">Manage Products</h1>
          <div className="loading-message">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Manage Products</h1>
          <div>
            <button 
              className="back-btn"
              onClick={() => navigate('/admin')}
            >
              ← Back to Dashboard
            </button>
            <button 
              className="add-product-btn"
              onClick={handleAddNew}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid-admin">
          {products.map((product) => {
            // For Firestore products, use the document ID (string)
            // For default products, use the numeric id
            const productId = product.id;
            const isFirestore = isFirestoreProduct(productId);
            
            console.log('Rendering product:', {
              name: product.name,
              id: productId,
              idType: typeof productId,
              isFirestore: isFirestore
            });
            
            return (
            <div key={productId} className="product-card-admin">
              <div className="product-image-admin">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200?text=' + product.name;
                  }}
                />
              </div>
              <div className="product-info-admin">
                <h3 className="product-name-admin">{product.name}</h3>
                <p className="product-price-admin">₹{product.price}</p>
                <p className="product-category-admin">{product.category}</p>
              </div>
              <div className="product-actions-admin">
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => {
                    console.log('Delete button clicked for product:', product);
                    console.log('Product ID:', productId, 'Type:', typeof productId);
                    console.log('Is Firestore product?', isFirestore);
                    handleDelete(productId);
                  }}
                  disabled={!isFirestore}
                  title={!isFirestore ? 'Default products cannot be deleted. Add products to Firestore first.' : 'Delete product from Firestore'}
                >
                  Delete
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={errors.price ? 'error' : ''}
                  />
                  {errors.price && <span className="error-message">{errors.price}</span>}
                </div>

                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className={errors.image ? 'error' : ''}
                  />
                  {errors.image && <span className="error-message">{errors.image}</span>}
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={errors.category ? 'error' : ''}
                  >
                    <option value="vegetable">Vegetable</option>
                    <option value="fruit">Fruit</option>
                  </select>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingProduct ? 'Update' : 'Add'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

