import React, { ReactNode } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  emoji: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  colorClass: string;
  children: ReactNode;
}

const CollapsibleSection = React.memo<CollapsibleSectionProps>(({
  id,
  title,
  emoji,
  isExpanded,
  onToggle,
  colorClass,
  children
}) => (
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
export default CollapsibleSection;
