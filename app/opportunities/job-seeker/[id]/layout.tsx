import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Job Opportunity Details',
  description: 'View detailed job opportunity information, requirements, and apply directly through SkillDash.',
  openGraph: {
    title: 'Job Opportunity | SkillDash',
    description: 'Explore job opportunities tailored for Bangladesh youth. Apply with confidence and track your applications.',
    url: 'https://skilldash.live/opportunities/job-seeker',
    type: 'website',
    images: [
      {
        url: '/og/og-image-jobseeker.jpg',
        width: 1200,
        height: 630,
        alt: 'Job opportunities on SkillDash - Find your next career move'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Opportunity | SkillDash',
    description: 'Explore verified job opportunities in Bangladesh',
    images: ['/og/og-image-jobseeker.jpg']
  }
};

export default function JobSeekerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}