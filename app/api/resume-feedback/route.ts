import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Force this route to run on the Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Ensure the API keys are available
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Enhanced Bangladesh-focused system instruction
const createSystemInstruction = (industryPreference: string, hasJobDescription: boolean) => `
You are an expert AI career coach specializing in the Bangladeshi job market with deep knowledge of local industry trends, salary expectations, and career opportunities. Your expertise covers:

🇧🇩 **BANGLADESH JOB MARKET EXPERTISE:**
- Current job market trends in Dhaka, Chittagong, Sylhet, and other major cities
- Local salary expectations and compensation packages in Bangladeshi Taka (BDT)
- Major employers in Bangladesh including local companies and MNCs
- Work culture, interview processes, and hiring practices in Bangladesh
- Government policies affecting employment and skill development
- Educational institutions and their market reputation in Bangladesh
- Networking opportunities and professional communities in Bangladesh

**BANGLADESH-SPECIFIC CONTEXT TO CONSIDER:**
- Local companies: Grameenphone, BRAC, Dutch-Bangla Bank, Square Group, ACI, Beximco, etc.
- MNCs operating in Bangladesh: Unilever, Nestle, Samsung, Microsoft, Oracle, etc.
- Growing sectors: IT, Textiles, Pharmaceuticals, Banking, Telecommunications, E-commerce
- Emerging opportunities: Fintech, EdTech, AgriTech, Digital Marketing
- Educational background expectations for Bangladeshi employers
- Professional development opportunities available in Bangladesh
- Remote work trends and freelancing market in Bangladesh

Your personality:
- Culturally aware of Bangladeshi professional norms
- Encouraging yet realistic about local job market conditions  
- Focused on practical, achievable improvements for Bangladesh context
- Knowledgeable about both local and international career paths for Bangladeshi professionals

**CRITICAL CONTENT VALIDATION:**
Before providing any response, you MUST validate the content:
1. If the resume contains completely irrelevant content (like cooking recipes, random stories, or nonsense)
2. If the content contains dangerous, harmful, inappropriate, or offensive material
3. If the content is clearly not a resume or job-related document

If ANY of these conditions are met, respond with this EXACT message:
"⚠️ Content Validation Error: The provided content appears to be inappropriate, irrelevant, or not related to resume analysis. Please provide a proper resume containing your educational background, work experience, skills, and career objectives. Let's start fresh with appropriate professional content."

The user will provide up to three pieces of information:
1. **Industry Preference:** ${industryPreference}
2. **Resume Content:** The user's resume text.
${hasJobDescription ? "3. **Job Description:** A specific job description they are targeting." : ""}

When analyzing a VALID resume for the FIRST TIME, you MUST respond with a JSON object in the following format:

{
  "summary": "A brief paragraph highlighting the candidate's potential in the Bangladesh job market context, mentioning relevant local opportunities",
  "strengths": {
    "technical": ["List technical skills relevant to Bangladesh market", "Technologies in demand locally", "..."],
    "soft": ["Communication skills valued by Bangladeshi employers", "Leadership qualities", "..."],
    "experience": ["Relevant experience for Bangladesh context", "Project work applicable locally", "..."],
    "education": ["Educational achievements valued in Bangladesh", "Institution reputation in local market", "..."]
  },
  "weaknesses": {
    "technical": ["Technical skills gaps for Bangladesh market", "Missing local technology requirements", "..."],
    "soft": ["Soft skills to develop for local workplace culture", "Areas for improvement", "..."],
    "experience": ["Experience gaps for Bangladesh job market", "Missing industry exposure", "..."],
    "education": ["Additional qualifications valued in Bangladesh", "Professional certifications needed", "..."]
  },
  "recommendations": {
    "skillsToDevelop": ["Skills in high demand in Bangladesh", "Technologies used by local companies", "Language skills if needed", "..."],
    "experienceToGain": ["Internship opportunities in Bangladesh", "Projects relevant to local market", "Volunteer work options", "..."],
    "formattingTips": ["Resume format preferences of Bangladeshi employers", "Cultural considerations for CV presentation", "..."],
    "actionableSteps": ["Immediate steps for Bangladesh job market", "Networking opportunities in Bangladesh", "Professional development paths", "..."]
  },
  "additionalSkillRequired": ["Industry-specific skills for Bangladesh market", "Language requirements", "Professional certifications valued locally", "Digital skills for Bangladesh context", "..."],
  "suggestedCourses": [
    {
      "title": "Course Name (Available in Bangladesh or Online)",
      "description": "How this course helps in Bangladesh job market with specific local relevance",
      "priority": "High"
    },
    {
      "title": "Professional Development Program",
      "description": "Benefits for career growth in Bangladesh context",
      "priority": "Medium"
    }
  ],
  "confidenceScore": 7.5,
  "marketInsights": [
    "Current ${industryPreference} trends in Bangladesh",
    "Salary expectations in BDT for this role level",
    "Major employers in Bangladesh for this field",
    "Growth opportunities in Bangladesh market",
    "Networking and professional communities in Bangladesh"
  ]
}

**RESPONSE RULES:**
1. FIRST: Check content validity - if inappropriate/irrelevant, return the validation error message
2. For VALID initial analysis: respond ONLY with valid JSON (no extra text)
3. For follow-up questions: respond conversationally with Bangladesh-focused advice
4. Always provide context relevant to Bangladesh job market
5. Include salary ranges in BDT when relevant
6. Mention specific Bangladesh companies and opportunities
7. Consider cultural and professional norms of Bangladesh
`;

