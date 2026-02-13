"use client"

import React, { useState, useEffect, useCallback, Component } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, signUpWithEmailPasswordAndProfile, googleProvider, githubProvider, signInWithSocialProviderAndCreateProfile } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import { validateEmail, validatePassword, sanitizeError, rateLimit } from '../../lib/authUtils'
import { humanizeAuthError } from '../../lib/authErrorHandler'
import OptimizedImage from '../../components/shared/OptimizedImage'
import SocialAuth from '../../components/SocialAuth'
import { Eye, EyeOff } from 'lucide-react'
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3'

// Inner component that uses reCAPTCHA
function AuthPageContent() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
  const { executeRecaptcha } = useGoogleReCaptcha()

  // reCAPTCHA verification helper
  const verifyRecaptcha = async (action: string): Promise<boolean> => {
    if (!executeRecaptcha) {
      console.warn('reCAPTCHA not ready yet')
      setError('Security verification loading. Please wait a moment and try again.')
      return false
    }

    try {
      const token = await executeRecaptcha(action)
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      })
      const data = await response.json()
      
      if (!data.success) {
        setError(data.error || 'Security verification failed. Please try again.')
        return false
      }
      return true
    } catch (err) {
      console.error('reCAPTCHA verification error:', err)
      setError('Security verification failed. Please refresh and try again.')
      return false
    }
  }

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

  // Fix reCAPTCHA badge z-index
  useEffect(() => {
    const fixRecaptchaBadge = () => {
      const badge = document.querySelector('.grecaptcha-badge') as HTMLElement
      if (badge) {
        const isMobile = window.innerWidth < 1024
        badge.style.zIndex = isMobile ? '51' : '9999'
        badge.style.bottom = isMobile ? '72px' : '16px'
        badge.style.position = 'fixed'
        badge.style.right = '8px'
      }
    }

    // Run immediately
    fixRecaptchaBadge()

    // Also run on window resize
    const resizeObserver = window.addEventListener('resize', fixRecaptchaBadge)

    // Keep checking for the badge if it's not there yet (Google loads it async)
    const checkInterval = setInterval(fixRecaptchaBadge, 500)
    
    // Clean up after 5 seconds of checking
    const timeout = setTimeout(() => clearInterval(checkInterval), 5000)

    return () => {
      window.removeEventListener('resize', fixRecaptchaBadge)
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [])

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

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('signup')
    if (!isHuman) return

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
      setError(humanizeAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!rateLimit(`signin:${formData.email}`)) {
      setError('Too many login attempts. Please try again later.')
      return
    }

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('signin')
    if (!isHuman) return

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
      setError(humanizeAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!rateLimit('google:signin')) {
      setError('Too many attempts. Please try again later.')
      return
    }

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('google_signin')
    if (!isHuman) return

    setIsLoading(true)
    setError('')
    setShowSignupSuccess(false)
    // ✅ NEW: Give immediate feedback to user
    setMessage('Connecting to Google... If a popup does not appear, check your popup blocker.')

    try {
      // ✅ NEW: Increased to 45 second timeout for slower networks
      const googleSignInPromise = signInWithSocialProviderAndCreateProfile(googleProvider)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Network might be slow or popup blocked.')), 45000)
      )
      
      await Promise.race([googleSignInPromise, timeoutPromise])
    } catch (err: any) {
      setError(humanizeAuthError(err))
      console.error('Google sign-in error:', err)
    } finally {
      setIsLoading(false)
      setMessage('') // Clear message
    }
  }

  const handleGitHubSignIn = async () => {
    if (!rateLimit('github:signin')) {
      setError('Too many attempts. Please try again later.')
      return
    }

    // Verify reCAPTCHA first
    const isHuman = await verifyRecaptcha('github_signin')
    if (!isHuman) return

    setIsLoading(true)
    setError('')
    setShowSignupSuccess(false)

    try {
      await signInWithSocialProviderAndCreateProfile(githubProvider)
    } catch (err: any) {
      setError(humanizeAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email?.trim()) {
      setError('Please enter your email address first.')
      return
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setIsLoading(true)
    setError('')
    setMessage('')
    try {
      await sendPasswordResetEmail(auth, formData.email.trim().toLowerCase())
      setMessage('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      setError(humanizeAuthError(err))
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 pt-20 relative z-0">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main card - centered */}
      <div className="w-full max-w-4xl relative z-10">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          
          {/* 2-column grid: 1 col on mobile, 65/35 split on lg screens */}
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8">
            
            {/* LEFT COLUMN - Form */}
            <div className="flex flex-col justify-center">
              {/* Redirect Message (shown when user is redirected from protected page) */}
              {redirectMessage && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <p className="text-blue-300 text-sm text-center">{redirectMessage}</p>
                </div>
              )}
              
              {/* Sign In View */}
              {!isSignUp && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
                  <p className="text-slate-400 mb-6 text-sm">Sign in to your account</p>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                      <p className="text-green-300 text-sm text-center">{message}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                        className="text-xs text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Log In Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing In...
                        </>
                      ) : (
                        'Log In'
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Sign Up View */}
              {isSignUp && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
                  <p className="text-slate-400 mb-6 text-sm">Join SkillDash today</p>
                  
                  {showSignupSuccess && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">🎉</span>
                        <div className="flex-1 text-xs">
                          <h4 className="font-semibold text-green-300 mb-1">Welcome to SkillDash!</h4>
                          <div className="text-green-200 space-y-1">
                            <p>📧 Check your email and click the verification link</p>
                            <p>🪙 After verification, your 5 welcome coins will appear in ~5 minutes</p>
                            <p>🔄 Refresh the page if coins don't appear after verification</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                      <p className="text-green-300 text-sm text-center">{message}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Full Name & Email in two columns on lg */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-3">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">Full Name</label>
                        <input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your name"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">Email Address</label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    {/* Phone & Age */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">Phone</label>
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(optional)"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">Age</label>
                        <input
                          name="age"
                          type="number"
                          min="13"
                          max="100"
                          value={formData.age}
                          onChange={handleInputChange}
                          placeholder="(optional)"
                          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    {/* Password & Confirm Password in two columns on lg */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-3">
                      {/* Password */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative">
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">Confirm Password</label>
                        <div className="relative">
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sign Up Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>

                  {/* Toggle to Sign In */}
                  <div className="mt-4 text-center">
                    <p className="text-slate-400 text-xs">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(false)
                          setError('')
                          setMessage('')
                          setShowSignupSuccess(false)
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold transition"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT COLUMN - Social Auth (desktop only) */}
            <div className="hidden lg:flex flex-col justify-center gap-6">
              {/* Or Divider */}
              <p className="text-slate-400 text-center font-medium text-sm">or</p>

              {/* Social Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 transition flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={handleGitHubSignIn}
                  disabled={isLoading}
                  className="w-full py-2 px-3 rounded-lg bg-slate-700 text-white font-semibold text-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 transition flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.182.092-.923.35-1.543.636-1.897-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.48C19.138 20.194 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              {/* Another Or Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-slate-600"></div>
                <span className="px-3 text-slate-400 text-xs">or</span>
                <div className="flex-1 border-t border-slate-600"></div>
              </div>

              {/* Show different content based on view */}
              {!isSignUp ? (
                // Sign In View - Show New Here Box
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm font-semibold mb-3">New here?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setMessage('');
                      setShowSignupSuccess(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Create Your Account
                  </button>
                  <p className="text-slate-400 text-xs text-center mt-3">
                    Join thousands learning new skills on SkillDash
                  </p>
                </div>
              ) : (
                // Sign Up View - Show Sign In Link
                <div className="text-center">
                  <p className="text-slate-400 text-xs">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setError('');
                        setMessage('');
                        setShowSignupSuccess(false);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Social Auth - only shown on mobile AND during sign-in */}
          {!isSignUp && (
            <div className="lg:hidden mt-6 pt-6 border-t border-slate-700">
              {/* Or Divider */}
              <p className="text-slate-400 text-center mb-4 font-medium text-sm">or</p>

              {/* Social Auth Component */}
              <SocialAuth 
                handleGoogleSignIn={handleGoogleSignIn}
                handleGitHubSignIn={handleGitHubSignIn}
                isLoading={isLoading}
              />

              {/* Another Or Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-slate-600"></div>
                <span className="px-3 text-slate-400 text-xs">or</span>
                <div className="flex-1 border-t border-slate-600"></div>
              </div>

              {/* New Here Registration Box - Only show on sign in view */}
              {!isSignUp && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm font-semibold mb-3">New here?</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setMessage('');
                      setShowSignupSuccess(false);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Create Your Account
                  </button>
                  <p className="text-slate-400 text-xs text-center mt-3">
                    Join thousands learning new skills on SkillDash
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HR Portal Link */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <a
              href="/opportunities/hiring/auth"
              className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-blue-400 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>HR Portal</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error boundary to catch provider initialization failures
class AuthErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50 max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">
              The authentication page encountered an error. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main component wrapped with reCAPTCHA provider
export default function AuthPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  if (!siteKey) {
    // Fallback if no reCAPTCHA key configured
    return (
      <AuthErrorBoundary>
        <AuthPageContent />
      </AuthErrorBoundary>
    )
  }

  return (
    <AuthErrorBoundary>
      <GoogleReCaptchaProvider
        reCaptchaKey={siteKey}
        scriptProps={{
          async: true,
          defer: true,
          appendTo: 'head',
        }}
      >
        <AuthPageContent />
      </GoogleReCaptchaProvider>
    </AuthErrorBoundary>
  )
}