// ✅ SAFE: Extract repeated constants
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_CONVERSATION_LENGTH: 24, // 12 exchanges (10 questions + 2 buffer for follow-ups)
  IRRELEVANT_THRESHOLD: 3,
  QUESTION_COUNT_THRESHOLD: 5,
} as const;

export const MESSAGES = {
  LOADING: 'Analyzing your information...',
  ERROR_GENERIC: 'Service temporarily unavailable',
  AUTH_REQUIRED: 'Please log in to continue',
} as const;

export const ROUTES = {
  AUTH: '/auth',
  COINS: '/coins',
  SIMULATOR: '/simulator',
} as const;

// Domain Configuration - Works across skill-dash.vercel.app and skilldash.live
// Note: skill-dash.vercel.app is the primary default (Vercel is maintained indefinitely)
// skilldash.live is kept as fallback but could expire
export const DOMAINS = {
  MAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://skill-dash.vercel.app',
} as const;

/**
 * Get full URL for a path on the main domain
 * Works across different deployments (production, Vercel preview, local)
 */
export function getMainUrl(path: string = ''): string {
  const baseUrl = DOMAINS.MAIN;
  if (!path) return baseUrl;
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
