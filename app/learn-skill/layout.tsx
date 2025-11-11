import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Learn Skills',
  description: 'Master new skills with curated courses and personalized learning paths',
  openGraph: {
    title: 'Learn Skills | SkillDash',
    description: 'Master new skills with curated courses and personalized learning paths',
    url: 'https://skilldash.live/learn-skill',
    type: 'website',
    images: [
      {
        url: '/og/og-image-learnskill.jpg',
        width: 1200,
        height: 630,
        alt: 'Learn Skills on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Skills | SkillDash',
    description: 'Master new skills with curated courses and personalized learning paths',
    images: ['/og/og-image-learnskill.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}