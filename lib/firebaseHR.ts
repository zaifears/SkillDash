// lib/firebaseHR.ts - SEPARATE Firebase instance for HR-only operations
// This is completely isolated from the main SkillDash Firebase

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider,
    Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// HR Firebase Configuration (separate project)
const hrFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_HR_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_HR_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_HR_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_HR_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_HR_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_HR_FIREBASE_APP_ID,
};

// Initialize HR Firebase App with unique name to avoid conflicts
let hrApp: FirebaseApp | undefined;
let hrAuth: Auth | undefined;
let hrDb: Firestore | undefined;
let hrStorage: FirebaseStorage | undefined;

// Only initialize if we have valid config AND we're on client-side
const isValidConfig = hrFirebaseConfig.apiKey && hrFirebaseConfig.projectId;

if (typeof window !== 'undefined' && isValidConfig) {
  try {
    // Client-side only
    const existingApps = getApps();
    const hrAppExists = existingApps.some(app => app.name === 'hr-app');
    
    if (!hrAppExists) {
      hrApp = initializeApp(hrFirebaseConfig, 'hr-app');
    } else {
      hrApp = getApp('hr-app');
    }

    hrAuth = getAuth(hrApp);
    hrDb = getFirestore(hrApp);
    hrStorage = getStorage(hrApp);
  } catch (error) {
    console.warn('[FirebaseHR] Failed to initialize HR Firebase:', error);
    // Leave hrApp, hrAuth, hrDb, hrStorage as undefined
  }
}

export { hrApp, hrAuth, hrDb, hrStorage };
export default hrApp;