// Content validation function
const validateResumeContent = (content: string): { isValid: boolean; reason?: string } => {
  const lowerContent = content.toLowerCase();
  
  // Check for completely irrelevant content
  const irrelevantKeywords = [
    'recipe', 'cooking', 'food preparation', 'ingredients',
    'once upon a time', 'fairy tale', 'story telling',
    'lorem ipsum', 'dolor sit amet', 'consectetur adipiscing',
    'asdfg', 'qwerty', '12345', 'test test test',
    'random text', 'nonsense', 'gibberish'
  ];
  
  // Check for dangerous/inappropriate content
  const dangerousKeywords = [
    'suicide', 'self harm', 'violence', 'weapon', 'bomb',
    'illegal drugs', 'terrorism', 'hate speech',
    'explicit sexual', 'pornography', 'abuse'
  ];
  
  // Check for resume-related keywords (should have at least 2)
  const resumeKeywords = [
    'experience', 'education', 'skill', 'university', 'college',
    'work', 'job', 'intern', 'project', 'degree',
    'bachelor', 'master', 'diploma', 'certificate',
    'responsibility', 'achievement', 'objective'
  ];
  
  // Check for irrelevant content
  if (irrelevantKeywords.some(keyword => lowerContent.includes(keyword))) {
    return { isValid: false, reason: 'irrelevant_content' };
  }
  
  // Check for dangerous content
  if (dangerousKeywords.some(keyword => lowerContent.includes(keyword))) {
    return { isValid: false, reason: 'inappropriate_content' };
  }
  
  // Check if content has resume-like keywords
  const resumeKeywordCount = resumeKeywords.filter(keyword => lowerContent.includes(keyword)).length;
  if (content.length > 50 && resumeKeywordCount < 2) {
    return { isValid: false, reason: 'not_resume_content' };
  }
  
  // Check if content is too short or nonsensical
  if (content.length < 20 || /^[a-zA-Z]{1,3}(\s[a-zA-Z]{1,3})*$/.test(content.trim())) {
    return { isValid: false, reason: 'insufficient_content' };
  }
  
  return { isValid: true };
};

// Your original three-tier model strategy (unchanged)
const groqCompoundModels = [
  "groq/compound",
  "groq/compound-mini"
];

const groqLlamaModels = [
  "llama-3.1-8b-instant"
];

interface GroqResult {
  success: boolean;
  content?: string;
  error?: string;
}

