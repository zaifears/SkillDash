import React from 'react';

interface JobSeekerHeaderProps {
  jobCount: number;
}

const JobSeekerHeader = React.memo<JobSeekerHeaderProps>(({ jobCount }) => (
  <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Job <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Opportunities</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Discover amazing career opportunities from top companies. Find your perfect match and take the next step in your career journey.
        </p>
        {jobCount > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Found {jobCount} opportunity{jobCount !== 1 ? 'ies' : ''} for you
          </p>
        )}
      </div>
    </div>
  </div>
));

JobSeekerHeader.displayName = 'JobSeekerHeader';
export default JobSeekerHeader;
