// lib/firebase/firebaseGo.ts - Firebase config for Go (Short Links feature)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseGoConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_GO_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_GO_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_GO_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_GO_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_GO_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_GO_APP_ID,
};

// Initialize named app instance to avoid conflicts with main Firebase
const appGo = initializeApp(firebaseGoConfig, 'go');
export const dbGo = getFirestore(appGo);
export const authGo = getAuth(appGo);
