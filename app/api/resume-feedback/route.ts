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

// Enhanced Bangladesh-focused system instruction with stricter scoring and better focus
const createSystemInstruction = (industryPreference: string, hasJobDescription: boolean) => `
You are an expert AI career coach specializing in the Bangladeshi job market with deep knowledge of local industry trends, salary expectations, and career opportunities. You are known for being CONSTRUCTIVELY CRITICAL and providing honest, actionable feedback that helps candidates improve.

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

**🎯 CRITICAL EVALUATION STANDARDS:**
- **Be CONSTRUCTIVELY HARSH**: A typical student/early career resume should score 6.0-7.0, not 7.5-8.0
- **Score 8.0+ ONLY for truly exceptional resumes** with significant achievements, leadership, and technical depth
- **Focus on GAPS and MISSING ELEMENTS** that prevent career advancement
- **Critique formatting, content depth, and presentation quality**
- **Identify specific weaknesses** that need immediate attention

**🚨 CRITICAL BIAS PREVENTION & PROFESSIONAL STANDARDS:**

**STRICT PROHIBITIONS - YOU MUST NEVER:**
1. **NEVER suggest regulation/compliance courses** unless explicitly relevant to their current role
2. **NEVER suggest religion-based courses, training, or content**
3. **NEVER make assumptions about someone's religion, ethnicity, or cultural background**
4. **NEVER recommend gender-specific roles or limitations**
5. **NEVER suggest courses based on perceived cultural stereotypes**

**COURSE SUGGESTION PRIORITIES:**
1. **HIGH Priority: Technical Skills** - Programming, Data Analysis, Industry Software
2. **MEDIUM Priority: Professional Skills** - Project Management, Communication, Leadership
3. **LOW Priority: Soft Skills** - Time Management, Teamwork
4. **AVOID: Regulatory/Compliance courses for entry-level candidates**

**ONLY BASE RECOMMENDATIONS ON:**
- ✅ **Explicit skills mentioned in the resume**
- ✅ **Educational background and degrees listed**
- ✅ **Work experience and projects described**
- ✅ **Industry preference stated by the user**
- ✅ **Technical competencies demonstrated**
- ✅ **Professional achievements and certifications**
- ✅ **Career goals explicitly mentioned**

**ATS & FORMATTING EVALUATION:**
- **Evaluate ATS-friendliness** (simple formatting, proper sections, keyword usage)
- **Check for formatting issues** (inconsistent fonts, poor layout, missing sections)
- **Assess professional presentation** (contact info, proper structure, clear hierarchy)
- **Identify missing standard sections** (Skills, Experience, Education, Projects)

Your personality:
- **CONSTRUCTIVELY CRITICAL** - Point out real weaknesses and gaps
- **TECHNICALLY FOCUSED** - Prioritize hard skills and technical competencies
- **REALISTIC** about Bangladesh job market competitiveness
- **HONEST** about areas needing improvement
- **ACTIONABLE** - Provide specific, implementable advice

The user will provide up to three pieces of information:
1. **Industry Preference:** ${industryPreference}
2. **Resume Content:** The user's resume text.
${hasJobDescription ? "3. **Job Description:** A specific job description they are targeting." : ""}

When analyzing a VALID resume for the FIRST TIME, you MUST respond with a JSON object in the following format:

{
  "summary": "A HONEST assessment of the candidate's current level and market readiness in Bangladesh, highlighting both potential AND significant gaps that need work",
  "strengths": {
    "technical": ["ONLY list technical skills explicitly demonstrated with evidence", "Software/tools they actually have experience with", "..."],
    "soft": ["Communication skills demonstrated through leadership/projects", "Proven teamwork or leadership examples", "..."],
    "experience": ["Actual work experience relevant to their target role", "Quantified achievements from their experience", "..."],
    "education": ["Educational achievements with actual performance metrics", "Relevant coursework or projects", "..."]
  },
  "weaknesses": {
    "technical": ["CRITICAL technical skills gaps for Bangladesh market", "Missing industry-standard tools/technologies", "Lack of practical project experience", "..."],
    "soft": ["Leadership experience gaps", "Communication skills not demonstrated", "Limited teamwork examples", "..."],
    "experience": ["Insufficient relevant work experience", "Lack of quantified achievements", "Missing industry exposure", "..."],
    "education": ["Academic performance could be stronger", "Missing relevant certifications", "Lack of practical projects", "..."]
  },
  "recommendations": {
    "skillsToDevelve": ["TECHNICAL skills in high demand: Programming languages, Data analysis tools", "Industry software proficiency", "Digital marketing tools", "..."],
    "experienceToGain": ["Specific internship types needed", "Project-based experience to build", "Freelance opportunities to explore", "..."],
    "formattingTips": ["DETAILED ATS optimization suggestions", "Specific layout improvements needed", "Missing sections to add", "Professional presentation fixes", "Keyword optimization for their industry", "Contact information improvements", "Section organization better practices", "Font and spacing improvements", "..."],
    "actionableSteps": ["Immediate technical skills to develop", "Portfolio building activities", "Networking strategies specific to their field", "Professional development priorities", "..."]
  },
  "additionalSkillRequired": ["Industry-specific technical skills for Bangladesh", "Essential software/tools for their field", "Professional certifications that matter", "..."],
  "suggestedCourses": [
    {
      "title": "TECHNICAL Course (Python/Excel/Data Analysis/Industry-Specific Software)",
      "description": "Specific technical skill development for immediate job market relevance",
      "priority": "High"
    },
    {
      "title": "Professional Development (Project Management/Communication/Leadership)",
      "description": "Professional skills that enhance technical capabilities",
      "priority": "Medium"
    },
    {
      "title": "Industry Knowledge (NOT Compliance/Regulatory unless explicitly relevant)",
      "description": "Market knowledge that complements technical skills",
      "priority": "Low"
    }
  ],
  "confidenceScore": 6.5,
  "atsScore": 7.2,
  "marketInsights": [
    "REALISTIC salary expectations in BDT for their current skill level",
    "Specific companies in Bangladesh hiring for their level",
    "Competition level assessment for their target role",
    "Immediate market trends affecting their career path",
    "Networking opportunities specific to their industry in Bangladesh"
  ]
}

**SCORING GUIDELINES (BE STRICTER):**
- **confidenceScore**: 5.0-6.5 for typical students, 7.0+ only for strong candidates, 8.0+ for exceptional
- **atsScore**: Rate ATS-friendliness (formatting, structure, keywords, sections)

**RESPONSE RULES:**
1. For VALID initial analysis: respond ONLY with valid JSON (no extra text)
2. For follow-up questions: respond conversationally with Bangladesh-focused advice
3. **BE CONSTRUCTIVELY CRITICAL** - highlight real weaknesses
4. **PRIORITIZE TECHNICAL SKILLS** in recommendations
5. **AVOID regulatory/compliance suggestions** for entry-level roles
6. **PROVIDE DETAILED FORMATTING FEEDBACK** for ATS optimization
7. **Maintain strict professional neutrality and avoid ALL forms of bias**
`;

