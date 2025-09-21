'use client';

import React, { useState, useRef, FormEvent, useEffect, useMemo, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
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

// --- Memoized Helper Icons & Components ---
const BotIcon = memo(() => (
    <img
        src="/skilldash-logo.png"
        alt="SkillDash AI Avatar"
        className="w-10 h-10 rounded-full shadow-md object-cover"
        loading="lazy"
    />
));
BotIcon.displayName = 'BotIcon';

const LoadingDots = memo(() => (
    <div className="flex items-center space-x-1.5 px-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
));
LoadingDots.displayName = 'LoadingDots';

const AuthLoadingScreen = memo(() => (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
));
AuthLoadingScreen.displayName = 'AuthLoadingScreen';

// --- Highly Optimized Sub-components ---
const ExpandableSection = memo(({ 
  title, 
  bgColor, 
  textColor, 
  borderColor, 
  hoverColor, 
  icon, 
  isExpanded, 
  onToggle, 
  children 
}: {
  title: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <button 
      onClick={onToggle}
      className={`w-full px-6 py-4 ${bgColor} border-b ${borderColor} flex items-center justify-between ${hoverColor}`}
    >
      <h3 className={`text-lg font-semibold ${textColor}`}>{icon} {title}</h3>
      <svg className={`w-5 h-5 text-current transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isExpanded && <div className="p-6">{children}</div>}
  </div>
));
ExpandableSection.displayName = 'ExpandableSection';

const ListRenderer = memo(({ items, colorClass }: { items: string[]; colorClass: string }) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={`${item.slice(0, 20)}-${index}`} className={`flex items-start ${colorClass}`}>
        <span className="w-2 h-2 bg-current rounded-full mt-2 mr-3 flex-shrink-0"></span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
));
ListRenderer.displayName = 'ListRenderer';

const SubSection = memo(({ title, items, colorClass }: { title: string; items: string[]; colorClass: string }) => (
  items.length > 0 ? (
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
      <ListRenderer items={items} colorClass={colorClass} />
    </div>
  ) : null
));
SubSection.displayName = 'SubSection';

const CourseCard = memo(({ course, index }: { course: { title: string; description: string; priority: string }; index: number }) => {
  const priorityStyles = useMemo(() => {
    switch (course.priority) {
      case 'High': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    }
  }, [course.priority]);

  return (
    <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-orange-800 dark:text-orange-300">{course.title}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${priorityStyles}`}>
          {course.priority} Priority
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm">{course.description}</p>
    </div>
  );
});
CourseCard.displayName = 'CourseCard';

// --- Main Feedback Display Component ---
const FeedbackCard = memo(({ feedback, providerInfo }: { feedback: ResumeFeedback; providerInfo?: string }) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    strengths: true,
    weaknesses: false,
    recommendations: false,
    additionalSkills: false,
    courses: false,
    insights: false
  });

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const toggleJsonView = useCallback(() => {
    setShowRawJson(prev => !prev);
  }, []);

  // Memoize expensive renders
  const courseCards = useMemo(() => 
    feedback.suggestedCourses.map((course, index) => (
      <CourseCard key={`${course.title}-${index}`} course={course} index={index} />
    )), [feedback.suggestedCourses]);

  if (showRawJson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Raw JSON Data</h3>
          <button 
            onClick={toggleJsonView}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            Show Cards
          </button>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-800 dark:text-gray-200">
          {JSON.stringify(feedback, null, 2)}
        </pre>
        {providerInfo && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            {providerInfo}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Resume Analysis Complete</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Score: {feedback.confidenceScore}/10
              </span>
            </div>
          </div>
          <button 
            onClick={toggleJsonView}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            View JSON
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.summary}</p>
        </div>
      </div>

      {/* Strengths Section */}
      <ExpandableSection
        title="Your Strengths"
        bgColor="bg-green-50 dark:bg-green-900/20"
        textColor="text-green-800 dark:text-green-300"
        borderColor="border-green-200 dark:border-green-800"
        hoverColor="hover:bg-green-100 dark:hover:bg-green-900/30"
        icon="✅"
        isExpanded={expandedSections.strengths}
        onToggle={() => toggleSection('strengths')}
      >
        <SubSection title="Technical Skills" items={feedback.strengths.technical} colorClass="text-green-700 dark:text-green-300" />
        <SubSection title="Soft Skills" items={feedback.strengths.soft} colorClass="text-green-700 dark:text-green-300" />
        <SubSection title="Experience" items={feedback.strengths.experience} colorClass="text-green-700 dark:text-green-300" />
        <SubSection title="Education" items={feedback.strengths.education} colorClass="text-green-700 dark:text-green-300" />
      </ExpandableSection>

      {/* Weaknesses Section */}
      <ExpandableSection
        title="Areas to Improve"
        bgColor="bg-red-50 dark:bg-red-900/20"
        textColor="text-red-800 dark:text-red-300"
        borderColor="border-red-200 dark:border-red-800"
        hoverColor="hover:bg-red-100 dark:hover:bg-red-900/30"
        icon="⚠️"
        isExpanded={expandedSections.weaknesses}
        onToggle={() => toggleSection('weaknesses')}
      >
        <SubSection title="Technical Skills" items={feedback.weaknesses.technical} colorClass="text-red-700 dark:text-red-300" />
        <SubSection title="Soft Skills" items={feedback.weaknesses.soft} colorClass="text-red-700 dark:text-red-300" />
        <SubSection title="Experience" items={feedback.weaknesses.experience} colorClass="text-red-700 dark:text-red-300" />
        <SubSection title="Education" items={feedback.weaknesses.education} colorClass="text-red-700 dark:text-red-300" />
      </ExpandableSection>

      {/* Recommendations Section */}
      <ExpandableSection
        title="Recommendations"
        bgColor="bg-blue-50 dark:bg-blue-900/20"
        textColor="text-blue-800 dark:text-blue-300"
        borderColor="border-blue-200 dark:border-blue-800"
        hoverColor="hover:bg-blue-100 dark:hover:bg-blue-900/30"
        icon="💡"
        isExpanded={expandedSections.recommendations}
        onToggle={() => toggleSection('recommendations')}
      >
        <SubSection title="Skills to Develop" items={feedback.recommendations.skillsToDevelop} colorClass="text-blue-700 dark:text-blue-300" />
        <SubSection title="Experience to Gain" items={feedback.recommendations.experienceToGain} colorClass="text-blue-700 dark:text-blue-300" />
        <SubSection title="Formatting Tips" items={feedback.recommendations.formattingTips} colorClass="text-blue-700 dark:text-blue-300" />
        <SubSection title="Actionable Steps" items={feedback.recommendations.actionableSteps} colorClass="text-blue-700 dark:text-blue-300" />
      </ExpandableSection>

      {/* Additional Skills Required */}
      <ExpandableSection
        title="Additional Skills Required"
        bgColor="bg-purple-50 dark:bg-purple-900/20"
        textColor="text-purple-800 dark:text-purple-300"
        borderColor="border-purple-200 dark:border-purple-800"
        hoverColor="hover:bg-purple-100 dark:hover:bg-purple-900/30"
        icon="🎯"
        isExpanded={expandedSections.additionalSkills}
        onToggle={() => toggleSection('additionalSkills')}
      >
        <ListRenderer items={feedback.additionalSkillRequired} colorClass="text-purple-700 dark:text-purple-300" />
      </ExpandableSection>

      {/* Suggested Courses */}
      <ExpandableSection
        title="Suggested Courses"
        bgColor="bg-orange-50 dark:bg-orange-900/20"
        textColor="text-orange-800 dark:text-orange-300"
        borderColor="border-orange-200 dark:border-orange-800"
        hoverColor="hover:bg-orange-100 dark:hover:bg-orange-900/30"
        icon="📚"
        isExpanded={expandedSections.courses}
        onToggle={() => toggleSection('courses')}
      >
        <div className="space-y-4">
          {courseCards}
        </div>
      </ExpandableSection>

      {/* Market Insights */}
      <ExpandableSection
        title="Market Insights"
        bgColor="bg-teal-50 dark:bg-teal-900/20"
        textColor="text-teal-800 dark:text-teal-300"
        borderColor="border-teal-200 dark:border-teal-800"
        hoverColor="hover:bg-teal-100 dark:hover:bg-teal-900/30"
        icon="📈"
        isExpanded={expandedSections.insights}
        onToggle={() => toggleSection('insights')}
      >
        <ListRenderer items={feedback.marketInsights} colorClass="text-teal-700 dark:text-teal-300" />
      </ExpandableSection>

      {providerInfo && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {providerInfo}
        </div>
      )}
    </div>
  );
});
FeedbackCard.displayName = 'FeedbackCard';

