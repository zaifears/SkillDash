import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Discover Skills - AI-Powered Assessment | SkillDash',
  description: 'Take our quick AI-powered quiz to identify your strengths, uncover market-relevant skills and begin your journey to real career opportunities.',
  openGraph: {
    title: 'Discover Your Skills | SkillDash - Bridge the Skill Gap',
    description: 'Take our quick AI-powered quiz to identify your strengths, uncover market-relevant skills and begin your journey to real career opportunities.',
    url: 'https://skilldash.live/discover',
    type: 'website',
    images: [
      {
        url: '/og/og-image-discover.jpg',
        width: 1200,
        height: 630,
        alt: 'SkillDash - AI skill discovery for students'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Your Skills | SkillDash',
    description: 'AI-powered skill assessment and discovery tool for students',
    images: ['/og/og-image-discover.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}