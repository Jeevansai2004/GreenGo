# Visual Guide: Setting Up Admin User in Firestore

## Step-by-Step Instructions

### Step 1: Open Your User Document
1. Go to Firebase Console → Firestore Database → Data tab
2. Click on **users** collection (left panel)
3. Click on your user document (the one with your User ID)

### Step 2: Add the `role` Field
1. Click the **"+ Add field"** button (top right of the document)
2. In the dialog that opens:
   - **Field name**: Type `role` (type it manually, it's a text input)
   - **Type**: Select `string` from the dropdown
   - **Value**: Type `admin` in the text box
3. Click **"Add"** button

### Step 3: Add the `isAdmin` Field (Optional but Recommended)
1. Click **"+ Add field"** again
2. In the dialog:
   - **Field name**: Type `isAdmin`
   - **Type**: Select `boolean` from the dropdown
   - **Value**: Check/toggle the checkbox to make it `true`
3. Click **"Add"** button

### Step 4: Verify Your Document
Your user document should now have these fields:
- `name`: (your name)
- `email`: (your email)
- `role`: `admin` (string)
- `isAdmin`: `true` (boolean)
- `createdAt`: (timestamp)
- `updatedAt`: (timestamp)

## Alternative: Using the Code Method

If you're still having trouble, you can use this temporary code:

1. Open your app in the browser
2. Open browser console (F12)
3. Make sure you're logged in
4. Run this code:

```javascript
// Import Firebase functions (run this in browser console)
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Or use this simpler method:
const makeMeAdmin = async () => {
  // Get your current user from localStorage
  const user = JSON.parse(localStorage.getItem('greengo_currentUser'));
  
  if (!user || !user.id) {
    console.error('Please login first!');
    return;
  }
  
  console.log('Your User ID:', user.id);
  console.log('Your Email:', user.email);
  
  // You need to manually add these fields in Firestore:
  // 1. Go to Firestore → users collection
  // 2. Find document with ID = user.id
  // 3. Add field: role = "admin" (string)
  // 4. Add field: isAdmin = true (boolean)
};
```

## Quick Copy-Paste Values

When adding fields in Firestore:

**Field 1:**
- Field name: `role`
- Type: `string`
- Value: `admin`

**Field 2:**
- Field name: `isAdmin`
- Type: `boolean`
- Value: `true` (check the checkbox)

## Troubleshooting

### "Field" input is empty
- Just type `role` manually in the text box
- It's not a dropdown, it's a text input field

### Can't find "string" in Type dropdown
- Scroll down in the Type dropdown
- Common types: string, number, boolean, timestamp, map, array
- Select `string` for the role field

### Field not saving
- Make sure you click the "Add" button (not Cancel)
- Check that the field name doesn't have spaces
- Field names are case-sensitive: use `role` not `Role`

## After Adding Fields

1. Refresh your app
2. Log out and log back in (to refresh admin status)
3. You should see the "Admin" link in the navbar
4. Click it to access the admin dashboard

