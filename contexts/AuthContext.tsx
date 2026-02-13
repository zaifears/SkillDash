'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification,
  getRedirectResult 
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, handleSocialSignInResult } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { fetchWithRetry } from '@/lib/utils/apiClient';
import { updateUserCount } from '@/lib/utils/updateStats';

// ✅ localStorage cache interface
interface CachedUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  lastSync: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  sendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  isEmailVerified: false,
  sendVerificationEmail: async () => {},
  refreshVerificationStatus: async () => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [welcomeBonusGranted, setWelcomeBonusGranted] = useState(false);
  const [userCountUpdated, setUserCountUpdated] = useState(false);
  // Track whether we're still resolving a redirect OAuth callback.
  // Keeps `loading: true` so the UI never flashes the login page.
  const [redirectChecked, setRedirectChecked] = useState(false);
  const router = useRouter();

  // ✅ Handle OAuth redirect callback (when user returns from Google/GitHub auth)
  // This MUST resolve before we allow `loading` to become `false`.
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('✅ User authenticated via redirect OAuth');
          await handleSocialSignInResult(result.user);
          // onAuthStateChanged will pick up the user from here
        }
      } catch (error: any) {
        // auth/no-auth-event is expected when the page loads normally (no redirect)
        if (error.code !== 'auth/no-auth-event') {
          console.error('❌ Failed to handle OAuth redirect:', error.message);
        }
      } finally {
        // Signal that redirect resolution is complete
        setRedirectChecked(true);
      }
    };

    if (typeof window !== 'undefined') {
      handleRedirectResult();
    } else {
      // SSR – no redirect to handle
      setRedirectChecked(true);
    }
  }, []);

  // ✅ Load cached user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('skilldash_user_cache');
        if (cached) {
          const cachedData: CachedUserData = JSON.parse(cached);
          const now = Date.now();
          const cacheAge = now - cachedData.lastSync;
          
          // Use cache if less than 1 hour old
          if (cacheAge < 60 * 60 * 1000) {
            setIsEmailVerified(cachedData.emailVerified);
            console.log('✅ Loaded user from localStorage cache');
          } else {
            // Cache expired
            localStorage.removeItem('skilldash_user_cache');
          }
        }
      } catch (error) {
        console.error('Failed to load cached user:', error);
      }
    }
    // ✅ DON'T set loading to false here - let Firebase auth resolve it
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      // ✅ BLOCK ANONYMOUS USERS (Guest login disabled)
      if (user?.isAnonymous) {
        console.warn('⚠️ Anonymous users are disabled. Signing out...');
        // Clean up anonymous user's Firestore document to prevent orphan data
        try {
          const anonDocRef = doc(db, 'users', user.uid);
          const anonDoc = await getDoc(anonDocRef);
          if (anonDoc.exists()) {
            await deleteDoc(anonDocRef);
            console.log('🗑️ Cleaned up anonymous user document');
          }
        } catch (cleanupErr) {
          console.warn('Failed to clean up anonymous user document:', cleanupErr);
        }
        await signOut(auth);
        setUser(null);
        setIsEmailVerified(false);
        setWelcomeBonusGranted(false);
        setUserCountUpdated(false);
        setLoading(false);
        return;
      }
      
      setUser(user);
      
      if (user) {
        // ✅ Cache user to localStorage for instant reload
        const cachedData: CachedUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          lastSync: Date.now()
        };
        
        try {
          localStorage.setItem('skilldash_user_cache', JSON.stringify(cachedData));
        } catch (error) {
          console.warn('Failed to cache user to localStorage:', error);
        }
        
        // 🔧 CHECK EMAIL VERIFICATION STATUS
        await user.reload();
        const nowVerified = user.emailVerified;
        setIsEmailVerified(nowVerified);
        
        // ✅ AUTOMATIC USER DOCUMENT CREATION & COUNT UPDATE
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          if (!userDoc.exists()) {
            // ✅ NEW USER: Create document (merge:true to avoid overwriting if race with handleSocialSignInResult)
            console.log('🆕 New user detected, creating document...');
            
            // Determine provider
            const provider = user.providerData[0]?.providerId || 'email';
            const isGoogleUser = provider === 'google.com';
            const isGitHubUser = provider === 'github.com';
            
            await setDoc(userDocRef, {
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              displayName: user.displayName || null,
              photoURL: user.photoURL || null,
              coins: (isGoogleUser || isGitHubUser) ? 5 : 0,
              welcomeBonusGranted: (isGoogleUser || isGitHubUser), // Social users get bonus on signup
              status: 'Other',
              provider: provider,
              createdAt: new Date().toISOString(),
            }, { merge: true });
            
            console.log('✅ User document created');
            
            // ✅ FIXED: Pass user.uid to updateUserCount
            if (!userCountUpdated) {
              setUserCountUpdated(true);
              updateUserCount(user.uid).catch(err => 
                console.error('Failed to update user count:', err)
              );
            }
          }
          
          // 🎉 WELCOME BONUS FOR EMAIL VERIFICATION
          // Check Firestore for whether bonus was already granted (survives page reloads)
          const bonusAlreadyGranted = userData?.welcomeBonusGranted === true;
          const isManualSignup = !user.isAnonymous && 
                                !user.providerData.some(p => p.providerId === 'google.com' || p.providerId === 'github.com');
          
          if (nowVerified && isManualSignup && !bonusAlreadyGranted && !welcomeBonusGranted) {
            setWelcomeBonusGranted(true);
            
            // 🔒 Optimistically mark bonus as granted in Firestore FIRST to prevent race condition
            // across multiple tabs/sessions
            await setDoc(userDocRef, { welcomeBonusGranted: true }, { merge: true });
            
            try {
              console.log('🎯 Granting welcome bonus for verified email user...');
              
              // 🔒 Get Firebase ID token for authentication
              const idToken = await user.getIdToken();
              
              const response = await fetchWithRetry('/api/coins/add', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                  userId: user.uid,
                  amount: 5,
                  reason: 'welcome_bonus',
                  description: 'Welcome bonus - Email verified! 🎉'
                }),
                maxRetries: 3,
                retryDelay: 1000
              });

              const result = await response.json();
              
              if (result.success) {
                console.log('🎉 Welcome bonus successfully granted!');
                
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('coinBalanceUpdated', { 
                    detail: { newBalance: result.newBalance } 
                  }));
                }
              } else {
                console.error('❌ Welcome bonus transaction failed:', result.error);
                setWelcomeBonusGranted(false);
                // Revert the optimistic Firestore flag on failure
                await setDoc(userDocRef, { welcomeBonusGranted: false }, { merge: true });
                
                fetch('/api/log-error', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    error: `Welcome bonus failed: ${result.error}`,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    endpoint: '/api/coins/add',
                    userId: user.uid
                  })
                }).catch(() => {});
              }
            } catch (error: any) {
              console.error('❌ Failed to process welcome bonus:', error);
              setWelcomeBonusGranted(false);
              // Revert the optimistic Firestore flag on failure
              try {
                await setDoc(userDocRef, { welcomeBonusGranted: false }, { merge: true });
              } catch {
                // Best-effort revert
              }
              
              fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  error: `Welcome bonus exception: ${error.message}`,
                  userAgent: navigator.userAgent,
                  timestamp: new Date().toISOString(),
                  url: window.location.href,
                  endpoint: '/api/coins/add',
                  userId: user.uid
                })
              }).catch(() => {});
            }
          }
        } catch (error) {
          console.error('❌ Failed to create user document:', error);
        }
        
        console.log('🔍 User email verified:', nowVerified);
      } else {
        setIsEmailVerified(false);
        setWelcomeBonusGranted(false);
        setUserCountUpdated(false);
      }
      
      // Don't set loading to false here directly — we gate it below
      // via the `authResolved` effect so we wait for BOTH
      // onAuthStateChanged AND getRedirectResult to finish.
      setAuthStateResolved(true);
    });

    return () => unsubscribe();
  }, [isEmailVerified, welcomeBonusGranted, userCountUpdated]);

  // ✅ Loading is only false when BOTH Firebase auth state AND redirect result are settled.
  // This prevents the "bounce" — briefly showing the login page before the redirect
  // result resolves and logs the user in.
  const [authStateResolved, setAuthStateResolved] = useState(false);

  useEffect(() => {
    if (authStateResolved && redirectChecked) {
      setLoading(false);
    }
  }, [authStateResolved, redirectChecked]);

  const sendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(user);
        console.log('✅ Verification email sent');
      } catch (error) {
        console.error('❌ Failed to send verification email:', error);
        throw error;
      }
    }
  };

  const refreshVerificationStatus = async () => {
    if (user) {
      try {
        await user.reload();
        const nowVerified = user.emailVerified;
        setIsEmailVerified(nowVerified);
        
        if (nowVerified && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('coinBalanceUpdated'));
          console.log('🎉 Email verified! Coin balance refreshed');
        }
        
        console.log('🔄 Refreshed verification status:', nowVerified);
      } catch (error) {
        console.error('❌ Failed to refresh verification status:', error);
      }
    }
  };

  const logout = async () => {
    try {
      // ✅ Clear localStorage cache on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('skilldash_user_cache');
      }
      
      await signOut(auth);
      setUser(null);
      setIsEmailVerified(false);
      setWelcomeBonusGranted(false);
      setUserCountUpdated(false);
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isEmailVerified,
      sendVerificationEmail,
      refreshVerificationStatus,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
