/**
 * 🚀 Lazy-Load AI SDKs
 * Only imports AI providers when needed, reducing bundle size
 * Saves ~200-300KB in bundle
 */

import type { GoogleGenerativeAI } from '@google/generative-ai';
import type { default as Groq } from 'groq-sdk';

// Cached instances to prevent re-initialization
let googleAIInstance: GoogleGenerativeAI | null = null;
let groqInstance: Groq | null = null;

/**
 * Lazily load and return Google Generative AI instance
 */
export async function getGoogleAI(): Promise<GoogleGenerativeAI | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ GOOGLE_API_KEY not configured');
    return null;
  }

  if (googleAIInstance) {
    return googleAIInstance;
  }

  try {
    // Only import when needed
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    googleAIInstance = new GoogleGenerativeAI(apiKey);
    return googleAIInstance;
  } catch (error) {
    console.error('❌ Failed to load Google Generative AI:', error);
    return null;
  }
}

/**
 * Lazily load and return Groq client instance
 */
export async function getGroqClient(): Promise<Groq | null> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ GROQ_API_KEY not configured');
    return null;
  }

  if (groqInstance) {
    return groqInstance;
  }

  try {
    // Only import when needed
    const GroqModule = await import('groq-sdk');
    const Groq = GroqModule.default;
    groqInstance = new Groq({ apiKey });
    return groqInstance;
  } catch (error) {
    console.error('❌ Failed to load Groq SDK:', error);
    return null;
  }
}

/**
 * Lazily load and return Perplexity client instance
 * Note: Perplexity uses OpenAI-compatible API, so we use fetch instead
 */
export async function getPerplexityClient() {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ PERPLEXITY_API_KEY not configured');
    return null;
  }

  // Return a simple wrapper object with the API key
  // Users can make fetch calls with the appropriate headers
  return {
    apiKey,
    baseURL: 'https://api.perplexity.ai',
    makeRequest: async (endpoint: string, options: any) => {
      const response = await fetch(`https://api.perplexity.ai${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${apiKey}`
        }
      });
      return response.json();
    }
  };
}

/**
 * Reset all cached instances (useful for testing)
 */
export function resetAIClients() {
  googleAIInstance = null;
  groqInstance = null;
}
