/**
 * Domain Detection Utility
 * Detects which domain the app is running on and provides helper functions
 */

export type Domain = 'main' | 'hr';

/**
 * Detects current domain
 * @returns 'main' for skilldash.live, 'hr' for hr.skilldash.live
 */
export function getDomain(): Domain {
  if (typeof window === 'undefined') {
    return 'main'; // Default to main on server-side
  }

  const host = window.location.hostname;

  // Check if on HR subdomain
  if (host.includes('hr.') || host === 'hr.skilldash.live') {
    return 'hr';
  }

  return 'main';
}

/**
 * Gets base URL for current domain
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://skilldash.live';
  }

  const domain = getDomain();
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (domain === 'hr') {
    // If on HR domain but localhost, construct localhost HR URL
    if (isLocalhost) {
      const port = window.location.port ? `:${window.location.port}` : '';
      return `http://localhost${port}/hr`;
    }
    return process.env.NEXT_PUBLIC_HR_DOMAIN || 'https://hr.skilldash.live';
  }

  // Main domain
  if (isLocalhost) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `http://localhost${port}`;
  }
  return process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://skilldash.live';
}

/**
 * Checks if running on HR subdomain
 * @returns true if on HR subdomain, false otherwise
 */
export function isHRDomain(): boolean {
  return getDomain() === 'hr';
}

/**
 * Gets the correct Firebase config based on domain
 * @returns 'student' or 'hr' to determine which Firebase to use
 */
export function getFirebaseType(): 'student' | 'hr' {
  return isHRDomain() ? 'hr' : 'student';
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
  if (isHRDomain()) {
    return formatPathForDomain('/auth');
  }
  return formatPathForDomain('/auth');
}

/**
 * Gets dashboard URL for current domain
 * @returns Dashboard page URL
 */
export function getDashboardUrl(): string {
  if (isHRDomain()) {
    return formatPathForDomain('/');
  }
  return formatPathForDomain('/profile');
}

/**
 * Gets profile page URL for current domain
 * @returns Profile page URL
 */
export function getProfileUrl(): string {
  if (isHRDomain()) {
    return formatPathForDomain('/profile');
  }
  return formatPathForDomain('/profile');
}

/**
 * Checks if a path is restricted to main domain only
 * @param path - Path to check
 * @returns true if path is restricted to main domain
 */
export function isMainDomainOnly(path: string): boolean {
  const mainOnlyPaths = ['/discover', '/resume-feedback', '/coins', '/learn-skill'];
  return mainOnlyPaths.some((p) => path.startsWith(p));
}

/**
 * Checks if a path is restricted to HR domain only
 * @param path - Path to check
 * @returns true if path is restricted to HR domain
 */
export function isHRDomainOnly(path: string): boolean {
  return path.includes('/hr');
}
