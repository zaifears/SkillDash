/**
 * Humanize Firebase Authentication Error Codes
 * Converts technical Firebase errors into user-friendly messages
 */

export function humanizeAuthError(error: any): string {
  // Check error code
  const code = error?.code || error?.message || '';
  
  // Email/Password errors
  if (code.includes('auth/user-not-found')) {
    return 'No account found with this email. Did you mean to sign up?';
  }
  
  if (code.includes('auth/wrong-password')) {
    return 'Incorrect password. Try again or use "Forgot Password" to reset it.';
  }
  
  if (code.includes('auth/invalid-credential')) {
    return 'Invalid email or password. Please check and try again.';
  }
  
  if (code.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  
  if (code.includes('auth/weak-password')) {
    return 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.';
  }
  
  if (code.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  
  if (code.includes('auth/user-disabled')) {
    return 'This account has been disabled. Contact support for help.';
  }
  
  if (code.includes('auth/too-many-requests')) {
    return '⚠️ Too many failed attempts. Your account is temporarily locked. Reset your password to unlock immediately.';
  }
  
  if (code.includes('auth/operation-not-allowed')) {
    return 'This sign-in method is not currently enabled. Try another method.';
  }
  
  // Social auth errors
  if (code.includes('auth/popup-blocked')) {
    return '⚠️ Popup blocked! Please allow popups for this site in your browser settings. If using an in-app browser, try Safari or Firefox.';
  }
  
  if (code.includes('auth/popup-closed-by-user')) {
    return 'Sign-in was cancelled. Please try again.';
  }
  
  if (code.includes('auth/cancelled-popup-request')) {
    return 'Another sign-in popup is already open. Please close it and try again.';
  }
  
  if (code.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with this email using a different sign-in method. Try signing in with email/password instead.';
  }
  
  if (code.includes('auth/credential-already-in-use')) {
    return 'This account is already linked to another user.';
  }
  
  // Network errors
  if (code.includes('timed out') || code.includes('timeout')) {
    return '⏱️ Connection took too long. Check your internet and try again.';
  }
  
  if (code.includes('network') || code.includes('offline')) {
    return '📡 Network error. Please check your internet connection and try again.';
  }
  
  // Generic fallback
  if (error?.message) {
    return error.message;
  }
  
  return 'An error occurred during sign-in. Please try again.';
}

/**
 * Map Firebase error code to technical issue for debugging
 */
export function debugAuthError(error: any): string {
  const code = error?.code || 'UNKNOWN';
  console.error(`[AUTH ERROR] ${code}:`, error?.message);
  return code;
}
