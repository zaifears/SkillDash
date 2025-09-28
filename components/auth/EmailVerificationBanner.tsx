'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function EmailVerificationBanner() {
  const { user, isEmailVerified, sendVerificationEmail, refreshVerificationStatus } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const router = useRouter();

  // Don't show banner if user is not logged in or already verified
  if (!user || isEmailVerified) return null;

  // ✅ AUTOMATIC VERIFICATION CHECK EVERY 5 SECONDS
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (user && !isEmailVerified) {
      intervalId = setInterval(async () => {
        try {
          await refreshVerificationStatus();
          
          // ✅ AUTOMATIC REDIRECT AFTER VERIFICATION
          if (user.emailVerified) {
            // Show success message briefly then redirect
            setTimeout(() => {
              router.refresh(); // Refresh the page to update UI
            }, 1500);
          }
        } catch (error) {
          // Silent fail - don't spam console
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, isEmailVerified, refreshVerificationStatus, router]);

  // ✅ COUNTDOWN TIMER FOR RESEND BUTTON (Prevents spam)
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setSent(false); // Allow sending again
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [countdown]);

  // ✅ ENHANCED ERROR HANDLING FOR EMAIL SENDING
  const handleSendVerification = async () => {
    if (sending || countdown > 0) return;
    
    setSending(true);
    setError('');
    
    try {
      await sendVerificationEmail();
      setSent(true);
      setCountdown(60); // 60 second cooldown
      setError('');
      
      // Show success state
      setTimeout(() => {
        if (!user.emailVerified) {
          setSent(false);
        }
      }, 5000);
      
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      
      // ✅ BETTER ERROR HANDLING WITH SPECIFIC MESSAGES
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/too-many-requests':
            errorMessage = 'Too many verification emails sent. Please wait a few minutes before trying again.';
            setCountdown(300); // 5 minute cooldown for spam
            break;
          case 'auth/user-token-expired':
            errorMessage = 'Your session has expired. Please sign in again.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address. Please contact support.';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setSent(false);
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    
    try {
      await refreshVerificationStatus();
      
      if (!user?.emailVerified) {
        setError('Email not verified yet. Please check your email and click the verification link.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error: any) {
      console.error('Failed to refresh verification status:', error);
      setError('Failed to check verification status. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">📧</span>
          <div>
            <p className="font-bold text-lg">Email Verification Required</p>
            <p className="text-sm opacity-90">
              Please verify your email <strong>{user?.email}</strong> to access SkillDash features.
            </p>
            <div className="text-xs opacity-75 mt-1">
              ✨ Auto-checking every 5 seconds for verification...
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {sent || countdown > 0 ? (
            <div className="flex items-center gap-2">
              <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <span className="animate-pulse">✅</span>
                {countdown > 0 ? `Email sent! Wait ${formatCountdown(countdown)}` : 'Verification email sent!'}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white text-red-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {refreshing ? '🔄 Checking...' : '🔄 I Verified'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSendVerification}
                disabled={sending || countdown > 0}
                className="bg-white text-red-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </span>
                ) : countdown > 0 ? (
                  `Wait ${formatCountdown(countdown)}`
                ) : (
                  '📧 Send Verification Email'
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-red-800 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-900 transition-colors disabled:opacity-50"
              >
                {refreshing ? '🔄 Checking...' : '🔄 Already Verified?'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* ✅ ERROR DISPLAY */}
      {error && (
        <div className="mt-3 bg-red-800 bg-opacity-50 border border-red-400 rounded-lg p-3 text-center">
          <p className="text-sm">⚠️ {error}</p>
        </div>
      )}
      
      {/* Mobile responsive layout */}
      <div className="block sm:hidden mt-3 text-center">
        <div className="flex flex-col gap-2">
          {sent || countdown > 0 ? (
            <>
              <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {countdown > 0 ? `✅ Email sent! Wait ${formatCountdown(countdown)}` : '✅ Verification email sent!'}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white text-red-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {refreshing ? '🔄 Checking...' : '🔄 I Verified'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSendVerification}
                disabled={sending || countdown > 0}
                className="bg-white text-red-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending...' : countdown > 0 ? `Wait ${formatCountdown(countdown)}` : '📧 Send Verification Email'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-red-800 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-900 transition-colors disabled:opacity-50"
              >
                {refreshing ? '🔄 Checking...' : '🔄 Already Verified?'}
              </button>
            </>
          )}
        </div>
        
        {error && (
          <div className="mt-3 bg-red-800 bg-opacity-50 border border-red-400 rounded-lg p-3">
            <p className="text-sm">⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
