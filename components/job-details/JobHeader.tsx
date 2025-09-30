import React from 'react';
import { FormattedJobOpportunity } from '../../lib/contentful';

interface JobHeaderProps {
  formattedJob: FormattedJobOpportunity;
}

const JobHeader = React.memo<JobHeaderProps>(({ formattedJob }) => {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header with Company Logo */}
        <div className="flex items-start gap-6 mb-6">
          {/* Company Logo */}
          {formattedJob.companyLogo?.fields?.file?.url && (
            <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img 
                src={`https:${formattedJob.companyLogo.fields.file.url}`}
                alt={formattedJob.companyLogo.fields.title || formattedJob.companyName}
                className="w-full h-full object-contain p-2"
                loading="eager"
              />
            </div>
          )}
          
          {/* Job Info */}
          <div className="flex-1 min-w-0">
            {formattedJob.isExpired && (
              <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-sm font-medium px-3 py-1 rounded-full mb-4">
                This job posting has expired
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {formattedJob.positionName}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-1">
              {formattedJob.companyName}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {formattedJob.jobLocation}
              </span>
              <span>•</span>
              <span>{formattedJob.workplaceType}</span>
              <span>•</span>
              <span>{formattedJob.employmentType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

JobHeader.displayName = 'JobHeader';

export default JobHeader;
