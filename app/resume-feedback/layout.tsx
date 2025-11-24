import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Resume Feedback - Expert Review & AI Insights | SkillDash',
  description: 'Get expert-reviewed feedback, tailor your resume with AI insights and present your experience in a way that opens doors to jobs and gigs.',
  openGraph: {
    title: 'Resume Feedback | SkillDash - Bridge the Skill Gap',
    description: 'Get expert-reviewed feedback, tailor your resume with AI insights and present your experience in a way that opens doors to jobs and gigs.',
    url: 'https://skilldash.live/resume-feedback',
    type: 'website',
    images: [
      {
        url: '/og/og-image-resume.jpg',
        width: 1200,
        height: 630,
        alt: 'Resume feedback and workshop for students'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Feedback | SkillDash',
    description: 'Build a job-ready resume with AI feedback and expert guidance',
    images: ['/og/og-image-resume.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}