import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Job Opportunities',
  description: 'Browse verified job openings and apply with confidence',
  openGraph: {
    title: 'Job Opportunities | SkillDash',
    description: 'Browse verified job openings and apply with confidence',
    url: 'https://skilldash.live/opportunities/job-seeker',
    type: 'website',
    images: [
      {
        url: '/og/og-image-jobseeker.jpg',
        width: 1200,
        height: 630,
        alt: 'Job Opportunities on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Opportunities | SkillDash',
    description: 'Browse verified job openings and apply with confidence',
    images: ['/og/og-image-jobseeker.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}