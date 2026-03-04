'use client';

import React, { memo } from 'react';
import Link from 'next/link';


// Unused interface removed



const CoreFeaturesSection = memo(() => (
  <section className="py-20 relative">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 box-border">
      {/* Bonus Features Section */}
      <div className="mt-0 pt-0">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Simulator Card */}
          <Link 
            href="/simulator"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 sm:p-8 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📈</div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Trading Simulator</h4>
              <p className="text-white/90 text-xs sm:text-sm mb-4">
                Practice stock trading risk-free with real market data. Learn before you trade.
              </p>
              <div className="flex items-center text-white font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                <span>Launch Simulator</span>
                <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Go Card */}
          <Link 
            href="/go"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-6 sm:p-8 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🔗</div>
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Link Shortener (Go)</h4>
              <p className="text-white/90 text-xs sm:text-sm mb-4">
                Create smart short links with custom delays and expiration. Track & manage easily.
              </p>
              <div className="flex items-center text-white font-semibold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                <span>Start Shortening</span>
                <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  </section>
));
CoreFeaturesSection.displayName = 'CoreFeaturesSection';

export default CoreFeaturesSection;
