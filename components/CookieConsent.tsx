'use client';

import React, { useEffect, useState } from 'react';
import CookieConsent from 'react-cookie-consent';

declare global {
  interface Window {
    dataLayer?: any[];
    [key: string]: any;
  }
}

const CookieConsentBanner = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All"
      declineButtonText="Decline"
      cookieName="skilldash_cookie_consent"
      style={{
        background: '#1f2937',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        fontSize: '14px',
        color: '#e5e7eb',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
      buttonStyle={{
        background: 'linear-gradient(to right, #3b82f6, #6366f1)',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: 'none',
        fontWeight: '600',
        fontSize: '13px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.4)',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#9ca3af',
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid #4b5563',
        fontWeight: '500',
        fontSize: '13px',
        transition: 'all 0.3s ease',
      }}
      containerClasses="cookie-consent-container dark"
      onAccept={() => {
        try {
          // ✅ NEW: Enable GTM when user accepts
          if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          }
          console.log('✅ Cookies accepted');
        } catch (error) {
          console.error('Error in onAccept:', error);
        }
      }}
      onDecline={() => {
        try {
          // ✅ NEW: Disable GTM if user declines
          if (typeof window !== 'undefined') {
            (window as any)['ga-disable-GTM-MT2LDFM3'] = true;
          }
          console.log('❌ Cookies declined');
        } catch (error) {
          console.error('Error in onDecline:', error);
        }
      }}
      expires={365}
      enableDeclineButton
      flipButtons
    >
      <span style={{ flex: 1, marginRight: '20px', lineHeight: '1.5' }}>
        We use cookies to improve your experience and analyze how you use SkillDash. By continuing, you consent to our{' '}
        <a
          href="/policy"
          style={{
            color: '#3b82f6',
            textDecoration: 'underline',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#60a5fa')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
        >
          cookie policy
        </a>
        .
      </span>
    </CookieConsent>
  );
};

export default CookieConsentBanner;
