'use client';

import React, { useMemo } from 'react';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'part-time' | 'full-time' | 'contract' | 'freelance';
  status: 'active' | 'closed' | 'draft';
  postedDate: any;
  applicants: number;
  budget?: number;
  description?: string;
  requirements?: string[];
}

interface Applicant {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone?: string;
  appliedDate: any;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  rating?: number;
  notes?: string;
}

interface DashboardStats {
  totalPostings: number;
  activePostings: number;
  totalApplicants: number;
  pendingReview: number;
  shortlisted: number;
  hired: number;
}

interface Props {
  postings: JobPosting[];
  applicants: Applicant[];
  stats: DashboardStats;
}

const HRAnalytics: React.FC<Props> = ({ postings, applicants, stats }) => {
  // Calculate analytics data
  const analytics = useMemo(() => {
    // Job type distribution
    const typeDistribution: Record<string, number> = {};
    postings.forEach(job => {
      typeDistribution[job.type] = (typeDistribution[job.type] || 0) + 1;
    });

    // Status distribution
    const statusDistribution: Record<string, number> = {
      applied: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0
    };
    applicants.forEach(app => {
      statusDistribution[app.status]++;
    });

    // Top performing jobs
    const jobPerformance = postings.map(job => ({
      id: job.id,
      title: job.title,
      applicants: job.applicants || 0,
      hired: applicants.filter(a => a.jobId === job.id && a.status === 'hired').length,
      conversionRate: job.applicants > 0 ? Math.round((applicants.filter(a => a.jobId === job.id && a.status === 'hired').length / job.applicants) * 100) : 0
    })).sort((a, b) => b.applicants - a.applicants).slice(0, 5);

    // Conversion funnel
    const totalApplicants = stats.totalApplicants || 1;
    const conversionFunnel = [
      {
        stage: 'Applied',
        count: stats.pendingReview,
        percentage: Math.round((stats.pendingReview / totalApplicants) * 100)
      },
      {
        stage: 'Reviewed',
        count: Math.max(0, stats.totalApplicants - stats.pendingReview - stats.shortlisted - stats.hired - (applicants.filter(a => a.status === 'rejected').length)),
        percentage: 0
      },
      {
        stage: 'Shortlisted',
        count: stats.shortlisted,
        percentage: Math.round((stats.shortlisted / totalApplicants) * 100)
      },
      {
        stage: 'Hired',
        count: stats.hired,
        percentage: Math.round((stats.hired / totalApplicants) * 100)
      }
    ];

    // Hiring funnel efficiency
    const rejectedCount = applicants.filter(a => a.status === 'rejected').length;
    const conversionRate = stats.totalApplicants > 0 ? Math.round((stats.hired / stats.totalApplicants) * 100) : 0;

    return {
      typeDistribution,
      statusDistribution,
      jobPerformance,
      conversionFunnel,
      conversionRate,
      rejectedCount
    };
  }, [postings, applicants, stats]);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">📊</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Conversion Rate</p>
          </div>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{analytics.conversionRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {stats.hired} hired from {stats.totalApplicants} applicants
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">⏳</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Avg. Per Job</p>
          </div>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalPostings > 0 ? Math.round(stats.totalApplicants / stats.totalPostings) : 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            applicants per job posting
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">❌</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Rejected</p>
          </div>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">{analytics.rejectedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            not a good fit
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">✅</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-bold uppercase">Success Rate</p>
          </div>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {((stats.shortlisted / Math.max(stats.totalApplicants, 1)) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            shortlisted candidates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span>🚀</span>
              Top Performing Jobs
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {analytics.jobPerformance.length === 0 ? (
              <div className="px-8 py-12 text-center text-gray-500 dark:text-gray-400">
                No job performance data yet
              </div>
            ) : (
              analytics.jobPerformance.map((job, idx) => (
                <div key={job.id} className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{job.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>👥 {job.applicants} applicants</span>
                        <span>✅ {job.hired} hired</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {job.conversionRate}%
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">conversion</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${job.conversionRate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span>📈</span>
              Applicant Status Distribution
            </h2>
          </div>
          <div className="px-8 py-8">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const total = stats.totalApplicants || 1;
              const percentage = Math.round((count / total) * 100);
              const colors: Record<string, { bg: string; text: string }> = {
                applied: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
                reviewed: { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
                shortlisted: { bg: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
                hired: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
                rejected: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' }
              };
              const color = colors[status] || colors.applied;

              return (
                <div key={status} className="mb-6 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {status === 'shortlisted' ? '⭐ Shortlisted' : 
                       status === 'applied' ? '📨 Applied' :
                       status === 'reviewed' ? '👀 Reviewed' :
                       status === 'hired' ? '✅ Hired' : '❌ Rejected'}
                    </p>
                    <div>
                      <span className={`${color.text} font-bold`}>{count}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`${color.bg} h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Type Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span>💼</span>
            Job Type Distribution
          </h2>
        </div>
        <div className="px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(analytics.typeDistribution).map(([type, count]) => (
              <div key={type} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                <div className="text-3xl mb-3 flex justify-center">
                  {type === 'full-time' ? '💼' : 
                   type === 'part-time' ? '⏰' : 
                   type === 'internship' ? '🎓' : 
                   type === 'contract' ? '📋' : '🌐'}
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 capitalize">
                  {type.replace('-', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRAnalytics;
