import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Coins - Your Trading Balance',
  description: 'View your Coin balance, recharge via bKash, and start trading on the DSE simulator. 10 BDT = 10,000 Coins.',
  keywords: ['Coins', 'trading balance', 'DSE simulator', 'virtual trading', 'Bangladesh stock exchange', 'bKash recharge'],
  openGraph: {
    title: 'Coins - Your Trading Balance | SkillDash',
    description: 'View your Coin balance, recharge via bKash, and trade DSE stocks. 10 BDT = 10,000 Coins.',
    url: 'https://skilldash.live/coins',
    type: 'website',
    images: [
      {
        url: '/og/og-image-coin.jpg',
        width: 1200,
        height: 630,
        alt: 'SkillDash Coins - Your Trading Balance'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coins - Your Trading Balance | SkillDash',
    description: 'View your Coin balance and trade DSE stocks in the simulator',
    images: ['/og/og-image-coin.jpg']
  }
};

export default function CoinsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
