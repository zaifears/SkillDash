'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Suspense } from 'react';
import Footer from '../../components/shared/Footer';

// Ultra-light bouncing balls for maximum performance
const FastBouncingBalls = React.memo(() => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div className="absolute w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60 top-20 right-10 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}} />
    <div className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-50 bottom-40 left-8 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}} />
    <div className="absolute w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-40 top-1/2 right-6 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}} />
  </div>
));
FastBouncingBalls.displayName = 'FastBouncingBalls';

// Inline quiz data for maximum performance - no external imports
const QUIZ_DATA = [
  {
    q: "What excites you most?",
    o: [
      { t: "Creating beautiful designs", s: ["graphic-design", "ui-ux-figma", "presentation-canva"] },
      { t: "Building apps & software", s: ["flutter-development", "python-programming", "git-github"] },
      { t: "Analyzing data & insights", s: ["excel-mastery", "power-bi", "financial-literacy"] },
      { t: "Creating videos & content", s: ["video-editing-capcut", "audio-editing", "public-speaking"] }
    ]
  },
  {
    q: "Your ideal work environment?",
    o: [
      { t: "Creative studio", s: ["graphic-design", "ui-ux-figma", "video-editing-capcut"] },
      { t: "Tech company", s: ["flutter-development", "python-programming", "git-github"] },
      { t: "Corporate office", s: ["excel-mastery", "power-bi", "financial-literacy"] },
      { t: "Media company", s: ["video-editing-capcut", "audio-editing", "public-speaking"] }
    ]
  },
  {
    q: "What motivates you?",
    o: [
      { t: "Visual beauty & aesthetics", s: ["graphic-design", "ui-ux-figma", "presentation-canva"] },
      { t: "Solving technical problems", s: ["python-programming", "flutter-development", "critical-thinking"] },
      { t: "Data-driven decisions", s: ["excel-mastery", "power-bi", "financial-literacy"] },
      { t: "Effective communication", s: ["public-speaking", "english-speaking", "presentation-canva"] }
    ]
  },
  {
    q: "Preferred learning style?",
    o: [
      { t: "Visual & hands-on projects", s: ["graphic-design", "ui-ux-figma", "video-editing-capcut"] },
      { t: "Coding & building things", s: ["python-programming", "flutter-development", "git-github"] },
      { t: "Structured practice", s: ["excel-mastery", "typing-skills", "english-vocabulary"] },
      { t: "Presenting & teaching", s: ["public-speaking", "english-speaking", "presentation-canva"] }
    ]
  },
  {
    q: "Tools that interest you?",
    o: [
      { t: "Design tools (Canva, Figma)", s: ["graphic-design", "ui-ux-figma", "presentation-canva"] },
      { t: "Programming languages", s: ["python-programming", "flutter-development", "git-github"] },
      { t: "Spreadsheets & BI tools", s: ["excel-mastery", "power-bi", "financial-literacy"] },
      { t: "Audio/Video editors", s: ["video-editing-capcut", "audio-editing", "presentation-canva"] }
    ]
  },
  {
    q: "Dream project type?",
    o: [
      { t: "Design a brand identity", s: ["graphic-design", "ui-ux-figma", "presentation-canva"] },
      { t: "Build a mobile app", s: ["flutter-development", "python-programming", "git-github"] },
      { t: "Create business dashboard", s: ["power-bi", "excel-mastery", "financial-literacy"] },
      { t: "Produce a video series", s: ["video-editing-capcut", "audio-editing", "public-speaking"] }
    ]
  },
  {
    q: "Career priority?",
    o: [
      { t: "Creative expression", s: ["graphic-design", "ui-ux-figma", "video-editing-capcut"] },
      { t: "Technical expertise", s: ["python-programming", "flutter-development", "git-github"] },
      { t: "Business impact", s: ["excel-mastery", "power-bi", "financial-literacy"] },
      { t: "Communication skills", s: ["public-speaking", "english-speaking", "critical-thinking"] }
    ]
  },
  {
    q: "Free time activity?",
    o: [
      { t: "Drawing & designing", s: ["graphic-design", "ui-ux-figma", "presentation-canva"] },
      { t: "Coding personal projects", s: ["python-programming", "flutter-development", "git-github"] },
      { t: "Reading business content", s: ["financial-literacy", "excel-mastery", "critical-thinking"] },
      { t: "Creating content", s: ["video-editing-capcut", "public-speaking", "english-speaking"] }
    ]
  }
];

// Lightweight skill data - only what we need
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
};

export default function MiniTestPage() {
  const [step, setStep] = useState(0); // 0: intro, 1: quiz, 2: results
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<string[]>([]);

  const handleStart = useCallback(() => {
    setStep(1);
  }, []);

  const handleAnswer = useCallback((optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQ < QUIZ_DATA.length - 1) {
      setTimeout(() => setCurrentQ(prev => prev + 1), 200);
    } else {
      // Calculate results instantly
      const scores: Record<string, number> = {};
      
      newAnswers.forEach((ansIdx, qIdx) => {
        QUIZ_DATA[qIdx].o[ansIdx].s.forEach(skillId => {
          scores[skillId] = (scores[skillId] || 0) + 1;
        });
      });

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

  // Intro Screen
  if (step === 0) {
    return (
      <>
        <FastBouncingBalls />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center px-4 pt-20 relative z-10">
          <div className="text-center max-w-2xl">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
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
            
            <div className="flex items-center justify-center gap-6 mb-10 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>8 Quick Questions</span>
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
                <span>Personalized Results</span>
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
      </>
    );
  }

  // Quiz Screen
  if (step === 1) {
    const question = QUIZ_DATA[currentQ];
    
    return (
      <>
        <FastBouncingBalls />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900 px-4 py-8 pt-24 relative z-10">
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
                  className="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
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
      </>
    );
  }

  // Results Screen - FIXED MOBILE BUTTON LAYOUT + BOUNCING BALLS
  return (
    <>
      <FastBouncingBalls />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto pt-20">
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
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
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 ${
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
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <img src={skill.logo} alt={skill.name} className="w-10 h-10 object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {skill.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {skill.desc}
                      </p>
                      <button
                        onClick={() => window.open('/learn-skill', '_blank')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-full hover:scale-105 transition-transform"
                      >
                        Start Learning
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FIXED MOBILE BUTTON LAYOUT - EQUAL WIDTH */}
          <div className="text-center mb-8">
            <div className="flex flex-col gap-4 max-w-md mx-auto">
              <button
                onClick={resetTest}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200"
              >
                Take Test Again
              </button>
              <button
                onClick={() => window.open('/learn-skill', '_blank')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:scale-105 transition-transform"
              >
                Explore All Skills
              </button>
            </div>
          </div>

          <div className="mt-16">
            <Suspense fallback={<div className="h-32" />}>
              <Footer />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
