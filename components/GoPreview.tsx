'use client';

import React from 'react';
import Link from 'next/link';
import { Link2, Zap, Clock, Shield } from 'lucide-react';

const GoPreview = () => {
  return (
    <section className="relative py-20 bg-gradient-to-l from-slate-800 via-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Quick Stats */}
          <div className="grid grid-cols-2 gap-6 order-last lg:order-first">
            <div className="p-6 bg-slate-700/50 rounded-xl border border-pink-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-pink-400 mb-2">Instant</div>
              <p className="text-slate-300 text-sm">Create Short Links Fast</p>
            </div>
            
            <div className="p-6 bg-slate-700/50 rounded-xl border border-pink-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-rose-400 mb-2">Custom</div>
              <p className="text-slate-300 text-sm">Alias Support Available</p>
            </div>
            
            <div className="p-6 bg-slate-700/50 rounded-xl border border-pink-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-pink-400 mb-2">Delay</div>
              <p className="text-slate-300 text-sm">Add Redirect Wait Time</p>
            </div>
            
            <div className="p-6 bg-slate-700/50 rounded-xl border border-pink-500/20 backdrop-blur-sm">
              <div className="text-3xl font-bold text-rose-400 mb-2">Track</div>
              <p className="text-slate-300 text-sm">Monitor Click Analytics</p>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-500/20 rounded-lg">
                <Link2 className="w-6 h-6 text-pink-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Go Short Links Smart
              </h2>
            </div>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Create powerful short links with custom delays and expiration dates. Perfect for marketing campaigns, referral tracking, and link management with advanced features.
            </p>

            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Lightning Fast</h3>
                  <p className="text-slate-400 text-sm">Create and share short links in seconds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Smart Delays</h3>
                  <p className="text-slate-400 text-sm">Add custom redirect delays for user engagement</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Auto Expiry</h3>
                  <p className="text-slate-400 text-sm">Set expiration dates for link management</p>
                </div>
              </div>
            </div>

            <Link
              href="/go"
              className="inline-block bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-4 px-8 rounded-full hover:shadow-xl hover:scale-105 transform transition-all duration-300"
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
