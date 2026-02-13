'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { hrAuth } from '@/lib/firebaseHR';

interface HRRedirectProviderProps {
  children: React.ReactNode;
}

export default function HRRedirectProvider({ children }: HRRedirectProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!hrAuth || !auth) {
      setIsReady(true);
      return;
    }

    let studentUnsubscribe: (() => void) | undefined;
    let hrUnsubscribe: (() => void) | undefined;

    // Monitor both auth instances
    studentUnsubscribe = onAuthStateChanged(auth, (studentUser) => {
      // Clean up previous HR listener to prevent subscription leaks
      if (hrUnsubscribe) hrUnsubscribe();

      hrUnsubscribe = onAuthStateChanged(hrAuth!, async (hrUser) => {
        if (typeof window === 'undefined') {
          setIsReady(true);
          return;
        }

        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isHRDomain = hostname === 'hr.skilldash.live' || (isLocalhost && pathname.startsWith('/hr'));
        const isMainDomain = hostname === 'skilldash.live' || hostname === 'www.skilldash.live' || (isLocalhost && !pathname.startsWith('/hr'));

        console.log('[AuthSwitcher] Auth state:', {
          studentLoggedIn: !!studentUser,
          hrLoggedIn: !!hrUser,
          hostname,
          isHRDomain,
          isMainDomain,
          pathname,
        });

        // ========== SCENARIO 1: On HR domain or /hr path on localhost ==========
        if (isHRDomain) {
          // HR domain/path but logged in as student - switch to HR
          if (studentUser && !hrUser) {
            console.log('[AuthSwitcher] 🔄 On HR domain with student login → logging out student');
            await signOut(auth);
            // Redirect to HR login
            if (isLocalhost) {
              router.replace('/hr/auth');
            } else {
              window.location.href = `${process.env.NEXT_PUBLIC_HR_DOMAIN}/auth`;
            }
            return;
          }

          // HR domain/path and logged in as HR - allow access
          if (hrUser) {
            console.log('[AuthSwitcher] ✅ HR user on HR domain/path, allowing access');
            return;
          }

          // Not logged in to HR - show HR login page (allow access to HR auth pages)
          if (!studentUser && !hrUser) {
            console.log('[AuthSwitcher] ✅ Not logged in on HR domain, allowing access to HR login');
            return;
          }
        }

        // ========== SCENARIO 2: On Main domain ==========
        if (isMainDomain && !pathname.startsWith('/hr')) {
          // Main domain and logged in as HR - redirect to HR dashboard/domain
          if (hrUser && !studentUser) {
            console.log('[AuthSwitcher] 🔄 HR user on main domain → redirecting to HR');
            if (isLocalhost) {
              router.replace('/hr');
            } else {
              window.location.href = process.env.NEXT_PUBLIC_HR_DOMAIN || 'https://hr.skilldash.live/';
            }
            return;
          }

          // Main domain and logged in as student - continue normally
          if (studentUser && !hrUser) {
            console.log('[AuthSwitcher] ✅ Student user on main domain, allowing access');
            return;
          }
        }

        setIsReady(true);
      });
    });

    return () => {
      if (studentUnsubscribe) studentUnsubscribe();
      if (hrUnsubscribe) hrUnsubscribe();
    };
  }, [router, pathname]);

  // Show loading while auth is being checked
  if (!isReady) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
