import React from 'react';
import dynamic from 'next/dynamic';

// ✅ OPTIMIZED: Lazy-loaded heavy components with loading states (ONLY WORKING COMPONENTS)
export const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  ),
  ssr: false,
});

export const AuthForm = dynamic(() => import('../components/AuthForm'), {
  loading: () => (
    <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
  ),
  ssr: false,
});

export const JobsList = dynamic(() => import('../components/job-seeker/JobsList'), {
  loading: () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      ))}
    </div>
  ),
  ssr: false,
});

export const ProfileHeader = dynamic(() => import('../components/profile/ProfileHeader'), {
  loading: () => (
    <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800"></div>
  ),
  ssr: false,
});

export const JobSeekerHeader = dynamic(() => import('../components/job-seeker/JobSeekerHeader'), {
  loading: () => (
    <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800"></div>
  ),
  ssr: false,
});

// ✅ REMOVED: Problematic FeedbackCard import that was causing issues
// export const FeedbackCard = dynamic(() => import('../components/resume-feedback/FeedbackCard')

// ✅ OPTIMIZED: Split icon imports for better tree shaking
export const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'google':
      return dynamic(() => import('react-icons/fa').then(mod => ({ default: mod.FaGoogle })), {
        ssr: false,
      });
    case 'github':
      return dynamic(() => import('react-icons/fa').then(mod => ({ default: mod.FaGithub })), {
        ssr: false,
      });
    case 'user':
      return dynamic(() => import('react-icons/hi').then(mod => ({ default: mod.HiUser })), {
        ssr: false,
      });
    case 'email':
      return dynamic(() => import('react-icons/hi').then(mod => ({ default: mod.HiMail })), {
        ssr: false,
      });
    default:
      return dynamic(() => import('react-icons/hi').then(mod => ({ default: mod.HiQuestionMarkCircle })), {
        ssr: false,
      });
  }
};

// ✅ OPTIMIZED: Preload critical components (without resume-feedback components)
export const preloadComponents = () => {
  if (typeof window !== 'undefined') {
    // Preload components likely to be needed
    const componentsToPreload = [
      () => import('../components/AuthForm'),
      () => import('../components/job-seeker/JobsList'),
      () => import('react-markdown'),
    ];

    // Preload during idle time
    if ('requestIdleCallback' in window) {
      componentsToPreload.forEach((importFn) => {
        window.requestIdleCallback(() => {
          importFn().catch(() => {
            // Ignore preload failures
          });
        });
      });
    }
  }
};
