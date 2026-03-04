'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

const SimulatorPreview = () => {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 box-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-lg shrink-0">
                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white break-words leading-tight">
                Master Trading with Simulator
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-slate-300 mb-8 leading-relaxed break-words">
              Practice stock trading in a risk-free environment. Learn market dynamics, test strategies, and build confidence with real-time data before investing your own capital.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4">
                <BarChart3 className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Real Market Data</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Trade with actual stock prices and market conditions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Target className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Zero Risk Learning</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Practice without losing real money, build skills from scratch</p>
                </div>
              </div>
            </div>

            <Link
              href="/simulator"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:shadow-xl hover:scale-105 transform transition-all duration-300 shadow-md shadow-orange-500/20 max-w-full break-words text-center"
            >
              Launch Simulator →
            </Link>
          </div>

          {/* Right: Quick Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-amber-300 dark:hover:border-amber-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">10K+</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Virtual Capital to Start</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-amber-300 dark:hover:border-amber-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">Live</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Practice in DSE open hours</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-amber-300 dark:hover:border-amber-500/40">
              <div className="text-2xl sm:text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">300+</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">Tradable Companies</p>
            </div>
            
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-none backdrop-blur-sm transition-all hover:border-amber-300 dark:hover:border-amber-500/40">
              <div className="text-xl sm:text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2 break-words leading-tight">Realistic</div>
              <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm">T+1 Limit & Commission</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimulatorPreview;
