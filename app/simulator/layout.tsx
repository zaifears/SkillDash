import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'DSE Stock Simulator - Practice Trading with Virtual Currency | SkillDash',
  description: 'Practice trading Dhaka Stock Exchange (DSE) stocks with virtual currency. Learn stock market investing risk-free with real-time market data, 0.3% commission simulation, and T+1 settlement rules.',
  keywords: ['DSE simulator', 'stock trading practice', 'Dhaka Stock Exchange', 'virtual trading', 'learn stock market', 'Bangladesh stocks', 'paper trading'],
  openGraph: {
    title: 'DSE Stock Simulator | SkillDash - Practice Trading Risk-Free',
    description: 'Practice trading Dhaka Stock Exchange stocks with virtual currency. Real-time market data, 0.3% commission, T+1 settlement rules. No real money involved.',
    url: 'https://skilldash.live/simulator',
    type: 'website',
    images: [
      {
        url: '/og/og-image-dsesimulator.jpg',
        width: 1200,
        height: 630,
        alt: 'DSE Stock Simulator - Practice Trading with Virtual Currency'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSE Stock Simulator | SkillDash',
    description: 'Practice trading DSE stocks with virtual currency. Learn stock market investing risk-free!',
    images: ['/og/og-image-dsesimulator.jpg']
  }
};

export default function SimulatorLayout({ children }: { children: ReactNode }) {
  return children;
}
