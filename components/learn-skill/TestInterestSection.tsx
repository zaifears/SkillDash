'use client';

import React, { useState, memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const BouncingBalls = dynamic(() => import('../shared/BouncingBalls'), {
  ssr: false,
  loading: () => null
});

type Course = {
  url: string;
  educator: string;
  educatorLink: string;
};

type Skill = {
  id: string;
  name: string;
  logo: string;
  description: string;
  courses: {
    bangla: Course | null;
    english: Course | null;
  };
};

const SKILLS_DATA: Skill[] = [
  {
    id: 'graphic-design',
    name: 'Graphic Design using Canva',
    logo: '/learn-skill/logos/canva.png',
    description: 'Create stunning graphics and designs with user-friendly tools.',
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=-CTQYiGtoTI&list=PLBYQR04FmifgMyzhWgqlnzT624RQVxWsh',
        educator: 'Fahimul Islam Khan',
        educatorLink: 'https://www.linkedin.com/in/fahimulrafi/'
      },
      english: {
        url: 'https://youtu.be/Llnmf5BXLBA',
        educator: 'Daniel Walter Scott',
        educatorLink: 'https://bringyourownlaptop.com/bio'
      }
    }
  },
  {
    id: 'presentation-canva',
    name: 'Presentation Making using Canva',
    logo: '/learn-skill/logos/canva.png',
    description: 'Master compelling presentations that captivate audiences.',
    courses: {
      bangla: null,
      english: {
        url: 'https://youtu.be/hrgrFmV7aCM',
        educator: 'Pat Flynn',
        educatorLink: 'https://wirededucator.com/wep79/'
      }
    }
  },
  {
    id: 'ui-ux-figma',
    name: 'UI/UX Design (Figma)',
    logo: '/learn-skill/logos/figma.png',
    description: 'Design beautiful user-friendly interfaces with industry standards.',
    courses: {
      bangla: {
        url: 'https://youtu.be/Ed1ineovwzg',
        educator: 'Atiqur Rahaman',
        educatorLink: 'https://www.designmonks.co/atiqur-rahaman'
      },
      english: {
        url: 'https://www.youtube.com/watch?v=kbZejnPXyLM&list=PLttcEXjN1UcHu4tCUSNhhuQ4riGARGeap',
        educator: 'Daniel Walter Scott',
        educatorLink: 'https://bringyourownlaptop.com/bio'
      }
    }
  },
  {
    id: 'flutter-development',
    name: 'Mobile App Development using Flutter',
    logo: '/learn-skill/logos/flutter.png',
    description: "Build cross-platform mobile applications with Google's framework.",
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=SCFTPjgZLQw&list=PLzHzHuEcLLzDh7koqhZJMrE879XzLAfo4',
        educator: 'Jibon Khan',
        educatorLink: 'https://www.youtube.com/c/JibonKhan'
      },
      english: {
        url: 'https://youtu.be/HQ_ytw58tC4',
        educator: 'Mitch Koko',
        educatorLink: 'https://au.linkedin.com/in/mitchkoko'
      }
    }
  },
  {
    id: 'english-vocabulary',
    name: 'English Vocabulary Practice',
    logo: '/learn-skill/logos/speakandimprove.png',
    description: 'Enhance vocabulary with gamified AI-based learning experiences.',
    courses: {
      bangla: null,
      english: {
        url: 'https://www.wordmate.app/',
        educator: 'Wordmate Team',
        educatorLink: 'https://www.wordmate.app/'
      }
    }
  },
  {
    id: 'typing-skills',
    name: 'Fast Typing Skills',
    logo: '/learn-skill/logos/typing_bird.png',
    description: 'Master fast and accurate typing through engaging games.',
    courses: {
      bangla: null,
      english: {
        url: 'https://www.typing.com/student/games',
        educator: 'Typing.com Team',
        educatorLink: 'https://www.typing.com/'
      }
    }
  },
  {
    id: 'excel-mastery',
    name: 'Microsoft Excel Mastery',
    logo: '/learn-skill/logos/excel.png',
    description: 'Master spreadsheet skills essential for business and data analysis.',
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=ccyy-kIN75I&list=PLsRR4c2QGChwFRp_gOy06qAw-AMtdZ_pQ&pp=0gcJCaIEOCosWNin',
        educator: 'Tanvir Rahaman',
        educatorLink: 'https://www.tanviracademy.com/tanvir-rahaman'
      },
      english: {
        url: 'https://youtu.be/Vl0H-qTclOg',
        educator: 'Shad Sluiter',
        educatorLink: 'https://www.freecodecamp.org/news/excel-classes-online-free-excel-training-courses/'
      }
    }
  },
  {
    id: 'python-programming',
    name: 'Python Programming',
    logo: '/learn-skill/logos/python.png',
    description: 'Learn versatile programming for data science and web development.',
    courses: {
      bangla: null,
      english: {
        url: 'https://youtu.be/eWRfhZUzrAc?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB',
        educator: 'Beau Carnes',
        educatorLink: 'https://www.freecodecamp.org/news/author/beaucarnes/'
      }
    }
  },
  {
    id: 'power-bi',
    name: 'Microsoft Power BI',
    logo: '/learn-skill/logos/powerbi.png',
    description: 'Transform data into actionable business intelligence insights.',
    courses: {
      bangla: null,
      english: {
        url: 'https://www.youtube.com/watch?v=VaOhNqNtGGE&list=PLlKpQrBME6xIAUqcPjFRPsMQJhgXdJVxe',
        educator: 'Kevin Stratvert',
        educatorLink: 'https://kevinstratvert.com/'
      }
    }
  },
  {
    id: 'git-github',
    name: 'Git & GitHub',
    logo: '/learn-skill/logos/git.png',
    description: 'Master version control and collaborate on code projects effectively.',
    courses: {
      bangla: null,
      english: {
        url: 'https://skills.github.com/',
        educator: 'GitHub Learn Team',
        educatorLink: 'https://skills.github.com/'
      }
    }
  },
  {
    id: 'video-editing-capcut',
    name: 'Video Editing with CapCut',
    logo: '/learn-skill/logos/capcut.png',
    description: 'Create engaging videos with professional editing techniques.',
    courses: {
      bangla: null,
      english: {
        url: 'https://www.youtube.com/watch?v=P51CqlPOE_w&list=PLKrujGFpHTTXuDK_7nq5CN-iLRzq2ir96',
        educator: 'Dee Nimmin',
        educatorLink: 'https://www.youtube.com/@DeeNimmin'
      }
    }
  },
  {
    id: 'english-speaking',
    name: 'English Speaking Practice',
    logo: '/learn-skill/logos/speakandimprove.png',
    description: 'Improve English speaking with AI-powered feedback and practice.',
    courses: {
      bangla: null,
      english: {
        url: 'https://speakandimprove.com/',
        educator: 'Speak & Improve Team (University of Cambridge)',
        educatorLink: 'https://speakandimprove.com/'
      }
    }
  },
  {
    id: 'critical-thinking',
    name: 'Critical Thinking',
    logo: '/learn-skill/logos/critical_thinking.png',
    description: 'Develop analytical and logical reasoning for better decisions.',
    courses: {
      bangla: null,
      english: {
        url: 'https://www.khanacademy.org/test-prep/lsat-prep/xdf35b2883be7178a:lsat-prep-lessons',
        educator: 'Khan Academy (Salman Khan)',
        educatorLink: 'https://en.wikipedia.org/wiki/Sal_Khan'
      }
    }
  },
  {
    id: 'public-speaking',
    name: 'Public Speaking & Presentation',
    logo: '/learn-skill/logos/public-speaking.png',
    description: 'Build confidence and deliver impactful presentations professionally.',
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=xMhZlt-OHEg&list=PL1pf33qWCkmjL7W-eevyKqNWMjI2nLMDA',
        educator: 'Ayman Sadiq',
        educatorLink: 'https://www.linkedin.com/in/aymansadiq/'
      },
      english: {
        url: 'https://youtu.be/HAnw168huqA',
        educator: 'Matt Abrahams',
        educatorLink: 'https://gsb.stanford.edu/faculty-research/faculty/matt-abrahams'
      }
    }
  },
  {
    id: 'audio-editing',
    name: 'Audio Editing with Audacity',
    logo: '/learn-skill/logos/audacity.png',
    description: 'Edit and enhance audio files with professional-grade software.',
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=NqvO6A7WGeE&pp=ygUYYXVkYWNpdHkgdHV0b3JpYWwgYmFuZ2xh',
        educator: 'Shohag Mia (Shohag360)',
        educatorLink: 'https://www.youtube.com/@Shohag360'
      },
      english: {
        url: 'https://www.youtube.com/watch?v=yzJ2VyYkmaA&pp=ygUYYXVkYWNpdHkgdHV0b3JpYWwgYmFuZ2xh',
        educator: 'Kevin Stratvert',
        educatorLink: 'https://kevinstratvert.com/'
      }
    }
  },
  {
    id: 'financial-literacy',
    name: 'Financial Literacy',
    logo: '/learn-skill/logos/financial-literacy.png',
    description: 'Learn money management and investment principles for success.',
    courses: {
      bangla: null,
      english: {
        url: 'https://www.khanacademy.org/college-careers-more/financial-literacy',
        educator: 'Khan Academy (Salman Khan)',
        educatorLink: 'https://en.wikipedia.org/wiki/Sal_Khan'
      }
    }
  }
];

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

