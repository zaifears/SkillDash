'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
// +++ FIX: Changed to absolute path aliases +++
import { 
  getBusinessCompetitions, 
  FormattedBusinessCompetition 
} from '@/lib/contentful'; 
import dynamic from 'next/dynamic';

// +++ FIX: Changed to absolute path aliases +++
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/lib/components/shared';
import { ROUTES, MESSAGES } from '@/lib/constants';


// --- Lazy Load Footer ---
// +++ FIX: Changed to absolute path aliases +++
const Footer = dynamic(() => import('@/components/shared/Footer'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-t-3xl" />,
  ssr: false,
});

// --- Reusable Icons (Fast & Light) ---
const BackIcon = memo(() => (
  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
));
BackIcon.displayName = 'BackIcon';

const CalendarIcon = memo(() => (
  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
));
CalendarIcon.displayName = 'CalendarIcon';

const UsersIcon = memo(() => (
  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
));
UsersIcon.displayName = 'UsersIcon';

const MoneyIcon = memo(() => (
  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));
MoneyIcon.displayName = 'MoneyIcon';

const VideoIcon = memo(() => (
  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
));
VideoIcon.displayName = 'VideoIcon';

const PrizeIcon = memo(() => (
  <svg className="w-4 h-4 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));
PrizeIcon.displayName = 'PrizeIcon';

// --- Header Component ---
const BizCompHeader = memo(() => (
  <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          BizComp <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Arena</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          On this page, we provide the latest Business Competition updates. Find your team, showcase your skills, and win big!
        </p>
      </div>
    </div>
  </div>
));
BizCompHeader.displayName = 'BizCompHeader';

// --- Competition Card Component ---
const BizCompCard = memo(({ comp }: { comp: FormattedBusinessCompetition }) => {
  const isExpired = new Date(comp.registrationDeadline) < new Date();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${isExpired ? 'opacity-60' : 'hover:shadow-xl hover:scale-[1.02]'}`}>
      
      {/* Header */}
      <div className="mb-4">
        {isExpired && (
          <span className="inline-block bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full mb-2">
            Registration Closed
          </span>
        )}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {comp.competitionName}
        </h2>
        <p className="text-md font-medium text-gray-600 dark:text-gray-400">
          by {comp.competitionOrganizer}
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <InfoItem icon={<CalendarIcon />} label="Deadline" value={comp.formattedDeadline} isExpired={isExpired} />
        <InfoItem icon={<MoneyIcon />} label="Reg. Fee" value={comp.registrationFee} />
        <InfoItem icon={<UsersIcon />} label="Team Size" value={comp.teamSize || 'N/A'} />
        <InfoItem icon={<PrizeIcon />} label="Prize Pool" value={comp.prizePool || 'N/A'} />
        <InfoItem icon={<VideoIcon />} label="OVC Required" value={comp.ovcRequirement} />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {comp.detailsLink && (
          <a
            href={comp.detailsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            View Details
          </a>
        )}
        <a
          href={comp.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 text-center font-semibold py-3 px-4 rounded-lg transition-all duration-200 ${
            isExpired 
            ? 'bg-gray-400 dark:bg-gray-600 text-gray-100 dark:text-gray-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
          }`}
          aria-disabled={isExpired}
          onClick={(e) => isExpired && e.preventDefault()}
        >
          {isExpired ? 'Registration Closed' : 'Register Now'}
        </a>
      </div>
    </div>
  );
});
BizCompCard.displayName = 'BizCompCard';

const InfoItem = memo(({ icon, label, value, isExpired = false }: { icon: React.ReactNode, label: string, value: string, isExpired?: boolean }) => (
  <div className="flex items-start space-x-2">
    <div className="flex-shrink-0 mt-0.5">{icon}</div>
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-sm font-semibold ${isExpired ? 'text-red-600 dark:text-red-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
        {value}
      </p>
    </div>
  </div>
));
InfoItem.displayName = 'InfoItem';

// --- Loading & Error States ---
const LoadingSkeleton = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div></div>
          <div className="space-y-2"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div></div>
          <div className="space-y-2"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="flex-1 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

const ErrorState = memo(({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-700 p-6">
    <div className="text-6xl mb-4">😕</div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something Went Wrong</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
    <button
      onClick={onRetry}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
    >
      Try Again
    </button>
  </div>
));
ErrorState.displayName = 'ErrorState';

const EmptyState = memo(() => (
  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="text-8xl mb-6">🏆</div>
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
      No Active Competitions
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
      We are currently scouting for the next big competition. Check back soon for new updates!
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

// --- Main Page Component ---
export default function BizCompPage() {
  const router = useRouter();
  // +++ ADDED: Auth state +++
  const { user, loading: authLoading } = useAuth();
  
  const [competitions, setCompetitions] = useState<FormattedBusinessCompetition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // +++ ADDED: Authentication Wall +++
  useEffect(() => {
    // Wait until auth state is confirmed
    if (!authLoading && !user) {
      // Store a message to show on the login page
      sessionStorage.setItem('redirectMessage', 'Please log in to view the BizComp Arena.');
      // Store the page we wanted to go to
      sessionStorage.setItem('redirectAfterLogin', '/opportunities/bizcomp');
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchComps = useCallback(async () => {
    // +++ ADDED: Guard clause to prevent fetching if not logged in +++
    if (!user || authLoading) {
      return; // Don't fetch data if user isn't logged in
    }
    try {
      setIsLoading(true);
      setError(null);
      const comps = await getBusinessCompetitions(20); // Fetch up to 20 competitions
      setCompetitions(comps);
    } catch (err: any) {
      console.error('Error fetching competitions:', err);
      setError('Failed to load competition data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading]); // +++ ADDED: Dependencies on user and authLoading +++

  useEffect(() => {
    // +++ ADDED: Only fetch data if user is authenticated +++
    if (user && !authLoading) {
      fetchComps();
    }
  }, [fetchComps, user, authLoading]); // +++ ADDED: Dependencies +++

  const renderContent = () => {
    // Note: The main loading state is handled by the return block below
    if (isLoading) {
      return <LoadingSkeleton />;
    }
    if (error) {
      return <ErrorState error={error} onRetry={fetchComps} />;
    }
    if (competitions.length === 0) {
      return <EmptyState />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitions.map((comp) => (
          <BizCompCard key={comp.id} comp={comp} />
        ))}
      </div>
    );
  };

  // +++ ADDED: Top-level loading state for auth check +++
  // This shows a full-page loader while checking auth or redirecting
  if (authLoading || !user) {
    return <LoadingScreen />;
  }

  // This will only render if authLoading is false AND user is present
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
      {/* Fixed Back Button - Hidden on Mobile (< 768px) */}
      <button
        onClick={() => router.back()}
        className="hidden md:block fixed top-24 left-4 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg hover:scale-105 transition-all duration-200"
        aria-label="Go back"
      >
        <BackIcon />
      </button>

      <BizCompHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
}
