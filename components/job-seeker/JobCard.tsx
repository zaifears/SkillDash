import React, { useMemo } from 'react';
import Link from 'next/link';
import { JobOpportunity, formatJobOpportunityMinimal } from '../../lib/contentful';
import { MapPinIcon, CalendarIcon, AcademicCapIcon, BuildingOfficeIcon, ArrowRightIcon } from './JobIcons';

interface JobCardProps {
  job: JobOpportunity;
}

const JobCard = React.memo<JobCardProps>(({ job }) => {
  const formattedJob = useMemo(() => formatJobOpportunityMinimal(job), [job]);

  return (
    <Link href={`/opportunities/job-seeker/${job.sys.id}`} prefetch={false}>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-1.02 transition-all duration-300 cursor-pointer group ${formattedJob.isExpired ? 'opacity-60' : ''}`}>
        
        {/* Header with Company Logo */}
        <div className="flex items-start gap-4 mb-4">
          {/* Company Logo */}
          {formattedJob.companyLogo?.fields?.file?.url && (
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <img 
                src={`https:${formattedJob.companyLogo.fields.file.url}`}
                alt={formattedJob.companyLogo.fields.title || formattedJob.companyName}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            </div>
          )}
          
          {/* Job Details */}
          <div className="flex-1 min-w-0">
            {formattedJob.isExpired && (
              <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full mb-2">
                Expired
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {formattedJob.positionName}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <BuildingOfficeIcon />
              <span className="ml-2 font-medium">{formattedJob.companyName}</span>
            </div>
          </div>
        </div>

        {/* Job Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start space-x-2">
            <MapPinIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedJob.jobLocation}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.415-3.414l5-5A2 2 0 009 8.172V5L8 4z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Type</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formattedJob.workplaceType} • {formattedJob.employmentType}</p>
            </div>
          </div>

          <div className="flex items-start space-x-2 sm:col-span-2">
            <CalendarIcon />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Deadline to Apply</p>
              <p className={`text-sm font-medium ${formattedJob.isExpired ? 'text-red-600 dark:text-red-400 line-through' : 'text-red-600 dark:text-red-400'}`}>
                {formattedJob.formattedDeadline}
                {formattedJob.isExpired && <span className="ml-2 text-xs">Expired</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Login required to view details</span>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              View Details
              <ArrowRightIcon />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

JobCard.displayName = 'JobCard';

export default JobCard;
