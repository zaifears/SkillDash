import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share2, Calendar, User, Rocket, ShieldCheck, Download, Smartphone } from 'lucide-react';

export const metadata = {
  title: 'Press Release: SkillDash is Officially Rebranding to Stock Simulator BD',
  description: 'We have officially rebranded from SkillDash to Stock Simulator BD. Read our official press release regarding our 100% pivot into building the ultimate Dhaka Stock Exchange (DSE) paper trading platform.',
  openGraph: {
    title: 'Press Release: SkillDash is Officially Rebranding to Stock Simulator BD',
    description: 'We have officially pivoted to focus entirely on financial education and DSE market simulation with a brand-new identity.',
    type: 'article',
    publishedTime: '2026-06-20T12:00:00.000Z',
  },
};

export default function RebrandPressReleasePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0E11] text-gray-900 dark:text-gray-100 font-sans pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Insights & Blog
        </Link>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            Official Announcement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            SkillDash is Officially Rebranding to Stock Simulator BD
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-2 border-y border-gray-200 dark:border-gray-800 py-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>June 20, 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>By Shahoriar Hossain</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Branding Image/Logo Grid Placer */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-8 sm:p-12 mb-10 shadow-lg border border-gray-200 dark:border-gray-800">
          
          {/* New Logo */}
          <div className="mb-6 relative w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl">
            <Image 
              src="/web-app-manifest-512x512.png" 
              alt="Stock Simulator BD Logo" 
              fill
              sizes="(max-width: 640px) 96px, 128px"
              className="object-contain"
              priority
            />
          </div>

          <div className="text-center space-y-4">
            <div className="text-white font-black text-3xl sm:text-5xl tracking-tight flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="opacity-70 line-through decoration-red-500 decoration-4">SkillDash</span>
              <span className="text-blue-300 text-2xl font-light sm:rotate-0 rotate-90">➔</span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Stock Simulator BD</span>
            </div>
            <p className="text-blue-100 text-sm max-w-md mx-auto font-medium opacity-90">
              The ultimate free, browser-based paper trading platform for the Dhaka Stock Exchange (DSE).
            </p>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed text-base">
          <p className="font-semibold text-gray-900 dark:text-white text-lg">
            DHAKA, BANGLADESH — We are thrilled to announce that our platform is evolving. Moving forward, <strong className="text-blue-600 dark:text-blue-400">SkillDash has officially rebranded to Stock Simulator BD</strong>. 
          </p>

          <p>
            Due to the overwhelming success and community demand for our Dhaka Stock Exchange (DSE) paper trading tool, we are making a definitive executive decision to focus <strong>100% of our energy and technology on our core simulator business</strong>. 
          </p>

          <hr className="border-gray-200 dark:border-gray-800 my-8" />

          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-500" /> Download Our New Android App
          </h2>
          <p>
            To celebrate our rebrand, we are releasing our native Android Application. Experience the thrill of risk-free trading directly from your home screen, complete with real-time DSE data, T+1 settlement rules, and zero latency.
          </p>
          
          <div className="my-6">
            <a 
              href="https://www.stocksimulator.tech/stocksimulator_bd.apk"
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95 w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              Download APK (Android)
            </a>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-500" /> What's New?
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>New Web Domain:</strong> We are now live exclusively at <a href="https://www.stocksimulator.tech" className="text-blue-500 underline">stocksimulator.tech</a>.</li>
            <li><strong>New Brand Identity:</strong> A completely reconstructed logo (shown above) representing analytics, financial precision, and market dynamics.</li>
            <li><strong>Laser Focus:</strong> By stripping away peripheral features, we are drastically improving the speed and reliability of our real-time stock simulation engine.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" /> Your Accounts Are Safe
          </h2>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4 rounded-xl">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Your profile data, historical trades, and virtual portfolios remain completely untouched. Simply log in with your existing Google account on our new domain to access your funds and continue trading.
            </p>
          </div>

          <p className="pt-4 font-medium">
            Thank you for supporting us through the SkillDash era. Welcome to the future of financial education in Bangladesh: <strong>Stock Simulator BD</strong>.
          </p>
        </article>

        {/* Article Footer Call to Action */}
        <footer className="mt-12 p-6 sm:p-8 bg-gray-100 dark:bg-[#15191E] rounded-2xl border border-gray-200 dark:border-gray-800 text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-bold">Ready to practice your DSE strategies?</h3>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/simulator" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 w-full sm:w-auto"
            >
              Open Trading Terminal
            </Link>
          </div>
        </footer>

      </div>
    </div>
  );
}