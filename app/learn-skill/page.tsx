'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import TestInterestSection from '../../components/learn-skill/TestInterestSection';
import GPAcademyCard from '../../components/learn-skill/GPAcademyCard';

const Footer = dynamic(() => import('../../components/shared/Footer'), {
  loading: () => (
    <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>
  ),
  ssr: false
});

export default function LearnSkillPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      {/* Modern Background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full blur-2xl animate-optimized-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 dark:from-emerald-400/20 dark:to-teal-400/20 rounded-full blur-xl animate-optimized-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-pink-400/10 to-rose-400/10 dark:from-pink-400/20 dark:to-rose-400/20 rounded-full blur-xl animate-optimized-bounce" style={{ animationDelay: '4s', animationDuration: '5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10 sm:pt-14 relative z-10">
        {/* HERO: Test Interest Section */}
        <TestInterestSection />

        {/* Modern Recommendation Section */}
        <div className="text-center mb-16 px-6">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 dark:from-emerald-400/30 dark:to-teal-400/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 px-8 py-4 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🎓</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xl">OUR RECOMMENDATIONS</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 bg-clip-text text-transparent mb-6 leading-tight">
            Ready for Structured Learning?
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Take your skills to the next level with our carefully selected learning partners. 
            These industry-recognized courses will help you build professional expertise.
          </p>
        </div>

        {/* GP Academy Feature Card */}
        <GPAcademyCard />

        {/* Footer */}
        <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
