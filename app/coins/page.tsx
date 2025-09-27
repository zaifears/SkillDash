'use client';

import { useState, useEffect, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CoinManager } from '@/lib/coinManager';
import CoinDisplay from '@/components/ui/CoinDisplay';
import BouncingBalls from '@/components/shared/BouncingBalls';

// TypeScript interfaces
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface TransactionHistoryItem {
  id: string;
  type: 'spent' | 'earned' | 'granted';
  amount: number;
  description: string;
  feature: string;
  timestamp: Date;
  success: boolean;
}

// Memoized components
const AuthLoadingScreen = memo(() => (
  <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
  </div>
));
AuthLoadingScreen.displayName = 'AuthLoadingScreen';

const CoinIcon = memo(() => (
  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  </div>
));
CoinIcon.displayName = 'CoinIcon';

const FeatureCard = memo(({ icon, title, description, color }: FeatureCardProps) => (
  <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 backdrop-blur-sm">
    <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
      {icon}
    </div>
    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{title}</h3>
    <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
  </div>
));
FeatureCard.displayName = 'FeatureCard';

// Pre-defined data for faster rendering
const futureFeatures: FeatureCardProps[] = [
  {
    icon: <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: "Daily Login",
    description: "+1 coin daily",
    color: "bg-green-100 dark:bg-green-900/30"
  },
  {
    icon: <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" /></svg>,
    title: "Referrals",
    description: "+3 coins per friend",
    color: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    icon: <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    title: "Achievements",
    description: "+2 coins per milestone",
    color: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    icon: <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    title: "Premium",
    description: "Unlimited access",
    color: "bg-orange-100 dark:bg-orange-900/30"
  }
];

export default function CoinsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [coinHistory, setCoinHistory] = useState<TransactionHistoryItem[]>([]);
  const [coinStats, setCoinStats] = useState<any>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectMessage', 'Please log in to view your coin balance and rewards.');
      sessionStorage.setItem('redirectAfterLogin', '/coins');
      router.push('/auth');
      return;
    }

    // 🚀 Fetch all coin data
    if (user) {
      const fetchCoinData = async () => {
        try {
          const [balance, history, stats] = await Promise.all([
            CoinManager.getCoinBalance(user.uid),
            CoinManager.getTransactionHistory(user.uid),
            CoinManager.getCoinStatistics(user.uid)
          ]);

          setCurrentBalance(balance);
          setCoinHistory(history);
          setCoinStats(stats);
        } catch (error) {
          console.error('Error fetching coin data:', error);
        } finally {
          setIsLoadingBalance(false);
        }
      };
      fetchCoinData();
    }
  }, [user, loading, router]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'spent':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m0 7V3" />
          </svg>
        );
      case 'earned':
      case 'granted':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8 relative">
      <BouncingBalls variant="default" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <CoinIcon />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 mt-4">Your SkillDash Coins</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage your AI feature usage</p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-8 text-center">
            <div className="mb-4">
              {isLoadingBalance ? (
                <div className="animate-pulse">
                  <div className="h-16 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentBalance}
                  </div>
                  <p className="text-xl text-gray-600 dark:text-gray-400">Available Coins</p>
                </>
              )}
            </div>
            
            <div className="flex justify-center">
              <CoinDisplay className="flex scale-125" />
            </div>
          </div>
        </div>

        {/* 🆕 TRANSACTION HISTORY SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Transaction History</h2>
            
            {isLoadingBalance ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                    <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : coinHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {coinHistory.map((transaction, index) => (
                  <div key={transaction.id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'spent' 
                          ? 'bg-red-100 dark:bg-red-900/30' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                            {transaction.feature.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        transaction.type === 'spent' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {transaction.type === 'spent' ? '−' : '+'}{transaction.amount}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.amount === 1 ? 'coin' : 'coins'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Transactions Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Your coin transaction history will appear here once you start using AI features.</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Fair Access for Everyone 🌟
            </h2>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
              To keep SkillDash accessible for everyone to use, we currently provide <span className="font-bold text-blue-600 dark:text-blue-400">5 coins per user</span>. 
              This ensures our AI-powered features remain available to all students while maintaining service quality.
            </p>

            {/* How Coins Work Section */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-white/20 dark:border-gray-600/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 How Coins Work</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Resume Feedback</p>
                    <p className="text-gray-600 dark:text-gray-400">1 coin per analysis</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Discover Analysis</p>
                    <p className="text-gray-600 dark:text-gray-400">1 coin per completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Features Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-700 p-8 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Coming Soon! 🚀
            </h2>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              We're working on exciting ways for you to earn more coins and unlock additional features!
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {futureFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center pt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
