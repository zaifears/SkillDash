'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { hrAuth } from '@/lib/firebaseHR';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { hrDb } from '@/lib/firebaseHR';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

function HRAuthPageContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  // reCAPTCHA verification helper
  const verifyRecaptcha = async (action: string): Promise<boolean> => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not ready yet');
      setError('Security verification loading. Please wait a moment and try again.');
      return false;
    }

    try {
      const token = await executeRecaptcha(action);
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      });
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Security verification failed. Please try again.');
        return false;
      }
      return true;
    } catch (err) {
      console.error('reCAPTCHA verification error:', err);
      setError('Security verification failed. Please refresh and try again.');
      return false;
    }
  };

  // Check if already logged in to HR
  useEffect(() => {
    if (!hrAuth) {
      setCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(hrAuth, async (user) => {
      if (user) {
        // Check if user is an approved HR admin
        if (hrDb) {
          const userDoc = await getDoc(doc(hrDb, 'hr_users', user.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'admin') {
            router.push('/');
            return;
          }
        }
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrAuth) {
      setError('HR authentication not initialized');
      return;
    }

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('hr_signin');
    if (!isHuman) return;

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(hrAuth, email, password);
      
      // Check if user has HR admin role
      if (hrDb) {
        const userDoc = await getDoc(doc(hrDb, 'hr_users', userCredential.user.uid));
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          await signOut(hrAuth);
          setError('Access denied. You are not authorized to access the HR dashboard.');
          setLoading(false);
          return;
        }
      }

      router.push('/');
    } catch (err: any) {
      console.error('HR Sign in error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrAuth || !hrDb) {
      setError('HR system not initialized');
      return;
    }

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('hr_signup');
    if (!isHuman) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(hrAuth, email, password);
      
      // Create HR user document (pending approval)
      await setDoc(doc(hrDb, 'hr_users', userCredential.user.uid), {
        email: email,
        name: name,
        role: 'pending', // Needs admin approval
        createdAt: serverTimestamp(),
        status: 'pending_approval'
      });

      // Sign out until approved
      await signOut(hrAuth);
      setError('');
      alert('Account created! Please wait for admin approval before logging in.');
      setIsSignUp(false);
    } catch (err: any) {
      console.error('HR Sign up error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hrAuth || !hrDb) {
      setError('HR system not initialized');
      return;
    }

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('hr_google_signin');
    if (!isHuman) return;

    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();

      // Use redirect on mobile (more reliable), popup on desktop
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
      
      if (isMobile) {
        await signInWithRedirect(hrAuth, provider);
        return;
      }

      const result = await signInWithPopup(hrAuth, provider);
      
      // Check if user exists in HR users
      const userDoc = await getDoc(doc(hrDb, 'hr_users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new HR user (pending approval)
        await setDoc(doc(hrDb, 'hr_users', result.user.uid), {
          email: result.user.email,
          name: result.user.displayName,
          role: 'pending',
          createdAt: serverTimestamp(),
          status: 'pending_approval'
        });
        await signOut(hrAuth);
        alert('Account created! Please wait for admin approval before logging in.');
        return;
      }

      if (userDoc.data()?.role !== 'admin') {
        await signOut(hrAuth);
        setError('Access denied. Your account is pending approval.');
        return;
      }

      router.push('/');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        // Fall back to redirect if popup is blocked
        try {
          const provider = new GoogleAuthProvider();
          await signInWithRedirect(hrAuth!, provider);
        } catch (redirectErr) {
          setError('Failed to sign in with Google. Please try again.');
        }
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!hrAuth) {
      setError('HR authentication not initialized');
      return;
    }
    if (!email?.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(hrAuth, email.trim().toLowerCase());
      setError('');
      alert('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main card - centered */}
      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          
          {/* 2-column grid: 1 col on mobile, 65/35 split on lg screens */}
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8">
            
            {/* LEFT COLUMN - Form */}
            <div className="flex flex-col justify-center">
              {/* Sign In View */}
              {!isSignUp && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-1">HR Portal</h1>
                  <p className="text-slate-400 mb-6 text-sm">Sign in to manage hiring</p>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="hr@company.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loading}
                        className="text-xs text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>

                  {/* Toggle to Request Access */}
                  <div className="mt-4 text-center">
                    <p className="text-slate-400 text-xs">
                      No access yet?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(true);
                          setError('');
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition"
                      >
                        Request access
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* Request Access View */}
              {isSignUp && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-1">HR Portal</h1>
                  <p className="text-slate-400 mb-6 text-sm">Request access to manage hiring</p>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-3">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Your name"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="hr@company.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Request Access Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Requesting Access...
                        </>
                      ) : (
                        'Request Access'
                      )}
                    </button>
                  </form>

                  {/* Toggle to Sign In */}
                  <div className="mt-4 text-center">
                    <p className="text-slate-400 text-xs">
                      Already have access?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false);
                          setError('');
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT COLUMN - Social Auth (desktop only) */}
            <div className="hidden lg:flex flex-col justify-center gap-6">
              {/* Or Divider */}
              <p className="text-slate-400 text-center font-medium text-sm">or</p>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs text-center">
                  🔒 Restricted area for HR personnel only.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Social Auth - only shown on mobile */}
          <div className="lg:hidden mt-6 pt-6 border-t border-slate-700">
            {/* Or Divider */}
            <p className="text-slate-400 text-center mb-4 font-medium text-sm">or</p>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 transition flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            {/* Info Box */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-xs text-center">
                🔒 Restricted area for HR personnel only.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-xs text-slate-400 hover:text-blue-400 transition inline-flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to SkillDash</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with reCAPTCHA provider
export default function HRAuthPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    // Fallback if no reCAPTCHA key configured
    return <HRAuthPageContent />;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <HRAuthPageContent />
    </GoogleReCaptchaProvider>
  );
}
