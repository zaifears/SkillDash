'use client';

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Footer from '../../components/shared/Footer';

// Dynamic import for optimal performance
const BouncingBalls = dynamic(() => import('../../components/shared/BouncingBalls'), {
  ssr: false,
  loading: () => null
});

// Inline quiz data for maximum speed - OPTIMIZED COURSE MAPPING
const QUIZ_DATA = [
  {
    q: "What's your primary interest?",
    o: [
      { t: "Design & Visual Creativity", s: ["graphic-design", "ui-ux-figma", "presentation-canva", "video-editing-capcut"] },
      { t: "Programming & Tech Development", s: ["python-programming", "flutter-development", "git-github", "critical-thinking"] },
      { t: "Business & Data Analysis", s: ["excel-mastery", "power-bi", "financial-literacy", "python-programming"] },
      { t: "Communication & Language", s: ["english-speaking", "public-speaking", "english-vocabulary", "typing-skills"] }
    ]
  },
  {
    q: "What do you want to create?",
    o: [
      { t: "Marketing materials, ads, social content", s: ["graphic-design", "presentation-canva", "video-editing-capcut", "public-speaking"] },
      { t: "Mobile apps or software", s: ["flutter-development", "python-programming", "git-github", "critical-thinking"] },
      { t: "Business dashboards & insights", s: ["power-bi", "excel-mastery", "financial-literacy", "presentation-canva"] },
      { t: "Audio/video content for media", s: ["video-editing-capcut", "audio-editing", "public-speaking", "english-speaking"] }
    ]
  },
  {
    q: "Your work style preference?",
    o: [
      { t: "Visual & creative with tools", s: ["graphic-design", "ui-ux-figma", "video-editing-capcut", "audio-editing"] },
      { t: "Writing code & problem-solving", s: ["python-programming", "flutter-development", "git-github", "critical-thinking"] },
      { t: "Working with numbers & insights", s: ["excel-mastery", "power-bi", "financial-literacy", "critical-thinking"] },
      { t: "Speaking & connecting with people", s: ["public-speaking", "english-speaking", "presentation-canva", "english-vocabulary"] }
    ]
  },
  {
    q: "Career field you're aiming for?",
    o: [
      { t: "UX/UI Design, Branding, Media", s: ["ui-ux-figma", "graphic-design", "presentation-canva", "video-editing-capcut"] },
      { t: "Software Engineering, Startups", s: ["flutter-development", "python-programming", "git-github", "critical-thinking"] },
      { t: "Finance, Business, Analytics", s: ["excel-mastery", "power-bi", "financial-literacy", "python-programming"] },
      { t: "Teaching, Marketing, HR, Public role", s: ["public-speaking", "english-speaking", "presentation-canva", "english-vocabulary"] }
    ]
  },
  {
    q: "Most enjoyable activity for you?",
    o: [
      { t: "Editing photos, videos, making graphics", s: ["video-editing-capcut", "graphic-design", "audio-editing", "ui-ux-figma"] },
      { t: "Debugging code & building systems", s: ["python-programming", "git-github", "flutter-development", "critical-thinking"] },
      { t: "Analyzing data & finding patterns", s: ["excel-mastery", "power-bi", "financial-literacy", "critical-thinking"] },
      { t: "Presenting ideas & speaking confidently", s: ["public-speaking", "english-speaking", "presentation-canva", "typing-skills"] }
    ]
  },
  {
    q: "What software/tools interest you?",
    o: [
      { t: "Canva, Figma, Adobe-like tools", s: ["graphic-design", "ui-ux-figma", "presentation-canva", "video-editing-capcut"] },
      { t: "Programming languages & Git", s: ["python-programming", "flutter-development", "git-github", "critical-thinking"] },
      { t: "Excel, Power BI, Google Sheets", s: ["excel-mastery", "power-bi", "financial-literacy", "typing-skills"] },
      { t: "Video, audio, presentation software", s: ["video-editing-capcut", "audio-editing", "public-speaking", "english-speaking"] }
    ]
  },
  {
    q: "Your learning goal timeline?",
    o: [
      { t: "Quick start, visual projects (days-weeks)", s: ["graphic-design", "video-editing-capcut", "presentation-canva", "typing-skills"] },
      { t: "Deep technical mastery (weeks-months)", s: ["flutter-development", "python-programming", "git-github", "critical-thinking"] },
      { t: "Career advancement in business (weeks-months)", s: ["power-bi", "excel-mastery", "financial-literacy", "python-programming"] },
      { t: "Improve communication skills (ongoing)", s: ["public-speaking", "english-speaking", "english-vocabulary", "presentation-canva"] }
    ]
  },
  {
    q: "What problem do you want to solve?",
    o: [
      { t: "Create professional visuals & presentations", s: ["graphic-design", "presentation-canva", "ui-ux-figma", "video-editing-capcut"] },
      { t: "Build applications & automate tasks", s: ["python-programming", "flutter-development", "git-github", "critical-thinking"] },
      { t: "Understand business data & finances", s: ["excel-mastery", "power-bi", "financial-literacy", "critical-thinking"] },
      { t: "Communicate better & be understood", s: ["english-speaking", "public-speaking", "english-vocabulary", "audio-editing"] }
    ]
  }
];

