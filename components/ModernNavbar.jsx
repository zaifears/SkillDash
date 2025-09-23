'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthStatus from './AuthStatus';

const ModernNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Discover', href: '/discover', hasIcon: true },
    { name: 'Learn Skills', href: '/learn-skill', hasIcon: false },
    { name: 'Resume Feedback', href: '/resume-feedback', hasIcon: true },
    { name: 'Opportunities', href: '/opportunities', hasIcon: false },
    { name: 'About Us', href: '/about-us', hasIcon: false },
  ];

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* ✅ FIXED: Reduced spacer to match actual visual navbar position */}
      <div className="h-24"></div>
      
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isScrolled ? 'top-2' : 'top-4'
      } w-full max-w-6xl px-4`}>
        
        {/* Main Navbar Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-xl px-6 py-4">
          
          <div className="flex items-center justify-between">
            
            {/* Logo - Always show SkillDash text */}
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

            {/* Right Side - Always show Join + Menu on mobile */}
            <div className="flex items-center gap-3">
              
              {/* Desktop Auth Status */}
              <div className="hidden lg:flex">
                <AuthStatus />
              </div>

              {/* Mobile - Always show Join button + Menu */}
              <div className="lg:hidden flex items-center gap-2">
                <Link
                  href="/auth"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Join
                </Link>
                <MobileMenuButton navItems={navItems} pathname={pathname} />
              </div>
              
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

// Mobile Menu Button Component
const MobileMenuButton = ({ navItems, pathname }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href) => pathname === href;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

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
          }`} />
          <div className={`w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-1' : ''
          }`} />
        </div>
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 min-w-[200px] z-60">
          <div className="flex flex-col gap-1">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernNavbar;
