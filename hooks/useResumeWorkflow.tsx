import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { fetchWithRetry } from '@/lib/utils/apiClient'; // ✅ NEW IMPORT

type Step = 'industry' | 'resume' | 'job-description' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
}

interface ResumeFeedback {
  summary: string;
  strengths: {
    technical: string[];
    soft: string[];
    experience: string[];
    education: string[];
  };
  weaknesses: {
    technical: string[];
    soft: string[];
    experience: string[];
    education: string[];
  };
  recommendations: {
    skillsToDevelop: string[];
    experienceToGain: string[];
    formattingTips: string[];
    actionableSteps: string[];
  };
  additionalSkillRequired: string[];
  suggestedCourses: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  confidenceScore: number;
  marketInsights: string[];
}

export const useResumeWorkflow = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State Management - EXACT same as your original
  const [currentStep, setCurrentStep] = useState<Step>('industry');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data - EXACT same as your original
  const [industryPreference, setIndustryPreference] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userInput, setUserInput] = useState('');
  
  // Store the initial feedback for context - EXACT same as your original
  const [initialFeedback, setInitialFeedback] = useState<ResumeFeedback | null>(null);
  
  // Refs - EXACT same as your original
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auth effect - EXACT same as your original
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to use the AI Resume Feedback feature. We require login for fair usage.');
      sessionStorage.setItem('redirectAfterLogin', '/resume-feedback');
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Auto-scroll effect - EXACT same as your original
  useEffect(() => {
    if (currentStep === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, currentStep]);

  // Auto-resize textarea effect - EXACT same as your original
  useEffect(() => {
    if (currentStep === 'chat' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput, currentStep]);

  // All your handler functions - EXACT same logic
  const initializeConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Perfect! I have all the information I need. I'll analyze your resume now and provide detailed feedback. After that, feel free to ask any follow-up questions!"
      }
    ]);
    setCurrentStep('chat');
  };

  const handleIndustryNext = () => {
    if (!industryPreference.trim()) {
      setError('Please enter your preferred industry');
      return;
    }
    setError('');
    setCurrentStep('resume');
  };

  const handleResumeNext = () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text');
      return;
    }
    if (resumeText.trim().length < 100) {
      setError('Resume text seems too short. Please provide a complete resume.');
      return;
    }
    setError('');
    setCurrentStep('job-description');
  };

  const handleSkipJobDescription = () => {
    setJobDescription('');
    startAnalysis(null);
  };
  
  const handleJobDescriptionNext = () => {
    startAnalysis(jobDescription);
  };

  // ✅ UPDATED: API logic with retry
  const startAnalysis = async (finalJobDescription: string | null) => {
    setIsLoading(true);
    setError('');
    initializeConversation();

    try {
      const requestData = {
        resumeText,
        industryPreference,
        jobDescription: finalJobDescription ? finalJobDescription.trim() : null,
        messages: []
      };
      
      // ✅ CHANGED: Use fetchWithRetry
      const response = await fetchWithRetry('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        maxRetries: 3,
        retryDelay: 1000
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // ✅ NEW: Log error
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: `Resume analysis error: ${errorData.error || 'Unknown'}`,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            endpoint: '/api/resume-feedback',
            status: response.status
          })
        }).catch(() => {});
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      displayInitialFeedback(data);

    } catch (err: any) {
      console.error('Analysis error:', err);
      
      // ✅ NEW: Log client error
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Resume analysis failed: ${err.message}`,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          endpoint: '/api/resume-feedback'
        })
      }).catch(() => {});
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, an error occurred: ${err.message}. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // SIMPLIFIED displayInitialFeedback without dynamic import issues
  const displayInitialFeedback = (data: any) => {
    try {
      let parsedFeedback: ResumeFeedback;
      
      if (typeof data.feedback === 'string') {
        const jsonMatch = data.feedback.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedFeedback = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } else {
        parsedFeedback = data.feedback;
      }

      setInitialFeedback(parsedFeedback);

      // Return the feedback data instead of component - parent will handle rendering
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: JSON.stringify({ feedback: parsedFeedback, providerInfo: data.providerInfo, type: 'feedback-card' })
      }]);

    } catch (parseError) {
      console.error('Failed to parse JSON feedback:', parseError);
      const formattedFeedback = (
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <ReactMarkdown>{data.feedback}</ReactMarkdown>
          {data.providerInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              {data.providerInfo}
            </div>
          )}
        </div>
      );
      setMessages(prev => [...prev, { role: 'assistant', content: formattedFeedback }]);
    }
  };

  // ✅ UPDATED: Follow-up logic with retry
  const handleFollowUpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setError('');
    setUserInput('');
    
    try {
      const conversationHistory = messages
        .filter(msg => typeof msg.content === 'string')
        .map(msg => ({ role: msg.role, content: msg.content as string }));
      
      conversationHistory.push({ role: 'user', content: userInput });

      // ✅ CHANGED: Use fetchWithRetry
      const response = await fetchWithRetry('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          industryPreference,
          jobDescription: jobDescription.trim() || null,
        }),
        maxRetries: 3,
        retryDelay: 1000
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // ✅ NEW: Log error
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: `Resume follow-up error: ${errorData.error || 'Unknown'}`,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            endpoint: '/api/resume-feedback',
            status: response.status
          })
        }).catch(() => {});
        
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const formattedFeedback = (
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <ReactMarkdown>{data.feedback}</ReactMarkdown>
          {data.providerInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              {data.providerInfo}
            </div>
          )}
        </div>
      );

      setMessages(prev => [...prev, { role: 'assistant', content: formattedFeedback }]);

    } catch (err: any) {
      console.error('Follow-up error:', err);
      
      // ✅ NEW: Log client error
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Resume follow-up failed: ${err.message}`,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          endpoint: '/api/resume-feedback'
        })
      }).catch(() => {});
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, an error occurred: ${err.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentStep === 'industry') handleIndustryNext();
      else if (currentStep === 'resume') handleResumeNext();
      else if (currentStep === 'job-description') handleJobDescriptionNext();
      else if (currentStep === 'chat') formRef.current?.requestSubmit();
    }
  };
  
  const resetFlow = () => {
    setCurrentStep('industry');
    setMessages([]);
    setIndustryPreference('');
    setResumeText('');
    setJobDescription('');
    setUserInput('');
    setError('');
    setInitialFeedback(null);
  };

  return {
    // Auth state
    user,
    loading,
    
    // Step state
    currentStep,
    
    // Form state
    industryPreference,
    setIndustryPreference,
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    userInput,
    setUserInput,
    
    // UI state
    messages,
    isLoading,
    error,
    initialFeedback,
    
    // Refs
    messagesEndRef,
    textareaRef,
    formRef,
    
    // Handlers
    handleIndustryNext,
    handleResumeNext,
    handleJobDescriptionNext,
    handleSkipJobDescription,
    handleFollowUpSubmit,
    handleKeyDown,
    resetFlow,
    
    // Step navigation
    goToIndustry: () => setCurrentStep('industry'),
    goToResume: () => setCurrentStep('resume'),
    goToJobDescription: () => setCurrentStep('job-description')
  };
};
