import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllDseStocks } from '@/lib/dseStocks';

export const revalidate = 3600;

type RouteParams = {
  symbol: string;
};

type StockPageProps = {
  params: Promise<RouteParams>;
};

function formatSymbol(rawSymbol: string): string {
  return decodeURIComponent(rawSymbol).trim().toUpperCase();
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const stocks = await getAllDseStocks();

  return stocks.map((stock) => ({
    symbol: encodeURIComponent(stock.symbol.toLowerCase()),
  }));
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const formattedSymbol = formatSymbol(symbol);
  const stocks = await getAllDseStocks();
  const stock = stocks.find((item) => item.symbol.toUpperCase() === formattedSymbol);

  if (!stock) {
    return {
      title: 'Stock Not Found | SkillDash DSE Simulator',
      description: 'This DSE stock page is not available right now.',
    };
  }

  const baseUrl = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'https://skilldash.live').replace(/\/$/, '');
  const pageUrl = `${baseUrl}/stocks/${encodeURIComponent(stock.symbol.toLowerCase())}`;
  const title = `${stock.symbol} Stock Price, Share History & Analysis | SkillDash`;
  const description = `Track ${stock.name} (${stock.symbol}) with historical context and market insights. Practice trading ${stock.symbol} risk-free on the SkillDash DSE Simulator.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'SkillDash',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function StockDetailsPage({ params }: StockPageProps) {
  const { symbol } = await params;
  const formattedSymbol = formatSymbol(symbol);
  const stocks = await getAllDseStocks();
  const stock = stocks.find((item) => item.symbol.toUpperCase() === formattedSymbol);

  if (!stock) {
    notFound();
  }

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
            Dhaka Stock Exchange Profile
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {stock.name} ({stock.symbol})
          </h1>
        </header>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-sm mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Historical Price Chart
          </h2>
          <div className="h-72 sm:h-96 w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center text-center px-6">
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Chart placeholder for {stock.symbol}. Integrate your live OHLC/candlestick feed here.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-sm mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
            About {stock.name}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {stock.name} ({stock.symbol}) is one of the listed companies on the Dhaka Stock Exchange (DSE). This page is designed to help learners and aspiring investors understand the stock at a high level by combining price context, company background, and trading practice guidance. For real analysis, connect this template with your live market data service and company fundamentals API.
          </p>
        </section>

        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Practice {stock.symbol} Trading Risk-Free
          </h2>
          <p className="text-blue-50 text-base sm:text-lg leading-relaxed mb-5">
            Want to trade {stock.symbol} without risking real money? Practice on the SkillDash DSE Simulator for free.
          </p>
          <Link
            href="/simulator"
            className="inline-flex items-center justify-center rounded-full bg-white text-blue-700 font-semibold px-6 py-3 hover:bg-blue-50 transition-colors"
          >
            Go to Simulator
          </Link>
        </section>
      </div>
    </main>
  );
}