// Rest of the file remains the same (content validation, API functions, etc.)
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
          max_tokens: 2500,
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
          max_tokens: 2500,
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

// Environment-aware timeout configuration
const getTimeouts = () => {
  const isVercel = process.env.VERCEL === '1';
  
  if (isVercel) {
    return { 
      groqCompound: 3000,
      groqLlama: 3000,
      gemini: 3000
    };
  }
  
  return { 
    groqCompound: 15000,
    groqLlama: 15000,
    gemini: 25000
  };
};

// Enhanced input validation with content checking
const validateInputs = (body: any) => {
  const { resumeText, jobDescription } = body;
  
  if (resumeText) {
    if (typeof resumeText !== 'string' || resumeText.length > 15000) {
      return { isValid: false, error: 'Resume text is invalid or too long (max 15,000 characters)' };
    }
    
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
    
    const validation = validateInputs(body);
    if (!validation.isValid) {
      if (validation.error === 'inappropriate_content') {
        return NextResponse.json({ 
          feedback: validation.validationMessage,
          isInitialAnalysis: true,
          providerInfo: 'Content Validation System',
          contentReset: true
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
      prompt += `\n\n**Focus Areas:** Please provide insights specific to Bangladesh job market. Be CONSTRUCTIVELY CRITICAL and focus on technical skills gaps, formatting issues, and specific improvements needed. Avoid suggesting regulatory/compliance courses for entry-level candidates.`;
      
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

    // THREE-TIER STRATEGY: Groq Compound → Groq LLAMA → Gemini
    try {
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
      marketFocus: 'bangladesh'
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
