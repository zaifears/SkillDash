const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
let sentryInitialized = false;
type SentryLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

async function loadSentryBrowser() {
  const sentry = await import('@sentry/browser');
  return sentry;
}

export async function initSentry() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (sentryInitialized || !SENTRY_DSN || typeof window === 'undefined') {
    return;
  }

  sentryInitialized = true;

  const start = async () => {
    const Sentry = await loadSentryBrowser();
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.05,
      maxBreadcrumbs: 30,
      attachStacktrace: true,
      beforeSend(event, hint) {
        if (
          hint.originalException instanceof TypeError &&
          hint.originalException.message?.includes('fetch')
        ) {
          return null;
        }
        return event;
      },
      ignoreErrors: [
        'chrome-extension://',
        'moz-extension://',
        'Network request failed',
        'timeout',
        'cancelled',
        'aborted',
      ],
    });
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => {
      void start();
    }, { timeout: 5000 });
  } else {
    setTimeout(() => {
      void start();
    }, 250);
  }
}

export async function captureException(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await loadSentryBrowser();
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  } else {
    console.error('🔴 [Sentry] Dev Error:', error, context);
  }
}

export async function captureMessage(message: string, level: SentryLevel = 'info') {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await loadSentryBrowser();
    Sentry.captureMessage(message, level);
  } else {
    console.log(`🔵 [Sentry] ${level.toUpperCase()}: ${message}`);
  }
}
