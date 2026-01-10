import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Firebase Admin Setup
// Use absolute path relative to the backend root, not the dist folder
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
  ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.resolve(__dirname, '../auto-trust-48178-firebase-adminsdk-fbsvc-85ba1a16fd.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'auto-trust-48178.appspot.com',
  });

  console.log('Firebase Admin initialized successfully');
  console.log('Service account path:', serviceAccountPath);
  console.log('Storage bucket:', process.env.FIREBASE_STORAGE_BUCKET || 'auto-trust-48178.appspot.com');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  console.error('Attempted path:', serviceAccountPath);
}

export const db = admin.firestore();
