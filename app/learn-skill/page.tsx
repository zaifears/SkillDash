'use client';

import React, { Suspense } from 'react';
import TestInterestSection from '../../components/learn-skill/TestInterestSection';
import GPAcademyCard from '../../components/learn-skill/GPAcademyCard';
// If Footer is a client component just import directly:
import Footer from '../../components/shared/Footer';
// If you really need to use next/dynamic, drop ssr: false and ONLY use loading:

export default function LearnSkillPage() {
  return (
    <div className="hero-background-container w-full min-h-screen overflow-x-hidden relative" style={{
      backgroundImage: 'url(/hero-background.png)',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
    }}>
      {/* Dark overlay for light mode and gradient for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/60 dark:from-black/70 dark:via-black/60 dark:to-black/50 pointer-events-none"></div>

      {/* background */}
      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14 relative z-10">
        <TestInterestSection />
        <GPAcademyCard />
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
