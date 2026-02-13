// ✅ ADD THE IMPORT AT THE TOP
import { LIMITS } from '../constants';

// ✅ SAFE: Extract common validation logic
export const detectPromptInjection = (content: string): boolean => {
  const cleanContent = content.toLowerCase().trim();
  const injectionPatterns = [
    /ignore\s+(all\s+|previous\s+|prior\s+|earlier\s+)*instructions/i,
    /forget\s+(all|everything|previous|prior|earlier)/i,
    /disregard\s+(all\s+|previous\s+|prior\s+)*instructions/i,
    /override\s+(all\s+|previous\s+|prior\s+)*instructions/i,
    /you\s+are\s+now/i,
    /jailbreak/i,
  ];
  return injectionPatterns.some(pattern => pattern.test(cleanContent));
};

export const validateMessageArray = (messages: any[]): { isValid: boolean; error?: string } => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { isValid: false, error: 'Invalid messages format' };
  }
  if (messages.length > LIMITS.MAX_CONVERSATION_LENGTH) {
    return { isValid: false, error: 'Conversation too long' };
  }
  return { isValid: true };
};
