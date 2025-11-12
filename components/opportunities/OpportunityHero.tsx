'use client'; // Keep this as it's a client component

import React from 'react';
import Image from 'next/image';

// This is the component for the two existing cards
interface OpportunityCardProps {
  href: string;
  title: string;
  description: string;
  imageUrl: string;
  variant: 'primary' | 'secondary';
}

const OpportunityCard = React.memo<OpportunityCardProps>(({ href, title, description, imageUrl, variant }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <a
      href={href}
      className={`group relative flex flex-col items-center justify-center p-12 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden ${
        isPrimary 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' 
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm text-gray-800 dark:text-white border border-gray-200 dark:border-gray-800 hover:border-blue-500'
      }`}
    >
      <div className="mb-4">
        <div className="relative w-12 h-12">
          {/* MODIFIED: Using Next.js Image component for optimization */}
          <Image
            src={imageUrl}
            alt={title}
            width={48}
            height={48}
            className={`object-contain ${!isPrimary ? 'opacity-60 group-hover:opacity-100' : ''} transition-opacity`}
          />
        </div>
      </div>
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className={isPrimary ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}>
        {description}
      </p>
      
      {/* Decorative elements */}
      {isPrimary ? (
        <>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 dark:hidden" />
          <div className="hidden dark:block absolute -bottom-4 -right-4 w-16 h-16 bg-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
        </>
      ) : null}
    </a>
  );
});
OpportunityCard.displayName = 'OpportunityCard';

// +++ NEW INLINE ICON FOR BIZCOMP (Fast loading) +++
// This is a relevant "business competition" icon (bar chart)
const BizCompIcon = React.memo(() => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m6 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
  </svg>
));
BizCompIcon.displayName = 'BizCompIcon';
// +++ END NEW ICON +++

const OpportunityHero = React.memo(() => {
  const jobSeekerMaintenanceUrl = "/opportunities/job-seeker";
  const hirerMaintenanceUrl = "/opportunities/hiring";
  // +++ NEW URL FOR BIZCOMP +++
  const bizCompUrl = "/opportunities/bizcomp";

  return (
    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 pt-40 pb-18">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Unlock Your Next Opportunity
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12">
          Are you looking for your next role, or searching for the perfect candidate? Select your path below to get started.
        </p>

        {/* --- EXISTING GRID FOR THE FIRST TWO BUTTONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <OpportunityCard
            href={jobSeekerMaintenanceUrl}
            title="I am seeking a job"
            description="Find part-time roles, internships, and freelance gigs tailored to your skills."
            imageUrl="/opportunities/seeking-jobs.png"
            variant="primary"
          />
          
          <OpportunityCard
            href={hirerMaintenanceUrl}
            title="I am hiring"
            description="Post a job opening and find skilled, ambitious student talent for your team."
            imageUrl="/opportunities/hiring.png"
            variant="secondary"
          />
        </div>
        
        {/* +++ NEW SECTION FOR THE BIZCOMP BUTTON +++ */}
        <div className="mt-8 relative"> {/* Added relative for absolute positioning of Beta tag */}
          <a
            href={bizCompUrl}
            className="group relative flex flex-col items-center justify-center p-12 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white w-full" // w-full makes it span the full width
          >
            <div className="mb-4">
              <div className="relative w-12 h-12">
                <BizCompIcon /> {/* Using the new SVG icon */}
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2">BizComp</h2>
            <p className="text-white/80">Get the latest Business Competition updates right here.</p>
            
            {/* Decorative elements to match the primary button style */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 dark:hidden" />
            <div className="hidden dark:block absolute -bottom-4 -right-4 w-16 h-16 bg-yellow-400/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
          </a>

          {/* +++ BETA BANNER +++ */}
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 rotate-12">
            <span className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white shadow-lg dark:bg-blue-600">
              BETA
            </span>
          </div>
          {/* +++ END BETA BANNER +++ */}

        </div>
        {/* +++ END OF NEW SECTION +++ */}

      </div>
    </div>
  );
});

OpportunityHero.displayName = 'OpportunityHero';
export default OpportunityHero;
