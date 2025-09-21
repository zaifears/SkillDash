import React from 'react';

const ProfileLoadingScreen = React.memo(() => (
  <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
    {/* Animated background elements */}
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
      <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '4s'}} />
      <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}} />
      <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.5s'}} />
    </div>
    
    <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your profile...</p>
    </div>
  </div>
));

ProfileLoadingScreen.displayName = 'ProfileLoadingScreen';
export default ProfileLoadingScreen;
