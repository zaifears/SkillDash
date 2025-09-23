"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import OptimizedImage from './shared/OptimizedImage'
import AuthStatus from './AuthStatus'

const ModernNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

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
    { name: 'About Us', href: '/about-us', hasIcon: false },
  ]

  const isActive = (href) => pathname === href

  return (
    <>
      {/* Spacer for the fixed navbar */}
      <div className="h-20"></div>
      <nav className="fixed top-4 left-4 right-4 z-50 transition-all duration-300" style={{
        top: isScrolled ? '8px' : '16px'
      }}>
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg px-4 py-3 lg:px-8 lg:py-3">
          <div className="flex items-center justify-between lg:justify-start lg:gap-6">
            
            {/* Logo - Always visible with both icon and text */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
            >
              <OptimizedImage
                src="/skilldash-logo.png"
                alt="SkillDash"
                width={28}
                height={28}
                className="flex-shrink-0"
                priority={true}
                sizes="28px"
              />
              <span className="block">SkillDash</span>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.hasIcon && (
                    <OptimizedImage
                      src="/homepage/ai-icon.png"
                      alt=""
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                      sizes="16px"
                    />
                  )}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Auth + Hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              {/* Auth Status - Always visible on mobile */}
              <div className="scale-90">
                <AuthStatus />
              </div>
              
              {/* Mobile Menu Button */}
              <MobileMenu navItems={navItems} pathname={pathname} />
            </div>

            {/* Desktop Auth Status */}
            <div className="hidden lg:flex items-center">
              <AuthStatus />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

// Mobile Menu Component
const MobileMenu = ({ navItems, pathname }) => {
  const [isOpen, setIsOpen] = useState(false)
  const isActive = (href) => pathname === href

  // Close menu when clicking outside - but without backdrop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative mobile-menu-container">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : 'mb-1'}`}></div>
          <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
        </div>
      </button>

      {/* Mobile dropdown - NO BACKDROP */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 min-w-[240px] max-w-[280px] z-60">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.hasIcon && (
                  <OptimizedImage
                    src="/homepage/ai-icon.png"
                    alt=""
                    width={20}
                    height={20}
                    className="flex-shrink-0"
                    sizes="20px"
                  />
                )}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModernNavbar
