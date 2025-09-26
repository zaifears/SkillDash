'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useProfile } from '../../hooks/useProfile';
import ProfileLoadingScreen from '../../components/profile/ProfileLoadingScreen';

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
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 w-20 h-20 bg-blue-400/20 dark:bg-blue-400/30 rounded-full animate-bounce" 
             style={{animationDelay: '0s', animationDuration: '4s'}} />
        <div className="absolute top-40 right-24 w-16 h-16 bg-purple-400/20 dark:bg-purple-400/30 rounded-full animate-pulse" 
             style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-400/15 dark:bg-indigo-400/25 rounded-full animate-bounce" 
             style={{animationDelay: '2s', animationDuration: '5s'}} />
        <div className="absolute bottom-32 right-20 w-18 h-18 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full animate-bounce" 
             style={{animationDelay: '1.5s', animationDuration: '3.5s'}} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <ProfileHeader />

        {/* Main Content - INCREASED TOP PADDING TO LOWER CONTENT */}
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            
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
