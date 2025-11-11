'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { fetchWithRetry } from '@/lib/utils/apiClient'; // ✅ NEW IMPORT

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
  const [welcomeBonusGranted, setWelcomeBonusGranted] = useState(false); // 🛡️ SESSION-LEVEL PROTECTION
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 🔧 CHECK EMAIL VERIFICATION STATUS
        await user.reload();
        const wasVerified = isEmailVerified;
        const nowVerified = user.emailVerified;
        setIsEmailVerified(nowVerified);
        
        // 🎉 GIVE WELCOME BONUS FOR EMAIL VERIFICATION - BULLETPROOF DUPLICATE PREVENTION
        if (!wasVerified && nowVerified && user.uid && !welcomeBonusGranted) {
          // Check if this is a manual email signup user (not social/guest)
          const isManualSignup = !user.isAnonymous && 
                                !user.providerData.some(p => p.providerId === 'google.com' || p.providerId === 'github.com');
          
          if (isManualSignup) {
            setWelcomeBonusGranted(true); // 🛡️ PROTECTION 1: Immediate session flag
            
            try {
              console.log('🎯 Granting welcome bonus for newly verified user...');
              
              // ✅ CHANGED: Use fetchWithRetry
              const response = await fetchWithRetry('/api/coins/add', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
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
                
                // 🚀 INSTANT UI REFRESH
                if (typeof window !== 'undefined') {
                  // Trigger coin balance update event
                  window.dispatchEvent(new CustomEvent('coinBalanceUpdated', { 
                    detail: { newBalance: result.newBalance } 
                  }));
                }
                
              } else {
                console.error('❌ Welcome bonus transaction failed:', result.error);
                setWelcomeBonusGranted(false); // Reset flag on failure
                
                // ✅ NEW: Log error
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
              setWelcomeBonusGranted(false); // Reset flag on error for retry
              
              // ✅ NEW: Log error
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
        setWelcomeBonusGranted(false); // Reset flag when user logs out
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isEmailVerified, welcomeBonusGranted]);

  // Send verification email
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

  // Refresh verification status with coin balance update
  const refreshVerificationStatus = async () => {
    if (user) {
      try {
        await user.reload();
        const nowVerified = user.emailVerified;
        setIsEmailVerified(nowVerified);
        
        // 🚀 If user just got verified, trigger coin balance refresh
        if (nowVerified && typeof window !== 'undefined') {
          // Force refresh coin displays
          window.dispatchEvent(new CustomEvent('coinBalanceUpdated'));
          console.log('🎉 Email verified! Coin balance refreshed');
        }
        
        console.log('🔄 Refreshed verification status:', nowVerified);
      } catch (error) {
        console.error('❌ Failed to refresh verification status:', error);
      }
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsEmailVerified(false);
      setWelcomeBonusGranted(false); // Reset flag on logout
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
