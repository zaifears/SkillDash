import React from 'react';
import FeedbackList from './FeedbackList';

interface FeedbackSubSectionProps {
  title: string;
  items: string[];
  colorClass: string;
}

const FeedbackSubSection = React.memo<FeedbackSubSectionProps>(({ 
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
export default FeedbackSubSection;
