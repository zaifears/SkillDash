'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CoinManager } from '@/lib/coinManager';
import TransactionHistory from '@/components/coins/TransactionHistory';
import { LoadingScreen } from '@/lib/components/shared';
import { ROUTES, MESSAGES, LIMITS } from '@/lib/constants';

interface CoinStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  featuresUsed: number;
  lastTransaction?: Date;
}

const CoinsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      sessionStorage.setItem('redirectMessage', MESSAGES.AUTH_REQUIRED);
      sessionStorage.setItem('redirectAfterLogin', ROUTES.COINS);
      router.push(ROUTES.AUTH);
    }
  }, [user, authLoading, router]);

  // Fetch coin data
  const fetchCoinData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const [balance, stats] = await Promise.all([
        CoinManager.getCoinBalance(user.uid),
        CoinManager.getCoinStatistics(user.uid)
      ]);

      setCoinBalance(balance);
      setCoinStats(stats);
    } catch (err: any) {
      console.error('Failed to fetch coin data:', err);
      setError('Failed to load coin information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCoinData();
  }, [user, refreshKey]);

  // Global refresh function for other components
  useEffect(() => {
    (window as any).refreshCoinBalance = () => {
      setRefreshKey(prev => prev + 1);
    };

    return () => {
      delete (window as any).refreshCoinBalance;
    };
  }, []);

  // Loading state
  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{error}</p>
              <button
                onClick={fetchCoinData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <Image
                src="/coin/coin.png"
                alt="SkillDash Coin"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              Your SkillCoins
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Use SkillCoins to unlock powerful AI features. Complete activities to earn more coins!
          </p>
        </div>

        {/* Current Balance - Hero Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-1 mb-8 shadow-xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                  <Image
                    src="/coin/coin.png"
                    alt="SkillDash Coin"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1">
                    {coinBalance}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                    SkillCoins Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h3 className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Earned</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{coinStats?.totalEarned || 0}</div>
            <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">coins total</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h3 className="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-base">Spent</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{coinStats?.totalSpent || 0}</div>
            <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">coins used</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base">Used</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{coinStats?.featuresUsed || 0}</div>
            <div className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">times</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-purple-600 dark:text-purple-400 font-semibold text-sm sm:text-base">Last</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {coinStats?.lastTransaction 
                ? new Date(coinStats.lastTransaction).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : 'None'
              }
            </div>
            <div className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">activity</div>
          </div>
        </div>

        {/* How to Earn Coins */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              💡
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Earn Coins</h2>
          </div>
          
          {/* Available Now */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">Welcome Bonus</h3>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    AVAILABLE NOW
                  </span>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-3">Get 5 coins when you create your account</p>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">+5 coins</div>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-4">Coming Soon</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center text-xl opacity-50">
                  📅
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300">Daily Login</h4>
                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-bold">SOON</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">+1 coin per day</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center text-xl opacity-50">
                  👥
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300">Referrals</h4>
                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-bold">SOON</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">+3 coins per friend</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Costs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🔥
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SkillDash Features</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300">Resume Feedback AI</h3>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {LIMITS.COINS_PER_FEATURE} coin
                </div>
              </div>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Get comprehensive AI-powered feedback on your resume tailored for the Bangladesh job market.
              </p>
              <button
                onClick={() => router.push(ROUTES.RESUME_FEEDBACK)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Try Resume Feedback
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300">Discover Career Paths</h3>
                <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {LIMITS.COINS_PER_FEATURE} coin
                </div>
              </div>
              <p className="text-purple-800 dark:text-purple-200 mb-4">
                Discover personalized career recommendations based on your interests and skills.
              </p>
              <button
                onClick={() => router.push(ROUTES.DISCOVER)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Explore Discover
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <TransactionHistory />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(ROUTES.RESUME_FEEDBACK)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Analyze Resume ({LIMITS.COINS_PER_FEATURE} coin)
          </button>
          
          <button
            onClick={() => router.push(ROUTES.DISCOVER)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Careers ({LIMITS.COINS_PER_FEATURE} coin)
          </button>

          <button
            onClick={fetchCoinData}
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shadow-lg sm:col-span-2 lg:col-span-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Balance
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinsPage;