// Lightweight skill data - ONLY includes skills that are actually available in courses
const SKILLS = {
  "graphic-design": { name: "Graphic Design using Canva", desc: "Create stunning graphics and designs", logo: "/learn-skill/logos/canva.png" },
  "ui-ux-figma": { name: "UI/UX Design (Figma)", desc: "Design beautiful user interfaces", logo: "/learn-skill/logos/figma.png" },
  "presentation-canva": { name: "Presentation Making using Canva", desc: "Master compelling presentations", logo: "/learn-skill/logos/canva.png" },
  "flutter-development": { name: "Mobile App Development using Flutter", desc: "Build cross-platform mobile apps", logo: "/learn-skill/logos/flutter.png" },
  "python-programming": { name: "Python Programming", desc: "Learn versatile programming language", logo: "/learn-skill/logos/python.png" },
  "git-github": { name: "Git & GitHub", desc: "Master version control", logo: "/learn-skill/logos/git.png" },
  "excel-mastery": { name: "Microsoft Excel Mastery", desc: "Master spreadsheet skills", logo: "/learn-skill/logos/excel.png" },
  "power-bi": { name: "Microsoft Power BI", desc: "Transform data into insights", logo: "/learn-skill/logos/powerbi.png" },
  "financial-literacy": { name: "Financial Literacy", desc: "Learn money management", logo: "/learn-skill/logos/financial-literacy.png" },
  "video-editing-capcut": { name: "Video Editing with CapCut", desc: "Create engaging videos", logo: "/learn-skill/logos/capcut.png" },
  "audio-editing": { name: "Audio Editing with Audacity", desc: "Edit and enhance audio", logo: "/learn-skill/logos/audacity.png" },
  "public-speaking": { name: "Public Speaking & Presentation", desc: "Build confidence in speaking", logo: "/learn-skill/logos/public-speaking.png" },
  "english-speaking": { name: "English Speaking Practice", desc: "Improve English speaking", logo: "/learn-skill/logos/speakandimprove.png" },
  "typing-skills": { name: "Fast Typing Skills", desc: "Master fast typing", logo: "/learn-skill/logos/typing_bird.png" },
  "english-vocabulary": { name: "English Vocabulary Practice", desc: "Enhance vocabulary", logo: "/learn-skill/logos/speakandimprove.png" },
  "critical-thinking": { name: "Critical Thinking", desc: "Develop analytical reasoning", logo: "/learn-skill/logos/critical_thinking.png" }
} as const;

// Validate that all recommended skills exist in SKILLS
const VALID_SKILL_IDS = Object.keys(SKILLS) as (keyof typeof SKILLS)[];

