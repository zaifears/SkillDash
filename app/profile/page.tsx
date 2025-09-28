'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useProfile } from '../../hooks/useProfile';
import ProfileLoadingScreen from '../../components/profile/ProfileLoadingScreen';
import CoinDisplay from '@/components/ui/CoinDisplay';
import BouncingBalls from '@/components/shared/BouncingBalls';

// Lazy load heavy components
const ProfileHeader = dynamic(() => import('../../components/profile/ProfileHeader'), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800" />
});

const ProfileDisplay = dynamic(() => import('../../components/profile/ProfileDisplay'), {
  loading: () => <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

const ProfileEditForm = dynamic(() => import('../../components/profile/ProfileEditForm'), {
  loading: () => <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

const ProfileActions = dynamic(() => import('../../components/profile/ProfileActions'), {
  loading: () => <div className="h-16 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

export default function ProfilePage() {
  const { 
    user, 
    profile, 
    loading, 
    isEditing, 
    formData, 
    handleLogout, 
    handleSave, 
    handleInputChange, 
    handleEdit, 
    handleCancel 
  } = useProfile();

  if (loading) return <ProfileLoadingScreen />;
  if (!user) return null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-black dark:to-blue-950/30 overflow-x-hidden relative">
      
      {/* Bouncing Balls Background */}
      <BouncingBalls variant="default" />

      <div className="relative z-10">
        {/* Header */}
        <ProfileHeader />

        {/* Main Content - Mobile Optimized */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            
            {/* Mobile-Optimized Coin Display Section */}
            <div className="bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-yellow-500/10 dark:from-yellow-500/20 dark:via-orange-500/20 dark:to-yellow-600/20 p-4 sm:p-6 lg:p-8 border-b border-gray-200/50 dark:border-gray-800/50">
              
              {/* Mobile: Stack vertically, Desktop: Side by side */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Left side - Title */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    Your SkillDash Coins
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Manage your AI feature usage
                  </p>
                </div>
                
                {/* Right side - Coin display and button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
                  {/* Mobile-optimized coin display */}
                  <div className="flex items-center">
                    <CoinDisplay 
                      className="flex" 
                      size="small"
                      showLabel={false}
                    />
                  </div>
                  
                  {/* Mobile-friendly button */}
                  <button
                    onClick={() => window.location.href = '/coins'}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile-Optimized Profile Header */}
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 p-6 sm:p-8 lg:p-12 text-center border-b border-gray-200/50 dark:border-gray-800/50">
              
              {/* Mobile-Responsive Profile Picture */}
              <div className="relative inline-block mb-4 sm:mb-6">
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-green-500 rounded-full border-2 sm:border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Mobile-Optimized Content */}
              <div className="max-w-md mx-auto">
                {!isEditing ? (
                  <ProfileDisplay user={user} profile={profile} />
                ) : (
                  <ProfileEditForm 
                    formData={formData} 
                    onInputChange={handleInputChange} 
                  />
                )}
              </div>
            </div>

            {/* Mobile-Optimized Action Buttons */}
            <div className="p-4 sm:p-6 lg:p-8">
              <ProfileActions 
                isEditing={isEditing}
                onEdit={handleEdit}
                onLogout={handleLogout}
                onCancel={handleCancel}
                onSave={handleSave}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
