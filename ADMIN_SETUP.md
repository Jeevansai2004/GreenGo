# Admin Panel Setup Guide

This guide will help you set up the admin panel and create your first admin user.

## Features

✅ **Admin Dashboard** - View statistics (total orders, pending orders, delivered orders, total revenue, total products)
✅ **Order Management** - View all customer orders and mark them as delivered
✅ **Product Management** - Add, edit, and delete products
✅ **Protected Routes** - Only admin users can access admin pages
✅ **Real-time Updates** - All changes sync with Firestore

## Step 1: Create Your First Admin User

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (greengo-db761)
3. Go to **Firestore Database** → **Data** tab
4. Click on **users** collection (create it if it doesn't exist)
5. Create a new document with:
   - **Document ID**: Your Firebase User UID (you can find this in Authentication → Users)
   - **Fields**:
     - `name`: Your name (string)
     - `email`: Your email (string)
     - `role`: `admin` (string)
     - `isAdmin`: `true` (boolean)
     - `createdAt`: Current timestamp
     - `updatedAt`: Current timestamp

### Option 2: Using Browser Console (Quick Method)

1. Register/Login to your app with the account you want to make admin
2. Open browser console (F12)
3. Run this code:

```javascript
// Get your current user ID
const user = JSON.parse(localStorage.getItem('greengo_currentUser'));
console.log('Your User ID:', user.id);

// Then in Firebase Console, go to Firestore → users collection
// Create a document with ID = user.id
// Add fields: role = "admin", isAdmin = true
```

### Option 3: Programmatically (For Developers)

You can add this temporary code to your app to set yourself as admin:

1. Add this to any page temporarily (e.g., Home.js):

```javascript
import { setUserAsAdmin } from '../utils/adminHelper';
import { getCurrentFirebaseUser } from '../utils/firebaseAuth';

// Call this function once
const makeMeAdmin = async () => {
  const user = getCurrentFirebaseUser();
  if (user) {
    await setUserAsAdmin(user.uid, true);
    console.log('You are now an admin!');
  }
};
```

2. Call `makeMeAdmin()` once, then remove the code.

## Step 2: Update Firestore Security Rules

Copy the rules from `FIRESTORE_SECURITY_RULES.txt` to your Firebase Console:

1. Go to **Firestore Database** → **Rules** tab
2. Replace existing rules with the new rules
3. Click **Publish**

The new rules include:
- Admin helper function to check admin status
- Admin access to all orders
- Admin access to products (read/write)
- Users can only access their own data

## Step 3: Access Admin Panel

1. Make sure you're logged in with your admin account
2. You should see an **Admin** link in the navbar
3. Click it to access the admin dashboard

## Admin Panel Pages

### Dashboard (`/admin`)
- View statistics:
  - Total Orders
  - Pending Orders
  - Delivered Orders
  - Total Revenue
  - Total Products
- Quick actions to navigate to Orders and Products management

### Orders Management (`/admin/orders`)
- View all customer orders
- Filter by: All, Pending, Delivered
- View order details:
  - Order ID
  - Customer information
  - Items and quantities
  - Total amount
  - Delivery address
- **Mark as Delivered** button for pending orders

### Products Management (`/admin/products`)
- View all products in a grid
- **Add Product** button to add new products
- **Edit** button to modify existing products
- **Delete** button to remove products
- Form fields:
  - Product Name
  - Price (₹)
  - Image URL
  - Category (Vegetable/Fruit)

## Important Notes

- **Admin Status**: Admin status is checked from Firestore `users` collection
- **Security**: Admin routes are protected - non-admin users are redirected
- **Products**: Products are stored in Firestore `products` collection
- **Orders**: All orders have a `status` field: `pending` or `delivered`
- **Real-time**: Changes sync with Firestore in real-time

## Troubleshooting

### "Access Denied" or Redirected to Home
- Make sure your user document in Firestore has `role: "admin"` or `isAdmin: true`
- Check that you're logged in with the correct account
- Verify Firestore security rules are updated

### Admin Link Not Showing
- Make sure you're logged in
- Check browser console for errors
- Refresh the page after setting admin status

### Products Not Loading
- Products are loaded from Firestore `products` collection
- If collection is empty, it will use default products from `src/data/products.js`
- Add products through the admin panel to store them in Firestore

### Orders Not Updating
- Check Firestore security rules allow admin updates
- Verify you have admin status in Firestore
- Check browser console for errors

## Next Steps

1. Set up your first admin user
2. Update Firestore security rules
3. Access the admin panel
4. Start managing orders and products!

