'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MessageBubble from '../../components/discover/MessageBubble';
import { CoinManager } from '@/lib/coinManager';
import InsufficientCoinsModal from '@/components/ui/InsufficientCoinsModal';
import { LoadingScreen, LoadingDots, Message } from '@/lib/components/shared';
import { ROUTES, MESSAGES, LIMITS } from '@/lib/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchWithRetry } from '@/lib/utils/apiClient'; // ✅ NEW IMPORT
import HRAccessBlock from '@/components/shared/HRAccessBlock';

// Lazy load SuggestionsCard for better performance
const SuggestionsCard = dynamic(() => import('../../components/discover/SuggestionsCard'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
});

interface SkillSuggestions {
  summary: string;
  topSkills: string[];
  skillsToDevelop: string[];
  suggestedCourses: { title: string; description: string }[];
  suggestedCareers: { title: string; fit: string; description: string }[];
  nextStep: 'resume' | 'jobs';
  forceEnd?: boolean;
  blocked?: boolean;
  coinDeducted?: boolean;
  newBalance?: number;
  fallback?: boolean;
  questionsAsked?: number;
  inappropriateCount?: number;
  provider?: string; // NEW: AI provider used
}

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Maintenance mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center transform transition-all">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-12a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Under Maintenance
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We're currently improving the Discover feature to provide you with better recommendations. We'll be back soon!
          </p>
          
          {/* Status */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Expected maintenance period: We're working hard to bring you new features soon.
            </p>
          </div>
          
          {/* Button */}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
