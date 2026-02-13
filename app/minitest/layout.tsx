import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Skill Tests',
  description: 'Test your skills with AI-powered assessments and get instant feedback',
  openGraph: {
    title: 'Skill Tests | SkillDash',
    description: 'Test your skills with AI-powered assessments and get instant feedback',
    url: 'https://skilldash.live/minitest',
    type: 'website',
    images: [
      {
        url: '/og/og-image-minitest.jpg',
        width: 1200,
        height: 630,
        alt: 'Skill Tests on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skill Tests | SkillDash',
    description: 'Test your skills with AI-powered assessments and get instant feedback',
    images: ['/og/og-image-minitest.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}