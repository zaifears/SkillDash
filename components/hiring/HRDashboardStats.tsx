'use client';

import React from 'react';

interface DashboardStats {
  totalPostings: number;
  activePostings: number;
  totalApplicants: number;
  pendingReview: number;
  shortlisted: number;
  hired: number;
}

interface Props {
  stats: DashboardStats;
}

const HRDashboardStats: React.FC<Props> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Postings',
      value: stats.totalPostings,
      icon: '📋',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Active Postings',
      value: stats.activePostings,
      icon: '🟢',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Total Applicants',
      value: stats.totalApplicants,
      icon: '👥',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Pending Review',
      value: stats.pendingReview,
      icon: '⏳',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Shortlisted',
      value: stats.shortlisted,
      icon: '⭐',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      textColor: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      label: 'Hired',
      value: stats.hired,
      icon: '✅',
      color: 'from-lime-500 to-green-600',
      bgColor: 'bg-lime-50 dark:bg-lime-900/20',
      textColor: 'text-lime-600 dark:text-lime-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.bgColor} rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all transform hover:scale-105 hover:-translate-y-1`}
        >
          {/* Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">{card.icon}</div>
            <div className={`bg-gradient-to-br ${card.color} rounded-full p-3 shadow-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Label */}
          <p className={`${card.textColor} text-sm font-bold uppercase tracking-wide mb-2`}>
            {card.label}
          </p>

          {/* Value */}
          <p className="text-5xl font-bold text-gray-900 dark:text-white">
            {card.value}
          </p>

          {/* Trend indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5 19" />
            </svg>
            <span>Updated just now</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HRDashboardStats;
