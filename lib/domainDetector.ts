/**
 * Domain Detection Utility
 * Detects which domain the app is running on and provides helper functions
 * Supports: skilldash.live, skill-dash.vercel.app, and localhost
 */

export type Domain = 'main';

/**
 * Gets the current hostname (works both client and server-side)
 * On server-side, uses environment variables as fallback
 */
function getCurrentHostname(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  // Server-side: extract from NODE_ENV or use default
  return process.env.VERCEL_URL || 'skill-dash.vercel.app';
}

/**
 * Gets the current protocol (works both client and server-side)
 */
function getCurrentProtocol(): string {
  if (typeof window !== 'undefined') {
    return window.location.protocol.replace(':', '');
  }
  return process.env.NODE_ENV === 'production' ? 'https' : 'http';
}

/**
 * Detects current domain
 * @returns 'main' for skilldash.live/skill-dash.vercel.app
 */
export function getDomain(): Domain {
  return 'main';
}

/**
 * Gets base URL for current domain
 * Works correctly on both Vercel and custom domains
 */
export function getBaseUrl(): string {
  const hostname = getCurrentHostname();
  const protocol = getCurrentProtocol();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  // Main domain
  if (isLocalhost) {
    const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : ':3000';
    return `http://localhost${port}`;
  }

  // Return current domain URL
  if (hostname.includes('vercel.app')) {
    return `${protocol}://${hostname}`;
  }

  return process.env.NEXT_PUBLIC_MAIN_DOMAIN || `https://skill-dash.vercel.app`;
}

/**
 * Gets the correct Firebase config based on domain
 * @returns 'student' to determine which Firebase to use
 */
export function getFirebaseType(): 'student' {
  return 'student';
}

/**
 * Formats a path for the current domain
 * @param path - Path to format
 * @returns Full URL for current domain
 */
export function formatPathForDomain(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Gets login page URL for current domain
 * @returns Login page URL
 */
export function getLoginUrl(): string {
  return formatPathForDomain('/auth');
}

/**
 * Gets dashboard URL for current domain
 * @returns Dashboard page URL
 */
export function getDashboardUrl(): string {
  return formatPathForDomain('/profile');
}

/**
 * Gets profile page URL for current domain
 * @returns Profile page URL
 */
export function getProfileUrl(): string {
  return formatPathForDomain('/profile');
}

/**
 * Checks if a path is restricted to main domain only
 * @param path - Path to check
 * @returns true if path is restricted to main domain
 */
export function isMainDomainOnly(path: string): boolean {
  const mainOnlyPaths = ['/coins'];
  return mainOnlyPaths.some((p) => path.startsWith(p));
}

/**
 * Checks if a path is restricted to HR domain only (deprecated)
 * @param path - Path to check
 * @returns Always false as HR domain is not supported
 * @deprecated HR domain is no longer supported
 */
export function isHRDomainOnly(path: string): boolean {
  return false;
}
