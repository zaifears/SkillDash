'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { fetchWithRetry } from '@/lib/utils/apiClient';
import { updateUserCount } from '@/lib/utils/updateStats';

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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      // ✅ BLOCK ANONYMOUS USERS (Guest login disabled)
      if (user?.isAnonymous) {
        console.warn('⚠️ Anonymous users are disabled. Signing out...');
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
        // 🔧 CHECK EMAIL VERIFICATION STATUS
        await user.reload();
        const wasVerified = isEmailVerified;
        const nowVerified = user.emailVerified;
        setIsEmailVerified(nowVerified);
        
        // ✅ AUTOMATIC USER DOCUMENT CREATION & COUNT UPDATE
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // ✅ NEW USER: Create document
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
              status: 'Other',
              provider: provider,
              createdAt: new Date().toISOString(),
            });
            
            console.log('✅ User document created');
            
            // ✅ FIXED: Pass user.uid to updateUserCount
            if (!userCountUpdated) {
              setUserCountUpdated(true);
              updateUserCount(user.uid).catch(err => 
                console.error('Failed to update user count:', err)
              );
            }
          }
        } catch (error) {
          console.error('❌ Failed to create user document:', error);
        }
        
        // 🎉 WELCOME BONUS FOR EMAIL VERIFICATION
        if (!wasVerified && nowVerified && user.uid && !welcomeBonusGranted) {
          const isManualSignup = !user.isAnonymous && 
                                !user.providerData.some(p => p.providerId === 'google.com' || p.providerId === 'github.com');
          
          if (isManualSignup) {
            setWelcomeBonusGranted(true);
            
            try {
              console.log('🎯 Granting welcome bonus for newly verified user...');
              
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
        }
        
        console.log('🔍 User email verified:', nowVerified);
      } else {
        setIsEmailVerified(false);
        setWelcomeBonusGranted(false);
        setUserCountUpdated(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isEmailVerified, welcomeBonusGranted, userCountUpdated]);

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
