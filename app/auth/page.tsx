"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, signUpWithEmailPasswordAndProfile, googleProvider, githubProvider, signInWithSocialProviderAndCreateProfile } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword, sanitizeError, rateLimit } from '../../lib/authUtils'
import OptimizedImage from '../../components/shared/OptimizedImage'
import SocialAuth from '../../components/SocialAuth'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    status: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null)
  const [showSignupSuccess, setShowSignupSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const msg = sessionStorage.getItem('redirectMessage')
    if (msg) {
      setRedirectMessage(msg)
      sessionStorage.removeItem('redirectMessage')
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/profile'
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setShowSignupSuccess(false)
  }, [])

  const handleSignUp = async () => {
    if (!rateLimit(`signup:${formData.email}`)) {
      setError('Too many signup attempts. Please try again later.')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formData.name?.trim() || formData.name.length < 2) {
      setError('Please enter a valid name (at least 2 characters).')
      return
    }

    setIsLoading(true)
    setError('')
    setShowSignupSuccess(false)

    try {
      const profileData = {
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        age: formData.age ? Math.max(13, Math.min(100, parseInt(formData.age, 10))) : null,
        status: formData.status,
        phone: formData.phone?.trim()
      }

      await signUpWithEmailPasswordAndProfile(profileData, formData.password)
      setMessage('Account created! Please check your email for verification.')
      setShowSignupSuccess(true)
    } catch (err: any) {
      setError(sanitizeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!rateLimit(`signin:${formData.email}`)) {
      setError('Too many login attempts. Please try again later.')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    setError('')
    setShowSignupSuccess(false)

    try {
      await signInWithEmailAndPassword(auth, formData.email.trim().toLowerCase(), formData.password)
    } catch (err: any) {
      setError(sanitizeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!rateLimit('google:signin')) {
      setError('Too many attempts. Please try again later.')
      return
    }

    setIsLoading(true)
    setError('')
    setShowSignupSuccess(false)

    try {
      await signInWithSocialProviderAndCreateProfile(googleProvider)
    } catch (err: any) {
      setError(sanitizeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    if (!rateLimit('github:signin')) {
      setError('Too many attempts. Please try again later.')
      return
    }

    setIsLoading(true)
    setError('')
    setShowSignupSuccess(false)

    try {
      await signInWithSocialProviderAndCreateProfile(githubProvider)
    } catch (err: any) {
      setError(sanitizeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    isSignUp ? handleSignUp() : handleSignIn()
  }

  return (
    <div className="hero-background-container min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{
      backgroundImage: 'url(/hero-background.png)',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
    }}>
      {/* Dark overlay for light mode and gradient for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/60 dark:from-black/70 dark:via-black/60 dark:to-black/50 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-slate-800/90 p-8 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 relative z-10">
        
        <div className="text-center">
          <OptimizedImage
            src="/skilldash-logo.png"
            alt="SkillDash Logo"
            width={64}
            height={64}
            className="mx-auto mb-4"
            priority={true}
            sizes="64px"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Join SkillDash to start your journey.' : 'Sign in to access your dashboard.'}
          </p>
        </div>

        {showSignupSuccess && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎉</span>
              </div>
              <div className="flex-1 text-sm">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  Welcome to SkillDash! 
                </h4>
                <div className="text-green-700 dark:text-green-400 space-y-2">
                  <p className="flex items-center gap-2">
                    <span>📧</span>
                    <span><strong>Step 1:</strong> Check your email and click the verification link</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🪙</span>
                    <span><strong>Step 2:</strong> After verification, your 5 welcome coins may take up to 5 minutes to appear</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>🔄</span>
                    <span><strong>Step 3:</strong> Refresh the page if coins don't appear after verification</span>
                  </p>
                </div>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                  <p className="text-blue-800 dark:text-blue-300 text-xs font-medium">
                    💡 <strong>Note:</strong> Social login users (Google/GitHub) receive coins immediately!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {redirectMessage && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 mb-4 rounded-md border border-blue-200 dark:border-blue-700">
            <p className="text-blue-700 dark:text-blue-300 text-sm text-center">{redirectMessage}</p>
          </div>
        )}

        <SocialAuth 
          handleGoogleSignIn={handleGoogleSignIn}
          handleGitHubSignIn={handleGitHubSignIn}
          isLoading={isLoading}
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 dark:bg-slate-800/90 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>

        <AuthFormWithInlineNotice
          isSignUp={isSignUp}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          message={message}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
              setMessage('')
              setShowSignupSuccess(false)
            }}
            className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  )
}

// Form Component (unchanged)
function AuthFormWithInlineNotice({ isSignUp, formData, handleInputChange, handleSubmit, isLoading, error, message }: any) {
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {isSignUp && (
          <>
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Full Name *"
              />
            </div>
            
            <div className="flex space-x-4">
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
              />
              <input
                id="age"
                name="age"
                type="number"
                min="13"
                max="100"
                value={formData.age}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                placeholder="Age"
              />
            </div>

            <div>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
              >
                <option value="">Select Your Status *</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
                <option value="Job">Job</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        )}

        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
            placeholder="Email Address *"
          />
        </div>

        <div>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
            placeholder="Password *"
          />
        </div>

        {isSignUp && (
          <div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password *"
            />
          </div>
        )}

        {isSignUp && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700/50 mt-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <span className="text-xl">🎉</span>
              </div>
              <div className="flex-1 text-sm">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  Welcome to SkillDash! 
                </h4>
                <div className="text-green-700 dark:text-green-400 space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5">📧</span>
                    <span><strong>Step 1:</strong> Check your email and click the verification link</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5">🪙</span>
                    <span><strong>Step 2:</strong> After verification, your 5 welcome coins may take up to 5 minutes to appear</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-0.5">🔄</span>
                    <span><strong>Step 3:</strong> Refresh the page if coins don't appear after verification</span>
                  </p>
                </div>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                  <p className="text-blue-800 dark:text-blue-300 text-xs font-medium">
                    💡 <strong>Note:</strong> Social login users (Google/GitHub) receive coins immediately!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-700">
          <p className="text-red-700 dark:text-red-300 text-sm text-center">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-700">
          <p className="text-green-700 dark:text-green-300 text-sm text-center">{message}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </span>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </div>
    </form>
  )
}