// STRATEGY 1: Try Groq Compound models first
async function tryGroqCompoundAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<GroqResult> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API key not configured' };
  }

  const systemMessage = { 
    role: "system", 
    content: createSystemInstruction(industryPreference, hasJobDescription) 
  };
  const messagesForApi = [systemMessage, ...messages];

  for (const model of groqCompoundModels) {
    try {
      console.log(`🇧🇩 Attempting Groq COMPOUND (Bangladesh-focused) with model: ${model}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ 
          model, 
          messages: messagesForApi,
          max_tokens: 2500, // Increased for Bangladesh context
          temperature: 0.3
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`❌ Groq COMPOUND model ${model} failed (${response.status})`);
        continue;
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`❌ Invalid Groq COMPOUND response from ${model}`);
        continue;
      }

      console.log(`✅ Groq COMPOUND successful with Bangladesh context: ${model}`);
      return { success: true, content: data.choices[0].message.content };

    } catch (error: any) {
      console.warn(`❌ Groq COMPOUND error with ${model}:`, error.name);
    }
  }

  return { success: false, error: 'all_groq_compound_models_failed' };
}

// STRATEGY 2: Try Groq LLAMA models as second fallback
async function tryGroqLlamaAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<GroqResult> {
  if (!GROQ_API_KEY) {
    return { success: false, error: 'Groq API key not configured' };
  }

  const systemMessage = { 
    role: "system", 
    content: createSystemInstruction(industryPreference, hasJobDescription) 
  };
  const messagesForApi = [systemMessage, ...messages];

  for (const model of groqLlamaModels) {
    try {
      console.log(`🇧🇩 Attempting Groq LLAMA (Bangladesh-focused) with model: ${model}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ 
          model, 
          messages: messagesForApi,
          max_tokens: 2500, // Increased for Bangladesh context
          temperature: 0.3
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`❌ Groq LLAMA model ${model} failed (${response.status})`);
        continue;
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`❌ Invalid Groq LLAMA response from ${model}`);
        continue;
      }

      console.log(`✅ Groq LLAMA successful with Bangladesh context: ${model}`);
      return { success: true, content: data.choices[0].message.content };

    } catch (error: any) {
      console.warn(`❌ Groq LLAMA error with ${model}:`, error.name);
    }
  }

  return { success: false, error: 'all_groq_llama_models_failed' };
}

// STRATEGY 3: Use Google Gemini as the final fallback
async function useGeminiAPI(messages: {role: string, content: string}[], industryPreference: string, hasJobDescription: boolean): Promise<string> {
  console.log('🇧🇩 Final fallback to Google Gemini (Bangladesh-focused)...');
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: createSystemInstruction(industryPreference, hasJobDescription),
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });

  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const chat = model.startChat({ 
    history,
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.3,
    }
  });
  
  const latestMessage = messages[messages.length - 1]?.content || '';
  const result = await chat.sendMessage(latestMessage);
  
  console.log('✅ Google Gemini successful with Bangladesh context');
  return result.response.text();
}

// Environment-aware timeout configuration (unchanged)
const getTimeouts = () => {
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    return { 
      groqCompound: 3000,  // 3s for compound models
      groqLlama: 3000,     // 3s for LLAMA models  
      gemini: 3000         // 3s for Gemini (total 9s < 10s Vercel limit)
    };
  }
  
  return { 
    groqCompound: 15000,   // 15s for compound models
    groqLlama: 15000,      // 15s for LLAMA models
    gemini: 25000          // 25s for Gemini
  };
};

// Enhanced input validation with content checking
const validateInputs = (body: any) => {
  const { resumeText, jobDescription } = body;
  
  if (resumeText) {
    if (typeof resumeText !== 'string' || resumeText.length > 15000) {
      return { isValid: false, error: 'Resume text is invalid or too long (max 15,000 characters)' };
    }
    
    // Validate resume content
    const contentValidation = validateResumeContent(resumeText);
    if (!contentValidation.isValid) {
      return { 
        isValid: false, 
        error: 'inappropriate_content',
        validationMessage: '⚠️ Content Validation Error: The provided content appears to be inappropriate, irrelevant, or not related to resume analysis. Please provide a proper resume containing your educational background, work experience, skills, and career objectives. Let\'s start fresh with appropriate professional content.'
      };
    }
  }
  
  if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > 8000)) {
    return { isValid: false, error: 'Job description is too long (max 8,000 characters)' };
  }
  
  return { isValid: true };
};

