import { NextRequest } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Ensure the API key is available
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Enhanced system instruction with STRICT JSON formatting
const systemInstruction = `
You are 'SkillDashAI', an expert career counselor for university students in Bangladesh. You must efficiently identify a student's core skills and interests in EXACTLY 5-7 questions maximum.

**🚨 CRITICAL CONVERSATION RULES:**
1. **MAXIMUM 7 QUESTIONS TOTAL** - After question 7, you MUST provide the final JSON
2. **MINIMUM 5 QUESTIONS** - Gather sufficient info before providing JSON
3. **Ask focused, multi-part questions** to gather more info per question
4. **Never exceed the question limit** - be efficient and decisive

**CONVERSATION FLOW (STRICT):**
- Questions 1-3: Core interests, projects, and natural strengths
- Questions 4-5: Learning style, teamwork preference, and career aspirations  
- Questions 6-7 (if needed): Clarify any gaps, then IMMEDIATELY provide JSON
- **After question 7: ALWAYS end with JSON, no exceptions**

**🎯 EFFICIENT QUESTION STRATEGY:**
Ask multi-part questions to gather more information efficiently:
- "What project would you build on a free weekend, and what part would excite you most - the planning, building, or seeing people use it?"
- "What subject do you find genuinely interesting, and how do you prefer to learn it - hands-on, reading, or discussing with others?"
- "Describe a problem you solved that made you proud - what was your approach and did you work alone or with others?"

**🚨 IRRELEVANT INPUT HANDLING:**
- First irrelevant input: Quick redirect and continue
- Second irrelevant input: Direct redirect 
- Third irrelevant input: END immediately with "IRRELEVANT_END:"

**FINAL JSON OUTPUT (MANDATORY FORMAT):**
When ending, respond with "COMPLETE:" followed immediately by PURE JSON (no markdown, no code blocks, no extra text):

COMPLETE:{"summary": "Brief encouraging summary", "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"], "skillsToDevelop": ["Skill 1", "Skill 2", "Skill 3"], "suggestedCourses": [{"title": "Course Area 1", "description": "Why this fits them"}, {"title": "Course Area 2", "description": "Why this fits them"}, {"title": "Course Area 3", "description": "Why this fits them"}], "nextStep": "resume"}

**CRITICAL: DO NOT use markdown code blocks or any formatting around the JSON. Just pure JSON immediately after "COMPLETE:"**
`;

