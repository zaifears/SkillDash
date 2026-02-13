'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { checkAdmin } from '@/lib/admin';
import { LoadingScreen } from '@/lib/components/shared';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (loading) return;

      if (!user) {
        router.replace('/auth');
        return;
      }

      // Double-check with ID token claim for stronger server-verified admin check
      try {
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.admin === true) {
          setIsAdmin(true);
          setChecking(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to verify admin via token claims, falling back to Firestore:', err);
      }

      // Fall back to Firestore check (still useful if custom claims aren't set up)
      const adminStatus = await checkAdmin(user.uid);
      
      if (!adminStatus) {
        router.replace('/');
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    verifyAdmin();
  }, [user, loading, router]);

  if (loading || checking) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {children}
    </div>
  );
}
