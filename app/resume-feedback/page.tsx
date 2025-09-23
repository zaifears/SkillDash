"use client"

import React, { useState, useRef, FormEvent, useEffect, useMemo, useCallback, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import OptimizedImage from '../../components/shared/OptimizedImage'

// === Type Definitions ===
type Step = 'industry' | 'resume' | 'job-description' | 'chat'

interface Message {
  role: 'user' | 'assistant'
  content: string | React.ReactNode
}

interface ResumeFeedback {
  summary: string
  strengths: {
    technical: string[]
    soft: string[]
    experience: string[]
    education: string[]
  }
  weaknesses: {
    technical: string[]
    soft: string[]
    experience: string[]
    education: string[]
  }
  recommendations: {
    skillsToDevelop: string[]
    experienceToGain: string[]
    formattingTips: string[]
    actionableSteps: string[]
  }
  additionalSkillRequired: string[]
  suggestedCourses: Array<{
    title: string
    description: string
    priority: string
  }>
  confidenceScore: number
  atsScore: number // NEW: ATS Score
  marketInsights: string[]
}

// === Optimized Loading Screen ===
const AuthLoadingScreen = () => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-black items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
  </div>
)

// === Your Original Step Components ===
const IndustryStep = memo(({ industryPreference, setIndustryPreference, onNext, onKeyDown }: {
  industryPreference: string
  setIndustryPreference: (value: string) => void
  onNext: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}) => (
  <div className="max-w-2xl mx-auto space-y-6">
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
        placeholder="e.g., Software Development, Digital Marketing, Finance..."
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        maxLength={100}
        autoFocus
      />
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-8 rounded-lg hover:shadow-lg transition-all"
        >
          Next: Resume
        </button>
      </div>
    </div>
  </div>
))

