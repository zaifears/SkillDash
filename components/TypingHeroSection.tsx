import React from 'react';
import Link from 'next/link';
import TypingAnimation from './TypingAnimation';

const TypingHeroSection = () => {
  return (
    <section className="relative z-10 container mx-auto px-6 pt-20 pb-16 text-center">
      {/* Main Title - Fixed for both light and dark modes */}
      <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6 leading-tight py-2">
        Bridge the Skill Gap
      </h1>
      
      {/* Description - Fixed contrast for both modes */}
      <p className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
        From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
      </p>

      {/* CTA Button - Same for both modes */}
      <div className="relative inline-block mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-75" />
        <Link
          href="/discover"
          className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300 inline-flex items-center gap-3"
        >
          Discover your talent with SkillDash AI
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Fixed typing animation section */}
      <div className="relative">
        {/* Background glow - visible in both modes */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl rounded-2xl" />
        
        {/* Container with better contrast */}
        <div className="relative bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl py-8 px-6 border border-gray-300/30 dark:border-slate-700/30">
          <div className="flex items-center justify-center gap-4">
            {/* Left side text - Fixed contrast */}
            <span className="text-xl md:text-3xl text-gray-700 dark:text-slate-300 font-light">
              Unlock your
            </span>
            
            {/* Right side - Typing animation */}
            <div className="text-xl md:text-3xl lg:text-4xl font-bold">
              <TypingAnimation />
            </div>
          </div>
          
          {/* Subtitle - Fixed contrast */}
          <p className="text-sm md:text-base text-gray-600 dark:text-slate-400 mt-4 max-w-md mx-auto">
            Let AI discover your hidden potential
          </p>
        </div>
      </div>
    </section>
  );
};

export default TypingHeroSection;
