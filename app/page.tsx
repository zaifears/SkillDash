import TypingHeroSection from '@/components/TypingHeroSection';
import { Suspense } from 'react';

// Loading component for better UX
function HeroSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4 px-6">
        <div className="h-16 w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer"></div>
        <div className="h-8 w-full max-w-lg bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer mx-auto"></div>
        <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg loading-shimmer mx-auto"></div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <TypingHeroSection />
      </Suspense>
      
      {/* Additional sections can be added here */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Your Path to Success
          </h2>
          {/* Add your other homepage sections here */}
        </div>
      </section>
    </>
  );
}
