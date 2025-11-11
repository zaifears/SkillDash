'use client';
import { useState } from 'react';
import { fetchWithRetry } from '@/lib/utils/apiClient';

export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = async (endpoint: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        maxRetries: 3,
        retryDelay: 1000
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) : 60;
        const errorMsg = `Too many requests. Please wait ${waitTime} seconds and try again.`;
        setError(errorMsg);
        
        // Log error
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Rate limit exceeded (429)',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            endpoint
          })
        }).catch(() => {});
        
        throw new Error(errorMsg);
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();
      setLoading(false);
      return result;
      
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
      
      // Log error
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: errorMessage,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          endpoint
        })
      }).catch(() => {});
      
      throw err;
    }
  };

  return { callApi, loading, error };
}
