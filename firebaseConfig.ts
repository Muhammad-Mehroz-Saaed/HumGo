import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Validate Firebase config
const isConfigValid = firebaseConfig.apiKey !== 'YOUR_API_KEY' && 
                      firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

if (!isConfigValid && __DEV__) {
  console.warn('Firebase config is using placeholder values. Set EXPO_PUBLIC_FIREBASE_* environment variables.');
}

// Initialize Firebase app (singleton pattern for hot reload safety)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize Firestore (simple, no persistence for cross-platform compatibility)
  db = getFirestore(app);
  
  // Initialize Auth - use getAuth for cross-platform compatibility
  // Firebase SDK handles persistence automatically per platform
  try {
    auth = getAuth(app);
  } catch (e) {
    // Auth already initialized (hot reload), get existing instance
    auth = getAuth(app);
  }
} catch (error) {
  // Fatal error - log and re-throw
  console.error('Firebase initialization failed:', error);
  throw error;
}

export { app, db, auth };
