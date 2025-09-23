import React from 'react';

interface CourseCardProps {
  course: {
    title: string;
    description: string;
    priority: string;
  };
}

const CourseCard = React.memo<CourseCardProps>(({ course }) => (
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
export default CourseCard;
