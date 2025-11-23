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
import { fetchWithRetry } from '@/lib/utils/apiClient'; // ✅ ADD THIS LINE


// 🔧 FIXED: Updated FileUpload component with all fixes
interface FileUploadProps {
  onFileProcessed: (feedback: any, fileName: string) => void; // 🔧 FIXED: Now expects feedback object
  onError: (error: string) => void;
  onClearError?: () => void; // 🆕 NEW: To clear errors
  disabled?: boolean;
  industryPreference?: string;
  userId?: string;
  jobDescription?: string;
  error?: string; // 🆕 NEW: Error prop from parent
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  onError,
  onClearError,
  disabled,
  industryPreference = 'general',
  userId,
  jobDescription,
  error
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔧 FIXED: Clear error when user interacts
  const clearError = useCallback(() => {
    if (onClearError) {
      onClearError();
    }
  }, [onClearError]);

  const processFile = useCallback(async (file: File) => {
    // Clear any previous errors
    clearError();
    
    // Validate file size first
    if (file.size > 200 * 1024) { // 200KB
      onError(`File too large (${Math.round(file.size / 1024)}KB). Maximum size is 200KB. Please compress your PDF at https://www.ilovepdf.com/compress_pdf`);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      onError('Invalid file type. We only process PDF and DOCX files less than 200KB.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔍 Processing file:', file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('industryPreference', industryPreference);
      if (userId) formData.append('userId', userId);
      if (jobDescription) formData.append('jobDescription', jobDescription);
      
      console.log('📤 Sending to /api/resume-feedback...');
      
      // 🔧 FIXED: Use correct endpoint
      const response = await fetchWithRetry('/api/resume-feedback', {
        method: 'POST',
        body: formData,
        maxRetries: 3,
        retryDelay: 1000
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Success result:', result);
      
      if (result.error) {
        onError(result.error);
        return;
      }
      
      // 🔧 FIXED: Pass feedback object directly
      onFileProcessed(result.feedback, file.name);
      
    } catch (error: any) {
      console.error('❌ File processing error:', error);
      onError(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [onFileProcessed, onError, clearError, industryPreference, userId, jobDescription]);

  // 🔧 FIXED: Improved drag and drop handling
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    clearError(); // Clear error when user starts dragging
  }, [clearError]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || isProcessing) return;
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      processFile(file);
    }
  }, [disabled, isProcessing, processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearError(); // Clear error when user selects file
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    e.target.value = '';
  }, [processFile, clearError]);

  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      clearError(); // Clear error when user clicks
      document.getElementById('file-input')?.click();
    }
  }, [disabled, isProcessing, clearError]);

  return (
    <div className="w-full">
      {/* 🆕 NEW: In Production Banner */}
      <div className="mb-4 relative overflow-hidden bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
        <div className="absolute -top-1 -right-8 bg-orange-500 text-white px-8 py-1 text-xs font-bold transform rotate-12 shadow-md">
          IN PRODUCTION
        </div>
        <div className="p-4 pr-16">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
                🚀 Feature in Production
              </h3>
              <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                File upload is currently being optimized for our production environment. 
                For the <strong>fastest and most reliable analysis</strong>, we recommend using the 
                <span className="font-semibold"> "Paste Text"</span> option instead. If you want to give your coin to us for free, go on,<span className="font-semibold"> USE IT *-*</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔧 FIXED: Error display - only shows when there's an error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Upload Error
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.includes('ilovepdf.com') ? (
                  <div>
                    {error.split('https://www.ilovepdf.com/compress_pdf')[0]}
                    <a 
                      href="https://www.ilovepdf.com/compress_pdf" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      https://www.ilovepdf.com/compress_pdf
                    </a>
                  </div>
                ) : (
                  error
                )}
              </div>
            </div>
            <button
              onClick={clearError}
              className="ml-3 text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 🔧 FIXED: Improved drag and drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isProcessing}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            {isProcessing ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {isProcessing ? 'AI is analyzing your resume...' : 'Upload Your Resume'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Drag and drop your PDF or DOCX file here, or click to browse
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <strong>Requirements:</strong> We only process PDF/DOCX files less than 200KB
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <strong>Need to compress?</strong> Use{' '}
                <a 
                  href="https://www.ilovepdf.com/compress_pdf" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-600 underline"
                  onClick={(e) => e.stopPropagation()} // Prevent triggering file input
                >
                  ilovepdf.com/compress_pdf
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // 🆕 File upload state
  const [uploadMethod, setUploadMethod] = useState<'text' | 'file'>('text');
  const [uploadError, setUploadError] = useState<string>(''); // 🔧 NEW: Upload error state

  // 🆕 COIN-RELATED STATE
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [coinError, setCoinError] = useState<{currentCoins: number; requiredCoins: number} | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', MESSAGES.AUTH_REQUIRED);
      sessionStorage.setItem('redirectAfterLogin', ROUTES.RESUME_FEEDBACK);
      router.replace(ROUTES.AUTH);
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
    router.push(ROUTES.COINS);
  }, [router]);

  // 🔄 PERIODIC COIN REFRESH: Auto-detect when coins become available (like in Discover)
  useEffect(() => {
    let coinRefreshInterval: NodeJS.Timeout;
    
    if (user && showInsufficientCoinsModal && coinError && coinError.currentCoins < coinError.requiredCoins) {
      // Check for coins every 5 seconds if modal is open
      coinRefreshInterval = setInterval(async () => {
        try {
          const currentBalance = await CoinManager.getCoinBalance(user.uid);
          const hasCoins = currentBalance >= LIMITS.COINS_PER_FEATURE;
          
          if (hasCoins && showInsufficientCoinsModal) {
            console.log('✨ [ResumeFeedbackPage] Coins detected during periodic check');
            setShowInsufficientCoinsModal(false);
            setCoinError(null);
          }
        } catch (error) {
          console.error('❌ [ResumeFeedbackPage] Periodic coin check failed:', error);
        }
      }, 5000);
    }
    
    return () => {
      if (coinRefreshInterval) {
        clearInterval(coinRefreshInterval);
      }
    };
  }, [user, showInsufficientCoinsModal, coinError]);

  // 👀 TAB FOCUS COIN CHECK: Instantly refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user && showInsufficientCoinsModal && coinError) {
        try {
          const currentBalance = await CoinManager.getCoinBalance(user.uid);
          const hasCoins = currentBalance >= LIMITS.COINS_PER_FEATURE;
          
          if (hasCoins) {
            console.log('🎉 [ResumeFeedbackPage] Coins found on tab focus');
            setShowInsufficientCoinsModal(false);
            setCoinError(null);
          }
        } catch (error) {
          console.error('❌ [ResumeFeedbackPage] Tab focus coin check failed:', error);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [user, showInsufficientCoinsModal, coinError]);

  // 🔧 FIXED: Clear error functions
  const clearUploadError = useCallback(() => {
    setUploadError('');
  }, []);

  // 🔧 FIXED: Navigation functions that clear errors
  const handleNext = () => {
    setUploadError(''); // Clear upload errors when moving forward
    setCurrentStep('job-description');
  };

  const handleBack = () => {
    setUploadError(''); // Clear upload errors when going back
    setCurrentStep('industry');
  };

  // 🔧 FIXED: File upload handlers
  const handleFileProcessed = useCallback((feedback: any, fileName: string) => {
    setUploadError(''); // Clear error on success
    console.log('File processed successfully:', fileName);
    
    // 🔧 FIXED: Handle feedback object directly - skip to results
    setParsedFeedback(feedback);
    setConversationEnded(true);
    setCurrentStep('chat');
    
    // Add success message to chat
    const feedbackComponent = <FeedbackCard feedback={feedback} providerInfo="File analysis completed" />;
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: feedbackComponent
    }]);
  }, []);

  const handleFileError = useCallback((error: string) => {
    setUploadError(error); // Set upload error
  }, []);

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
      const response = await fetchWithRetry('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          industryPreference: industryPreference || "a general entry-level position",
          jobDescription: finalJobDescription ? finalJobDescription.trim() : null,
          userId: user?.uid
        }),
        maxRetries: 3,
        retryDelay: 1000
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // ✅ ADD THIS ERROR LOGGING (NEW CODE)
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: `Resume feedback error: ${errorData.error || 'Unknown'}`,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            endpoint: '/api/resume-feedback',
            status: response.status
          })
        }).catch(() => {});
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

      const response = await fetchWithRetry('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          resumeText,
          industryPreference,
          jobDescription: jobDescription.trim() || null,
          userId: user?.uid
        }),
          maxRetries: 3,
          retryDelay: 1000
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
    setUploadMethod('text');
    setUploadError(''); // 🔧 FIXED: Clear upload error
  }, []);

  if (loading || !user) {
    return <LoadingScreen />;
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
                    <div className="card-glass mb-6 p-4">
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
                      className="input-field"
                    />
                    <button 
                      onClick={() => setCurrentStep('resume')} 
                      disabled={!industryPreference.trim()} 
                      className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                </div>
              )}
              
              {currentStep === 'resume' && (
                <div className="w-full max-w-2xl text-center animate-fade-in px-3 sm:px-4">
                    <h2 className="text-lg sm:text-xl font-semibold mb-6 text-gray-800 dark:text-white">Step 2: Add your resume content</h2>
                    
                    {/* Enhanced instructions with mobile-friendly design */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4 mb-4 text-left shadow-sm">
                      {/* Bold title inside instructions box */}
                      <div className="mb-4 text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-600">
                        <p className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-200">SkillDash Resume Feedback AI</p>
                        <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-300 mt-1">Get expert feedback tailored for the Bangladeshi job market</p>
                      </div>
                    </div>

                    {/* 🆕 Method Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
                      <button
                        onClick={() => { setUploadMethod('text'); setUploadError(''); }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                          uploadMethod === 'text'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        ✏️ Paste Text
                      </button>
                      <button
                        onClick={() => { setUploadMethod('file'); setUploadError(''); }}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative ${
                          uploadMethod === 'file'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        📁 Upload File
                        {/* 🆕 NEW: Mini production badge on tab */}
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
                          PROD
                        </span>
                      </button>
                    </div>

                    {/* 🆕 Content based on method */}
                    {uploadMethod === 'text' ? (
                      <div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4 mb-4 text-left shadow-sm">
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

                        <textarea 
                          value={resumeText} 
                          onChange={e => setResumeText(e.target.value)} 
                          placeholder="Paste your full resume text here..." 
                          className="input-field h-48 sm:h-64 resize-none text-xs sm:text-sm leading-relaxed"
                        />
                        
                        {/* Character count and validation */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-xs text-gray-500 dark:text-gray-400 gap-1 sm:gap-0">
                          <span>
                            {resumeText.length} characters
                            {resumeText.length < LIMITS.MIN_RESUME_LENGTH && resumeText.length > 0 && (
                              <span className="text-red-500 block sm:inline sm:ml-2">• Need at least {LIMITS.MIN_RESUME_LENGTH} characters for analysis</span>
                            )}
                          </span>
                          {resumeText.length >= LIMITS.MIN_RESUME_LENGTH && (
                            <span className="text-green-600 dark:text-green-400">✓ Ready for analysis</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <FileUpload
                        onFileProcessed={handleFileProcessed}
                        onError={handleFileError}
                        onClearError={clearUploadError}
                        error={uploadError}
                        industryPreference={industryPreference}
                        userId={user?.uid}
                        jobDescription={jobDescription}
                        disabled={isLoading}
                      />
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
                        <button 
                          onClick={handleBack} 
                          className="btn-secondary w-full sm:w-auto"
                        >
                          ← Back
                        </button>
                        <button 
                          onClick={handleNext} 
                          disabled={resumeText.trim().length < LIMITS.MIN_RESUME_LENGTH}
                          className="btn-primary w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="input-field h-32 sm:h-40 resize-none text-xs sm:text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                        <button 
                          onClick={() => setCurrentStep('resume')} 
                          className="btn-secondary w-full sm:w-auto"
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
                          className="btn-primary w-full sm:flex-1"
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
                            {msg.role === 'assistant' && <BotIcon />}
                            <div className={`max-w-full ${msg.role === 'user' ? 'px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-blue-600 text-white text-sm sm:text-base' : ''}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-2 sm:gap-3">
                            <BotIcon />
                            <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                              <LoadingDots />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Conditional input area or completion message */}
                {conversationEnded ? (
                  <div className="mt-auto space-y-3 sm:space-y-4">
                    {/* Copy Button */}
                    <div className="card-glass p-3 sm:p-4">
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
                        className="btn-primary w-full flex items-center justify-center gap-2"
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
