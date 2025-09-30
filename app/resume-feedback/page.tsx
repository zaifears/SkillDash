'use client';

import React, { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FeedbackCard from '../../components/resume-feedback/FeedbackCard';
import { CoinManager } from '@/lib/coinManager';
import InsufficientCoinsModal from '@/components/ui/InsufficientCoinsModal';
import { LoadingScreen, BotIcon, LoadingDots, Message } from '@/lib/components/shared'; // ✅ SHARED COMPONENTS
import { ROUTES, MESSAGES, LIMITS } from '@/lib/constants'; // ✅ CONSTANTS

// --- Type Definitions ---
interface ResumeFeedback {
    overallScore: string;
    overallFeedback: string;
    detailedSuggestions: {
        contactInfo?: string[];
        summary?: string[];
        education?: string[];
        experience?: string[];
        projects?: string[];
        skills?: string[];
    };
    physicalFormattingTips?: string[];
    bangladeshContextTips?: string[];
    suggestedActionVerbs?: string[];
    linkedinSynergy?: string;
    atsScore?: number;
    marketInsights?: string[];
}

type Step = 'industry' | 'resume' | 'job-description' | 'chat';

// Helper function to convert JSON to readable text
const convertJsonToReadableText = (feedback: ResumeFeedback): string => {
  let text = `RESUME ANALYSIS REPORT\n\n`;
  
  text += `OVERALL SCORE: ${feedback.overallScore}\n\n`;
  text += `OVERALL FEEDBACK:\n${feedback.overallFeedback}\n\n`;
  
  if (feedback.detailedSuggestions) {
    text += `DETAILED SUGGESTIONS:\n\n`;
    
    if (feedback.detailedSuggestions.contactInfo) {
      text += `Contact Info:\n`;
      feedback.detailedSuggestions.contactInfo.forEach(item => text += `• ${item}\n`);
      text += `\n`;
    }
    
    if (feedback.detailedSuggestions.summary) {
      text += `Summary/Objective:\n`;
      feedback.detailedSuggestions.summary.forEach(item => text += `• ${item}\n`);
      text += `\n`;
    }
    
    if (feedback.detailedSuggestions.experience) {
      text += `Experience:\n`;
      feedback.detailedSuggestions.experience.forEach(item => text += `• ${item}\n`);
      text += `\n`;
    }
    
    if (feedback.detailedSuggestions.skills) {
      text += `Skills:\n`;
      feedback.detailedSuggestions.skills.forEach(item => text += `• ${item}\n`);
      text += `\n`;
    }
  }
  
  if (feedback.physicalFormattingTips) {
    text += `FORMATTING TIPS:\n`;
    feedback.physicalFormattingTips.forEach(tip => text += `• ${tip}\n`);
    text += `\n`;
  }
  
  if (feedback.bangladeshContextTips) {
    text += `BANGLADESH CONTEXT TIPS:\n`;
    feedback.bangladeshContextTips.forEach(tip => text += `• ${tip}\n`);
    text += `\n`;
  }
  
  if (feedback.suggestedActionVerbs) {
    text += `SUGGESTED ACTION VERBS:\n`;
    text += feedback.suggestedActionVerbs.join(', ') + `\n\n`;
  }
  
  if (feedback.linkedinSynergy) {
    text += `LINKEDIN SYNERGY:\n${feedback.linkedinSynergy}\n\n`;
  }
  
  if (feedback.atsScore) {
    text += `ATS SCORE: ${feedback.atsScore}/10\n\n`;
  }
  
  if (feedback.marketInsights) {
    text += `MARKET INSIGHTS:\n`;
    feedback.marketInsights.forEach(insight => text += `• ${insight}\n`);
  }
  
  return text;
};

// --- Main Page Component ---
export default function ResumeFeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>('industry');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationEnded, setConversationEnded] = useState(false);
  const [parsedFeedback, setParsedFeedback] = useState<ResumeFeedback | null>(null);

  const [industryPreference, setIndustryPreference] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userInput, setUserInput] = useState('');

  // 🆕 COIN-RELATED STATE
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [coinError, setCoinError] = useState<{currentCoins: number; requiredCoins: number} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', MESSAGES.AUTH_REQUIRED); // ✅ USING CONSTANT
      sessionStorage.setItem('redirectAfterLogin', ROUTES.RESUME_FEEDBACK); // ✅ USING CONSTANT
      router.push(ROUTES.AUTH); // ✅ USING CONSTANT
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (currentStep === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, currentStep]);

  // Handle Enter key press for industry input
  const handleIndustryKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && industryPreference.trim()) {
      e.preventDefault();
      setCurrentStep('resume');
    }
  }, [industryPreference]);

  // Copy text function
  const copyTextToClipboard = useCallback(async () => {
    if (!parsedFeedback) return;
    
    try {
      const readableText = convertJsonToReadableText(parsedFeedback);
      await navigator.clipboard.writeText(readableText);
      
      // Show temporary success message
      const button = document.getElementById('copy-text-btn');
      if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '✅ Copied!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
      alert('Failed to copy text. Please try again.');
    }
  }, [parsedFeedback]);

  // 🔧 HANDLE GET COINS FUNCTION - Redirect to coins page
  const handleGetCoins = useCallback(() => {
    setShowInsufficientCoinsModal(false);
    setCoinError(null);
    router.push(ROUTES.COINS); // ✅ USING CONSTANT
  }, [router]);

  // 🆕 UPDATED startAnalysis FUNCTION WITH BETTER ERROR HANDLING
  const startAnalysis = useCallback(async (finalJobDescription: string | null) => {
    if (resumeText.trim().length < LIMITS.MIN_RESUME_LENGTH) {
        setError(`Your resume text seems too short. Please paste at least ${LIMITS.MIN_RESUME_LENGTH} characters for an accurate analysis.`);
        return;
    }

    // 🪙 Check coins first
    if (user) {
        console.log('🪙 Checking coins before analysis...');
        const hasCoins = await CoinManager.hasEnoughCoins(user.uid, LIMITS.COINS_PER_FEATURE);
        if (!hasCoins) {
            const currentBalance = await CoinManager.getCoinBalance(user.uid);
            setCoinError({ currentCoins: currentBalance, requiredCoins: LIMITS.COINS_PER_FEATURE });
            setShowInsufficientCoinsModal(true);
            return;
        }
    }

    setIsLoading(true);
    setError('');
    setCurrentStep('chat');
    setConversationEnded(false);
    setParsedFeedback(null);
    setMessages([{ role: 'assistant', content: "Got it! I'm now analyzing your resume with the context of the Bangladesh job market. This might take a moment..." }]);

    try {
      const response = await fetch('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          industryPreference: industryPreference || "a general entry-level position",
          jobDescription: finalJobDescription ? finalJobDescription.trim() : null,
          userId: user?.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // 🪙 Handle insufficient coins error
        if (response.status === 402) {
          setCoinError({ 
            currentCoins: errorData.currentCoins || 0, 
            requiredCoins: errorData.requiredCoins || 1 
          });
          setShowInsufficientCoinsModal(true);
          setCurrentStep('resume');
          return;
        }
        
        // ✨ ENHANCED ERROR HANDLING FOR VALIDATION ERRORS
        const errorMessage = errorData.error || 'An error occurred on the server.';
        
        if (errorMessage.includes('not_resume_content')) {
          setError(`❌ This doesn't appear to be resume content.

📋 **Please ensure your content includes typical resume sections like:**

• **Professional Summary** or Objective Statement
• **Work Experience** or Employment History  
• **Education** or Academic Background
• **Skills** or Core Competencies
• **Projects** or Key Achievements
• **Certifications** (if applicable)

💡 **Tip:** Copy your complete resume text including all headings and sections for accurate analysis.`);
        } else if (errorMessage.includes('length_invalid')) {
          setError(`📏 **Resume length issue detected.**

Your resume content is either too short or too long. Please provide a complete resume between **${LIMITS.MIN_RESUME_LENGTH}-15,000 characters** for accurate analysis.

💡 **Current length:** ${resumeText.length} characters`);
        } else if (errorMessage.includes('irrelevant_content')) {
          setError(`🚫 **Irrelevant content detected.**

The content appears to be unrelated to professional resume material. Please paste your **actual resume text** with proper career information, skills, and experience.`);
        } else if (errorMessage.includes('inappropriate_content')) {
          setError(`⚠️ **Content policy violation.**

The content contains inappropriate material. Please provide **professional resume content only** with your work experience, education, and skills.`);
        } else if (errorMessage.includes('injection_attempt')) {
          setError(`🛡️ **Security warning.**

Invalid input detected. Please provide **plain resume text** without any code, scripts, or special formatting. Just copy and paste your regular resume content.`);
        } else {
          // Generic error handling
          setError(errorMessage.includes('HTTP') ? 'Network error occurred. Please try again.' : errorMessage);
        }
        
        setCurrentStep('resume'); // Go back to resume step for user to fix the issue
        return;
      }

      const data = await response.json();
      
      let feedback: ResumeFeedback;
      
      if (typeof data.feedback === 'string') {
        const jsonMatch = data.feedback.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          feedback = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not find valid JSON in the AI's response.");
        }
      } else {
        feedback = data.feedback;
      }
      
      // Store parsed feedback and mark conversation as ended
      setParsedFeedback(feedback);
      setConversationEnded(data.conversationEnded || true);
      
      const feedbackComponent = <FeedbackCard feedback={feedback} providerInfo={data.providerInfo} />;
      setMessages(prev => [...prev, { role: 'assistant', content: feedbackComponent }]);

      // 🪙 Refresh coin balance after successful analysis
      if ((window as any).refreshCoinBalance) {
        (window as any).refreshCoinBalance();
      }

    } catch (err: any) {
      console.error("Analysis or Parsing Error:", err);
      
      // Handle different types of errors with user-friendly messages
      let userFriendlyError = "Sorry, there was an issue processing the analysis.";
      
      if (err.message.includes('not_resume_content')) {
        userFriendlyError = "The content doesn't appear to be a proper resume. Please include sections like experience, education, and skills.";
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        userFriendlyError = "Network connection issue. Please check your internet and try again.";
      } else if (err.message.includes('JSON')) {
        userFriendlyError = "Server response format error. Please try again in a moment.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: userFriendlyError }]);
      setCurrentStep('resume');
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, industryPreference, user]);

  const handleFollowUpSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (conversationEnded || !userInput.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);
    setUserInput('');

    try {
        const conversationHistory = newMessages.filter(msg => typeof msg.content === 'string')
          .map(msg => ({ role: msg.role, content: msg.content as string }));

      const response = await fetch('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          resumeText,
          industryPreference,
          jobDescription: jobDescription.trim() || null,
          userId: user?.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `An error occurred.`);
      }

      const data = await response.json();
      const assistantResponse = (
        <div className="prose prose-blue dark:prose-invert max-w-none">
            <ReactMarkdown>{data.feedback}</ReactMarkdown>
        </div>
      );
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);

    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, an error occurred: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, messages, resumeText, industryPreference, jobDescription, conversationEnded, user]);

  const resetFlow = useCallback(() => {
    setCurrentStep('industry');
    setMessages([]);
    setIndustryPreference('');
    setResumeText('');
    setJobDescription('');
    setError('');
    setConversationEnded(false);
    setParsedFeedback(null);
    setCoinError(null);
    setShowInsufficientCoinsModal(false);
  }, []);

  if (loading || !user) {
    return <LoadingScreen />; // ✅ USING SHARED COMPONENT
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pt-20 transition-colors duration-200">
      {/* Main content with mobile-friendly padding and responsive spacing */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto h-full">
          {currentStep !== 'chat' ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
              {currentStep === 'industry' && (
                <div className="w-full max-w-md text-center animate-fade-in px-4">
                    {/* Title text as regular text - mobile optimized */}
                    <div className="card-glass mb-6 p-4"> {/* ✅ USING CSS UTILITY CLASS */}
                      <p className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-200">SkillDash Resume Feedback AI</p>
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Get expert feedback tailored for the Bangladeshi job market</p>
                    </div>
                    
                    <h2 className="text-lg sm:text-xl font-semibold mb-6 text-gray-800 dark:text-white">Step 1: What is your target industry?</h2>
                    <input 
                      type="text" 
                      value={industryPreference} 
                      onChange={e => setIndustryPreference(e.target.value)} 
                      onKeyPress={handleIndustryKeyPress}
                      placeholder="e.g., Software Engineering, Marketing" 
                      className="input-field" // ✅ USING CSS UTILITY CLASS
                    />
                    <button 
                      onClick={() => setCurrentStep('resume')} 
                      disabled={!industryPreference.trim()} 
                      className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed" // ✅ USING CSS UTILITY CLASS
                    >
                      Next
                    </button>
                </div>
              )}
              
              {currentStep === 'resume' && (
                <div className="w-full max-w-2xl text-center animate-fade-in px-3 sm:px-4">
                    <h2 className="text-lg sm:text-xl font-semibold mb-6 text-gray-800 dark:text-white">Step 2: Paste your resume content</h2>
                    
                    {/* Enhanced instructions with mobile-friendly design */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4 mb-4 text-left shadow-sm">
                      {/* Bold title inside instructions box */}
                      <div className="mb-4 text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-600">
                        <p className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-200">SkillDash Resume Feedback AI</p>
                        <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-300 mt-1">Get expert feedback tailored for the Bangladeshi job market</p>
                      </div>
                      
                      <h3 className="text-sm sm:text-base font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        How to copy your resume text:
                      </h3>
                      <div className="space-y-2 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        <p className="flex items-start gap-2">
                          <span className="font-semibold text-blue-800 dark:text-blue-200 flex-shrink-0">1.</span>
                          <span>Open your resume document (Word, PDF, Google Docs, etc.)</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold text-blue-800 dark:text-blue-200 flex-shrink-0">2.</span>
                          <span>Select all text using:</span>
                        </p>
                        <div className="ml-4 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Ctrl</kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">A</kbd>
                            <span className="text-xs text-blue-600 dark:text-blue-400">(Windows/Linux)</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Cmd</kbd>
                            <span>+</span>
                            <kbd className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">A</kbd>
                            <span className="text-xs text-blue-600 dark:text-blue-400">(Mac)</span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400">Or manually select using your mouse</p>
                        </div>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold text-blue-800 dark:text-blue-200 flex-shrink-0">3.</span>
                          <span>Copy and paste the text into the box below</span>
                        </p>
                      </div>
                    </div>

                    {/* Future feature notice */}
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4 shadow-sm">
                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>
                          <span className="font-semibold">Coming Soon:</span>
                          Direct resume file upload feature for even easier analysis!
                        </span>
                      </p>
                    </div>

                    <textarea 
                      value={resumeText} 
                      onChange={e => setResumeText(e.target.value)} 
                      placeholder="Paste your full resume text here..." 
                      className="input-field h-48 sm:h-64 resize-none text-xs sm:text-sm leading-relaxed" // ✅ USING CSS UTILITY CLASS
                    />
                    
                    {/* Character count and validation */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-xs text-gray-500 dark:text-gray-400 gap-1 sm:gap-0">
                      <span>
                        {resumeText.length} characters
                        {resumeText.length < LIMITS.MIN_RESUME_LENGTH && resumeText.length > 0 && ( // ✅ USING CONSTANT
                          <span className="text-red-500 block sm:inline sm:ml-2">• Need at least {LIMITS.MIN_RESUME_LENGTH} characters for analysis</span>
                        )}
                      </span>
                      {resumeText.length >= LIMITS.MIN_RESUME_LENGTH && ( // ✅ USING CONSTANT
                        <span className="text-green-600 dark:text-green-400">✓ Ready for analysis</span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                        <button 
                          onClick={() => setCurrentStep('industry')} 
                          className="btn-secondary w-full sm:w-auto" // ✅ USING CSS UTILITY CLASS
                        >
                          ← Back
                        </button>
                        <button 
                          onClick={() => setCurrentStep('job-description')} 
                          disabled={resumeText.trim().length < LIMITS.MIN_RESUME_LENGTH} // ✅ USING CONSTANT
                          className="btn-primary w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed" // ✅ USING CSS UTILITY CLASS
                        >
                          Next →
                        </button>
                    </div>
                </div>
              )}
              
              {currentStep === 'job-description' && (
                <div className="w-full max-w-lg text-center animate-fade-in px-3 sm:px-4">
                    <h2 className="text-lg sm:text-xl font-semibold mb-6 text-gray-800 dark:text-white">Step 3 (Optional): Add a Job Description</h2>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4 shadow-sm">
                      <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                        <span className="font-semibold">💡 Pro Tip:</span> Pasting a specific job description will give you much more targeted feedback and suggestions.
                      </p>
                    </div>

                    <textarea 
                      value={jobDescription} 
                      onChange={e => setJobDescription(e.target.value)} 
                      placeholder="Paste a job description here..." 
                      className="input-field h-32 sm:h-40 resize-none text-xs sm:text-sm" // ✅ USING CSS UTILITY CLASS
                    />
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                        <button 
                          onClick={() => setCurrentStep('resume')} 
                          className="btn-secondary w-full sm:w-auto" // ✅ USING CSS UTILITY CLASS
                        >
                          ← Back
                        </button>
                        <button 
                          onClick={() => startAnalysis(null)} 
                          className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base shadow-md hover:shadow-lg"
                        >
                          Skip & Analyze
                        </button>
                        <button 
                          onClick={() => startAnalysis(jobDescription)} 
                          className="btn-primary w-full sm:flex-1" // ✅ USING CSS UTILITY CLASS
                        >
                          Analyze Now
                        </button>
                    </div>
                </div>
              )}
              
               {error && (
                 <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 sm:p-6 max-w-2xl mx-auto shadow-lg">
                   <div className="flex items-start gap-3">
                     {/* Error Icon */}
                     <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                       <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     
                     {/* Error Content */}
                     <div className="flex-1">
                       {error.includes('not_resume_content') ? (
                         <div className="space-y-4">
                           <div>
                             <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                               Content Not Recognized as Resume
                             </h3>
                             <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                               This doesn't appear to be resume content. Please ensure your content includes typical resume sections:
                             </p>
                           </div>
                           
                           <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-600">
                             <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                               <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                               </svg>
                               Required Resume Sections:
                             </h4>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               {[
                                 'Professional Summary',
                                 'Work Experience', 
                                 'Education Background',
                                 'Skills & Competencies',
                                 'Projects & Achievements',
                                 'Certifications'
                               ].map((section, index) => (
                                 <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                   <span>{section}</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                           
                           <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                             <div className="flex items-start gap-2">
                               <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                               <p className="text-sm text-blue-700 dark:text-blue-300">
                                 <span className="font-medium">Tip:</span> Copy your complete resume text including all headings and sections for accurate analysis.
                               </p>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div className="space-y-3">
                           <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                             Validation Error
                           </h3>
                           <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line leading-relaxed">
                             {error}
                           </p>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 mb-4 pr-1 sm:pr-2">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && <BotIcon />} {/* ✅ USING SHARED COMPONENT */}
                            <div className={`max-w-full ${msg.role === 'user' ? 'px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-blue-600 text-white text-sm sm:text-base' : ''}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-2 sm:gap-3">
                            <BotIcon /> {/* ✅ USING SHARED COMPONENT */}
                            <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                              <LoadingDots /> {/* ✅ USING SHARED COMPONENT */}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Conditional input area or completion message */}
                {conversationEnded ? (
                  <div className="mt-auto space-y-3 sm:space-y-4">
                    {/* Copy Button */}
                    <div className="card-glass p-3 sm:p-4"> {/* ✅ USING CSS UTILITY CLASS */}
                      <div className="text-center mb-3">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">
                          📋 Export Your Analysis
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Copy the analysis as readable text for your records
                        </p>
                      </div>
                      
                      <button
                        id="copy-text-btn"
                        onClick={copyTextToClipboard}
                        className="btn-primary w-full flex items-center justify-center gap-2" // ✅ USING CSS UTILITY CLASS
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        📄 Copy Analysis as Text
                      </button>
                    </div>

                    {/* Start New Analysis Button */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-600 p-4 sm:p-6 text-center shadow-sm">
                      <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
                          🎉 Analysis Complete!
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                          Ready to analyze another resume or improve this one further?
                        </p>
                      </div>
                      
                      <button
                        onClick={resetFlow}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        🚀 Start New Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFollowUpSubmit} className="mt-auto">
                      <div className="flex items-end space-x-2 sm:space-x-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                          <textarea
                              ref={textareaRef}
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              placeholder="Ask a follow-up question..."
                              className="flex-1 w-full p-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none text-sm sm:text-base"
                              rows={1}
                              disabled={isLoading}
                          />
                          <button 
                            type="submit" 
                            disabled={!userInput.trim() || isLoading} 
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full p-2.5 sm:p-3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-md hover:shadow-lg"
                          >
                               <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-12 5l7-7-7-7" />
                               </svg>
                          </button>
                      </div>
                       <button 
                         type="button" 
                         onClick={resetFlow} 
                         className="text-xs text-center w-full mt-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline transition-colors"
                       >
                         Start New Analysis
                       </button>
                  </form>
                )}
            </div>
          )}
        </div>
      </main>

      {/* Insufficient Coins Modal */}
      {showInsufficientCoinsModal && coinError && (
        <InsufficientCoinsModal
          isOpen={showInsufficientCoinsModal}
          onClose={() => {
            setShowInsufficientCoinsModal(false);
            setCoinError(null);
          }}
          onGetCoins={handleGetCoins}
          featureName="Resume Feedback"
          currentCoins={coinError.currentCoins}
          requiredCoins={coinError.requiredCoins}
        />
      )}
    </div>
  );
}
