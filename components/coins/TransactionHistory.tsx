'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CoinManager } from '@/lib/coinManager';

// Interface matches what the component uses internally
interface Transaction {
  id: string;
  type: 'spent' | 'earned' | 'granted';
  amount: number;
  description: string;
  feature: string;
  timestamp: Date;
  success: boolean;
}

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, index }) => {
  const isDeduction = transaction.type === 'spent';
  const isAddition = transaction.type === 'earned' || transaction.type === 'granted';

  return (
    <div 
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-xl border border-gray-300 dark:border-gray-700/50 hover:border-gray-400 dark:hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/20 animate-fade-in-up gap-3"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Arrow Icon */}
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 ${
          isDeduction 
            ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-600 dark:text-red-400 group-hover:from-red-500/30 group-hover:to-red-600/30' 
            : 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400 group-hover:from-green-500/30 group-hover:to-green-600/30'
        }`}>
          {isDeduction ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors duration-200 truncate">
            {transaction.description || `${isDeduction ? 'Used' : 'Earned'} ${transaction.amount} coin(s)`}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs border transition-all duration-200 group-hover:scale-105 truncate max-w-[100px] sm:max-w-none ${
              transaction.feature === 'resume-feedback' 
                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/30'
                : transaction.feature === 'discover'
                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30'
                : transaction.feature === 'welcome-bonus' || transaction.feature === 'welcome bonus' || transaction.feature === 'welcome_bonus' || transaction.feature === 'signup_bonus'
                ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30'
                : transaction.feature === 'login-bonus' || transaction.feature === 'login bonus'
                ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30'
                : transaction.feature === 'recharge'
                ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-500/30'
                : 'bg-gray-200 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500/30'
            }`}>
              {transaction.feature?.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
            </span>
            {!transaction.success && (
              <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs border border-red-300 dark:border-red-500/30">
                Failed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right flex-shrink-0 self-end sm:self-center">
        <div className={`text-lg sm:text-xl font-bold transition-all duration-200 group-hover:scale-110 ${
          isDeduction ? 'text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300' : 'text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300'
        }`}>
          {isDeduction ? '-' : '+'}
          {transaction.amount}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
          coin{transaction.amount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-300 dark:border-gray-700/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700/50 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-300 dark:bg-gray-700/50 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700/50 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gradient-to-br from-gray-300 dark:from-gray-600/20 to-gray-400 dark:to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-gray-600 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Transactions Yet</h3>
    <p className="text-gray-500 dark:text-gray-500 text-sm max-w-sm mx-auto">
      Your coin transaction history will appear here once you start using SkillDash features.
    </p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 rounded-xl p-6 text-center">
    <div className="text-red-600 dark:text-red-400 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Oops! Something went wrong</h3>
    <p className="text-red-600 dark:text-red-400/80 text-sm mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-200 dark:bg-red-500/20 hover:bg-red-300 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
    >
      Try Again
    </button>
  </div>
);

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const history = await CoinManager.getTransactionHistory(user.uid, 50);
      
      // ======================= FIX START =======================
      // Correctly map the backend's `action` field to the frontend's expected `type` field.
      const mappedHistory: Transaction[] = history.map((item: any) => {
        let type: 'spent' | 'earned' | 'granted' = 'earned';
        if (item.action === 'deduct') {
          type = 'spent';
        } else if (item.reason === 'welcome_bonus' || item.reason === 'signup_bonus') {
          type = 'granted';
        }

        // Determine feature display name
        let feature = item.feature || item.reason || 'unknown';
        if (item.reason === 'recharge' || item.feature === 'recharge') {
          feature = 'recharge';
        }

        return {
          id: item.id,
          type: type, // Use the mapped type
          amount: item.amount,
          description: item.description,
          feature: feature, // Use feature or reason for the tag
          timestamp: item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp),
          success: item.success !== false
        };
      });
      // ======================== FIX END ========================
      
      setTransactions(mappedHistory);
    } catch (err: any) {
      console.error('Failed to fetch transaction history:', err);
      setError('Failed to load transaction history. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
          <div className="w-20 h-4 bg-gray-300 dark:bg-gray-700/50 rounded animate-pulse" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
        <ErrorState error={error} onRetry={fetchTransactions} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Transaction History
        </h2>
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800/50 px-2 sm:px-3 py-1 rounded-full border border-gray-400 dark:border-gray-700/50 self-start sm:self-auto">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {transactions.map((transaction, index) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction} 
              index={index}
            />
          ))}
          
          {/* STATS SUMMARY */}
          <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-400">
                +{transactions.filter(t => t.type === 'earned' || t.type === 'granted').reduce((sum, t) => sum + t.amount, 0)}
              </div>
              <div className="text-[10px] sm:text-sm text-green-300">Earned</div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-400">
                -{transactions.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0)}
              </div>
              <div className="text-[10px] sm:text-sm text-red-300">Spent</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 sm:p-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-400">
                {transactions.filter(t => t.type === 'spent').length}
              </div>
              <div className="text-[10px] sm:text-sm text-blue-300">Used</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;