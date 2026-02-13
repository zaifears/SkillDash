'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailVerificationBanner() {
  const { user, sendVerificationEmail, refreshVerificationStatus } = useAuth();
  
  // 🔧 ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // ⏰ 10-MINUTE COUNTDOWN TIMER
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    
    if (countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
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

  // 🔧 Check if component should render AFTER all hooks are called
  if (!user || user.emailVerified || user.isAnonymous || 
      user.providerData.some(p => p.providerId === 'google.com' || p.providerId === 'github.com')) {
    return null;
  }

  // 📧 SEND VERIFICATION EMAIL WITH RATE LIMITING
  const handleSendVerification = async () => {
    if (sending || !canResend) return;
    
    setSending(true);
    
    try {
      await sendVerificationEmail();
      console.log('✅ Verification email sent');
      
      // Start 10-minute cooldown (600 seconds)
      setCanResend(false);
      setCountdown(600);
      
    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error);
      
      // Handle Firebase rate limiting
      if (error.code === 'auth/too-many-requests') {
        setCanResend(false);
        setCountdown(900); // 15 minutes for rate limiting
      }
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshVerificationStatus();
    } catch (error) {
      console.error('❌ Failed to refresh verification status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Format countdown time as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-4 sm:px-6 fixed top-0 left-0 right-0 z-[100] shadow-lg">
      <div className="max-w-6xl mx-auto">
        
        {/* 📱 MOBILE LAYOUT (default) */}
        <div className="block lg:hidden">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl animate-bounce flex-shrink-0">📧</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight">Email Verification Required</p>
            </div>
          </div>
          
          {/* Email and message */}
          <div className="mb-4">
            <p className="text-sm opacity-90 leading-relaxed">
              Verify <strong className="text-yellow-200">{user.email}</strong> to get your <strong>5 welcome coins</strong> 🪙 and unlock all features.
            </p>
            {countdown > 0 && (
              <p className="text-xs opacity-75 mt-2 bg-red-800/50 px-2 py-1 rounded">
                ⏰ Next email in {formatCountdown(countdown)}
              </p>
            )}
          </div>
          
          {/* Mobile buttons - stacked */}
          <div className="space-y-2">
            <button
              onClick={handleSendVerification}
              disabled={sending || !canResend}
              className="w-full bg-white text-red-600 px-4 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Sending...</span>
                </span>
              ) : !canResend ? (
                <span className="flex items-center justify-center gap-2">
                  <span>⏰</span>
                  <span>Wait {formatCountdown(countdown)}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>📧</span>
                  <span>Send Verification Email</span>
                </span>
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full bg-red-800 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-red-900 transition-colors disabled:opacity-50 shadow-sm"
            >
              {refreshing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  <span>Checking...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✅</span>
                  <span>I Already Verified</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 🖥️ DESKTOP LAYOUT (lg and up) */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl animate-bounce">📧</span>
            <div>
              <p className="font-bold text-lg">Email Verification Required</p>
              <p className="text-sm opacity-90">
                Please verify your email <strong>{user.email}</strong> to get your 5 welcome coins and access SkillDash features.
              </p>
              {countdown > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  ⏰ Can resend verification email in {formatCountdown(countdown)}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleSendVerification}
              disabled={sending || !canResend}
              className="bg-white text-red-600 px-5 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Sending...
                </span>
              ) : !canResend ? (
                `⏰ Wait ${formatCountdown(countdown)}`
              ) : (
                '📧 Send Verification Email'
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-red-800 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-900 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {refreshing ? '🔄 Checking...' : '✅ I Verified'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
