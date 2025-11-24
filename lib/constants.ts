// ✅ SAFE: Extract repeated constants
export const LIMITS = {
  MIN_RESUME_LENGTH: 100,
  MAX_MESSAGE_LENGTH: 500,
  MAX_CONVERSATION_LENGTH: 20,
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
