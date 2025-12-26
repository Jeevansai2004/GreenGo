# GreenGo - Fresh Eats on Wheels

A simple and beautiful React web application for ordering fresh vegetables and fruits online.

## Features

- 🏠 **Home Page** - Welcome banner with app introduction and call-to-action
- 🛒 **Products Page** - Browse and add fresh produce to cart
- 🛍️ **Cart Page** - Manage cart items with quantity controls
- ✅ **Checkout Page** - Place orders with delivery information
- 🔐 **Authentication** - User registration and login with Firebase
- 👤 **User Account** - View profile, orders, and support tickets
- 🛡️ **Admin Panel** - Manage orders, products, and support tickets
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🎨 **Green Theme** - Beautiful, modern UI with smooth animations

## Tech Stack

- React 18
- React Router DOM (for navigation)
- Firebase Authentication (email/password & Google Sign-In)
- Firestore (cloud database for cart, orders, products, tickets)
- CSS3 (no external CSS frameworks)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project (see `FIREBASE_SETUP.md` for setup instructions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jeevansai2004/GreenGo.git
cd GreenGo
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Copy your Firebase config to `src/firebase/config.js`
   - See `FIREBASE_SETUP.md` for detailed instructions

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/          # Reusable components (Navbar, Toast, ProtectedRoute)
├── pages/              # Page components (Home, Products, Cart, Checkout, Account, Admin)
├── data/               # Products data (products.js)
├── utils/              # Helper functions (cart, auth, firestore helpers)
├── context/            # React Context (CartContext, AuthContext)
├── firebase/           # Firebase configuration
├── App.js              # Main app component with routing
└── index.js            # Entry point
```

## Features Explained

### Authentication
- User registration and login with email/password
- Google Sign-In support
- Protected routes for authenticated users
- Session management with Firebase

### Cart Management
- Cart items stored in Firestore (for logged-in users) or localStorage (for guests)
- Real-time cart synchronization
- Cart persists across devices for logged-in users

### Order Management
- Place orders with delivery information
- Order history in user account
- Admin can mark orders as delivered

### Admin Features
- Dashboard with statistics
- Manage orders (view and update status)
- Manage products (add, edit, delete)
- Support ticket management

### Support System
- Users can submit support tickets
- Admin can reply to tickets
- Real-time ticket updates

## Customization

### Adding Products
Edit `src/data/products.js` to add or modify default products. Products can also be managed through the Admin panel.

### Setting Up Admin
See `ADMIN_SETUP.md` for instructions on creating an admin user.

## License

This project is open source and available for learning purposes.
