import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Learn Skills - Career-Ready Training | SkillDash',
  description: 'Explore curated learning paths, practice real projects and build proven skills employers value - from beginner to job-ready.',
  openGraph: {
    title: 'Learn Skills | SkillDash - Bridge the Skill Gap',
    description: 'Explore curated learning paths, practice real projects and build proven skills employers value - from beginner to job-ready.',
    url: 'https://skilldash.live/learn-skill',
    type: 'website',
    images: [
      {
        url: '/og/og-image-learnskill.jpg',
        width: 1200,
        height: 630,
        alt: 'Learn in-demand skills at SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Skills | SkillDash',
    description: 'Build career-ready skills with hands-on learning paths and real projects',
    images: ['/og/og-image-learnskill.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}