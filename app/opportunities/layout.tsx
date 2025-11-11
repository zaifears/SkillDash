import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Opportunities',
  description: 'Find jobs, freelance work, and career opportunities in Bangladesh',
  openGraph: {
    title: 'Opportunities | SkillDash',
    description: 'Find jobs, freelance work, and career opportunities in Bangladesh',
    url: 'https://skilldash.live/opportunities',
    type: 'website',
    images: [
      {
        url: '/og/og-image-opportunities.jpg',
        width: 1200,
        height: 630,
        alt: 'Opportunities on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opportunities | SkillDash',
    description: 'Find jobs, freelance work, and career opportunities in Bangladesh',
    images: ['/og/og-image-opportunities.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}