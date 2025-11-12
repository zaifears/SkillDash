import React from 'react';
import Image from 'next/image';

interface Feature {
  title: string;
  description: string;
  imageUrl: string;
  // +++ ADDED href and linkText to make each card unique +++
  href: string;
  linkText: string;
}

const FEATURES: Feature[] = [
  {
    title: "STAND OUT, BE REMEMBERED",
    description: "Showcase your verified skills from our AI Skill Quest and curated courses. Let your abilities, not just your CV, do the talking and capture the attention of top employers.",
    imageUrl: "/opportunities/remembered.png",
    // +++ ADDED +++
    href: "/opportunities/job-seeker",
    linkText: "Explore Job Listings →"
  },
  {
    // +++ MODIFIED +++
    title: "COMPETE AND CONQUER",
    description: "Prove your strategic thinking and problem-solving skills by joining business case competitions. Showcase your talent to top-tier companies.",
    imageUrl: "/opportunities/career.png", // Kept the same image as requested
    // +++ MODIFIED +++
    href: "/opportunities/bizcomp",
    linkText: "Enter the Arena →"
  },
  {
    title: "PROVE YOUR ABILITIES",
    description: "Go beyond grades. Our platform allows you to apply your skills in real-world freelance gigs and part-time jobs, giving you a portfolio of tangible experience that employers value.",
    imageUrl: "/opportunities/ability.png",
    // +++ ADDED +++
    href: "/opportunities/job-seeker",
    linkText: "Explore Job Listings →"
  },
] as const;

// +++ MODIFIED FeatureSection component +++
// It no longer needs 'maintenanceUrl' and instead gets the link and text from the 'feature' object
const FeatureSection = React.memo<{ feature: Feature; index: number }>(({ feature, index }) => {
  const isReversed = index % 2 === 1;
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div className={`text-center md:text-left ${isReversed ? 'md:order-2' : ''}`}>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          {feature.title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {feature.description}
        </p>
        <a
          // +++ MODIFIED href and link text +++
          href={feature.href}
          className="inline-block text-lg font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
        >
          {feature.linkText}
        </a>
      </div>
      
      {/* REDESIGNED: Flexible image container that adapts to image aspect ratio */}
      <div className={`flex justify-center ${isReversed ? 'md:order-1' : ''}`}>
        <div className="relative w-full max-w-md group">
          {/* Responsive container that maintains image aspect ratio */}
          <div className="relative w-full h-auto">
            {/* MODIFIED: Now using Next.js Image component */}
            <Image 
              src={feature.imageUrl}
              alt={feature.title}
              width={400}
              height={300}
              className="rounded-lg shadow-2xl object-contain w-full h-auto transform transition-all duration-300 group-hover:scale-105"
            />
          </div>
          
          {/* Optional: Decorative border */}
          <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 pointer-events-none" />
        </div>
      </div>
    </section>
  );
});

FeatureSection.displayName = 'FeatureSection';

const JobSeekerSection = React.memo(() => {
  // --- This URL is no longer needed by FeatureSection, but kept in case other parts use it ---
  const jobSeekerMaintenanceUrl = "/opportunities/job-seeker"; 

  return (
    <div className="text-gray-800 dark:text-gray-200">
      <header className="py-24 sm:py-32 text-center bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Your Skills, Your Future, Your Way
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join SkillDash to discover your talents, prove your abilities, and connect with opportunities that launch your career.
          </p>
          <a
            href={jobSeekerMaintenanceUrl}
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-3 px-10 rounded-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            Look into Opportunities
          </a>
        </div>
      </header>

      <main className="py-20 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* +++ MODIFIED LOOP +++ */}
          {/* The maintenanceUrl prop is no longer passed */}
          {FEATURES.map((feature, index) => (
            <FeatureSection
              key={feature.title}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </main>
    </div>
  );
});

JobSeekerSection.displayName = 'JobSeekerSection';
export default JobSeekerSection;
