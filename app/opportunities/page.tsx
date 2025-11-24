'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import OpportunityHero from '../../components/opportunities/OpportunityHero';
import BackgroundAnimation from '../../components/shared/BackgroundAnimation';

// Lazy load heavy components
const JobSeekerSection = dynamic(() => import('../../components/opportunities/JobSeekerSection'), {
  loading: () => <div className="h-screen animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const Footer = dynamic(() => import('../../components/shared/Footer'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl" />
});

export default function OpportunitiesPage() {
  return (
    <div className="hero-background-container w-full overflow-x-hidden relative" style={{
      backgroundImage: 'url(/hero-background.png)',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
    }}>
      {/* Dark overlay for light mode and gradient for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/60 dark:from-black/70 dark:via-black/60 dark:to-black/50 pointer-events-none"></div>

      {/* Background Animation */}
      <BackgroundAnimation />

      <div className="min-h-screen text-gray-800 dark:text-gray-200 relative z-10">
        {/* Top Section - Path Selection */}
        <OpportunityHero />

        {/* Job Seeker Section */}
        <JobSeekerSection />

        {/* Footer */}
        <div className="mx-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}
