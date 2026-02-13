/**
 * Gigalogy Maira API Client
 * 
 * Maira is a custom-trained AI assistant for SkillDash
 * Uses Gigalogy's Maira API with project routing
 * 
 * Endpoints:
 * - /v1/gpt/sessions - Create/manage sessions
 * - /v1/maira/ask - Single question (stateless)
 * - /v1/maira/conversation - Multi-turn conversation (stateful)
 */

// Gigalogy Maira API Configuration
const GIGALOGY_BASE_URL = 'https://api.recommender.gigalogy.com';

// Gigalogy Fixed Configuration for Discover Chat
const GIGALOGY_USER_ID = 'a243730-e0a5-8283-5f55-2c47cae33330';
const GIGALOGY_MEMBER_ID = '7c617fe3-4f4e-415d-85b5-748242943837';
const GIGALOGY_GPT_PROFILE_ID = '33017403-17fb-4688-ae70-e2e9c29c53b0';
const GIGALOGY_MODEL = 'gpt-4.1-mini-2025-04-14';

function getGigalogyConfig() {
  const apiKey = process.env.GIGALOGY_API_KEY;
  const projectKey = process.env.GIGALOGY_PROJECT_KEY;

  if (!apiKey || !projectKey) {
    console.warn('[Gigalogy] Missing credentials:', {
      hasApiKey: !!apiKey,
      hasProjectKey: !!projectKey,
    });
  }

  return { apiKey, projectKey };
}

export interface MairaRequest {
  query: string;
  sessionId?: string;
  questionnaireInit?: boolean;
}

export interface MairaResponse {
  response?: string;
  content?: string;
  answer?: string;
  conversation_id?: string;
  detail?: {
    session_id?: string;
    response?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface SessionResponse {
  session_id: string;
  [key: string]: any;
}

/**
 * Create a new Maira session for a conversation
 * Each user/conversation should have its own session
 */
export async function createMairaSession(): Promise<string> {
  const { apiKey, projectKey } = getGigalogyConfig();
  
  if (!apiKey || !projectKey) {
    throw new Error('Gigalogy credentials not configured');
  }

  const endpoint = `${GIGALOGY_BASE_URL}/v1/gpt/sessions`;
  
  // Generate a unique session ID for this conversation
  const newSessionId = crypto.randomUUID();
  
  console.log('[Gigalogy] Creating new session:', newSessionId);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'api-key': apiKey,
        'project-key': projectKey,
      },
      body: JSON.stringify({
        session_id: newSessionId,
        user_id: GIGALOGY_USER_ID,
        member_id: GIGALOGY_MEMBER_ID,
        gpt_profile_id: GIGALOGY_GPT_PROFILE_ID,
        maira_profile_id: GIGALOGY_GPT_PROFILE_ID, // Same as gpt_profile_id
      }),
    });

    const responseText = await res.text();
    console.log('[Gigalogy] Session response status:', res.status);
    
    if (!res.ok) {
      console.error('[Gigalogy] Session creation failed:', responseText.substring(0, 500));
      throw new Error(`Failed to create session: ${res.status}`);
    }

    const data = JSON.parse(responseText);
    const sessionId = data.session_id || data.id || data.detail?.session_id || newSessionId;
    
    console.log('[Gigalogy] ✅ Created session:', sessionId);
    return sessionId;
    
  } catch (error: any) {
    console.error('[Gigalogy] Session creation error:', error.message);
    throw error;
  }
}

/**
 * Call Maira AI using the conversation endpoint (stateful multi-turn)
 * Uses the session to maintain conversation context
 */
