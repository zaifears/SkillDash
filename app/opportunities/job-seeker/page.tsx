'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useJobData } from '../../../hooks/useJobData';
import LoadingScreen from '../../../components/job-seeker/LoadingScreen';
import ErrorScreen from '../../../components/job-seeker/ErrorScreen';

// Lazy load heavy components
const JobSeekerHeader = dynamic(() => import('../../../components/job-seeker/JobSeekerHeader'), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const JobsList = dynamic(() => import('../../../components/job-seeker/JobsList'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

export default function JobSeekerPage() {
  const router = useRouter();
  const { jobs, isLoading, isTimeout, error, refetch } = useJobData();

  if (error) {
    return (
      <ErrorScreen
        title="Connection Error"
        message={error}
        onRetry={refetch}
        icon="🔄"
      />
    );
  }

  if (isLoading) {
    return <LoadingScreen isTimeout={isTimeout} onRetry={isTimeout ? refetch : undefined} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
      {/* Fixed Back Button - Hidden on Mobile (< 768px) */}
      <button
        onClick={() => router.back()}
        className="hidden md:block fixed top-24 left-4 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg hover:scale-105 transition-all duration-200"
        aria-label="Go back"
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <JobSeekerHeader jobCount={jobs.length} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <JobsList jobs={jobs} />
      </div>
    </div>
  );
}