// Enhanced JSON extraction function
const extractJSON = (responseText: string): any => {
    const completeMarker = "COMPLETE:";
    const completeIndex = responseText.indexOf(completeMarker);
    
    if (completeIndex === -1) {
        return null;
    }
    
    let jsonString = responseText.substring(completeIndex + completeMarker.length).trim();
    
    // Corrected regex to remove backticks and markdown code block identifiers
    jsonString = jsonString.replace(/^\s*`+json\s*|^\s*`+\s*|`+\s*$/g, '');
    
    // Find the first { and last } to extract clean JSON
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error('No valid JSON object found');
    }
    
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        
    try {
        return JSON.parse(jsonString);
    } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Attempted to parse:', jsonString);
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }
};

// Enhanced input validation with question counting
const validateInput = (messages: any[]): { isValid: boolean; error?: string; irrelevantCount?: number; questionCount?: number } => {
    if (!Array.isArray(messages)) {
        return { isValid: false, error: 'Invalid messages format' };
    }
    
    if (messages.length === 0) {
        return { isValid: false, error: 'No messages provided' };
    }
    
    if (messages.length > 20) {
        return { isValid: false, error: 'Conversation too long' };
    }
    
    let irrelevantCount = 0;
    let questionCount = 0;
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (!msg || typeof msg !== 'object') {
            return { isValid: false, error: `Invalid message format at index ${i}` };
        }
        
        if (!msg.content || typeof msg.content !== 'string') {
            return { isValid: false, error: `Invalid message content at index ${i}` };
        }
        
        if (msg.content.length > 2000) {
            return { isValid: false, error: `Message too long at index ${i}` };
        }
        
        // Count questions from assistant (excluding the first welcome message)
        if (msg.role === 'assistant' && i > 0 && msg.content.includes('?')) {
            questionCount++;
        }
        
        // Count irrelevant inputs from user
        if (msg.role === 'user' && detectIrrelevantInput(msg.content)) {
            irrelevantCount++;
        }
        
        // Security checks
        const suspiciousPatterns = [
            /<script/i, /javascript:/i, /data:text\/html/i,
            /vbscript:/i, /<iframe/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(msg.content))) {
            return { isValid: false, error: 'Invalid content detected' };
        }
    }
    
    return { isValid: true, irrelevantCount, questionCount };
};

// Irrelevant input detection
const detectIrrelevantInput = (content: string): boolean => {
    const cleanContent = content.toLowerCase().trim();
    
    if (cleanContent.length < 3) return true;
    
    const irrelevantPatterns = [
        /^(idk|dk|dunno|whatever|nothing|nah|ok|yes|no|maybe)$/,
        /^[a-z]{1,2}(\s[a-z]{1,2})*$/,
        /^[0-9\s]+$/,
        /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,
        /^(lol|haha|hehe|lmao|rofl)+$/,
        /^(.)\1{3,}$/,
        /^qwerty|asdf|zxcv|test+$/,
        /^(boring|stupid|dumb|hate|bad)$/
    ];
    
    const keyboardPatterns = [
        'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890',
        'qwerty', 'asdfgh', 'zxcvbn'
    ];
    
    if (irrelevantPatterns.some(pattern => pattern.test(cleanContent))) {
        return true;
    }
    
    if (keyboardPatterns.some(pattern => cleanContent.includes(pattern))) {
        return true;
    }
    
    const words = cleanContent.split(/\s+/);
    if (words.length > 2 && new Set(words).size === 1) {
        return true;
    }
    
    return false;
};

// Rate limiting and timeout functions
const checkRateLimit = (req: NextRequest): boolean => {
    const userAgent = req.headers.get('user-agent') || '';
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper'];
    const isSuspicious = suspiciousPatterns.some(pattern => 
        userAgent.toLowerCase().includes(pattern)
    );
    
    if (isSuspicious) {
        console.log('Blocked suspicious user agent:', userAgent);
        return false;
    }
    
    return true;
};

const getTimeoutConfig = () => {
    const isVercel = process.env.VERCEL === '1';
    
    if (isVercel) {
        return {
            timeout: 8000,
            maxTokens: 800,
        };
    }
    
    return {
        timeout: 25000,
        maxTokens: 1000,
    };
};

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    
    try {
        if (!checkRateLimit(req)) {
            return new Response(JSON.stringify({ 
                error: 'Request blocked. Please try again later.' 
            }), { status: 429 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(JSON.stringify({ 
                error: 'Invalid JSON in request body' 
            }), { status: 400 });
        }

        const { messages } = body;

        if (!messages) {
            return new Response(JSON.stringify({ 
                error: 'Messages are required' 
            }), { status: 400 });
        }

        // Enhanced validation with question counting
        const validation = validateInput(messages);
        if (!validation.isValid) {
            return new Response(JSON.stringify({ 
                error: validation.error 
            }), { status: 400 });
        }

        // Force end if too many irrelevant inputs
        if (validation.irrelevantCount && validation.irrelevantCount >= 3) {
            return new Response(JSON.stringify({
                isComplete: true,
                forceEnd: true,
                summary: "I notice you're not fully engaged with the career discovery process. That's okay! Come back when you're ready to explore your potential seriously. 🌟",
                error: "Conversation ended due to lack of engagement"
            }), { status: 200 });
        }

        const config = getTimeoutConfig();
        
        // Create enhanced system instruction based on conversation state
        const questionCount = validation.questionCount || 0;
        const enhancedSystemInstruction = systemInstruction + 
            `\n\n**CURRENT STATE: You have asked ${questionCount} questions so far.**` +
            (questionCount >= 7 ? '\n🚨 CRITICAL: You MUST end with JSON output immediately - you have reached the maximum question limit!' :
             questionCount >= 5 ? '\n⚠️ WARNING: You should consider ending with JSON output soon - you have enough information.' :
             questionCount >= 3 ? '\n📊 INFO: You are mid-conversation - ask 2-4 more focused questions then end.' :
             '\n🎯 START: Ask efficient, multi-part questions to gather comprehensive information quickly.') +
            (validation.irrelevantCount ? `\n\nIMPORTANT: User has given ${validation.irrelevantCount} irrelevant response(s). Be more direct in your next question.` : '') +
            '\n\n**REMEMBER: When ending, use COMPLETE: followed immediately by clean JSON (no markdown formatting).**';

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: enhancedSystemInstruction,
        });

        // Prepare conversation history
        let conversationHistory = messages.slice(0, -1);

        if (conversationHistory.length > 0 && conversationHistory[0].role === 'assistant') {
            conversationHistory.shift();
        }

        const history = conversationHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const latestUserMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: config.maxTokens,
                temperature: 0.8,
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        });

        let result;
        try {
            const chatPromise = chat.sendMessage(latestUserMessage);
            const timeoutPromise = new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), config.timeout)
            );
            
            result = await Promise.race([chatPromise, timeoutPromise]);
        } catch (error: any) {
            if (error.message === 'Request timeout') {
                return new Response(JSON.stringify({ 
                    error: 'Request is taking longer than expected. Please try again.' 
                }), { status: 408 });
            }
            throw error;
        }
        
        const responseText = result.response.text();
        console.log('AI Response:', responseText); // Debug log

        // Check for irrelevant end marker
        if (responseText.includes("IRRELEVANT_END:")) {
            const endMessage = responseText.replace("IRRELEVANT_END:", "").trim();
            return new Response(JSON.stringify({
                isComplete: true,
                forceEnd: true,
                summary: endMessage,
                error: "Conversation ended due to irrelevant responses"
            }), { status: 200 });
        }

        // Check for completion and extract JSON
        if (responseText.includes("COMPLETE:")) {
            try {
                const suggestions = extractJSON(responseText);
                console.log('Extracted JSON:', suggestions); // Debug log
                
                return new Response(JSON.stringify({ isComplete: true, ...suggestions }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (e) {
                console.error("Enhanced JSON extraction failed:", e);
                console.error("Full response text:", responseText);
                
                // Fallback: try to provide a generic completion
                return new Response(JSON.stringify({
                    isComplete: true,
                    summary: "Thank you for the conversation! Based on our chat, I can see you have great potential.",
                    topSkills: ["Communication", "Problem Solving", "Adaptability", "Critical Thinking", "Teamwork"],
                    skillsToDevelop: ["Technical Skills", "Leadership", "Project Management"],
                    suggestedCourses: [
                        { title: "Digital Skills Development", description: "Build essential digital competencies" },
                        { title: "Communication & Leadership", description: "Enhance interpersonal skills" },
                        { title: "Industry-Specific Training", description: "Gain relevant technical knowledge" }
                    ],
                    nextStep: "resume",
                    error: "JSON parsing issue - provided fallback results"
                }), { status: 200 });
            }
        } else {
            // Continue conversation
            return new Response(JSON.stringify({ isComplete: false, reply: responseText }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error: any) {
        const processingTime = Date.now() - startTime;
        console.error(`Error in discover-chat API after ${processingTime}ms:`, error.message);
        console.error('Full error:', error);
        
        const isProduction = process.env.NODE_ENV === 'production';
        const errorMessage = isProduction 
            ? 'Service temporarily unavailable. Please try again.' 
            : error.message;
        
        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}