'use client';

import React, { useState, useRef, FormEvent, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FeedbackCard from '../../components/resume-feedback/FeedbackCard';
import { CoinManager } from '@/lib/coinManager';
import InsufficientCoinsModal from '@/components/ui/InsufficientCoinsModal';
import { LoadingScreen, BotIcon, LoadingDots, Message } from '@/lib/components/shared'; // ✅ SHARED COMPONENTS
import { ROUTES, MESSAGES, LIMITS } from '@/lib/constants'; // ✅ CONSTANTS
import { fetchWithRetry } from '@/lib/utils/apiClient'; // ✅ ADD THIS LINE
import HRAccessBlock from '@/components/shared/HRAccessBlock';


// 🔧 FIXED: Updated FileUpload component interface
interface FileUploadProps {
  onFileProcessed: (extractedText: string, fileName: string) => void; // ✅ FIXED: Now receives extracted text, not feedback
  onError: (error: string) => void;
  onClearError?: () => void; // 🆕 NEW: To clear errors
  disabled?: boolean;
  industryPreference?: string;
  userId?: string;
  jobDescription?: string;
  error?: string; // 🆕 NEW: Error prop from parent
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileProcessed, 
  onError,
  onClearError,
  disabled,
  industryPreference = 'general',
  userId,
  jobDescription,
  error
}) => {
  // Maintenance mode - dummy component
  return <div />;
};

export default function ResumeFeedbackPage() {
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
            We're currently improving the Resume Feedback feature to provide you with better analysis. We'll be back soon!
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
