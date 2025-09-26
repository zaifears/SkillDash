// lib/firebase.ts - AUTOGENERATE COINS FIELD FOR ALL NEW USERS

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
    signInAnonymously,
    sendEmailVerification,
    updateProfile
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
};

if (!firebaseConfig.apiKey) {
    throw new Error("Missing Firebase configuration.");
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

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

// Guest login: coins: 5
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    if (result.user) {
      await updateProfile(result.user, { displayName: 'Guest' });
      const userDocRef = doc(db, 'users', result.user.uid);
      await setDoc(userDocRef, {
        name: 'Guest', 
        email: null,
        age: null, 
        status: 'Other', 
        phone: '',
        isGuest: true,
        coins: 5 // <-- coins!
      });
    }
    return result.user;
  } catch (error) {
    console.error('Guest login error:', error);
    throw error;
  }
};

// Social login result: coins: 5
const handleSocialSignInResult = async (user: any) => {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            name: user.displayName || user.email?.split('@')[0] || 'User', 
            email: user.email,
            age: null, 
            status: 'Other', 
            phone: '',
            coins: 5 // <-- coins!
        });
    }
    return user;
};

export const signInWithSocialProviderAndCreateProfile = async (
    provider: GoogleAuthProvider | GithubAuthProvider
) => {
    try {
        const result = await signInWithPopup(auth, provider);
        return await handleSocialSignInResult(result.user);
    } catch (error: any) {
        if (
            error.code === 'auth/popup-blocked' || 
            error.code === 'auth/popup-closed-by-user' ||
            error.code === 'auth/cancelled-popup-request'
        ) {
            await signInWithRedirect(auth, provider);
            return null;
        }
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

// Email signup: coins: 5
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
        coins: 5 // <-- coins!
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