export default function MiniTestPage() {
  const [step, setStep] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<string[]>([]);

  const handleStart = useCallback(() => setStep(1), []);

  const handleAnswer = useCallback((optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ < QUIZ_DATA.length - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 200);
    } else {
      // Improved scoring: weighted by frequency and position
      const scores: Record<string, number> = {};
      
      newAnswers.forEach((ansIdx, qIdx) => {
        const selectedSkills = QUIZ_DATA[qIdx].o[ansIdx].s;
        selectedSkills.forEach(skillId => {
          // Only count skills that exist in our SKILLS database
          if (VALID_SKILL_IDS.includes(skillId as any)) {
            // Weight: later questions count slightly more (user's refined interests)
            const weight = 1 + (qIdx / QUIZ_DATA.length) * 0.3;
            scores[skillId] = (scores[skillId] || 0) + weight;
          }
        });
      });

      // Get top 4 skills with better ranking
      const topSkills = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4)
        .map(([skillId]) => skillId);

      setResults(topSkills);
      setTimeout(() => setStep(2), 300);
    }
  }, [answers, currentQ]);

  const resetTest = useCallback(() => {
    setStep(0);
    setCurrentQ(0);
    setAnswers([]);
    setResults([]);
  }, []);

  const progress = useMemo(() => ((currentQ + 1) / QUIZ_DATA.length) * 100, [currentQ]);

  // Intro Screen - FIXED Z-INDEX
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black relative">
        {/* Bouncing Balls - ABOVE BACKGROUND */}
        <div className="relative z-20">
          <BouncingBalls variant="default" />
        </div>
        
        {/* Content - ABOVE BALLS */}
        <div className="relative z-30 flex items-center justify-center min-h-screen px-4 pt-20">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Mini Skills Test
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Discover your perfect skills match in just <strong>2-3 minutes</strong>. 
              Get personalized recommendations based on your interests and goals.
            </p>
            
            <div className="flex items-center justify-center gap-6 mb-10 text-gray-500 dark:text-gray-400 flex-wrap">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{QUIZ_DATA.length} Questions</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>2-3 Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Personalized</span>
              </div>
            </div>
            
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold py-4 px-12 rounded-full hover:scale-105 transform transition-all duration-200 shadow-2xl hover:shadow-purple-500/25"
            >
              Start Mini Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen - FIXED Z-INDEX
  if (step === 1) {
    const question = QUIZ_DATA[currentQ];
    
    return (
      <div className="min-h-screen bg-white dark:bg-black relative">
        {/* Bouncing Balls - ABOVE BACKGROUND */}
        <div className="relative z-20">
          <BouncingBalls variant="minimal" />
        </div>
        
        {/* Content - ABOVE BALLS */}
        <div className="relative z-30 px-4 py-8 pt-24">
          <div className="max-w-3xl mx-auto">
            
            {/* Progress */}
            <div className="mb-12">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span>Question {currentQ + 1} of {QUIZ_DATA.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {question.q}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {question.o.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left group shadow-sm"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 flex-shrink-0">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                    <span className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {option.t}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen - FIXED Z-INDEX
  return (
    <div className="min-h-screen bg-white dark:bg-black relative">
      {/* Bouncing Balls - ABOVE BACKGROUND */}
      <div className="relative z-20">
        <BouncingBalls variant="dense" />
      </div>
      
      {/* Content - ABOVE BALLS */}
      <div className="relative z-30 px-4 py-8">
        <div className="max-w-4xl mx-auto pt-20">
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Perfect Skills Found!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Based on your answers, here are your top skill matches:
            </p>
          </div>

          <div className="grid gap-6 mb-12">
            {results.map((skillId, i) => {
              const skill = SKILLS[skillId as keyof typeof SKILLS];
              if (!skill) return null;

              return (
                <div
                  key={skillId}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                    i === 0 ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {i === 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🏆</span>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        TOP MATCH
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Image 
                        src={skill.logo} 
                        alt={skill.name} 
                        width={40}
                        height={40}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {skill.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                        {skill.desc}
                      </p>
                      <button
                        onClick={() => window.open('/learn-skill', '_blank', 'noopener,noreferrer')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-200 hover:scale-105 shadow-md"
                      >
                        Start Learning
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FIXED MOBILE BUTTONS */}
          <div className="text-center mb-8">
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <button
                onClick={resetTest}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200"
              >
                Take Test Again
              </button>
              <button
                onClick={() => window.open('/learn-skill', '_blank', 'noopener,noreferrer')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 hover:scale-105"
              >
                Explore All Skills
              </button>
            </div>
          </div>

          <div className="mt-16">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
