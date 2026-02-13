'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

const SimulatorPreview = () => {
  return (
    <section className="relative py-20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Master Trading with Simulator
              </h2>
            </div>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Practice stock trading in a risk-free environment. Learn market dynamics, test strategies, and build confidence with real-time data before investing your own capital.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4">
                <BarChart3 className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Real Market Data</h3>
                  <p className="text-slate-400 text-sm">Trade with actual stock prices and market conditions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Target className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Zero Risk Learning</h3>
                  <p className="text-slate-400 text-sm">Practice without losing real money, build skills from scratch</p>
                </div>
              </div>
            </div>

            <Link
              href="/simulator"
              className="inline-block bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-4 px-8 rounded-full hover:shadow-xl hover:scale-105 transform transition-all duration-300"
            >
              Launch Simulator →
            </Link>
          </div>

          {/* Right: Quick Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-slate-700/50 rounded-xl border border-amber-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">10K+</div>
              <p className="text-slate-300 text-sm">Virtual Capital to Start</p>
            </div>
            
            <div className="p-6 bg-slate-700/50 rounded-xl border border-amber-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">Live</div>
              <p className="text-slate-300 text-sm">Access and Pratice during DSE open hour</p>
            </div>
            
            <div className="p-6 bg-slate-700/50 rounded-xl border border-amber-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">300+</div>
              <p className="text-slate-300 text-sm">Tradable Companies</p>
            </div>
            
            <div className="p-6 bg-slate-700/50 rounded-xl border border-amber-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-400 mb-2">Real Limitations</div>
              <p className="text-slate-300 text-sm">Like T+1 Limit and Commission Charge</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimulatorPreview;
