import React, { Suspense, lazy } from 'react';
import TypingHeroSection from '../components/TypingHeroSection';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import LoadingSpinner from '../components/LoadingSpinner';

// Lazy load heavy sections
const ContentSections = lazy(() => import('../components/ContentSections'));

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
      
      {/* ✅ TOP SECTION: Light background with transparent navbar area */}
      <div className="relative bg-white dark:bg-gray-900 transition-colors duration-300">
        
        {/* ✅ NAVBAR TRANSPARENT ZONE - This prevents background showing through navbar */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-transparent z-40"></div>
        
        {/* ✅ Floating Transparent Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 dark:bg-blue-400/10 rounded-full animate-optimized-bounce"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/5 dark:bg-purple-400/10 rounded-full animate-optimized-bounce" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-96 left-1/4 w-20 h-20 bg-indigo-500/5 dark:bg-indigo-400/10 rounded-full animate-optimized-bounce" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-80 right-1/3 w-28 h-28 bg-cyan-500/5 dark:bg-cyan-400/10 rounded-full animate-optimized-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-60 left-1/2 w-16 h-16 bg-pink-500/5 dark:bg-pink-400/10 rounded-full animate-optimized-bounce" style={{animationDelay: '3s'}}></div>
        </div>
        
        {/* Hero Section */}
        <div className="relative z-10">
          <TypingHeroSection />
        </div>
        
        {/* Core Features Section */}
        <div className="relative z-10">
          <CoreFeaturesSection />
        </div>
        
      </div>
      
      {/* ✅ GRADIENT SECTION: Starts from "Your Path to Success" */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* Background decorations for gradient section */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content Sections (Your Path to Success onwards) */}
        <div className="relative z-10">
          <Suspense fallback={<LoadingSpinner />}>
            <ContentSections />
          </Suspense>
        </div>
        
      </div>
      
    </div>
  );
}
