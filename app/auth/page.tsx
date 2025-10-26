"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, signUpWithEmailPasswordAndProfile, googleProvider, githubProvider, signInWithSocialProviderAndCreateProfile, signInAsGuest } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword, sanitizeError, rateLimit } from '../../lib/authUtils'
import OptimizedImage from '../../components/shared/OptimizedImage'
import AuthForm from '../../components/AuthForm'
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
  const router = useRouter()

  useEffect(() => {
    // Handle redirect message
    const msg = sessionStorage.getItem('redirectMessage')
    if (msg) {
      setRedirectMessage(msg)
      sessionStorage.removeItem('redirectMessage')
    }

    // Secure auth state management
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
    setError('') // Clear error on input change
  }, [])

  // Guest login handler
  const handleGuestLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await signInAsGuest()
      setMessage('Signed in as Guest! Welcome to SkillDash.')
    } catch (err: any) {
      setError(sanitizeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    // Rate limiting
    if (!rateLimit(`signup:${formData.email}`)) {
      setError('Too many signup attempts. Please try again later.')
      return
    }

    // Client-side validation
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
    } catch (err: any) {
      setError(sanitizeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    // Rate limiting
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-slate-800/90 p-8 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
        
        <div className="text-center">
          {/* OPTIMIZED: Replaced img tag with OptimizedImage component */}
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

<<<<<<< Updated upstream
        {/* GPFutureMaker Badge - Only above guest login */}
        <div className="relative">
          <div className="absolute -top-3 right-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
            GPFutureMaker
          </div>
          
          {/* Guest Login Button */}
          <div className="pt-4">
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-orange-300 dark:border-orange-600 text-sm font-medium rounded-lg text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <span className="text-orange-500 text-lg">👤</span>
              </span>
              {isLoading ? 'Signing in...' : 'Continue as Guest'}
            </button>
            
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Quick access to explore all features
            </p>
          </div>
=======
        {/* 🆕 EMAIL VERIFICATION BONUS NOTICE - Only show after successful signup */}
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
                    💡 <strong>Note:</strong> Social login users (Google/GitHub) and guests receive coins immediately!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Login Button */}
        <div className="pt-4">
          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-orange-300 dark:border-orange-600 text-sm font-medium rounded-lg text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <span className="text-orange-500 text-lg">👤</span>
            </span>
            {isLoading ? 'Signing in...' : 'Continue as Guest'}
          </button>
          
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Quick access to explore all features + instant 5 coins 🪙
          </p>
>>>>>>> Stashed changes
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 dark:bg-slate-800/90 text-gray-500 dark:text-gray-400">OR</span>
          </div>
        </div>

        {/* Redirect Message */}
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

        <AuthForm
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