const SkillCard = memo(({ skill, index }: { skill: Skill, index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableLanguages = useMemo(() => {
    const langs = [];
    if (skill.courses.bangla) langs.push('bangla' as const);
    if (skill.courses.english) langs.push('english' as const);
    return langs;
  }, [skill.courses]);

  const handleCardClick = useCallback(() => {
    if (availableLanguages.length === 1) {
      const language = availableLanguages[0] as 'bangla' | 'english';
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
      {/* Logo */}
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
              onError={e => {
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
      {/* Course content */}
      {availableLanguages.length === 1 ? (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 mb-2 border border-gray-200/50 dark:border-gray-600/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Educator:</p>
          <div className="flex items-center gap-3">
            <LanguageBadge language={availableLanguages[0] as 'bangla' | 'english'} label={availableLanguages[0] === 'bangla' ? 'BN' : 'EN'} />
            {(() => {
              const course = skill.courses[availableLanguages[0] as 'bangla' | 'english'];
              return course?.educatorLink ? (
                <button
                  onClick={e => handleEducatorClick(course.educatorLink!, e)}
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
            {availableLanguages.map(language => {
              const course = skill.courses[language as 'bangla' | 'english'];
              if (!course) return null;
              return (
                <div key={language} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <LanguageBadge language={language as 'bangla' | 'english'} label={language === 'bangla' ? 'Bengali' : 'English'} />
                    <button
                      onClick={e => handleLanguageClick(language as 'bangla' | 'english', e)}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full font-medium transition-colors"
                    >
                      Start Learning
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Educator:</p>
                  {course.educatorLink ? (
                    <button
                      onClick={e => handleEducatorClick(course.educatorLink!, e)}
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

const TestInterestSection = memo(() => {
  const [visibleSkills, setVisibleSkills] = useState(8);

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
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight mb-8">
            TEST YOUR
            <br />
            INTEREST
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed mb-12">
            Discover your passion through hands-on learning. Each skill comes with carefully curated courses 
            from expert educators in both <strong>Bangla</strong> and <strong>English</strong>.
          </p>

          {/* Mini Test CTA - FIXED MOBILE LAYOUT */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl p-6 sm:p-8 border border-purple-200 dark:border-purple-800 max-w-2xl mx-auto mb-20">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center">
                Not Sure Where to Start?
              </h3>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed text-center">
              Take our quick <strong>mini-test</strong> to discover which skills match your interests perfectly. 
              Takes just <strong>2-3 minutes!</strong>
            </p>
            <a
              href="/mini-test"
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:scale-105 transform transition-all duration-200 shadow-xl hover:shadow-purple-500/25 w-full sm:w-auto"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-base sm:text-lg">Take Mini Test</span>
              <span className="bg-white/20 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium flex-shrink-0">
                2-3 min
              </span>
            </a>
            
            {/* FIXED MOBILE FEATURE LIST */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">8 Questions</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">Quick & Easy</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="whitespace-nowrap">Personalized</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Skills Grid */}
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
