'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const SKILLS = [
  'Video Editing',
  'Project Management', 
  'Excel Mastery',
  'UI/UX Design',
  'Digital Marketing',
  'Data Analysis'
];

const TypingHeroSection = () => {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Performance optimization: Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (document.hidden) {
        setIsPaused(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Optimized typing animation with CPU idle periods
  useEffect(() => {
    if (isPaused || !isVisibleRef.current) return;

    const currentSkill = SKILLS[currentSkillIndex];
    
    if (isTyping) {
      if (displayedText.length < currentSkill.length) {
        // Reduced frequency to allow CPU idle time
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(currentSkill.slice(0, displayedText.length + 1));
        }, 120); // Optimized timing for performance
      } else {
        // Longer pause after completing word (allows CPU to idle)
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2500);
      }
    } else {
      if (displayedText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 80);
      } else {
        // CPU idle period between skill changes
        timeoutRef.current = setTimeout(() => {
          setCurrentSkillIndex((prevIndex) => (prevIndex + 1) % SKILLS.length);
          setIsTyping(true);
        }, 800);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayedText, isTyping, currentSkillIndex, isPaused]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 opacity-60 dark:opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/50 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
            Bridge the Skill Gap
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            From Classroom to Career. The AI-powered platform for Bangladesh's youth to discover, grow, and showcase their real-world skills.
          </p>
          
          {/* Optimized Typing Animation */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
            <span className="text-center lg:text-left">Discover your talent with SkillDash AI</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Unlock your</span>
              <div className="relative h-8 min-w-[200px] flex items-center justify-start">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg md:text-xl">
                  {displayedText}
                  <span className="animate-pulse ml-1 text-blue-500">|</span>
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-4 max-w-md mx-auto">
            Let AI discover your hidden potential
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link href="/discover">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                Start Your Skill Quest →
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TypingHeroSection;
