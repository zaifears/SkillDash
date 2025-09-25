'use client';

import React, { Suspense } from 'react';
import TestInterestSection from '../../components/learn-skill/TestInterestSection';
import GPAcademyCard from '../../components/learn-skill/GPAcademyCard';
// If Footer is a client component just import directly:
import Footer from '../../components/shared/Footer';
// If you really need to use next/dynamic, drop ssr: false and ONLY use loading:

export default function LearnSkillPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
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
