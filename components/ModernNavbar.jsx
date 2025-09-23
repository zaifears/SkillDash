"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthStatus from './AuthStatus'
import { useAuth } from '../contexts/AuthContext' // Add this import

const ModernNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth() // Get auth state

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Discover', href: '/discover', hasIcon: true },
    { name: 'Learn Skills', href: '/learn-skill', hasIcon: false },
    { name: 'Resume Feedback', href: '/resume-feedback', hasIcon: true },
    { name: 'Opportunities', href: '/opportunities', hasIcon: false },
    { name: 'About Us', href: '/about-us', hasIcon: false }
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      <div className="h-20"></div>
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'top-2' : 'top-4'
      } w-full max-w-6xl px-4`}>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-full shadow-xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
              <img src="/skilldash-logo.png" alt="SkillDash" className="h-8 w-8" />
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
                    <img src="/homepage/ai-icon.png" alt="" className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side - Auth Status */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth Status */}
              <div className="hidden lg:flex">
                <AuthStatus />
              </div>

              {/* FIXED: Mobile - Show user info or Join based on auth status */}
              <div className="lg:hidden flex items-center gap-2">
                {user ? (
                  // User is logged in - show greeting
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hi, {user.displayName?.split(' ')[0] || 'User'}!
                    </span>
                    <MobileMenuButton navItems={navItems} pathname={pathname} />
                  </div>
                ) : (
                  // User not logged in - show Join button
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

// Mobile Menu Button Component
const MobileMenuButton = ({ navItems, pathname }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth() // Get auth functions
  
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
        <div className="absolute top-14 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 min-w-[220px] z-60">
          <div className="flex flex-col gap-1">
            {/* Navigation Items */}
            {navItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.hasIcon && (
                  <img src="/homepage/ai-icon.png" alt="" className="h-5 w-5 flex-shrink-0" />
                )}
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Divider if user is logged in */}
            {user && <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>}
            
            {/* Auth Actions */}
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full text-left"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Join SkillDash</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModernNavbar
