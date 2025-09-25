'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const BouncingBalls = dynamic(() => import('../shared/BouncingBalls'), {
  ssr: false,
  loading: () => null
});

// Move skills data to constants - prevents re-creation
const SKILLS_DATA = [
  {
    id: 'graphic-design',
    name: 'Graphic Design using Canva',
    logo: '/learn-skill/logos/canva.png',
    description: 'Create stunning graphics and designs with user-friendly tools.',
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=-CTQYiGtoTI&list=PLBYQR04FmifgMyzhWgqlnzT624RQVxWsh',
        educator: 'Fahimul Islam Khan',
        educatorLink: 'https://www.linkedin.com/in/fahimul-islam-khan-01b5b8180/'
      },
      english: {
        url: 'https://youtu.be/Llnmf5BXLBA',
        educator: 'Daniel Walter Scott',
        educatorLink: 'https://en.wikipedia.org/wiki/Daniel_Walter_Scott'
      }
    }
  },
  // Add other skills data here - same structure
] as const;

// Memoized language badge component
const LanguageBadge = memo(({ 
  language, 
  label 
}: { 
  language: 'bangla' | 'english';
  label: string;
}) => {
  const flagSrc = language === 'bangla' ? '/bn.png' : '/en.png';
  const colorClass = language === 'bangla' 
    ? 'bg-green-100/80 dark:bg-green-900/30 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-400'
    : 'bg-blue-100/80 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-400';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass}`}>
      <div className="w-4 h-4 rounded-full overflow-hidden border border-current">
        <Image 
          src={flagSrc} 
          alt={label} 
          width={16} 
          height={16} 
          className="w-full h-full object-cover"
          loading="lazy"
          sizes="16px"
        />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
});
LanguageBadge.displayName = 'LanguageBadge';

// Optimized skill card with better performance
const SkillCard = memo(({ skill, index }: { skill: typeof SKILLS_DATA[0], index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableLanguages = useMemo(() => {
    const langs = [];
    if (skill.courses.bangla) langs.push('bangla' as const);
    if (skill.courses.english) langs.push('english' as const);
    return langs;
  }, [skill.courses]);

  const handleCardClick = useCallback(() => {
    if (availableLanguages.length === 1) {
      const language = availableLanguages[0];
      const course = skill.courses[language];
      if (course?.url) {
        window.open(course.url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setIsExpanded(prev => !prev);
    }
  }, [availableLanguages, skill.courses]);

  const handleLanguageClick = useCallback((language: 'bangla' | 'english', e: React.MouseEvent) => {
    e.stopPropagation();
    const course = skill.courses[language];
    if (course?.url) {
      window.open(course.url, '_blank', 'noopener,noreferrer');
    }
  }, [skill.courses]);

  const handleEducatorClick = useCallback((educatorLink: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(educatorLink, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div
      className={`
        relative group cursor-pointer
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
        border border-gray-200/50 dark:border-gray-700/50
        rounded-3xl shadow-md hover:shadow-xl
        p-6 transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-2
        hover:bg-white dark:hover:bg-gray-800
        hover:border-blue-300/50 dark:hover:border-blue-600/50
        ${isExpanded ? 'ring-2 ring-blue-400/50' : ''}
      `}
      onClick={handleCardClick}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* OPTIMIZED: Next.js Image with proper loading */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-transform duration-300"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-200/50 dark:border-gray-600/50">
            <Image
              src={skill.logo}
              alt={`${skill.name} logo`}
              width={48}
              height={48}
              className="object-contain filter drop-shadow-sm"
              loading="lazy"
              sizes="48px"
              onError={(e) => {
                // Fallback to placeholder
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiMzNDgzRjYiLz4KPHBhdGggZD0iTTI0IDEyVjM2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIgMjRIMzYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==';
              }}
            />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {skill.name}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-base text-center mb-6 leading-relaxed">
        {skill.description}
      </p>

      {/* Language badges */}
      <div className="flex justify-center gap-3 mb-6">
        {skill.courses.bangla && <LanguageBadge language="bangla" label="BN" />}
        {skill.courses.english && <LanguageBadge language="english" label="EN" />}
      </div>

      {/* Single language educator info or expandable options */}
      {availableLanguages.length === 1 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 mb-2 border border-gray-200/50 dark:border-gray-600/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Educator:</p>
          <div className="flex items-center gap-3">
            <LanguageBadge language={availableLanguages[0]} label={availableLanguages[0] === 'bangla' ? 'BN' : 'EN'} />
            {(() => {
              const course = skill.courses[availableLanguages[0]];
              return course?.educatorLink ? (
                <button
                  onClick={(e) => handleEducatorClick(course.educatorLink!, e)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors"
                >
                  {course.educator}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course?.educator}</span>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-4">
            {availableLanguages.map((language) => {
              const course = skill.courses[language];
              if (!course) return null;
              
              return (
                <div key={language} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <LanguageBadge language={language} label={language === 'bangla' ? 'Bengali' : 'English'} />
                    <button
                      onClick={(e) => handleLanguageClick(language, e)}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full font-medium transition-colors"
                    >
                      Start Learning
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Educator:</p>
                  
                  {course.educatorLink ? (
                    <button
                      onClick={(e) => handleEducatorClick(course.educatorLink!, e)}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors"
                    >
                      {course.educator}
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.educator}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Indicator icon */}
      <div className="absolute top-6 right-6">
        {availableLanguages.length === 1 ? (
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        ) : (
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
});
SkillCard.displayName = 'SkillCard';

// Main component with virtual scrolling
const TestInterestSection = memo(() => {
  const [visibleSkills, setVisibleSkills] = useState(8); // Start with 8 instead of all 17+

  const handleLoadMore = useCallback(() => {
    setVisibleSkills(prev => Math.min(prev + 6, SKILLS_DATA.length));
  }, []);

  const displayedSkills = useMemo(() => 
    SKILLS_DATA.slice(0, visibleSkills), 
    [visibleSkills]
  );

  const hasMore = visibleSkills < SKILLS_DATA.length;

  return (
    <section className="py-20 px-6">
      <BouncingBalls variant="minimal" />
      
      <div className="max-w-7xl mx-auto">
        {/* Optimized Hero Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight mb-8">
            TEST YOUR
            <br />
            INTEREST
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Discover your passion through hands-on learning. Each skill comes with carefully curated courses 
            from expert educators in both <strong>Bangla</strong> and <strong>English</strong>.
          </p>
        </div>

        {/* Optimized Skills Grid - Virtual Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedSkills.map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} index={index} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Load More Skills</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
TestInterestSection.displayName = 'TestInterestSection';

export default TestInterestSection;
