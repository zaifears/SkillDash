'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useProfile } from '../../hooks/useProfile';
import ProfileLoadingScreen from '../../components/profile/ProfileLoadingScreen';
import CoinDisplay from '@/components/ui/CoinDisplay'; // 🆕 ADD COIN DISPLAY IMPORT
import BouncingBalls from '@/components/shared/BouncingBalls'; // 🆕 ADD BOUNCING BALLS

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
      
      {/* 🆕 REPLACE ANIMATED BACKGROUND WITH BOUNCING BALLS */}
      <BouncingBalls variant="default" />

      <div className="relative z-10">
        {/* Header */}
        <ProfileHeader />

        {/* Main Content - INCREASED TOP PADDING TO LOWER CONTENT */}
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            
            {/* 🆕 COIN DISPLAY SECTION */}
            <div className="bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-yellow-500/10 dark:from-yellow-500/20 dark:via-orange-500/20 dark:to-yellow-600/20 px-8 py-6 border-b border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your SkillDash Coins</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your AI feature usage</p>
                </div>
                <div className="flex items-center space-x-4">
                  <CoinDisplay className="flex scale-125" />
                  <button
                    onClick={() => window.location.href = '/coins'}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 px-8 py-12 text-center border-b border-gray-200/50 dark:border-gray-800/50">
              
              {/* ✅ OPTIMIZED Profile Picture - Dynamic Avatar */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 shadow-xl">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {!isEditing ? (
                <ProfileDisplay user={user} profile={profile} />
              ) : (
                <ProfileEditForm 
                  formData={formData} 
                  onInputChange={handleInputChange} 
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-8">
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
