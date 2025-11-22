import React from 'react';

function ProfileHeader() {
  return (
    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Empty header for spacing and visual separation */}
      </div>
    </div>
  );
}

ProfileHeader.displayName = 'ProfileHeader';
export default React.memo(ProfileHeader);