export async function callMairaConversation({
  query,
  sessionId,
}: {
  query: string;
  sessionId: string;
}): Promise<MairaResponse> {
  const { apiKey, projectKey } = getGigalogyConfig();
  
  if (!apiKey || !projectKey) {
    throw new Error('Gigalogy credentials not configured');
  }

  // Use conversation endpoint for multi-turn
  const endpoint = `${GIGALOGY_BASE_URL}/v1/maira/conversation`;
  
  console.log('[Gigalogy] Conversation request to:', endpoint);
  console.log('[Gigalogy] Session:', sessionId, '| Query length:', query.length);

  const requestBody = {
    user_id: GIGALOGY_USER_ID,
    member_id: GIGALOGY_MEMBER_ID,
    query: query,
    session_id: sessionId,
    gpt_profile_id: GIGALOGY_GPT_PROFILE_ID,
    model: GIGALOGY_MODEL,
    conversation_type: 'chat',
    is_background_task: false,
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'api-key': apiKey,
        'project-key': projectKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await res.text();
    console.log('[Gigalogy] Response status:', res.status);
    console.log('[Gigalogy] Raw response:', responseText.substring(0, 800));

    if (!res.ok) {
      console.error('[Gigalogy] Error:', responseText.substring(0, 500));
      throw new Error(`Gigalogy API error (${res.status}): ${responseText.substring(0, 200)}`);
    }

    const data = JSON.parse(responseText);
    console.log('[Gigalogy] ✅ Conversation success! Keys:', Object.keys(data).join(', '));
    return data;
    
  } catch (error: any) {
    console.error('[Gigalogy] Conversation request failed:', error.message);
    throw error;
  }
}

/**
 * Call Maira AI using the ask endpoint (stateless single query)
 * Falls back option if conversation endpoint doesn't work
 */
export async function callMaira({
  query,
  sessionId,
  questionnaireInit = false,
}: MairaRequest): Promise<MairaResponse> {
  const { apiKey, projectKey } = getGigalogyConfig();
  
  if (!apiKey) {
    throw new Error('Gigalogy API key not configured (GIGALOGY_API_KEY)');
  }

  if (!projectKey) {
    throw new Error('Gigalogy Project key not configured (GIGALOGY_PROJECT_KEY)');
  }

  const endpoint = `${GIGALOGY_BASE_URL}/v1/maira/ask`;
  
  console.log('[Gigalogy] Ask request to:', endpoint);
  console.log('[Gigalogy] Query length:', query.length, 'chars');

  const requestBody: any = {
    user_id: GIGALOGY_USER_ID,
    member_id: GIGALOGY_MEMBER_ID,
    query: query,
    conversation_type: 'chat',
    gpt_profile_id: GIGALOGY_GPT_PROFILE_ID,
    model: GIGALOGY_MODEL,
    is_background_task: false,
    questionnaire_init: questionnaireInit ? 'true' : 'false',
  };

  // Add session_id if provided
  if (sessionId) {
    requestBody.session_id = sessionId;
  }

  console.log('[Gigalogy] Request body:', JSON.stringify(requestBody).substring(0, 500));

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'api-key': apiKey,
        'project-key': projectKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await res.text();
    console.log('[Gigalogy] Response status:', res.status);
    console.log('[Gigalogy] Raw response:', responseText.substring(0, 800));

    if (!res.ok) {
      console.error('[Gigalogy] Error response:', {
        status: res.status,
        statusText: res.statusText,
        error: responseText.substring(0, 500),
      });
      throw new Error(`Gigalogy API error (${res.status}): ${responseText.substring(0, 200)}`);
    }

    const data = JSON.parse(responseText);
    console.log('[Gigalogy] ✅ Success! Response keys:', Object.keys(data).join(', '));
    return data;
    
  } catch (error: any) {
    console.error('[Gigalogy] Request failed:', error.message);
    throw error;
  }
}

/**
 * Extract content from Maira response
 * Handles various response formats from the Maira API
 */
export function extractMairaContent(response: MairaResponse): string {
  // Handle nested detail.response format (Maira's primary format)
  if (response.detail && typeof response.detail === 'object') {
    const detail = response.detail as any;
    if (detail.response && typeof detail.response === 'string') {
      console.log('[Gigalogy] Extracted from detail.response');
      return detail.response;
    }
  }

  // Try direct response field
  if (response.response && typeof response.response === 'string') {
    return response.response;
  }

  if (response.content && typeof response.content === 'string') {
    return response.content;
  }

  if (response.answer && typeof response.answer === 'string') {
    return response.answer;
  }

  // Try choices format (OpenAI-like)
  if (response.choices?.[0]?.message?.content) {
    return response.choices[0].message.content;
  }

  // Fallback to stringified response
  console.warn('[Gigalogy] Unknown response format, stringifying:', Object.keys(response));
  return JSON.stringify(response);
}

/**
 * Extract session_id from Maira response (if returned)
 */
export function extractSessionId(response: MairaResponse): string | null {
  if (response.detail?.session_id) {
    return response.detail.session_id;
  }
  if (response.session_id) {
    return response.session_id as string;
  }
  return null;
}
