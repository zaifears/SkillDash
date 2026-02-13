'use client';

import React, { Suspense, lazy, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TypingHeroSection from '../components/TypingHeroSection';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '@/components/shared/Footer';

// Optimized lazy loading with better error handling
const ContentSections = lazy(() => 
  import('../components/ContentSections').then(module => ({
    default: module.default
  })).catch(() => ({
    default: () => <div className="text-center py-20">Content temporarily unavailable</div>
  }))
);

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect HR domain to HR dashboard
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'hr.skilldash.live' || (hostname === 'localhost' && window.location.pathname === '/')) {
        // Check if we're on HR domain
        if (hostname === 'hr.skilldash.live') {
          router.replace('/hr');
        }
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen overflow-hidden flex flex-col pb-20 lg:pb-0">
      
      {/* ✅ TOP SECTION: Light background with transparent navbar area */}
      <div className="relative bg-white dark:bg-gray-900 transition-colors duration-300 flex-1">
        
        {/* ✅ Optimized Floating Circles - Reduced for performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/3 dark:bg-blue-400/6 rounded-full animate-optimized-bounce"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/3 dark:bg-purple-400/6 rounded-full animate-optimized-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-96 left-1/4 w-20 h-20 bg-indigo-500/3 dark:bg-indigo-400/6 rounded-full animate-optimized-bounce" style={{animationDelay: '4s'}}></div>
        </div>
        
        {/* Hero Section */}
        <section className="relative z-10" role="banner">
          <TypingHeroSection />
        </section>
        
        {/* Core Features Section */}
        <section className="relative z-10">
          <CoreFeaturesSection />
        </section>
        
      </div>
      
      {/* ✅ GRADIENT SECTION: Starts from "Your Path to Success" */}
      <div className="relative bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        
        {/* Optimized background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
        </div>
        
        {/* Content Sections with improved loading */}
        <section className="relative z-10">
          <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center" role="status" aria-label="Loading content">
              <LoadingSpinner />
              <span className="sr-only">Loading additional content...</span>
            </div>
          }>
            <ContentSections />
          </Suspense>
        </section>
        
      </div>
      
      {/* ✅ FOOTER SECTION */}
      <Footer />
      
    </div>
  );
}
