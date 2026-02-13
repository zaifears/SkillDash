import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Hire Talent',
  description: 'Find skilled professionals for your business needs',
  openGraph: {
    title: 'Hire Talent | SkillDash',
    description: 'Find skilled professionals for your business needs',
    url: 'https://skilldash.live/opportunities/hiring',
    type: 'website',
    images: [
      {
        url: '/og/og-image-hiring.jpg',
        width: 1200,
        height: 630,
        alt: 'Hire Talent on SkillDash'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hire Talent | SkillDash',
    description: 'Find skilled professionals for your business needs',
    images: ['/og/og-image-hiring.jpg']
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}