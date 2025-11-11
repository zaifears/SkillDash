import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'SkillCoins - Your Currency',
  description: 'Manage your SkillCoins, view transaction history, and unlock AI-powered features. Earn coins through activities and use them for resume feedback and career discovery.',
  keywords: ['SkillCoins', 'digital currency', 'earn coins', 'AI features', 'resume feedback', 'career discovery', 'Bangladesh'],
  openGraph: {
    title: 'SkillCoins - Your Digital Currency | SkillDash',
    description: 'Manage your SkillCoins, view transaction history, and unlock AI-powered features like resume feedback and career discovery.',
    url: 'https://skilldash.live/coins',
    type: 'website',
    images: [
      {
        url: '/og/og-image-coin.jpg',
        width: 1200,
        height: 630,
        alt: 'SkillCoins - Earn and spend coins on SkillDash features'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillCoins - Your Digital Currency | SkillDash',
    description: 'Manage your SkillCoins and unlock AI-powered career features',
    images: ['/og/og-image-coin.jpg']
  }
};

export default function CoinsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
