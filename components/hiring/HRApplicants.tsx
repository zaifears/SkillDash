'use client';

import React, { useState } from 'react';

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

interface JobPosting {
  id: string;
  title: string;
}

interface Props {
  applicants: Applicant[];
  isPreview?: boolean;
  onViewAll?: () => void;
  selectedJob?: string | null;
  onSelectJob?: (jobId: string) => void;
  jobs?: JobPosting[];
}

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    'applied': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: '📨' },
    'reviewed': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: '👀' },
    'shortlisted': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: '⭐' },
    'rejected': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: '❌' },
    'hired': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: '✅' }
  };
  return colors[status] || colors['applied'];
};

const formatDate = (date: any) => {
  if (!date) return 'Recently applied';
  try {
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recently applied';
  }
};

const HRApplicants: React.FC<Props> = ({ 
  applicants, 
  isPreview = false, 
  onViewAll, 
  selectedJob,
  onSelectJob,
  jobs = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getJobTitle = (jobId: string) => {
    return jobs.find(j => j.id === jobId)?.title || 'Unknown Position';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">👥</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Applicants
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {applicants.length} total {applicants.length === 1 ? 'applicant' : 'applicants'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      {!isPreview && (
        <div className="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus(null)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                filterStatus === null
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {['applied', 'reviewed', 'shortlisted', 'hired', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full font-semibold transition-all capitalize ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Applicants List */}
      <div className={isPreview ? 'divide-y divide-gray-200 dark:divide-gray-700' : 'max-h-[600px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700'}>
        {filteredApplicants.length === 0 ? (
          <div className="px-8 py-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No applicants found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'Applicants will appear here when candidates apply'}
            </p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => {
            const statusColor = getStatusColor(applicant.status);

            return (
              <div
                key={applicant.id}
                className="px-8 py-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  {/* Applicant Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {applicant.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {applicant.candidateName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {applicant.email}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="ml-15 flex flex-wrap items-center gap-4 text-sm mt-3">
                      {/* Position */}
                      <span className="text-gray-600 dark:text-gray-400">
                        💼 {getJobTitle(applicant.jobId)}
                      </span>

                      {/* Applied Date */}
                      <span className="text-gray-600 dark:text-gray-400">
                        📅 {formatDate(applicant.appliedDate)}
                      </span>

                      {/* Phone */}
                      {applicant.phone && (
                        <a
                          href={`tel:${applicant.phone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                          ☎️ {applicant.phone}
                        </a>
                      )}

                      {/* Rating */}
                      {applicant.rating && (
                        <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                          ⭐ {applicant.rating}/5
                        </span>
                      )}
                    </div>

                    {/* Notes */}
                    {applicant.notes && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          <span className="font-semibold">Note:</span> {applicant.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    <span className={`${statusColor.bg} ${statusColor.text} px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2`}>
                      {statusColor.icon} {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                    </span>

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      <a
                        href={`mailto:${applicant.email}`}
                        className="block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        📧 Email
                      </a>
                      {applicant.phone && (
                        <a
                          href={`tel:${applicant.phone}`}
                          className="block bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                        >
                          ☎️ Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Footer */}
      {isPreview && applicants.length > 5 && onViewAll && (
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onViewAll}
            className="w-full text-center py-3 text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            View all {applicants.length} applicants →
          </button>
        </div>
      )}
    </div>
  );
};

export default HRApplicants;
