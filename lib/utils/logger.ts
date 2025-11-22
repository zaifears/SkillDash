/**
 * 🚀 Production-aware logging utility
 * Automatically disables logs in production, keeps them in development
 * Reduces Vercel cold start time and processing costs
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log info messages (only in dev)
   */
  info: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log success messages (only in dev)
   */
  success: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log debug messages (only in dev)
   */
  debug: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Log warnings (both dev and prod for debugging)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log errors (both dev and prod for debugging)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Raw console.log wrapper for explicit logging
   */
  raw: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
};

export default logger;
