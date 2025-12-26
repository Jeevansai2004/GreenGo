# GreenGo - Fresh Eats on Wheels

A simple and beautiful React web application for ordering fresh vegetables and fruits online.

## Features

- 🏠 **Home Page** - Welcome banner with app introduction and call-to-action
- 🛒 **Products Page** - Browse and add fresh produce to cart
- 🛍️ **Cart Page** - Manage cart items with quantity controls
- ✅ **Checkout Page** - Place orders with delivery information
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🎨 **Green Theme** - Beautiful, modern UI with smooth animations

## Tech Stack

- React 18
- React Router DOM (for navigation)
- CSS3 (no external CSS frameworks)
- localStorage (for cart persistence)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/       # Reusable components (Navbar, Toast)
├── pages/           # Page components (Home, Products, Cart, Checkout)
├── data/            # Products data (products.js)
├── utils/           # Helper functions (cartHelper.js)
├── App.js           # Main app component with routing
└── index.js         # Entry point
```

## Features Explained

### Cart Management
- Cart items are stored in browser's localStorage
- Cart persists across page refreshes
- Real-time cart count in navbar

### Product Management
- Products loaded from `src/data/products.js`
- Easy to add/modify products
- Product images from Unsplash

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly buttons

## Customization

### Adding Products
Edit `src/data/products.js` to add or modify products. Each product needs:
- `id`: Unique identifier
- `name`: Product name
- `price`: Price in dollars
- `image`: Image URL
- `category`: "fruit" or "vegetable"

### Changing Theme Colors
The main green color is `#4CAF50`. Search and replace this color in CSS files to change the theme.

## License

This project is open source and available for learning purposes.

