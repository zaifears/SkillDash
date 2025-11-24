import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Career Opportunities - Jobs & Freelance Gigs | SkillDash',
  description: 'Browse live hiring and freelance opportunities matched to your skills, apply directly and take the next step toward your career.',
  openGraph: {
    title: 'Career Opportunities | SkillDash - Bridge the Skill Gap',
    description: 'Browse live hiring and freelance opportunities matched to your skills, apply directly and take the next step toward your career.',
    url: 'https://skilldash.live/opportunities',
    type: 'website',
    images: [
      {
        url: '/og/og-image-opportunities.jpg',
        width: 1200,
        height: 630,
        alt: 'Job and freelance opportunities for students'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Opportunities | SkillDash',
    description: 'Find internships, jobs and freelance gigs matched to your skills',
    images: ['/og/og-image-opportunities.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}