'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LearnHeroSection from '../../components/learn-skill/LearnHeroSection';
import GPAcademyCard from '../../components/learn-skill/GPAcademyCard';

// Dynamic imports with correct paths
const LearningFeatures = dynamic(() => import('../../components/learn-skill/LearningFeatures'), {
  loading: () => (
    <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl mb-24"></div>
  ),
  ssr: false
});

const Footer = dynamic(() => import('../../components/shared/Footer'), {
  loading: () => (
    <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>
  ),
  ssr: false
});

export default function LearnSkillPage() {
  // ✅ REMOVED: All auth-related code - page is now public

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-optimized-bounce" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-optimized-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14 relative z-10">
        {/* Hero Section */}
        <LearnHeroSection />

        {/* GP Academy Feature Card */}
        <GPAcademyCard />

        {/* Learning Features Section */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl mb-24"></div>}>
          <LearningFeatures />
        </Suspense>

        {/* Footer */}
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
