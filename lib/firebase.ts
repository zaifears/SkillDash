// lib/firebase.ts - FIXED VERSION
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
    signInAnonymously,  // ADD THIS
    sendEmailVerification,
    updateProfile       // IMPORT THIS SEPARATELY
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


// --- Type definitions remain the same ---
export interface UserProfile {
    name?: string;
    age?: number;
    status?: 'School' | 'College' | 'University' | 'Job' | 'Other';
    email?: string;
    phone?: string;
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
};


if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase configuration.");
}


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);


// FIXED: Properly configure providers with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');
githubProvider.setCustomParameters({
  allow_signup: 'true'
});


export const getActionCodeSettings = () => ({
    url: `${window.location.origin}/auth`,
    handleCodeInApp: true,
});


// FIXED: Guest login function with proper updateProfile usage
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    
    if (result.user) {
      // FIXED: Call updateProfile as a standalone function, not method
      await updateProfile(result.user, {
        displayName: 'Guest'
      });
      
      // Create a basic profile in Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        name: 'Guest', 
        email: null,
        age: null, 
        status: 'Other', 
        phone: '',
        isGuest: true // Flag to identify guest users
      });
    }
    
    return result.user;
  } catch (error) {
    console.error('Guest login error:', error);
    throw error;
  }
};


// FIXED: Enhanced error handling and fallback to redirect
export const signInWithSocialProviderAndCreateProfile = async (
    provider: GoogleAuthProvider | GithubAuthProvider
) => {
    try {
        console.log('Attempting popup sign-in...');
        const result = await signInWithPopup(auth, provider);
        return await handleSocialSignInResult(result.user);
    } catch (error: any) {
        console.error('Popup sign-in failed:', error);
        
        // If popup is blocked or fails, try redirect as fallback
        if (error.code === 'auth/popup-blocked' || 
            error.code === 'auth/popup-closed-by-user' ||
            error.code === 'auth/cancelled-popup-request') {
            
            console.log('Falling back to redirect sign-in...');
            await signInWithRedirect(auth, provider);
            return null; // Will be handled by redirect result
        }
        
        throw error;
    }
};


// FIXED: Separate function to handle redirect results
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


// FIXED: Common function to handle social sign-in user creation
const handleSocialSignInResult = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);


    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName || user.email?.split('@')[0] || 'User', 
            email: user.email,
            age: null, 
            status: 'Other', 
            phone: ''
        });
    }
    return user;
};


// Keep existing functions
export const signUpWithEmailPasswordAndProfile = async (profileData: SignUpProfileData, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, profileData.email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: profileData.name }); // FIXED: Proper updateProfile usage
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
        name: profileData.name, 
        age: profileData.age, 
        status: profileData.status,
        phone: profileData.phone || null, 
        email: profileData.email
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
