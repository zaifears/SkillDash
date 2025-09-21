import React, { useState, useMemo } from 'react';

interface ResumeFeedback {
  summary: string;
  strengths: {
    technical: string[];
    soft: string[];
    experience: string[];
    education: string[];
  };
  weaknesses: {
    technical: string[];
    soft: string[];
    experience: string[];
    education: string[];
  };
  recommendations: {
    skillsToDevelop: string[];
    experienceToGain: string[];
    formattingTips: string[];
    actionableSteps: string[];
  };
  additionalSkillRequired: string[];
  suggestedCourses: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  confidenceScore: number;
  marketInsights: string[];
}

interface FeedbackCardProps {
  feedback: ResumeFeedback;
  providerInfo?: string;
}

// Inline optimized components
const FeedbackList = React.memo<{ items: string[]; colorClass?: string }>(({ 
  items, 
  colorClass = "text-gray-700 dark:text-gray-300" 
}) => (
  <ul className="space-y-2">
    {items.map((item, index) => (
      <li key={index} className={`flex items-start ${colorClass}`}>
        <span className="w-2 h-2 bg-current rounded-full mt-2 mr-3 flex-shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
));
FeedbackList.displayName = 'FeedbackList';

const FeedbackSubSection = React.memo<{ title: string; items: string[]; colorClass: string }>(({ 
  title, 
  items, 
  colorClass 
}) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
      <FeedbackList items={items} colorClass={colorClass} />
    </div>
  );
});
FeedbackSubSection.displayName = 'FeedbackSubSection';

const CourseCard = React.memo<{ course: { title: string; description: string; priority: string } }>(({ course }) => (
  <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-orange-800 dark:text-orange-300">{course.title}</h4>
      <span className={`px-2 py-1 text-xs rounded-full ${
        course.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
        course.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      }`}>
        {course.priority} Priority
      </span>
    </div>
    <p className="text-gray-700 dark:text-gray-300 text-sm">{course.description}</p>
  </div>
));
CourseCard.displayName = 'CourseCard';

const CollapsibleSection = React.memo<{
  id: string;
  title: string;
  emoji: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  colorClass: string;
  children: React.ReactNode;
}>(({ id, title, emoji, isExpanded, onToggle, colorClass, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <button 
      onClick={() => onToggle(id)}
      className={`w-full px-6 py-4 ${colorClass} border-b flex items-center justify-between hover:opacity-90 transition-opacity`}
    >
      <h3 className="text-lg font-semibold">{emoji} {title}</h3>
      <svg 
        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isExpanded && (
      <div className="p-6">
        {children}
      </div>
    )}
  </div>
));
CollapsibleSection.displayName = 'CollapsibleSection';

const FeedbackCard = React.memo<FeedbackCardProps>(({ feedback, providerInfo }) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    strengths: true,
    weaknesses: false,
    recommendations: false,
    additionalSkills: false,
    courses: false,
    insights: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Memoize section configurations for performance
  const sections = useMemo(() => [
    {
      id: 'strengths',
      title: 'Your Strengths',
      emoji: '✅',
      colorClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
      content: (
        <>
          <FeedbackSubSection title="Technical Skills" items={feedback.strengths.technical} colorClass="text-green-700 dark:text-green-300" />
          <FeedbackSubSection title="Soft Skills" items={feedback.strengths.soft} colorClass="text-green-700 dark:text-green-300" />
          <FeedbackSubSection title="Experience" items={feedback.strengths.experience} colorClass="text-green-700 dark:text-green-300" />
          <FeedbackSubSection title="Education" items={feedback.strengths.education} colorClass="text-green-700 dark:text-green-300" />
        </>
      )
    },
    {
      id: 'weaknesses',
      title: 'Areas to Improve',
      emoji: '⚠️',
      colorClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
      content: (
        <>
          <FeedbackSubSection title="Technical Skills" items={feedback.weaknesses.technical} colorClass="text-red-700 dark:text-red-300" />
          <FeedbackSubSection title="Soft Skills" items={feedback.weaknesses.soft} colorClass="text-red-700 dark:text-red-300" />
          <FeedbackSubSection title="Experience" items={feedback.weaknesses.experience} colorClass="text-red-700 dark:text-red-300" />
          <FeedbackSubSection title="Education" items={feedback.weaknesses.education} colorClass="text-red-700 dark:text-red-300" />
        </>
      )
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      emoji: '💡',
      colorClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
      content: (
        <>
          <FeedbackSubSection title="Skills to Develop" items={feedback.recommendations.skillsToDevelop} colorClass="text-blue-700 dark:text-blue-300" />
          <FeedbackSubSection title="Experience to Gain" items={feedback.recommendations.experienceToGain} colorClass="text-blue-700 dark:text-blue-300" />
          <FeedbackSubSection title="Formatting Tips" items={feedback.recommendations.formattingTips} colorClass="text-blue-700 dark:text-blue-300" />
          <FeedbackSubSection title="Actionable Steps" items={feedback.recommendations.actionableSteps} colorClass="text-blue-700 dark:text-blue-300" />
        </>
      )
    },
    {
      id: 'additionalSkills',
      title: 'Additional Skills Required',
      emoji: '🎯',
      colorClass: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300',
      content: <FeedbackList items={feedback.additionalSkillRequired} colorClass="text-purple-700 dark:text-purple-300" />
    },
    {
      id: 'courses',
      title: 'Suggested Courses',
      emoji: '📚',
      colorClass: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300',
      content: (
        <div className="space-y-4">
          {feedback.suggestedCourses.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      )
    },
    {
      id: 'insights',
      title: 'Market Insights',
      emoji: '📈',
      colorClass: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300',
      content: <FeedbackList items={feedback.marketInsights} colorClass="text-teal-700 dark:text-teal-300" />
    }
  ], [feedback]);

  if (showRawJson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Raw JSON Data</h3>
          <button 
            onClick={() => setShowRawJson(false)}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            Show Cards
          </button>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm text-gray-800 dark:text-gray-200">
          {JSON.stringify(feedback, null, 2)}
        </pre>
        {providerInfo && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            {providerInfo}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Resume Analysis Complete</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Score: {feedback.confidenceScore}/10
              </span>
            </div>
          </div>
          <button 
            onClick={() => setShowRawJson(true)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            View JSON
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.summary}</p>
        </div>
      </div>

      {/* Dynamic Sections */}
      {sections.map(section => (
        <CollapsibleSection
          key={section.id}
          id={section.id}
          title={section.title}
          emoji={section.emoji}
          isExpanded={expandedSections[section.id]}
          onToggle={toggleSection}
          colorClass={section.colorClass}
        >
          {section.content}
        </CollapsibleSection>
      ))}

      {providerInfo && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {providerInfo}
        </div>
      )}
    </div>
  );
});

FeedbackCard.displayName = 'FeedbackCard';
export default FeedbackCard;
