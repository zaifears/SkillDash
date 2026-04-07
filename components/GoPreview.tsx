'use client';

import React from 'react';
import Link from 'next/link';
import { Link2, Zap, Clock, Shield } from 'lucide-react';

const GoPreview = () => {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 box-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Quick Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 order-last lg:order-first">
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-pink-200 dark:border-pink-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-pink-300 dark:hover:border-pink-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-pink-500 dark:text-pink-400 mb-2">Instant</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Create Short Links Fast</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-pink-200 dark:border-pink-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-pink-300 dark:hover:border-pink-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-rose-500 dark:text-rose-400 mb-2">Custom</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Alias Support Available</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-pink-200 dark:border-pink-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-pink-300 dark:hover:border-pink-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-pink-500 dark:text-pink-400 mb-2">Delay</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Add Redirect Wait Time</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-pink-200 dark:border-pink-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-pink-300 dark:hover:border-pink-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-rose-500 dark:text-rose-400 mb-2">Track</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Monitor Click Analytics</p>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-100 dark:bg-pink-500/20 rounded-lg shrink-0">
                <Link2 className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white break-words leading-tight">
                Go Short Links Smart
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-slate-300 mb-8 leading-relaxed break-words">
              Create powerful short links with custom delays and expiration dates. Perfect for marketing campaigns, referral tracking, and link management with advanced features.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-pink-500 dark:text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Lightning Fast</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Create and share short links in seconds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-rose-500 dark:text-rose-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Smart Delays</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Add custom redirect delays for user engagement</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-pink-500 dark:text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Auto Expiry</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Set expiration dates for link management</p>
                </div>
              </div>
            </div>

            <Link
              href="/go"
              aria-label="Go to SkillDash Go short links"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:shadow-xl hover:scale-105 transform transition-all duration-300 shadow-md shadow-pink-500/20 max-w-full break-words text-center"
            >
              Start Shortening →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoPreview;
