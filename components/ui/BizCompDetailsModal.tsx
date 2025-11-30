'use client';

import React, { memo } from 'react';
import type { FormattedBusinessCompetition } from '@/lib/contentful';

interface BizCompDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: FormattedBusinessCompetition | null;
}

const CloseIcon = memo(() => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
));
CloseIcon.displayName = 'CloseIcon';

const CalendarIcon = memo(() => (
  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
));
CalendarIcon.displayName = 'CalendarIcon';

const MoneyIcon = memo(() => (
  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));
MoneyIcon.displayName = 'MoneyIcon';

const UsersIcon = memo(() => (
  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
));
UsersIcon.displayName = 'UsersIcon';

const PrizeIcon = memo(() => (
  <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
));
PrizeIcon.displayName = 'PrizeIcon';

const VideoIcon = memo(() => (
  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
));
VideoIcon.displayName = 'VideoIcon';

const DetailItem = memo(({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div className="flex-shrink-0 mt-0.5">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1 break-words">{value}</p>
    </div>
  </div>
));
DetailItem.displayName = 'DetailItem';

const BizCompDetailsModal: React.FC<BizCompDetailsModalProps> = ({ isOpen, onClose, competition }) => {
  if (!isOpen || !competition) return null;

  const isExpired = new Date(competition.registrationDeadline) < new Date();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-6 flex items-start justify-between rounded-t-2xl">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">{competition.competitionName}</h2>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">{competition.competitionOrganizer}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          {isExpired && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg font-medium text-center">
              ⏰ Registration Closed - Event has passed
            </div>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem
              icon={<CalendarIcon />}
              label="Registration Deadline"
              value={competition.formattedDeadline}
            />
            <DetailItem
              icon={<MoneyIcon />}
              label="Registration Fee"
              value={competition.registrationFee}
            />
            <DetailItem
              icon={<UsersIcon />}
              label="Team Size"
              value={competition.teamSize || 'Not specified'}
            />
            <DetailItem
              icon={<PrizeIcon />}
              label="Prize Pool"
              value={competition.prizePool || 'Not announced'}
            />
            {competition.ovcRequirement && (
              <DetailItem
                icon={<VideoIcon />}
                label="OVC Requirement"
                value={competition.ovcRequirement}
              />
            )}
          </div>

          {/* Description Section */}
          {/* Description field not currently available from Contentful */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
            {competition.detailsLink && (
              <a
                href={competition.detailsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 text-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Full Details →
              </a>
            )}
            <a
              href={competition.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 px-6 py-3 text-center font-semibold rounded-lg transition-all duration-200 ${
                isExpired
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-100 dark:text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-lg transform hover:scale-105'
              }`}
              onClick={(e) => isExpired && e.preventDefault()}
            >
              {isExpired ? 'Registrations Closed' : 'Register Now →'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BizCompDetailsModal;
