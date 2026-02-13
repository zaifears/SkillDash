import React from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../../lib/firebase';

interface ProfileDisplayProps {
  user: User;
  profile: UserProfile | null;
}

function ProfileDisplay({ user, profile }: ProfileDisplayProps) {
  return (
  <div className="animate-fade-in-up">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      {profile?.name || user.email?.split('@')[0] || 'User'}
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 break-all">{user.email}</p>
    
    {/* Profile Tags */}
    <div className="flex flex-wrap justify-center gap-3">
      {profile?.age && (
        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800">
          {profile.age} years old
        </span>
      )}
      {profile?.status && (
        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 text-sm font-medium px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800">
          {profile.status}
        </span>
      )}
    </div>
  </div>
  );
}

ProfileDisplay.displayName = 'ProfileDisplay';
export default React.memo(ProfileDisplay);
