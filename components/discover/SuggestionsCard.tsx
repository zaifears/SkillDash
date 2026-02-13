'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import SkillBadges from './SkillBadges';

// --- UPDATED INTERFACE to handle the new backend response ---
interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  suggestedCareers: { title: string; fit: string; description: string }[];
  nextStep: 'resume' | 'jobs';
}

interface SuggestionsCardProps {
  data: SkillSuggestions;
}

// Reusable Accordion Item Component for a clean, collapsible UI
const AccordionItem = React.memo(({ title, icon, defaultOpen = false, children }: { title: string, icon: string, defaultOpen?: boolean, children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
      <button
        onClick={toggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          <span className="mr-3">{icon}</span>{title}
        </h3>
        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="grid transition-all duration-500 ease-in-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});
AccordionItem.displayName = 'AccordionItem';


// Main SuggestionsCard Component
const SuggestionsCard = React.memo<SuggestionsCardProps>(({ data }) => {

  const getFitColor = (fit: string) => {
    const fitLower = fit.toLowerCase();
    if (fitLower.includes('high')) return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300';
    if (fitLower.includes('good')) return 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300';
    return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300';
  };

  return (
    <div className="space-y-4 mt-6 suggestions-fade-in">
      {/* --- Main Summary Card --- */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Your Personalized Career Analysis
        </h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/20 dark:to-gray-700/30 p-4 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* --- NEW: Suggested Careers Section (Most Important) --- */}
      <AccordionItem title="Suggested Career Paths" icon="🚀" defaultOpen={true}>
        <div className="space-y-4">
          {data.suggestedCareers.map((career, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{career.title}</h4>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full mt-2 sm:mt-0 ${getFitColor(career.fit)}`}>
                  {career.fit} Fit
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{career.description}</p>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* --- Top Skills Section --- */}
      <AccordionItem title="Your Top Skills" icon="🌟" defaultOpen={true}>
        <SkillBadges 
          skills={data.topSkills} 
          colorClass="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300" 
        />
      </AccordionItem>

      {/* --- Skills to Develop Section --- */}
      <AccordionItem title="Skills to Develop" icon="🎯">
        <SkillBadges 
          skills={data.skillsToDevelop} 
          colorClass="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300" 
        />
      </AccordionItem>
      
      {/* --- Recommended Courses Section --- */}
      <AccordionItem title="Recommended Courses" icon="📚">
        <div className="space-y-4">
          {data.suggestedCourses.map((course, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{course.title}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{course.description}</p>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* --- Next Steps Section --- */}
      <AccordionItem title="Your Next Steps" icon="🧭">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a 
            href="/resume-feedback" 
            className="text-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            AI Resume Feedback 📄
          </a>
          <a 
            href="/opportunities/job-seeker" 
            className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Explore Opportunities 💼
          </a>
        </div>
      </AccordionItem>
    </div>
  );
});
SuggestionsCard.displayName = 'SuggestionsCard';

export default SuggestionsCard;