// lib/firebase.ts - CLIENT-SIDE Firebase with auto coin generation

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    onAuthStateChanged, 
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserProfile {
    name?: string;
    age?: number;
    status?: 'School' | 'College' | 'University' | 'Job' | 'Other';
    email?: string;
    phone?: string;
    coins?: number;
}

interface SignUpProfileData {
    name: string;
    age: number | null;
    status: string;
    phone?: string;
    email: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Enhanced error checking - only throw in browser, not during build
if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
    console.error('🔥 Firebase configuration missing!');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
}

// Safe initialization
let app: any;
let auth: any;
let db: any;
let googleProvider: any;
let githubProvider: any;

if (firebaseConfig.apiKey) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      // No apps initialized, create the default one
      app = initializeApp(firebaseConfig);
    } else {
      // Check if default app exists, if not create it
      app = apps.find(a => a.name === '[DEFAULT]') || initializeApp(firebaseConfig);
    }
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize providers after app is ready
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    githubProvider = new GithubAuthProvider();
    githubProvider.addScope('user:email');
    githubProvider.setCustomParameters({
      allow_signup: 'true'
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  // Fallback - create dummy objects to prevent crashes
  console.warn('Firebase not initialized - missing API key');
}

export const getActionCodeSettings = () => ({
    url: `${window.location.origin}/auth`,
    handleCodeInApp: true,
});

// 🎯 Social login result: coins: 5 (no verification needed)
export const handleSocialSignInResult = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName || user.email?.split('@')[0] || 'User', 
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            age: null, 
            status: 'Other', 
            phone: '',
            coins: 5, // ✅ Social users get coins immediately
            welcomeBonusGranted: true, // ✅ Mark bonus as granted to prevent duplicate from AuthContext
            provider: user.providerData[0]?.providerId || 'unknown',
            createdAt: new Date().toISOString()
        });
    } else {
        // Handle existing users without coins field
        const userData = docSnap.data();
        if (userData.coins === undefined) {
            await setDoc(userDocRef, { coins: 5, welcomeBonusGranted: true }, { merge: true });
        }
    }
    return user;
};

export const signInWithSocialProviderAndCreateProfile = async (
    provider: GoogleAuthProvider | GithubAuthProvider
) => {
    try {
        // Check if we're on mobile/tablet
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
        
        // Use redirect on mobile (more reliable), popup on desktop
        if (isMobile) {
            console.log('📱 Mobile detected - using redirect for OAuth');
            await signInWithRedirect(auth, provider);
            return null;
        } else {
            console.log('🖥️ Desktop detected - attempting popup OAuth');
            const result = await signInWithPopup(auth, provider);
            return await handleSocialSignInResult(result.user);
        }
    } catch (error: any) {
        // Comprehensive fallback for all popup failure scenarios
        const popupErrorCodes = [
            'auth/popup-blocked',              // Browser blocked the popup
            'auth/popup-closed-by-user',       // User closed the popup
            'auth/cancelled-popup-request',    // Firebase cancelled the request
            'auth/operation-not-supported-in-this-environment', // In-app browser (Instagram, LinkedIn, TikTok)
        ];

        if (popupErrorCodes.includes(error.code)) {
            console.warn(`⚠️ Popup failed (${error.code}) - Falling back to redirect OAuth`, error.message);
            try {
                await signInWithRedirect(auth, provider);
                console.log('✅ Redirect OAuth initiated successfully');
                return null;
            } catch (redirectError: any) {
                console.error('❌ Redirect OAuth also failed:', redirectError);
                throw new Error(`OAuth failed: Popup unavailable and redirect failed. ${redirectError.message}`);
            }
        }
        
        // Re-throw unexpected errors
        console.error('❌ Unexpected OAuth error:', error);
        throw error;
    }
};

export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            return await handleSocialSignInResult(result.user);
        }
        return null;
    } catch (error) {
        console.error('Redirect result error:', error);
        throw error;
    }
};

// 🔒 Email signup: coins: 0 (requires verification for coins)
export const signUpWithEmailPasswordAndProfile = async (profileData: SignUpProfileData, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: profileData.name });
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        name: profileData.name,
        age: profileData.age,
        status: profileData.status,
        phone: profileData.phone || null,
        email: profileData.email,
        coins: 0, // ✅ Manual signup users get coins after email verification
        createdAt: new Date().toISOString()
    });
    await sendEmailVerification(user);
    return user;
};

export const updateUserProfile = async (userId: string, data: any) => {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, data, { merge: true });
};

export const getUserProfile = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
};

export { 
    auth, 
    db,
    googleProvider,
    githubProvider,
    onAuthStateChanged, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailAndPassword,
    getRedirectResult
};

// ✅ Password Change Function
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = auth.currentUser;
  
  if (!user || !user.email) {
    throw new Error('No user is currently logged in');
  }

  try {
    // Re-authenticate user with their current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update to new password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Use at least 8 characters');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log back in, then try again');
    }
    throw new Error(error.message || 'Failed to change password');
  }
};

/**
 * Get fresh Firebase ID token with automatic refresh
 * Solves Issue #3: Token Expiry - ensures token is valid before API calls
 * @param forceRefresh - Force refresh even if token is valid (recommended for critical operations)
 * @returns Fresh ID token or null if not authenticated
 */
export const getFreshToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    // forceRefresh: true will refresh token even if not expired
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    console.error('Failed to get fresh token:', error);
    return null;
  }
};
