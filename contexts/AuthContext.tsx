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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // 🔧 CHECK EMAIL VERIFICATION STATUS
        await user.reload(); // Refresh user data
        setIsEmailVerified(user.emailVerified);
        console.log('🔍 User email verified:', user.emailVerified);
      } else {
        setIsEmailVerified(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔧 SEND VERIFICATION EMAIL FUNCTION
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

  // 🔧 REFRESH VERIFICATION STATUS
  const refreshVerificationStatus = async () => {
    if (user) {
      try {
        await user.reload();
        setIsEmailVerified(user.emailVerified);
        console.log('🔄 Refreshed verification status:', user.emailVerified);
      } catch (error) {
        console.error('❌ Failed to refresh verification status:', error);
      }
    }
  };

  // LOGOUT FUNCTION
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsEmailVerified(false);
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