// --- Main API Route Handler ---
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let usedProvider = 'unknown';
  let fallbackReason = '';

  try {
    const body = await req.json();
    
    // Enhanced input validation with content checking
    const validation = validateInputs(body);
    if (!validation.isValid) {
      // Special handling for inappropriate content - return validation message directly
      if (validation.error === 'inappropriate_content') {
        return NextResponse.json({ 
          feedback: validation.validationMessage,
          isInitialAnalysis: true,
          providerInfo: 'Content Validation System',
          contentReset: true // Signal to frontend to reset flow
        });
      }
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { 
      messages = [], 
      resumeText = null, 
      industryPreference = 'a general entry-level position in Bangladesh',
      jobDescription = null 
    } = body;

    let apiMessages: { role: string; content: string }[] = [];
    const isInitialAnalysis = !!resumeText;

    if (isInitialAnalysis) {
      let prompt = `Please analyze this resume for a student/professional interested in the ${industryPreference} industry in Bangladesh.\n\n**Resume Content:**\n${resumeText}`;
      if (jobDescription) {
        prompt += `\n\n**Target Job Description:**\n${jobDescription}`;
      }
      prompt += `\n\n**Focus Areas:** Please provide insights specific to Bangladesh job market including local company opportunities, salary expectations in BDT, cultural considerations, and networking opportunities in Bangladesh.`;
      
      apiMessages = [{ role: 'user', content: prompt }];
    } else {
      apiMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : 'User sent a complex message.'
      })).filter(msg => msg.role === 'user' || msg.role === 'assistant');
    }

    if (apiMessages.length === 0) {
      return NextResponse.json({ error: 'No content provided for analysis.' }, { status: 400 });
    }

    let feedback = '';
    const timeouts = getTimeouts();

    // THREE-TIER STRATEGY: Groq Compound → Groq LLAMA → Gemini (with Bangladesh focus)
    try {
      // STRATEGY 1: Try Groq COMPOUND models first
      console.log('🇧🇩 Step 1: Trying Groq COMPOUND models (Bangladesh-focused)...');
      const compoundResult = await Promise.race([
        tryGroqCompoundAPI(apiMessages, industryPreference, !!jobDescription),
        new Promise<GroqResult>((_, reject) => 
          setTimeout(() => reject(new Error('Compound timeout')), timeouts.groqCompound)
        )
      ]);
      
      if (compoundResult.success && compoundResult.content) {
        feedback = compoundResult.content;
        usedProvider = 'groq-compound-bangladesh';
      } else {
        throw new Error(`Compound failed: ${compoundResult.error}`);
      }
      
    } catch (compoundError: any) {
      console.log(`❌ Groq COMPOUND failed: ${compoundError.message}`);
      
      try {
        // STRATEGY 2: Try Groq LLAMA models
        console.log('🇧🇩 Step 2: Trying Groq LLAMA models (Bangladesh-focused)...');
        const llamaResult = await Promise.race([
          tryGroqLlamaAPI(apiMessages, industryPreference, !!jobDescription),
          new Promise<GroqResult>((_, reject) => 
            setTimeout(() => reject(new Error('LLAMA timeout')), timeouts.groqLlama)
          )
        ]);
        
        if (llamaResult.success && llamaResult.content) {
          feedback = llamaResult.content;
          usedProvider = 'groq-llama-bangladesh';
          fallbackReason = compoundError.message;
        } else {
          throw new Error(`LLAMA failed: ${llamaResult.error}`);
        }
        
      } catch (llamaError: any) {
        console.log(`❌ Groq LLAMA failed: ${llamaError.message}`);
        
        // STRATEGY 3: Final fallback to Gemini
        console.log('🇧🇩 Step 3: Final fallback to Gemini (Bangladesh-focused)...');
        fallbackReason = `Compound: ${compoundError.message}, LLAMA: ${llamaError.message}`;
        
        const geminiMessages = apiMessages.map(m => ({...m, role: m.role === 'assistant' ? 'model' : 'user'}));
        
        feedback = await Promise.race([
          useGeminiAPI(geminiMessages, industryPreference, !!jobDescription),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Gemini timeout')), timeouts.gemini)
          )
        ]);
        
        usedProvider = 'gemini-bangladesh';
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Bangladesh-focused resume feedback completed in ${processingTime}ms using ${usedProvider}`);

    // Updated provider info with Bangladesh focus
    const providerInfo = (() => {
      switch (usedProvider) {
        case 'groq-compound-bangladesh':
          return 'Powered by Groq AI (Compound Models) - Bangladesh Job Market Focus 🇧🇩';
        case 'groq-llama-bangladesh':
          return 'Powered by Groq AI (LLAMA Models) - Bangladesh Job Market Focus 🇧🇩';
        case 'gemini-bangladesh':
          return `Powered by Google Gemini - Bangladesh Job Market Focus 🇧🇩 (Groq fallback: ${fallbackReason})`;
        default:
          return 'Powered by AI - Bangladesh Job Market Focus 🇧🇩';
      }
    })();

    return NextResponse.json({ 
      feedback,
      isInitialAnalysis,
      providerInfo,
      marketFocus: 'bangladesh' // Indicate Bangladesh focus to frontend
    });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`Bangladesh-focused resume feedback error after ${processingTime}ms:`, error.message);
    
    if (error.message.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Request timed out. Please try again with a shorter resume.' 
      }, { status: 408 });
    }
    
    return NextResponse.json({ 
      error: 'An unexpected error occurred while analyzing your resume.' 
    }, { status: 500 });
  }
}
