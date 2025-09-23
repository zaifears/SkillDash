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
      {/* Aurora Background - Different settings for light/dark mode */}
      <Aurora
        colorStops={["#3B82F6", "#8B5CF6", "#06B6D4"]}
        blend={0.08} // Slightly more visible
        amplitude={0.6}
        speed={0.3}
      />

      {/* Different overlays for light and dark mode */}
      <div className="absolute inset-0 bg-white/75 dark:bg-gray-900/20 z-0"></div>
      
      {/* Gradient background for dark mode */}
      <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-gray-900/90 dark:via-gray-800/50 dark:to-gray-900/90 z-0"></div>

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