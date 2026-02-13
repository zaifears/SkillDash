// ✅ SAFE: Extract repeated constants
export const LIMITS = {
  MIN_RESUME_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 500,
  MAX_CONVERSATION_LENGTH: 24, // 12 exchanges (10 questions + 2 buffer for follow-ups)
  COINS_PER_FEATURE: 1,
  IRRELEVANT_THRESHOLD: 3,
  QUESTION_COUNT_THRESHOLD: 5,
} as const;

export const MESSAGES = {
  INSUFFICIENT_COINS: 'You need more SkillCoins for this feature',
  LOADING: 'Analyzing your information...',
  ERROR_GENERIC: 'Service temporarily unavailable',
  AUTH_REQUIRED: 'Please log in to continue',
} as const;

export const ROUTES = {
  AUTH: '/auth',
  DISCOVER: '/discover',
  LEARN_SKILL: '/learn-skill',
  RESUME_FEEDBACK: '/resume-feedback',
  OPPORTUNITIES: '/opportunities',
  COINS: '/coins',
} as const;

// Domain Configuration - Works across skill-dash.vercel.app and skilldash.live
// Note: skill-dash.vercel.app is the primary default (Vercel is maintained indefinitely)
// skilldash.live is kept as fallback but could expire
export const DOMAINS = {
  MAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://skill-dash.vercel.app',
  HR: process.env.NEXT_PUBLIC_HR_DOMAIN || 'https://hr.skilldash.live',
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

/**
 * Get full URL for a path on the HR domain
 */
export function getHRUrl(path: string = ''): string {
  const baseUrl = DOMAINS.HR;
  if (!path) return baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
