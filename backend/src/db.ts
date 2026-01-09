import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase Admin Setup
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  './auto-trust-48178-firebase-adminsdk-fbsvc-85ba1a16fd.json';

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const db = admin.firestore();
