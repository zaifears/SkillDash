'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { hrAuth } from '@/lib/firebaseHR';
import ModernNavbar from './ModernNavbar';
import HRNavbar from './hiring/HRNavbar';

export default function NavbarWrapper() {
  const [isHRUser, setIsHRUser] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (!hrAuth) {
      setIsChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(hrAuth, (user) => {
      setIsHRUser(!!user);
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // If checking auth, don't render navbar yet
  if (isChecking) {
    return null;
  }

  // Show HR navbar only for HR users
  if (isHRUser) {
    return <HRNavbar />;
  }

  // Show student navbar for everyone else
  return <ModernNavbar />;
}
