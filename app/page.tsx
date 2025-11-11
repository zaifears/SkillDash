import React, { Suspense, lazy } from 'react';
import { Metadata } from 'next';
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

// ✅ NEW: Custom metadata for homepage
export const metadata: Metadata = {
  title: 'SkillDash - AI Gateway for Career Readiness',
  description: "Unlock your potential with AI-powered skill discovery, personalized learning, and career opportunities designed for Bangladesh's youth.",
  openGraph: {
    title: 'SkillDash - AI Gateway for Career Readiness',
    description: "Unlock your potential with AI-powered skill discovery, personalized learning, and career opportunities designed for Bangladesh's youth.",
    url: 'https://skilldash.live',
    type: 'website',
    images: [
      {
        url: '/og/og-image.jpg', // ✅ Using your custom homepage OG image
        width: 1200,
        height: 630,
        alt: 'SkillDash - AI-powered career platform for Bangladesh youth'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillDash - AI Gateway for Career Readiness',
    description: "Unlock your potential with AI-powered skill discovery and personalized learning",
    images: ['/og/og-image.jpg']
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      
      {/* ✅ TOP SECTION: Light background with transparent navbar area */}
      <div className="relative bg-white dark:bg-gray-900 transition-colors duration-300 flex-1">
        
        {/* ✅ NAVBAR TRANSPARENT ZONE - This prevents background showing through navbar */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-transparent z-40"></div>
        
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
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* Optimized background decorations */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/8 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500/8 rounded-full blur-2xl opacity-50"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/4 rounded-full blur-3xl opacity-30"></div>
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
