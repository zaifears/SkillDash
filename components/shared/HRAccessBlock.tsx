'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { hrAuth } from '@/lib/firebaseHR';
import { useRouter } from 'next/navigation';

interface HRAccessBlockProps {
  pageName: string;
  children: React.ReactNode;
}

export default function HRAccessBlock({ pageName, children }: HRAccessBlockProps) {
  const [isHRUser, setIsHRUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!hrAuth) {
      // HR Firebase not initialized, allow access
      setIsHRUser(false);
      setIsChecking(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(hrAuth, (user) => {
      setIsHRUser(!!user);
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (hrAuth) {
      try {
        await signOut(hrAuth);
        setIsHRUser(false);
      } catch (error) {
        console.error('Error signing out from HR:', error);
      }
    }
  };

  const handleGoToStudentLogin = () => {
    router.push('/auth');
  };

  // Still checking auth state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // If logged in as HR user, show block message
  if (isHRUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">
            Access Restricted
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-2">
            The <span className="text-purple-400 font-semibold">{pageName}</span> page is only available for students and job seekers.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            You are currently logged in with an HR account. Please log out and sign in with a student account to access this feature.
          </p>

          {/* HR Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-purple-300 text-sm font-medium">Logged in as HR Personnel</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold hover:from-red-700 hover:to-orange-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out from HR Account
            </button>

            <button
              onClick={handleGoToStudentLogin}
              className="w-full py-3 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Go to Student Login
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Back to HR Dashboard */}
          <a 
            href="/opportunities/hiring"
            className="text-purple-400 hover:text-purple-300 text-sm transition inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to HR Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Not an HR user, render the page content normally
  return <>{children}</>;
}
