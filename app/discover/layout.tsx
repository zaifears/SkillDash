import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Discover Careers',
  description: 'AI-powered career path discovery tailored for Bangladesh youth',
  openGraph: {
    title: 'Discover Careers | SkillDash',
    description: 'AI-powered career path discovery tailored for Bangladesh youth',
    url: 'https://skilldash.live/discover',
    type: 'website',
    images: [
      {
        url: '/og/og-image-discover.jpg',
        width: 1200,
        height: 630,
        alt: 'Discover Careers on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Careers | SkillDash',
    description: 'AI-powered career path discovery tailored for Bangladesh youth',
    images: ['/og/og-image-discover.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}