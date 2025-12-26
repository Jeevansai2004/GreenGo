# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the GreenGo app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication Methods

### Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable the first toggle (Email/Password)
4. Click **Save**

### Enable Google Sign-In

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google**
3. Enable the toggle
4. Set a **Project support email** (required)
5. Click **Save**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "GreenGo Web")
5. Copy the Firebase configuration object

## Step 4: Add Configuration to Your Project

1. Create a `.env` file in the root directory of your project
2. Add your Firebase configuration as environment variables:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

3. Replace the placeholder values with your actual Firebase config values

## Step 5: Restart Your Development Server

After adding the `.env` file, restart your React development server:

```bash
npm start
```

## Important Notes

- The `.env` file should NOT be committed to version control (it's already in `.gitignore`)
- Never expose your Firebase API keys in client-side code publicly
- For production, use Firebase App Check for additional security

## Testing

1. Start the app: `npm start`
2. Try registering a new user
3. Try logging in with the registered credentials
4. Check Firebase Console > Authentication > Users to see registered users

## Troubleshooting

- **"Firebase: Error (auth/operation-not-allowed)"**: Make sure Email/Password authentication is enabled in Firebase Console
- **"Firebase: Error (auth/invalid-api-key)"**: Check that your API key in `.env` is correct
- **"Firebase: Error (auth/network-request-failed)"**: Check your internet connection and Firebase project status

