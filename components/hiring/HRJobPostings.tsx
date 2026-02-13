'use client';

import React, { useState } from 'react';

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

interface Props {
  postings: JobPosting[];
  isPreview?: boolean;
  onViewAll?: () => void;
  onSelectJob?: (jobId: string) => void;
  selectedJob?: string | null;
}

const getTypeColor = (type: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'full-time': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
    'part-time': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
    'internship': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
    'contract': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
    'freelance': { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-700' }
  };
  return colors[type] || colors['full-time'];
};

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    'active': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '🟢' },
    'closed': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '🔴' },
    'draft': { bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-300', icon: '⚪' }
  };
  return colors[status] || colors['active'];
};

const formatDate = (date: any) => {
  if (!date) return 'Recently posted';
  try {
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently posted';
  }
};

const HRJobPostings: React.FC<Props> = ({ 
  postings, 
  isPreview = false, 
  onViewAll, 
  onSelectJob,
  selectedJob
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPostings = postings.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💼</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Job Postings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {postings.length} total {postings.length === 1 ? 'posting' : 'postings'}
              </p>
            </div>
          </div>
          <div>
            <a
              href="mailto:alshahoriar.hossain@gmail.com?subject=New%20Job%20Posting&body=I%20would%20like%20to%20post%20a%20new%20job%20opportunity."
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              + Post New Job
            </a>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {!isPreview && (
        <div className="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Job List */}
      <div className={isPreview ? 'divide-y divide-gray-200 dark:divide-gray-700' : 'max-h-[600px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700'}>
        {filteredPostings.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No jobs posted yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Ready to find talent? Post your first job opportunity.'}
            </p>
            <a
              href="mailto:alshahoriar.hossain@gmail.com?subject=New%20Job%20Posting&body=I%20would%20like%20to%20post%20a%20new%20job%20opportunity."
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
            >
              📝 Create First Posting
            </a>
          </div>
        ) : (
          filteredPostings.map((job) => {
            const typeColor = getTypeColor(job.type);
            const statusColor = getStatusColor(job.status);
            const isSelected = selectedJob === job.id;

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob?.(job.id)}
                className={`px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <span className={`${statusColor.bg} ${statusColor.text} px-3 py-1 rounded-full text-xs font-bold`}>
                        {statusColor.icon} {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {job.company} • {job.location}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Job Type */}
                      <span className={`${typeColor.bg} ${typeColor.text} px-3 py-1 rounded-full text-xs font-semibold border ${typeColor.border}`}>
                        {job.type.replace('-', ' ').toUpperCase()}
                      </span>

                      {/* Posted Date */}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        📅 {formatDate(job.postedDate)}
                      </span>

                      {/* Budget */}
                      {job.budget && (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                          💰 ${job.budget.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Applicants Count */}
                  <div className="text-right">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {job.applicants || 0}
                      </div>
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                        Applicants
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Footer */}
      {isPreview && postings.length > 5 && onViewAll && (
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onViewAll}
            className="w-full text-center py-3 text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            View all {postings.length} job postings →
          </button>
        </div>
      )}
    </div>
  );
};

export default HRJobPostings;