const ResumeStep = memo(({ resumeText, setResumeText, onNext, onBack, onKeyDown }: {
  resumeText: string
  setResumeText: (value: string) => void
  onNext: () => void
  onBack: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
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
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
        >
          Next: Job Description
        </button>
      </div>
    </div>
  </div>
))

const JobDescriptionStep = memo(({ jobDescription, setJobDescription, onNext, onSkip, onBack, onKeyDown }: {
  jobDescription: string
  setJobDescription: (value: string) => void
  onNext: () => void
  onSkip: () => void
  onBack: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
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
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Back
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          Skip & Analyze
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
        >
          Analyze Resume
        </button>
      </div>
    </div>
  </div>
))

// Set display names for better debugging
IndustryStep.displayName = 'IndustryStep'
ResumeStep.displayName = 'ResumeStep'
JobDescriptionStep.displayName = 'JobDescriptionStep'

export default function ResumeFeedbackPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // === State Management ===
  const [currentStep, setCurrentStep] = useState<Step>('industry')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [industryPreference, setIndustryPreference] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [userInput, setUserInput] = useState('')

  // Store the initial feedback for context
  const [initialFeedback, setInitialFeedback] = useState<ResumeFeedback | null>(null)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Memoized auth redirect effect
  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to use the AI Resume Feedback feature. We require login for fair usage.')
      sessionStorage.setItem('redirectAfterLogin', '/resume-feedback')
      router.push('/auth')
    }
  }, [user, loading, router])

  // Optimized scroll effect - only runs when necessary
  useEffect(() => {
    if (currentStep === 'chat' && messages.length > 0) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [messages, isLoading, currentStep])

  // Optimized textarea resize
  useEffect(() => {
    if (currentStep === 'chat' && textareaRef.current && userInput) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [userInput, currentStep])

  // === Memoized handlers ===
  const initializeConversation = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: 'Perfect! I have all the information I need. I\'ll analyze your resume now and provide detailed feedback. After that, feel free to ask any follow-up questions!'
    }])
    setCurrentStep('chat')
  }, [])

  const handleIndustryNext = useCallback(() => {
    if (!industryPreference.trim()) {
      setError('Please enter your preferred industry')
      return
    }
    setError('')
    setCurrentStep('resume')
  }, [industryPreference])

  const handleResumeNext = useCallback(() => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text')
      return
    }
    if (resumeText.trim().length < 100) {
      setError('Resume text seems too short. Please provide a complete resume.')
      return
    }
    setError('')
    setCurrentStep('job-description')
  }, [resumeText])

  // === API Call and Feedback Display ===
  const startAnalysis = useCallback(async (finalJobDescription: string | null) => {
    setIsLoading(true)
    setError('')
    initializeConversation()

    try {
      const requestData = {
        resumeText,
        industryPreference,
        jobDescription: finalJobDescription ? finalJobDescription.trim() : null,
        messages: []
      }

      const response = await fetch('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      displayInitialFeedback(data)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, an error occurred: ${err.message}. Please try again.`
      }])
    } finally {
      setIsLoading(false)
    }
  }, [resumeText, industryPreference, initializeConversation])

  const handleSkipJobDescription = useCallback(() => {
    setJobDescription('')
    startAnalysis(null)
  }, [startAnalysis])

  const handleJobDescriptionNext = useCallback(() => {
    startAnalysis(jobDescription)
  }, [jobDescription, startAnalysis])

  const displayInitialFeedback = useCallback((data: any) => {
    try {
      let parsedFeedback: ResumeFeedback
      
      // Handle both JSON string and direct object responses
      if (typeof data.feedback === 'string') {
        try {
          parsedFeedback = JSON.parse(data.feedback)
        } catch (parseError) {
          // If JSON parsing fails, try to extract JSON from markdown-like text
          const jsonMatch = data.feedback.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsedFeedback = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No valid JSON found in response')
          }
        }
      } else if (typeof data.feedback === 'object') {
        parsedFeedback = data.feedback
      } else {
        throw new Error('Invalid feedback format')
      }

      setInitialFeedback(parsedFeedback)
      
      // ENHANCED: Create properly formatted feedback component with ATS score
      const feedbackComponent = (
        <div className="space-y-6">
          {/* Header with Dual Scores */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Resume Analysis Complete ✅</h3>
              <div className="flex items-center space-x-4">
                {/* Overall Score */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-bold">
                    Overall: {parsedFeedback.confidenceScore}/10
                  </span>
                </div>
                {/* NEW: ATS Score */}
                {parsedFeedback.atsScore && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      parsedFeedback.atsScore >= 8 ? 'bg-green-500' :
                      parsedFeedback.atsScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-bold ${
                      parsedFeedback.atsScore >= 8 ? 'text-green-600 dark:text-green-400' :
                      parsedFeedback.atsScore >= 6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      ATS: {parsedFeedback.atsScore}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{parsedFeedback.summary}</p>
          </div>

          {/* Strengths */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center">
              <span className="mr-2">💪</span> Strengths
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parsedFeedback.strengths).map(([category, items]) => (
                <div key={category}>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 capitalize mb-2">{category}:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {items.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-4 flex items-center">
              <span className="mr-2">🎯</span> Areas for Improvement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parsedFeedback.weaknesses).map(([category, items]) => (
                <div key={category}>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 capitalize mb-2">{category}:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {items.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ENHANCED: Formatting Tips Section */}
          {parsedFeedback.recommendations.formattingTips && parsedFeedback.recommendations.formattingTips.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-700 p-6">
              <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-4 flex items-center">
                <span className="mr-2">🎨</span> ATS & Formatting Optimization
              </h4>
              {parsedFeedback.atsScore && (
                <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">ATS Friendliness Score</span>
                    <span className={`font-bold text-lg ${
                      parsedFeedback.atsScore >= 8 ? 'text-green-600 dark:text-green-400' :
                      parsedFeedback.atsScore >= 6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {parsedFeedback.atsScore}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        parsedFeedback.atsScore >= 8 ? 'bg-green-500' :
                        parsedFeedback.atsScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(parsedFeedback.atsScore / 10) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {parsedFeedback.atsScore >= 8 ? 'Excellent - ATS systems will easily parse your resume' :
                     parsedFeedback.atsScore >= 6 ? 'Good - Some improvements needed for optimal ATS performance' :
                     'Needs Work - ATS systems may struggle to read your resume'}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {parsedFeedback.recommendations.formattingTips.map((tip: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
              <span className="mr-2">📋</span> Actionable Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parsedFeedback.recommendations)
                .filter(([category]) => category !== 'formattingTips') // Exclude formatting tips since they have their own section
                .map(([category, items]) => (
                <div key={category}>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200 capitalize mb-2">
                    {category.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {items.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Courses */}
          {parsedFeedback.suggestedCourses && parsedFeedback.suggestedCourses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4 flex items-center">
                <span className="mr-2">🎓</span> Suggested Courses
              </h4>
              <div className="space-y-3">
                {parsedFeedback.suggestedCourses.map((course, idx) => (
                  <div key={idx} className="border-l-4 border-purple-400 pl-4">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-800 dark:text-gray-200">{course.title}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        course.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        course.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {course.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Insights */}
          {parsedFeedback.marketInsights && parsedFeedback.marketInsights.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-4 flex items-center">
                <span className="mr-2">📊</span> Market Insights
              </h4>
              <ul className="space-y-2">
                {parsedFeedback.marketInsights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.providerInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              {data.providerInfo}
            </div>
          )}
        </div>
      )

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: feedbackComponent
      }])

    } catch (parseError) {
      console.error('Failed to parse feedback:', parseError)
      // Fallback to markdown display
      const formattedFeedback = (
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <ReactMarkdown>{data.feedback}</ReactMarkdown>
          {data.providerInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              {data.providerInfo}
            </div>
          )}
        </div>
      )
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formattedFeedback
      }])
    }
  }, [])

  // === Follow-up Chat Logic ===
  const handleFollowUpSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: userInput }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setError('')
    setUserInput('')

    try {
      const conversationHistory = messages
        .filter(msg => typeof msg.content === 'string')
        .map(msg => ({ role: msg.role, content: msg.content as string }))
      
      conversationHistory.push({ role: 'user', content: userInput })

      const response = await fetch('/api/resume-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          industryPreference,
          jobDescription: jobDescription.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const formattedFeedback = (
        <div className="prose prose-blue dark:prose-invert max-w-none">
          <ReactMarkdown>{data.feedback}</ReactMarkdown>
          {data.providerInfo && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              {data.providerInfo}
            </div>
          )}
        </div>
      )
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formattedFeedback
      }])
    } catch (err: any) {
      console.error('Follow-up error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, an error occurred: ${err.message}`
      }])
    } finally {
      setIsLoading(false)
    }
  }, [userInput, isLoading, messages, industryPreference, jobDescription])

  const resetFlow = useCallback(() => {
    setCurrentStep('industry')
    setMessages([])
    setIndustryPreference('')
    setResumeText('')
    setJobDescription('')
    setUserInput('')
    setError('')
    setInitialFeedback(null)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (currentStep === 'industry') {
        handleIndustryNext()
      } else if (currentStep === 'resume') {
        handleResumeNext()
      } else if (currentStep === 'job-description') {
        handleJobDescriptionNext()
      } else if (currentStep === 'chat') {
        formRef.current?.requestSubmit()
      }
    }
  }, [currentStep, handleIndustryNext, handleResumeNext, handleJobDescriptionNext])

  // === Render Step Content ===
  const renderStepContent = useMemo(() => {
    switch (currentStep) {
      case 'industry':
        return (
          <IndustryStep
            industryPreference={industryPreference}
            setIndustryPreference={setIndustryPreference}
            onNext={handleIndustryNext}
            onKeyDown={handleKeyDown}
          />
        )
      case 'resume':
        return (
          <ResumeStep
            resumeText={resumeText}
            setResumeText={setResumeText}
            onNext={handleResumeNext}
            onBack={() => setCurrentStep('industry')}
            onKeyDown={handleKeyDown}
          />
        )
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
        )
      case 'chat':
        return (
          <div className="max-w-4xl mx-auto">
            {/* Messages */}
            <div className="space-y-4 mb-8">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0">
                      {msg.role === 'assistant' ? (
                        <OptimizedImage
                          src="/skilldash-logo.png"
                          alt="SkillDash AI Avatar"
                          width={40}
                          height={40}
                          className="rounded-full shadow-md object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">You</span>
                        </div>
                      )}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {typeof msg.content === 'string' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <OptimizedImage
                      src="/skilldash-logo.png"
                      alt="SkillDash AI Avatar"
                      width={40}
                      height={40}
                      className="rounded-full shadow-md object-cover"
                      sizes="40px"
                    />
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form ref={formRef} onSubmit={handleFollowUpSubmit} className="sticky bottom-4 bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2">
              <div className="flex items-center gap-2">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleFollowUpSubmit(e as any)
                    }
                  }}
                  placeholder="Ask follow-up questions about your feedback..."
                  className="flex-1 px-4 py-3 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 resize-none focus:outline-none max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !userInput.trim()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )
      default:
        return null
    }
  }, [currentStep, industryPreference, resumeText, jobDescription, userInput, messages, isLoading, handleIndustryNext, handleResumeNext, handleJobDescriptionNext, handleSkipJobDescription, handleKeyDown, handleFollowUpSubmit])

  if (loading || !user) return <AuthLoadingScreen />

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black font-sans">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {renderStepContent}
        
        {currentStep === 'chat' && (
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 space-x-2">
              <span>Industry: <span className="font-medium">{industryPreference}</span></span>
              {jobDescription && <span>• Job-specific feedback</span>}
            </div>
            <button
              type="button"
              onClick={resetFlow}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Start New Analysis
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
