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
      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-800/80 hover:from-gray-750 hover:to-gray-750/80 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Arrow Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${
          isDeduction 
            ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-400 group-hover:from-red-500/30 group-hover:to-red-600/30' 
            : 'bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 group-hover:from-green-500/30 group-hover:to-green-600/30'
        }`}>
          {isDeduction ? (
            <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : (
            <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-gray-100 transition-colors duration-200">
            {transaction.description || `${isDeduction ? 'Used' : 'Earned'} ${transaction.amount} coin(s)`}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
            <span className={`px-2 py-1 rounded-full text-xs border transition-all duration-200 group-hover:scale-105 ${
              transaction.feature === 'resume-feedback' 
                ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/30'
                : transaction.feature === 'discover'
                ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border-purple-500/30'
                : transaction.feature === 'welcome-bonus' || transaction.feature === 'welcome bonus'
                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/30'
                : transaction.feature === 'login-bonus' || transaction.feature === 'login bonus'
                ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30'
                : 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/30'
            }`}>
              {transaction.feature?.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
            </span>
            {!transaction.success && (
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs border border-red-500/30">
                Failed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={`text-xl font-bold transition-all duration-200 group-hover:scale-110 ${
          isDeduction ? 'text-red-400 group-hover:text-red-300' : 'text-green-400 group-hover:text-green-300'
        }`}>
          {isDeduction ? '-' : '+'}
          {transaction.amount}
        </div>
        <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
          coin{transaction.amount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-700/50 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-700/50 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-700/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-12 h-6 bg-gray-700/50 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-20 h-20 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-400 mb-2">No Transactions Yet</h3>
    <p className="text-gray-500 text-sm max-w-sm mx-auto">
      Your coin transaction history will appear here once you start using SkillDash features.
    </p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
    <div className="text-red-400 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-300 mb-2">Oops! Something went wrong</h3>
    <p className="text-red-400/80 text-sm mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
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
        } else if (item.reason === 'welcome_bonus') {
          type = 'granted';
        }

        return {
          id: item.id,
          type: type, // Use the mapped type
          amount: item.amount,
          description: item.description,
          feature: item.feature || item.reason, // Use feature or reason for the tag
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
          <div className="w-20 h-4 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        <ErrorState error={error} onRetry={fetchTransactions} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Transaction History
        </h2>
        <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction} 
              index={index}
            />
          ))}
          
          {/* STATS SUMMARY */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                +{transactions.filter(t => t.type === 'earned' || t.type === 'granted').reduce((sum, t) => sum + t.amount, 0)}
              </div>
              <div className="text-sm text-green-300">Total Earned</div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                -{transactions.filter(t => t.type === 'spent').reduce((sum, t) => sum + t.amount, 0)}
              </div>
              <div className="text-sm text-red-300">Total Spent</div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {transactions.filter(t => t.type === 'spent').length}
              </div>
              <div className="text-sm text-blue-300">Features Used</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;