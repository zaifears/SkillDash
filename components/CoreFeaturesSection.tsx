'use client';

import React, { memo } from 'react';
import Link from 'next/link';

// Step interface
interface Step {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

// Step data
const STEPS: Step[] = [
  {
    id: 'discover',
    number: '01',
    title: 'Discover Your Skills',
    description: 'Take our AI-powered skill assessment to uncover your unique talents and strengths',
    icon: '🎯',
    href: '/discover',
    color: 'bg-blue-500'
  },
  {
    id: 'learn',
    number: '02', 
    title: 'Test & Learn Skills',
    description: 'Explore hands-on courses and test your abilities across 17+ in-demand skill areas',
    icon: '📚',
    href: '/learn-skill',
    color: 'bg-purple-500'
  },
  {
    id: 'resume',
    number: '03',
    title: 'Perfect Your Resume',
    description: 'Get AI-powered feedback to craft a resume that stands out to employers',
    icon: '📄',
    href: '/resume-feedback',
    color: 'bg-emerald-500'
  },
  {
    id: 'opportunities',
    number: '04',
    title: 'Find Opportunities',
    description: 'Access curated job listings, internships, and freelance projects tailored to your skills',
    icon: '💼',
    href: '/opportunities',
    color: 'bg-orange-500'
  }
];

const StepCard = memo(({ step, index }: { step: Step, index: number }) => (
  <div className="w-full relative">
    <Link href={step.href} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 relative">
        
        {/* Step Number */}
        <div className={`${step.color} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg mb-4`}>
          {step.number}
        </div>

        {/* Icon */}
        <div className="text-4xl mb-4">
          {step.icon}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {step.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
          {step.description}
        </p>

        {/* Call to Action */}
        <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
          <span>Get Started</span>
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>

    {/* FIXED: Modern Mobile Arrow - centered between cards */}
    {index < STEPS.length - 1 && (
      <div className="lg:hidden relative py-8 flex justify-center">
        {/* Connection Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-200 dark:bg-gray-600 transform -translate-x-1/2"></div>
        
        {/* Modern Arrow */}
        <div className="relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    )}
  </div>
));
StepCard.displayName = 'StepCard';

const CoreFeaturesSection = memo(() => (
  <section className="py-20 relative">
    <div className="max-w-7xl mx-auto px-6">
      {/* UPDATED: Header with Question */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          How SkillDash Works?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Follow our proven 4-step process to discover your potential, build skills, and land your dream opportunity
        </p>
      </div>

      {/* Steps Grid with Connection Line */}
      <div className="relative">
        {/* ADDED: Connection Line Behind Cards (Desktop Only) */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gray-200 dark:bg-gray-600 transform -translate-y-1/2 z-0"></div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {STEPS.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <Link 
          href="/discover"
          className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transform transition-all duration-300 shadow-xl"
        >
          <span>Start Your Journey Now</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  </section>
));
CoreFeaturesSection.displayName = 'CoreFeaturesSection';

export default CoreFeaturesSection;
