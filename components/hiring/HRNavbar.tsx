'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { hrAuth } from '@/lib/firebaseHR';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

export default function HRNavbar() {
  const [hrUser, setHrUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!hrAuth) return;

    const unsubscribe = onAuthStateChanged(hrAuth, (user) => {
      setHrUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (hrAuth) {
      try {
        await signOut(hrAuth);
        router.push('/hr/auth');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  // Only show Dashboard and Profile in navbar
  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Profile', href: '/hr/profile' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 bg-slate-900 border-b border-slate-700 ${
        isScrolled ? 'shadow-lg shadow-slate-900/50' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-purple-400 transition-colors"
          >
            <Image
              src="/skilldash-logo.png"
              alt="SkillDash"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span>SkillDash</span>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-600 text-white rounded-md">
              HR
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isExternalLink = item.href.startsWith('http');
              const isActiveLink = !isExternalLink && isActive(item.href);
              
              if (isExternalLink) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-sm font-medium transition-colors rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    {item.name}
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActiveLink
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side - User Info & Logout */}
          <div className="flex items-center gap-4">
            {hrUser && (
              <>
                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    {hrUser.displayName?.charAt(0).toUpperCase() || hrUser.email?.charAt(0).toUpperCase() || 'H'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {hrUser.displayName || 'HR Personnel'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {hrUser.email}
                    </span>
                  </div>
                </div>

                {/* Logout Button - Desktop */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && hrUser && (
          <div className="md:hidden py-4 border-t border-slate-700">
            {/* User Info - Mobile */}
            <div className="flex items-center gap-3 px-3 py-3 mb-3 rounded-lg bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {hrUser.displayName?.charAt(0).toUpperCase() || hrUser.email?.charAt(0).toUpperCase() || 'H'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {hrUser.displayName || 'HR Personnel'}
                </span>
                <span className="text-xs text-slate-400">
                  {hrUser.email}
                </span>
              </div>
            </div>

            {/* Nav Links - Mobile */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Logout - Mobile */}
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
