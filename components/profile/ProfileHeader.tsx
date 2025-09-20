import React from 'react';
import Link from 'next/link';
import { BackIcon } from './ProfileIcons';

const ProfileHeader = React.memo(() => (
  <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-200 dark:border-blue-800 text-sm">
          <BackIcon />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Manage your personal information and account settings.
        </p>
      </div>
    </div>
  </div>
));

ProfileHeader.displayName = 'ProfileHeader';
export default ProfileHeader;
