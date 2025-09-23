import React, { Suspense, lazy } from 'react';
import TypingHeroSection from '../components/TypingHeroSection';
import CoreFeaturesSection from '../components/CoreFeaturesSection';
import LoadingSpinner from '../components/LoadingSpinner';
import Aurora from '../components/Aurora';

// Lazy load heavy sections
const ContentSections = lazy(() => import('../components/ContentSections'));

export default function SkillDashHome() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Aurora Background - Very subtle for light mode */}
      <Aurora
        colorStops={["#3B82F6", "#8B5CF6", "#06B6D4"]}
        blend={0.05} // Much more subtle
        amplitude={0.5}
        speed={0.4}
      />

      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/70 dark:bg-transparent z-0"></div>

      {/* Content with strong contrast */}
      <div className="relative z-10">
        <TypingHeroSection />
        <CoreFeaturesSection />
        
        <Suspense fallback={<LoadingSpinner />}>
          <ContentSections />
        </Suspense>
      </div>
    </div>
  );
}
