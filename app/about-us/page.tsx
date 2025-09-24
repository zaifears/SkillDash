'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import BouncingBalls from '../../components/shared/BouncingBalls';

// Dynamic imports for better performance
const AboutHero = dynamic(() => import('../../components/AboutHero'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl mb-16"></div>,
  ssr: false
});

const TeamMember = dynamic(() => import('../../components/shared/TeamMember'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>,
  ssr: false
});

const StorySection = dynamic(() => import('../../components/StorySection'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>,
  ssr: false
});

const Footer = dynamic(() => import('../../components/shared/Footer'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>,
  ssr: false
});

// Team data - optimized
const TEAM_MEMBERS = [
  {
    name: 'MD AL Shahoriar Hossain',
    role: 'FINANCE & DATA ANALYTICS LEAD',
    imageUrl: '/about-us/shahoriar.png',
    description: 'A Finance major with a passion for data-driven decision-making. Shahoriar\'s expertise in financial analysis, Excel, and Power BI drives the analytical core of SkillDash, ensuring our skill assessments and learning paths are backed by solid data.',
    contactUrl: 'https://shahoriar.me/contact'
  },
  {
    name: 'Tasnuva Jahan Lamiya',
    role: 'EDUCATION & USER EXPERIENCE LEAD',
    imageUrl: '/about-us/tasnuva.png',
    description: 'With a passion for making learning accessible and enjoyable, Tasnuva\'s experience in online tutoring and instruction shapes the user-centric design of our Skill Courses. Her innovative mindset helps bridge the gap between academic knowledge and practical application.',
    contactUrl: 'https://www.linkedin.com/in/tasnuva-jahan-lamiya'
  },
  {
    name: 'Tazrian Rahman',
    role: 'STRATEGY & COMMUNITY LEAD',
    imageUrl: '/about-us/tazrian.png',
    description: 'Tazrian brings extensive leadership and communication experience from his diverse roles in university clubs and internships. His skills in team management and public relations are vital for building the SkillDash community and forging connections with real-world opportunities.',
    contactUrl: 'https://www.linkedin.com/in/tazrian-rahman-aa6822247'
  }
] as const;

// Gradient classes for team members
const CARD_GRADIENTS = [
  'from-blue-500/10 via-purple-500/5 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/10 dark:to-indigo-500/20',
  'from-pink-500/10 via-rose-500/5 to-purple-500/10 dark:from-pink-500/20 dark:via-rose-500/10 dark:to-purple-500/20',
  'from-violet-500/10 via-sky-500/5 to-cyan-500/10 dark:from-violet-500/20 dark:via-sky-500/10 dark:to-cyan-500/20'
] as const;

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-900 text-gray-800 dark:text-gray-200 pt-40 pb-12 sm:pt-40 sm:pb-24 px-4 relative overflow-hidden">
      
      {/* Bouncing Balls Component */}
      <BouncingBalls variant="dense" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="animate-fade-in-up">
          <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl mb-16"></div>}>
            <AboutHero />
          </Suspense>
        </div>

        {/* Meet the Team Header */}
        <section className="text-center mb-16 md:mb-20">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative inline-block mb-8">
              <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                Meet the Team
              </h2>
              
              {/* Small decorative elements near title */}
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-80"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce opacity-60"></div>
            </div>
            
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
        </section>

        {/* Team Members Grid - FIXED: Added gradient and index props */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-20 md:mb-32">
          {TEAM_MEMBERS.map((member, idx) => (
            <div 
              key={member.name} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}
            >
              <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>}>
                <TeamMember 
                  {...member} 
                  gradient={CARD_GRADIENTS[idx % 3]} 
                  index={idx}
                />
              </Suspense>
            </div>
          ))}
        </section>

        {/* Story Section */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>}>
          <StorySection />
        </Suspense>
      </div>

      {/* Footer */}
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
}
