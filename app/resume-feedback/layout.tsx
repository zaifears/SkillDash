import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Resume Feedback',
  description: 'Get AI-powered resume analysis and improvement suggestions',
  openGraph: {
    title: 'Resume Feedback | SkillDash',
    description: 'Get AI-powered resume analysis and improvement suggestions',
    url: 'https://skilldash.live/resume-feedback',
    type: 'website',
    images: [
      {
        url: '/og/og-image-resume.jpg',
        width: 1200,
        height: 630,
        alt: 'Resume Feedback on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Feedback | SkillDash',
    description: 'Get AI-powered resume analysis and improvement suggestions',
    images: ['/og/og-image-resume.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}