// --- Memoized Form Components ---
const IndustryStep = memo(({ 
  industryPreference, 
  setIndustryPreference, 
  onNext, 
  onKeyDown 
}: {
  industryPreference: string;
  setIndustryPreference: (value: string) => void;
  onNext: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => (
  <div className="max-w-md mx-auto space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 1: Your Target Industry</h2>
      <p className="text-gray-600 dark:text-gray-400">Which industry are you aiming for?</p>
    </div>
    <div className="space-y-4">
      <input
        type="text"
        value={industryPreference}
        onChange={(e) => setIndustryPreference(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="e.g., Tech, Finance, Marketing..."
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        autoFocus
      />
      <button onClick={onNext} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all">
        Next: Provide Resume
      </button>
    </div>
  </div>
));
IndustryStep.displayName = 'IndustryStep';

const ResumeStep = memo(({ 
  resumeText, 
  setResumeText, 
  onNext, 
  onBack, 
  onKeyDown 
}: {
  resumeText: string;
  setResumeText: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 2: Resume Content</h2>
      <p className="text-gray-600 dark:text-gray-400">Paste your resume content below.</p>
    </div>
    <div className="space-y-4">
      <textarea 
        value={resumeText} 
        onChange={(e) => setResumeText(e.target.value)} 
        onKeyDown={onKeyDown} 
        placeholder="Paste your resume content here (avoid personal details)..." 
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
        rows={10}
      />
      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>
        <button onClick={onNext} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all">Next: Job Description</button>
      </div>
    </div>
  </div>
));
ResumeStep.displayName = 'ResumeStep';

const JobDescriptionStep = memo(({ 
  jobDescription, 
  setJobDescription, 
  onNext, 
  onSkip, 
  onBack, 
  onKeyDown 
}: {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Step 3: Job Description (Optional)</h2>
      <p className="text-gray-600 dark:text-gray-400">For more targeted feedback, paste a job description below.</p>
    </div>
    <div className="space-y-4">
      <textarea 
        value={jobDescription} 
        onChange={(e) => setJobDescription(e.target.value)} 
        onKeyDown={onKeyDown} 
        placeholder="Paste the job description you're targeting..." 
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" 
        rows={8}
      />
      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Back</button>
        <button onClick={onSkip} className="px-6 py-3 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">Skip & Analyze</button>
        <button onClick={onNext} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all">Analyze Resume</button>
      </div>
    </div>
  </div>
));
JobDescriptionStep.displayName = 'JobDescriptionStep';

export default function ResumeFeedbackPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // --- State Management ---
    const [currentStep, setCurrentStep] = useState<Step>('industry');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form data
    const [industryPreference, setIndustryPreference] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [userInput, setUserInput] = useState('');
    
    // Store the initial feedback for context
    const [initialFeedback, setInitialFeedback] = useState<ResumeFeedback | null>(null);
    
    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    
    // Memoized auth redirect effect
    useEffect(() => {
        if (!loading && !user) {
          sessionStorage.setItem('redirectMessage', 'Please log in to use the AI Resume Feedback feature. We require login for fair usage.');
          sessionStorage.setItem('redirectAfterLogin', '/resume-feedback');
          router.push('/auth');
        }
    }, [user, loading, router]);

    // Optimized scroll effect - only runs when necessary
    useEffect(() => {
        if (currentStep === 'chat' && messages.length > 0) {
            const timeoutId = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [messages, isLoading, currentStep]);

    // Optimized textarea resize
    useEffect(() => {
        if (currentStep === 'chat' && textareaRef.current && userInput) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput, currentStep]);

    // --- Memoized handlers ---
    const initializeConversation = useCallback(() => {
        setMessages([
            {
                role: 'assistant',
                content: "Perfect! I have all the information I need. I'll analyze your resume now and provide detailed feedback. After that, feel free to ask any follow-up questions!"
            }
        ]);
        setCurrentStep('chat');
    }, []);

    const handleIndustryNext = useCallback(() => {
        if (!industryPreference.trim()) {
            setError('Please enter your preferred industry');
            return;
        }
        setError('');
        setCurrentStep('resume');
    }, [industryPreference]);

    const handleResumeNext = useCallback(() => {
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
    }, [resumeText]);

    // --- API Call and Feedback Display ---
    const startAnalysis = useCallback(async (finalJobDescription: string | null) => {
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
            const response = await fetch('/api/resume-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const data = await response.json();
            displayInitialFeedback(data);

        } catch (err: any) {
            console.error('Analysis error:', err);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, an error occurred: ${err.message}. Please try again.` 
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [resumeText, industryPreference, initializeConversation]);

    const handleSkipJobDescription = useCallback(() => {
        setJobDescription('');
        startAnalysis(null);
    }, [startAnalysis]);
    
    const handleJobDescriptionNext = useCallback(() => {
        startAnalysis(jobDescription);
    }, [jobDescription, startAnalysis]);

    const displayInitialFeedback = useCallback((data: any) => {
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

            const feedbackComponent = (
                <FeedbackCard 
                    feedback={parsedFeedback} 
                    providerInfo={data.providerInfo}
                />
            );

            setMessages(prev => [...prev, { role: 'assistant', content: feedbackComponent }]);

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
    }, []);

    // --- Follow-up Chat Logic ---
    const handleFollowUpSubmit = useCallback(async (e: FormEvent) => {
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

            const response = await fetch('/api/resume-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: conversationHistory,
                    industryPreference,
                    jobDescription: jobDescription.trim() || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
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
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Sorry, an error occurred: ${err.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading, messages, industryPreference, jobDescription]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (currentStep === 'industry') handleIndustryNext();
            else if (currentStep === 'resume') handleResumeNext();
            else if (currentStep === 'job-description') handleJobDescriptionNext();
            else if (currentStep === 'chat') formRef.current?.requestSubmit();
        }
    }, [currentStep, handleIndustryNext, handleResumeNext, handleJobDescriptionNext]);
    
    const resetFlow = useCallback(() => {
        setCurrentStep('industry');
        setMessages([]);
        setIndustryPreference('');
        setResumeText('');
        setJobDescription('');
        setUserInput('');
        setError('');
        setInitialFeedback(null);
    }, []);
    
    // --- Memoized step content ---
    const stepContent = useMemo(() => {
        switch (currentStep) {
            case 'industry':
                return (
                    <IndustryStep
                        industryPreference={industryPreference}
                        setIndustryPreference={setIndustryPreference}
                        onNext={handleIndustryNext}
                        onKeyDown={handleKeyDown}
                    />
                );

            case 'resume':
                return (
                    <ResumeStep
                        resumeText={resumeText}
                        setResumeText={setResumeText}
                        onNext={handleResumeNext}
                        onBack={() => setCurrentStep('industry')}
                        onKeyDown={handleKeyDown}
                    />
                );
            
            case 'job-description':
                return (
                    <JobDescriptionStep
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        onNext={handleJobDescriptionNext}
                        onSkip={handleSkipJobDescription}
                        onBack={() => setCurrentStep('resume')}
                        onKeyDown={handleKeyDown}
                    />
                );

            case 'chat':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto space-y-6 mb-4 pr-2">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && <BotIcon />}
                                    <div className={`max-w-full ${msg.role === 'user' ? 'px-4 py-3 rounded-2xl shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none' : ''}`}>
                                        {typeof msg.content === 'string' ? 
                                            <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p> : 
                                            msg.content
                                        }
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <BotIcon />
                                    <div className="max-w-lg px-4 py-3 rounded-2xl shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none">
                                        <LoadingDots />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <form ref={formRef} onSubmit={handleFollowUpSubmit} className="space-y-2">
                            <div className="flex items-end space-x-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-700 p-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
                                <textarea 
                                    ref={textareaRef} 
                                    value={userInput} 
                                    onChange={(e) => setUserInput(e.target.value)} 
                                    onKeyDown={handleKeyDown} 
                                    placeholder="Ask follow-up questions about your feedback..." 
                                    className="flex-1 w-full px-4 py-2 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 resize-none max-h-32" 
                                    rows={1} 
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!userInput.trim() || isLoading} 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform active:scale-95 flex-shrink-0"
                                >
                                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex items-center justify-between px-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Industry: <span className="font-medium">{industryPreference}</span>
                                    {jobDescription && <span> • Job-specific feedback</span>}
                                </p>
                                <button type="button" onClick={resetFlow} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
                                    Start New Analysis
                                </button>
                            </div>
                        </form>
                    </div>
                );

            default: return null;
        }
    }, [currentStep, industryPreference, resumeText, jobDescription, userInput, messages, isLoading, handleIndustryNext, handleResumeNext, handleJobDescriptionNext, handleSkipJobDescription, handleKeyDown, handleFollowUpSubmit, resetFlow]);

    if (loading || !user) {
        return <AuthLoadingScreen />;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-black font-sans">
            <header className="bg-white/80 dark:bg-black/50 backdrop-blur-lg border-b border-black/5 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            SkillDash Resume <span className="font-light bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Feedback AI</span>
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {currentStep === 'industry' && 'Step 1 of 3: Choose your industry'}
                            {currentStep === 'resume' && 'Step 2 of 3: Provide your resume'}
                            {currentStep === 'job-description' && 'Step 3 of 3: Add job description (optional)'}
                            {currentStep === 'chat' && 'AI Analysis Complete - Ask follow-up questions'}
                        </p>
                    </div>
                    {currentStep !== 'chat' && (
                        <div className="flex space-x-2">
                            <div className={`w-3 h-3 rounded-full transition-colors ${currentStep === 'industry' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${currentStep === 'resume' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${currentStep === 'job-description' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                        </div>
                    )}
                </div>
            </header>

            <main className={`flex-1 ${currentStep === 'chat' ? 'flex flex-col' : 'flex items-center justify-center'} p-4 md:p-6 transition-all duration-300`}>
                <div className={currentStep === 'chat' ? 'w-full max-w-4xl mx-auto flex flex-col h-full' : 'w-full'}>
                    {stepContent}
                </div>
            </main>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mx-auto mb-4 w-full max-w-4xl rounded-r-lg">
                    <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}
