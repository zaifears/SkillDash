import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compare Top DSE Stock Brokers in Bangladesh (2026)',
  description: 'Compare the best Dhaka Stock Exchange (DSE) brokers. Learn about BO account opening fees, commission rates, and practice trading risk-free before investing.',
  keywords: [
    'DSE stock broker', 'best stock broker Bangladesh', 'BO account opening fee',
    'LankaBangla Securities', 'City Brokerage', 'Dhaka Stock Exchange', 'BO account CDBL'
  ],
  alternates: {
    canonical: 'https://skilldash.live/blog/top-dse-stock-brokers-2026',
  },
  openGraph: {
    title: 'Compare Top DSE Stock Brokers in Bangladesh (2026)',
    description: 'Learn about BO account opening fees and practice trading risk-free before investing real money.',
    url: 'https://skilldash.live/blog/top-dse-stock-brokers-2026',
    type: 'article',
  }
};

export default function TopDseBrokersArticle() {
  const pageUrl = 'https://skilldash.live/blog/top-dse-stock-brokers-2026';
  const coverImage = 'https://skilldash.live/blog/19197351.jpg';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    headline: 'Compare Top DSE Stock Brokers in Bangladesh (2026)',
    description: 'A comprehensive comparison of Dhaka Stock Exchange brokers, BO account fees, and how to practice trading.',
    image: [coverImage],
    url: pageUrl,
    author: {
      '@type': 'Organization',
      name: 'SkillDash',
      url: 'https://skilldash.live',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SkillDash',
      url: 'https://skilldash.live',
      logo: {
        '@type': 'ImageObject',
        url: 'https://skilldash.live/skilldash-logo.png',
        width: 512,
        height: 512,
      }
    },
    datePublished: '2026-04-08',
    dateModified: '2026-04-08',
    inLanguage: 'en',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://skilldash.live',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://skilldash.live/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Compare Top DSE Stock Brokers in Bangladesh (2026)',
        item: pageUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the fee to open a BO account in Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The standard fee to open a Beneficiary Owner (BO) account in Bangladesh is generally around 450 to 500 BDT, which includes the CDBL fee. Some brokers may charge additional service fees.'
        }
      },
      {
        '@type': 'Question',
        name: 'Which is the best stock broker in Bangladesh?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Top stock brokers in Bangladesh include LankaBangla Securities, City Brokerage, IDLC Securities, and BRAC EPL. The best choice depends on your need for a dedicated RM, digital app quality, and commission rates.'
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Compare Top DSE Stock Brokers in Bangladesh (2026)
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about opening a BO Account, broker commissions, and how to protect your capital.
          </p>

          <figure className="mt-8">
            <Image
              src="/blog/19197351.jpg"
              alt="Stock broker comparison illustration"
              width={1200}
              height={675}
              className="w-full h-auto rounded-2xl border border-slate-200 dark:border-slate-700"
              priority
            />
            <figcaption className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              <a href="http://www.freepik.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-200">
                Designed by vectorjuice / Freepik
              </a>
            </figcaption>
          </figure>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Why Choosing the Right DSE Broker Matters</h2>
          <p>
            To trade on the Dhaka Stock Exchange (DSE), you must open a Beneficiary Owner (BO) account through a registered stock broker (Depository Participant). Your broker handles your trades, executes your buy/sell orders, and charges a commission on every transaction. Choosing a broker with a reliable trading app (like DSE Mobile) and low commission rates is critical for profitability.
          </p>

          <h2>Top 5 Stock Brokers in Bangladesh</h2>
          <ul>
            <li><strong>LankaBangla Securities:</strong> One of the largest retail brokerage houses in Bangladesh. Known for robust digital platforms and extensive branch networks.</li>
            <li><strong>City Brokerage:</strong> A subsidiary of City Bank, offering premium services, institutional-grade research, and high reliability.</li>
            <li><strong>IDLC Securities:</strong> Excellent for beginners and professionals alike, offering strong customer support and a seamless BO account opening process.</li>
            <li><strong>BRAC EPL Stock Brokerage:</strong> Backed by BRAC Bank, they provide comprehensive market research and a highly secure trading environment.</li>
            <li><strong>Shanta Securities:</strong> Popular for their premium customer service, advanced trading panels, and daily market insights.</li>
          </ul>

          <h2>BO Account Opening Fees & Maintenance Costs</h2>
          <p>
            When opening a BO account in Bangladesh, costs are regulated by the Central Depository Bangladesh Limited (CDBL) alongside broker-specific charges.
          </p>
          
          {/* LLM-Friendly Data Table */}
          <div className="overflow-x-auto my-8">
            <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="border border-slate-300 dark:border-slate-700 p-4 text-left">Fee Type</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-4 text-left">Estimated Cost (BDT)</th>
                  <th className="border border-slate-300 dark:border-slate-700 p-4 text-left">Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">BO Account Opening</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">450 - 500৳</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">One-time</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">CDBL Maintenance Fee</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">450৳</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">Annually</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">Brokerage Commission</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">0.30% - 0.50%</td>
                  <td className="border border-slate-300 dark:border-slate-700 p-4">Per Trade</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>How to Practice Trading Before Investing</h2>
          <p>
            Opening a BO account is easy, but making profitable trades is hard. The DSE operates on strict T+1 settlement rules, and understanding market volatility requires experience. Instead of testing your strategies with real capital, use a paper trading simulator.
          </p>
        </div>

        {/* BOTTOM MASSIVE CTA */}
        <section className="mt-16 mb-8 p-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Don&apos;t Lose Real Money While Learning
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              90% of new investors lose money in their first year on the DSE. Practice your trading strategies on the SkillDash Simulator with virtual currency before opening a real BO account.
            </p>
          </div>
          <Link 
            href="/simulator"
            className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-slate-100 font-bold text-lg py-4 px-8 rounded-full transition-transform hover:scale-105"
          >
            Start Free Simulator
            <ArrowRight className="w-6 h-6" />
          </Link>
        </section>
      </article>
    </div>
  );
}
