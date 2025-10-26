"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import AuthStatus from './AuthStatus'
import { useAuth } from '../contexts/AuthContext'
import CoinDisplay from './ui/CoinDisplay'

const ModernNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Discover', href: '/discover', hasIcon: true },
    { name: 'Learn Skills', href: '/learn-skill', hasIcon: false },
    { name: 'Resume Feedback', href: '/resume-feedback', hasIcon: true },
    { name: 'Opportunities', href: '/opportunities', hasIcon: false }
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'top-2' : 'top-4'
      } w-full max-w-6xl px-4`}>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-full shadow-xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              <Image
                src="/skilldash-logo.png"
                alt="SkillDash"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span>SkillDash</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.hasIcon && (
                    <Image
                      src="/homepage/ai-icon.png"
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 flex-shrink-0 object-contain"
                    />
                  )}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side - Coin Display and Auth Status */}
            <div className="flex items-center gap-3">
              {/* Desktop Coin Display - Simplified with automatic redirect */}
              <div className="hidden md:flex group">
                <CoinDisplay 
                  className="flex transition-all duration-200 hover:scale-105" 
                  size="default"
                />
              </div>

              {/* Desktop Auth Status */}
              <div className="hidden lg:flex">
                <AuthStatus />
              </div>

              {/* Mobile - Clean minimal design */}
              <div className="lg:hidden flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hi, {user.displayName?.split(' ')[0] || 'User'}!
                    </span>
                    <MobileMenuButton navItems={navItems} pathname={pathname} />
                  </div>
                ) : (
                  <>
                    <Link href="/auth" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                      Join
                    </Link>
                    <MobileMenuButton navItems={navItems} pathname={pathname} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

// Mobile Menu Button Component with Optimized Coin Display
const MobileMenuButton = ({ navItems, pathname }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  
  const isActive = (href) => pathname === href

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="relative mobile-menu-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-1' : 'mb-1'
          }`}></div>
          <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-1' : ''
          }`}></div>
        </div>
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-[280px] z-60 overflow-hidden">
          
          {/* Modern Header - User Info & Optimized Coins */}
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Welcome back, {user.displayName?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <div className="flex items-center group">
                  <CoinDisplay 
                    className="flex transition-all duration-200 group-hover:scale-105" 
                    showLabel={false} 
                    size="small"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Section */}
          <div className="p-4">
            
            {/* Priority Items - Full Width with BIGGER TEXT */}
            <div className="space-y-2 mb-4">
              <Link
                href="/discover"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-center gap-2.5 w-full px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActive('/discover')
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Image
                  src="/homepage/ai-icon.png"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 flex-shrink-0 object-contain"
                />
                <span>Discover</span>
              </Link>
              
              <Link
                href="/resume-feedback"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-center gap-2.5 w-full px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                  isActive('/resume-feedback')
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Image
                  src="/homepage/ai-icon.png"
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5 flex-shrink-0 object-contain"
                />
                <span>Resume Feedback</span>
              </Link>
            </div>

            {/* Main Divider */}
            <div className="border-t border-gray-300 dark:border-gray-600 mb-4"></div>

            {/* Two-Column Section */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/learn-skill"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-center px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive('/learn-skill')
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Learn Skills
                </Link>
                
                <Link
                  href="/opportunities"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-center px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive('/opportunities')
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  Opportunities
                </Link>
              </div>
              
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center px-3 py-3 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Profile
                </Link>
              )}
            </div>

            {/* Logout Section */}
            {user ? (
              <>
                <div className="border-t border-gray-300 dark:border-gray-600 mb-4"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-gray-300 dark:border-gray-600 mb-4"></div>
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Join SkillDash</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModernNavbar
