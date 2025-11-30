// ✅ NEW: Sentry Error Monitoring Configuration
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not configured. Error monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1, // Capture 10% of transactions
    
    // ✅ Reduce noise: Only capture errors in production
    maxBreadcrumbs: 50,
    attachStacktrace: true,
    
    // ✅ PII protection: Don't capture sensitive data
    beforeSend(event, hint) {
      // Filter out network errors that are expected
      if (hint.originalException instanceof TypeError && 
          hint.originalException.message?.includes('fetch')) {
        return null;
      }
      return event;
    },

    // ✅ Ignore known harmless errors
    ignoreErrors: [
      // Chrome extension errors
      'chrome-extension://',
      'moz-extension://',
      
      // Network timeouts (expected)
      'Network request failed',
      'timeout',
      
      // User cancelled
      'cancelled',
      'aborted',
    ],
  });
}

export function captureException(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    console.error('🔴 [Sentry] Dev Error:', error, context);
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`🔵 [Sentry] ${level.toUpperCase()}: ${message}`);
  }
}
