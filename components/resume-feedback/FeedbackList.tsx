import React from 'react';

interface FeedbackListProps {
  items: string[];
  colorClass?: string;
}

const FeedbackList = React.memo<FeedbackListProps>(({ 
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

FeedbackList.displayName = 'FeedbackList'; // ✅ FIXED: Changed from FeedbackListProps
export default FeedbackList;
