'use client';

import React, { useState } from 'react';

interface Course {
  bangla?: {
    url: string;
    educator: string;
    educatorLink?: string;
  };
  english?: {
    url: string;
    educator: string;
    educatorLink?: string;
  };
}

interface Skill {
  id: string;
  name: string;
  logo: string;
  description: string;
  courses: Course;
}

const skillsData: Skill[] = [
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
  {
    id: 'presentation-making',
    name: 'Presentation Making using Canva',
    logo: '/learn-skill/logos/canva.png',
    description: 'Master compelling presentations that captivate audiences.',
    courses: {
      english: {
        url: 'https://youtu.be/hrgrFmV7aCM',
        educator: 'Pat Flynn',
        educatorLink: 'https://www.patflynn.com/about/'
      }
    }
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design (Figma)',
    logo: '/learn-skill/logos/figma.png',
    description: 'Design beautiful user-friendly interfaces with industry standards.',
    courses: {
      bangla: {
        url: 'https://youtu.be/Ed1ineovwzg',
        educator: 'Atiqur Rahaman',
        educatorLink: 'https://www.linkedin.com/in/atiqur-rahaman/'
      },
      english: {
        url: 'https://www.youtube.com/watch?v=kbZejnPXyLM&list=PLttcEXjN1UcHu4tCUSNhhuQ4riGARGeap',
        educator: 'Daniel Walter Scott',
        educatorLink: 'https://en.wikipedia.org/wiki/Daniel_Walter_Scott'
      }
    }
  },
  {
    id: 'flutter-development',
    name: 'Mobile App Development (Flutter)',
    logo: '/learn-skill/logos/flutter.png',
    description: 'Build cross-platform mobile applications with Google\'s framework.',
    courses: {
      bangla: {
        url: 'https://www.youtube.com/watch?v=SCFTPjgZLQw&list=PLzHzHuEcLLzDh7koqhZJMrE879XzLAfo4',
        educator: 'Jibon Khan',
        educatorLink: 'https://www.youtube.com/@jibondev'
      },
      english: {
        url: 'https://youtu.be/HQ_ytw58tC4',
        educator: 'Mitch Koko',
        educatorLink: 'https://mitchkoko.github.io/'
      }
    }
  },
  {
    id: 'english-vocab',
    name: 'English Vocabulary Practice',
    logo: '/learn-skill/logos/wordmate.png',
    description: 'Enhance vocabulary with gamified AI-based learning experiences.',
    courses: {
      english: {
        url: 'https://www.wordmate.app/',
        educator: 'WordMate AI',
        educatorLink: 'https://www.wordmate.app/about'
      }
    }
  },
  {
    id: 'typing-speed',
    name: 'Fast Typing Skills',
    logo: '/learn-skill/logos/typing_bird.png',
    description: 'Master fast and accurate typing through engaging games.',
    courses: {
      english: {
        url: 'https://www.typing.com/student/games',
        educator: 'Typing.com',
        educatorLink: 'https://www.typing.com/about'
      }
    }
  },
  {
    id: 'excel-basics',
    name: 'Microsoft Excel Mastery',
    logo: '/learn-skill/logos/excel.png',
    description: 'Master spreadsheet skills essential for business and data analysis.',
    courses: {
      english: {
        url: 'https://youtu.be/Vl0H-qTclOg',
        educator: 'Shad Sluiter',
        educatorLink: 'https://www.linkedin.com/in/shad-sluiter/'
      },
      bangla: {
        url: 'https://www.youtube.com/watch?v=ccyy-kIN75I&list=PLsRR4c2QGChwFRp_gOy06qAw-AMtdZ_pQ',
        educator: 'Tanvir Rahaman',
        educatorLink: 'https://www.tanviracademy.com/tanvir-rahaman'
      }
    }
  },
  {
    id: 'python',
    name: 'Python Programming',
    logo: '/learn-skill/logos/python.png',
    description: 'Learn versatile programming for data science and web development.',
    courses: {
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
      english: {
        url: 'https://skills.github.com/',
        educator: 'GitHub Skills',
        educatorLink: 'https://github.com/about'
      }
    }
  },
  {
    id: 'video-editing',
    name: 'Video Editing with CapCut',
    logo: '/learn-skill/logos/capcut.png',
    description: 'Create engaging videos with professional editing techniques.',
    courses: {
      english: {
        url: 'https://www.youtube.com/watch?v=P51CqlPOE_w&list=PLKrujGFpHTTXuDK_7nq5CN-iLRzq2ir96',
        educator: 'Dee Nimmin',
        educatorLink: 'https://www.youtube.com/@DeNimmin'
      }
    }
  },
  {
    id: 'english-speaking',
    name: 'English Speaking Practice',
    logo: '/learn-skill/logos/speakandimprove.png',
    description: 'Improve English speaking with AI-powered feedback and practice.',
    courses: {
      english: {
        url: 'https://speakandimprove.com/',
        educator: 'Cambridge University',
        educatorLink: 'https://www.cambridge.org/'
      }
    }
  },
  {
    id: 'critical-thinking',
    name: 'Critical Thinking',
    logo: '/learn-skill/logos/critical_thinking.png',
    description: 'Develop analytical and logical reasoning for better decisions.',
    courses: {
      english: {
        url: 'https://www.khanacademy.org/test-prep/lsat-prep/xdf35b2883be7178a:lsat-prep-lessons',
        educator: 'Sal Khan',
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
        educatorLink: 'https://en.wikipedia.org/wiki/Ayman_Sadiq'
      },
      english: {
        url: 'https://youtu.be/HAnw168huqA',
        educator: 'Matt Abrahams',
        educatorLink: 'https://www.gsb.stanford.edu/faculty-research/faculty/matthew-abrahams'
      }
    }
  },
  {
    id: 'audio-editing',
    name: 'Audio Editing with Audacity',
    logo: '/learn-skill/logos/audacity.png',
    description: 'Edit and enhance audio files with professional-grade software.',
    courses: {
      english: {
        url: 'https://www.youtube.com/watch?v=yzJ2VyYkmaA',
        educator: 'Kevin Stratvert',
        educatorLink: 'https://kevinstratvert.com/'
      },
      bangla: {
        url: 'https://www.youtube.com/watch?v=NqvO6A7WGeE',
        educator: 'Shohag Mia',
        educatorLink: 'https://www.youtube.com/@shohag360'
      }
    }
  },
  {
    id: 'financial-literacy',
    name: 'Financial Literacy',
    logo: '/learn-skill/logos/financial-literacy.png',
    description: 'Learn money management and investment principles for success.',
    courses: {
      english: {
        url: 'https://www.khanacademy.org/college-careers-more/financial-literacy',
        educator: 'Sal Khan',
        educatorLink: 'https://en.wikipedia.org/wiki/Sal_Khan'
      }
    }
  },
  {
    id: 'sql-database',
    name: 'SQL Database Management',
    logo: '/learn-skill/logos/sql.png',
    description: 'Master database queries and data management effectively.',
    courses: {
      english: {
        url: 'https://www.w3schools.com/sql/',
        educator: 'W3Schools',
        educatorLink: 'https://www.w3schools.com/about/'
      }
    }
  }
];

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableLanguages = [];
  if (skill.courses.bangla) availableLanguages.push('bangla');
  if (skill.courses.english) availableLanguages.push('english');

  const handleCardClick = () => {
    if (availableLanguages.length === 1) {
      const language = availableLanguages[0] as 'bangla' | 'english';
      const course = skill.courses[language];
      if (course) {
        window.open(course.url, '_blank', 'noopener,noreferrer');
      }
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleLanguageClick = (language: 'bangla' | 'english', e: React.MouseEvent) => {
    e.stopPropagation();
    const course = skill.courses[language];
    if (course) {
      window.open(course.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEducatorClick = (educatorLink: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(educatorLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`
        relative group cursor-pointer
        bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
        border border-gray-200/50 dark:border-gray-700/50
        rounded-3xl shadow-lg hover:shadow-2xl
        p-8 transition-all duration-500 ease-out
        hover:scale-[1.02] hover:-translate-y-3
        hover:bg-white dark:hover:bg-gray-800
        hover:border-blue-300/50 dark:hover:border-blue-600/50
        ${availableLanguages.length === 1 ? 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20' : ''}
        ${isExpanded ? 'ring-2 ring-blue-400/50 shadow-blue-500/20 shadow-xl' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Modern Floating Logo */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-2xl blur-xl scale-110 group-hover:scale-125 transition-transform duration-500"></div>
          
          {/* Logo container */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-gray-200/50 dark:border-gray-600/50">
            <img 
              src={skill.logo} 
              alt={`${skill.name} logo`} 
              className="w-12 h-12 object-contain filter drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiMzNDgzRjYiLz4KPHBhdGggZD0iTTI0IDEyVjM2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIgMjRIMzYiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==';
              }}
            />
          </div>
        </div>
      </div>

      {/* Skill Name */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {skill.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-base text-center mb-6 leading-relaxed">
        {skill.description}
      </p>

      {/* Language Indicators - Floating badges */}
      <div className="flex justify-center gap-3 mb-6">
        {skill.courses.bangla && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100/80 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-700/50">
            <div className="w-4 h-4 rounded-full overflow-hidden border border-green-300 dark:border-green-600">
              <img src="/bn.png" alt="Bangla" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">BN</span>
          </div>
        )}
        {skill.courses.english && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100/80 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-700/50">
            <div className="w-4 h-4 rounded-full overflow-hidden border border-blue-300 dark:border-blue-600">
              <img src="/en.png" alt="English" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">EN</span>
          </div>
        )}
      </div>

      {/* Single Language - Show Educator Info Directly */}
      {availableLanguages.length === 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-4 mb-2 border border-gray-200/50 dark:border-gray-600/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Educator:</p>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm flex-shrink-0">
              <img 
                src={availableLanguages[0] === 'bangla' ? '/bn.png' : '/en.png'} 
                alt={availableLanguages[0] === 'bangla' ? 'Bangla' : 'English'} 
                className="w-full h-full object-cover" 
              />
            </div>
            {(() => {
              const course = skill.courses[availableLanguages[0] as 'bangla' | 'english'];
              return course?.educatorLink ? (
                <button
                  onClick={(e) => handleEducatorClick(course.educatorLink!, e)}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 hover:decoration-blue-600 transition-colors"
                >
                  {course.educator}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course?.educator}</span>
              );
            })()}
          </div>
        </div>
      )}

      {/* Multiple Languages - Expandable Options */}
      {availableLanguages.length > 1 && (
        <div className={`
          transition-all duration-500 ease-in-out
          ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
          overflow-hidden
        `}>
          <div className="border-t border-gray-200/70 dark:border-gray-700/70 pt-6 mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4 font-medium">Choose your mode of learning:</p>
            
            <div className="flex flex-col gap-4 mb-6">
              {skill.courses.bangla && (
                <button
                  onClick={(e) => handleLanguageClick('bangla', e)}
                  className="w-full px-5 py-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 rounded-2xl hover:from-green-200 hover:to-emerald-200 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50 transition-all duration-300 flex items-center justify-center gap-4 font-semibold text-base shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-green-300 dark:border-green-600 shadow-sm flex-shrink-0">
                    <img src="/bn.png" alt="Bangla" className="w-full h-full object-cover" />
                  </div>
                  <span>Bangla</span>
                </button>
              )}
              
              {skill.courses.english && (
                <button
                  onClick={(e) => handleLanguageClick('english', e)}
                  className="w-full px-5 py-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 rounded-2xl hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 transition-all duration-300 flex items-center justify-center gap-4 font-semibold text-base shadow-md hover:shadow-lg hover:scale-[1.02]"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-blue-300 dark:border-blue-600 shadow-sm flex-shrink-0">
                    <img src="/en.png" alt="English" className="w-full h-full object-cover" />
                  </div>
                  <span>English</span>
                </button>
              )}
            </div>
            
            {/* Educator Info */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3 uppercase tracking-wide">About the Educators:</p>
              
              {skill.courses.bangla && (
                <div className="mb-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-green-400 shadow-sm flex-shrink-0">
                      <img src="/bn.png" alt="Bangla" className="w-full h-full object-cover" />
                    </div>
                    {skill.courses.bangla.educatorLink ? (
                      <button
                        onClick={(e) => handleEducatorClick(skill.courses.bangla!.educatorLink!, e)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 font-medium"
                      >
                        {skill.courses.bangla.educator}
                      </button>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{skill.courses.bangla.educator}</span>
                    )}
                  </div>
                </div>
              )}
              
              {skill.courses.english && (
                <div className="text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-blue-400 shadow-sm flex-shrink-0">
                      <img src="/en.png" alt="English" className="w-full h-full object-cover" />
                    </div>
                    {skill.courses.english.educatorLink ? (
                      <button
                        onClick={(e) => handleEducatorClick(skill.courses.english!.educatorLink!, e)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 font-medium"
                      >
                        {skill.courses.english.educator}
                      </button>
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{skill.courses.english.educator}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modern Indicator Icons */}
      <div className="absolute top-6 right-6">
        {availableLanguages.length === 1 ? (
          <div className="relative">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-30"></div>
          </div>
        ) : (
          <div className={`transition-transform duration-500 ease-in-out ${isExpanded ? 'rotate-180' : ''}`}>
            <div className="p-2 bg-white/80 dark:bg-gray-700/80 rounded-full shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Modern Gradient Border Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-blue-500/20 group-hover:via-purple-500/10 group-hover:to-indigo-500/20 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};

const TestInterestSection: React.FC = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Hero Header */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight">
              TEST YOUR
            </h1>
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 bg-clip-text text-transparent leading-tight tracking-tight">
              INTEREST
            </h1>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce opacity-80"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse opacity-60"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Discover your passion through hands-on learning. Each skill comes with carefully curated courses 
            from expert educators in both <strong>Bangla</strong> and <strong>English</strong>.
          </p>
        </div>

        {/* Modern Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {skillsData.map((skill, index) => (
            <div 
              key={skill.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <SkillCard skill={skill} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestInterestSection;
