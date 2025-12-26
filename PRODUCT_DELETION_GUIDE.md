# Product Deletion Guide

## How Product Deletion Works

### Product Types

1. **Default Products** (from `products.js`)
   - Have numeric IDs: 1, 2, 3, etc.
   - Cannot be deleted (they're read-only)
   - Delete button is disabled for these

2. **Firestore Products** (added via Admin Panel)
   - Have Firestore document IDs (alphanumeric strings like "abc123xyz...")
   - Can be deleted by admin
   - Delete button is enabled for these

### How to Delete Products

1. **Add Products to Firestore First**
   - Go to Admin Panel → Manage Products
   - Click "Add Product"
   - Fill in the form and save
   - Products added this way are stored in Firestore

2. **Delete Firestore Products**
   - Products with Firestore document IDs can be deleted
   - Click the "Delete" button (it will be enabled)
   - Confirm the deletion
   - Product will be removed from Firestore

### Troubleshooting

**If delete button is disabled:**
- The product is from the default `products.js` file
- You need to add it to Firestore first using "Add Product"
- Then you can delete it

**If delete fails with "Permission denied":**
1. Check Firestore security rules in Firebase Console
2. Ensure the rules allow admin to delete products:
   ```javascript
   match /products/{productId} {
     allow delete: if isAdmin();
   }
   ```

**If delete fails with "Product not found":**
- The product may have already been deleted
- Refresh the page to see updated product list

### Firestore Security Rules

Make sure your Firestore rules include:
```javascript
match /products/{productId} {
  allow read: if true; // Everyone can read
  allow create, update, delete: if isAdmin(); // Only admins can modify
}
```

### Testing Deletion

1. Add a test product via Admin Panel
2. Check the product ID in browser console (should be a long alphanumeric string)
3. Click Delete button
4. Check browser console for any errors
5. Verify product is removed from the list

