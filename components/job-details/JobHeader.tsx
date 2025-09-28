import React from 'react';
import { FormattedJobOpportunity } from '../../lib/contentful';

interface JobHeaderProps {
  formattedJob: FormattedJobOpportunity;
}

const JobHeader = React.memo<JobHeaderProps>(({ formattedJob }) => (
  <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        {formattedJob.isExpired && (
          <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-sm font-medium px-3 py-1 rounded-full mb-4">
            This job posting has expired
          </span>
        )}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {formattedJob.positionName}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{formattedJob.company}</p>
      </div>
    </div>
  </div>
));

JobHeader.displayName = 'JobHeader';
export default JobHeader;
