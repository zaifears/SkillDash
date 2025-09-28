'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CoinManager } from '@/lib/coinManager';
import { useRouter } from 'next/navigation';

// 🎯 CORRECTED INTERFACE - Matches API response
interface CoinStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  transactionCount: number;
  lastActivity: Date | null;
  topFeatures: Array<{ feature: string; count: number; totalAmount: number }>;
}

interface Transaction {
  id: string;
  amount: number;
  action: 'add' | 'deduct';
  feature?: string;
  reason?: string;
  description: string;
  timestamp: Date;
  success: boolean;
}

export default function CoinsPage() {
  const { user, loading: authLoading } = useAuth();
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // 🔄 Fetch coin data
  const fetchCoinData = async (showLoading: boolean = true) => {
    if (!user) return;
    
    if (showLoading) setLoading(true);
    setError('');

    try {
      console.log('🔄 Fetching coin data for user:', user.uid);
      
      const [balance, stats, transactionHistory] = await Promise.all([
        CoinManager.getCoinBalance(user.uid),
        CoinManager.getCoinStatistics(user.uid),
        CoinManager.getTransactionHistory(user.uid, 20)
      ]);

      console.log('✅ Coin data fetched successfully:', { balance, statsCount: stats.topFeatures.length, transactionCount: transactionHistory.length });

      setCoinBalance(balance);
      setCoinStats(stats); // ✅ Now matches the interface perfectly
      setTransactions(transactionHistory);
    } catch (err: any) {
      console.error('❌ Failed to fetch coin data:', err);
      setError('Failed to load coin information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCoinData(false);
    setRefreshing(false);
  };

  // ⚡ Initial data fetch
  useEffect(() => {
    if (!authLoading && user) {
      fetchCoinData();
    } else if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // 🔄 Auto-refresh on page focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        fetchCoinData(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, loading]);

  // ⏳ Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Loading your SkillCoins...</p>
        </div>
      </div>
    );
  }

  // 🚫 Not authenticated
  if (!user) {
    return null; // Will redirect to /auth
  }

  // ❌ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/90 dark:bg-slate-800/90 p-8 rounded-2xl shadow-2xl backdrop-blur text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => fetchCoinData()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // 📊 Format last activity date
  const formatLastActivity = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // 🎨 Format feature name
  const formatFeatureName = (feature: string): string => {
    return feature.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* 🏆 Header with refresh button */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-6xl">🪙</span>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your SkillCoins</h1>
              <p className="text-xl text-gray-300">
                Use SkillCoins to unlock powerful AI features. Complete activities to earn more coins!
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Balance'}
          </button>
        </div>

        {/* 💰 Current Balance - Large Display */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-3xl shadow-2xl mb-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="text-6xl animate-bounce">🪙</span>
            <div>
              <p className="text-8xl font-bold text-white drop-shadow-lg">{coinBalance}</p>
              <p className="text-2xl text-yellow-100 font-semibold">SkillCoins Available</p>
            </div>
          </div>
        </div>

        {/* 📊 Statistics Cards */}
        {coinStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Earned */}
            <div className="bg-green-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📈</span>
                <div>
                  <p className="text-3xl font-bold">{coinStats.totalEarned}</p>
                  <p className="text-green-100 font-medium">Earned</p>
                  <p className="text-xs text-green-200">coins total</p>
                </div>
              </div>
            </div>

            {/* Spent */}
            <div className="bg-red-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📉</span>
                <div>
                  <p className="text-3xl font-bold">{coinStats.totalSpent}</p>
                  <p className="text-red-100 font-medium">Spent</p>
                  <p className="text-xs text-red-200">coins used</p>
                </div>
              </div>
            </div>

            {/* Features Used */}
            <div className="bg-blue-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div>
                  <p className="text-3xl font-bold">{coinStats.topFeatures.length}</p>
                  <p className="text-blue-100 font-medium">Used</p>
                  <p className="text-xs text-blue-200">times</p>
                </div>
              </div>
            </div>

            {/* Last Activity */}
            <div className="bg-purple-600 p-6 rounded-2xl shadow-xl text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🕐</span>
                <div>
                  <p className="text-lg font-bold">{formatLastActivity(coinStats.lastActivity)}</p>
                  <p className="text-purple-100 font-medium">Last</p>
                  <p className="text-xs text-purple-200">activity</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 Feature Usage & Transaction History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Features Used */}
          {coinStats?.topFeatures && coinStats.topFeatures.length > 0 && (
            <div className="bg-white/90 dark:bg-slate-800/90 p-6 rounded-2xl shadow-xl backdrop-blur">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🏆</span> Most Used Features
              </h3>
              <div className="space-y-3">
                {coinStats.topFeatures.slice(0, 5).map((feature, index) => (
                  <div key={feature.feature} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatFeatureName(feature.feature)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Used {feature.count} time{feature.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {feature.totalAmount} 🪙
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white/90 dark:bg-slate-800/90 p-6 rounded-2xl shadow-xl backdrop-blur">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📋</span> Recent Transactions
            </h3>
            
            {transactions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      transaction.action === 'add' 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {transaction.action === 'add' ? '📈' : '📉'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.action === 'add' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.action === 'add' ? '+' : '-'}{transaction.amount} 🪙
                      </p>
                      {!transaction.success && (
                        <p className="text-xs text-red-500">Failed</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-2 block">📝</span>
                <p>No transactions yet</p>
                <p className="text-sm">Start using SkillDash features to see your activity here!</p>
              </div>
            )}
          </div>
        </div>

        {/* 🎯 Earn More Coins Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-3xl shadow-2xl text-white">
          <h3 className="text-3xl font-bold mb-4 text-center">🚀 How to Earn More Coins</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur">
              <span className="text-4xl block mb-2">📝</span>
              <h4 className="font-bold text-lg mb-2">Complete Your Profile</h4>
              <p className="text-purple-100 text-sm">
                Add skills, experience, and education to unlock bonus coins
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur">
              <span className="text-4xl block mb-2">🎯</span>
              <h4 className="font-bold text-lg mb-2">Use AI Features</h4>
              <p className="text-purple-100 text-sm">
                Get resume feedback and skill analysis to earn activity bonuses
              </p>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur">
              <span className="text-4xl block mb-2">🔗</span>
              <h4 className="font-bold text-lg mb-2">Share & Refer</h4>
              <p className="text-purple-100 text-sm">
                Invite friends to SkillDash and earn referral bonuses
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/profile')}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              💼 Go to Profile
            </button>
          </div>
        </div>

        {/* 💡 Coin Usage Tips */}
        <div className="mt-8 bg-white/90 dark:bg-slate-800/90 p-6 rounded-2xl shadow-xl backdrop-blur">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>💡</span> Spend Your Coins Wisely
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">📄 Resume Feedback</h4>
              <p className="text-blue-800 dark:text-blue-400 text-sm mb-2">
                Get AI-powered resume analysis and improvement suggestions
              </p>
              <p className="text-blue-600 dark:text-blue-500 font-semibold">Cost: 1 coin</p>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">🔍 Skill Discovery</h4>
              <p className="text-green-800 dark:text-green-400 text-sm mb-2">
                Discover new skills and career paths with AI guidance
              </p>
              <p className="text-green-600 dark:text-green-500 font-semibold">Cost: 1 coin</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/discover')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              🚀 Explore Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
