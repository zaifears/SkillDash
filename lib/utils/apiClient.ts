// lib/utils/apiClient.ts - Smart API client with automatic retries

interface FetchOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // If rate limited (429), wait and retry
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay * (attempt + 1);
        
        console.log(`⏳ Rate limited. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      // If server error (5xx), retry
      if (response.status >= 500 && response.status < 600) {
        console.log(`⚠️ Server error ${response.status}. Retrying... (Attempt ${attempt + 1}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }

      // If network error or timeout, retry
      if (!response.ok && response.status === 0) {
        console.log(`🌐 Network error. Retrying... (Attempt ${attempt + 1}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }

      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Request failed (Attempt ${attempt + 1}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after maximum retries');
}

// Example usage:
// const response = await fetchWithRetry('/api/discover-chat', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(data),
//   maxRetries: 3,
//   retryDelay: 1000
// });
