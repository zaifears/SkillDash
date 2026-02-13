'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { Link2, Clock, AlertTriangle, ExternalLink, BookOpen, Briefcase, FileText, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Firebase configuration using HR Firebase environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_HR_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_HR_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_HR_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_HR_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_HR_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_HR_FIREBASE_APP_ID,
};
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Services to showcase during redirect
const SERVICES = [
  {
    name: 'Learn Skills',
    description: 'Master new skills with AI-powered learning paths',
    href: '/learn-skill',
    icon: BookOpen,
    color: 'bg-purple-500',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Discover Careers',
    description: 'Find your perfect career path with AI guidance',
    href: '/discover',
    icon: Sparkles,
    color: 'bg-blue-500',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Opportunities',
    description: 'Browse internships and job openings',
    href: '/opportunities',
    icon: Briefcase,
    color: 'bg-green-500',
    iconColor: 'text-green-600',
  },
  {
    name: 'Resume Feedback',
    description: 'Get AI-powered resume analysis and tips',
    href: '/resume-feedback',
    icon: FileText,
    color: 'bg-orange-500',
    iconColor: 'text-orange-600',
  },
  {
    name: 'Interview Simulator',
    description: 'Practice with AI mock interviews',
    href: '/simulator',
    icon: MessageSquare,
    color: 'bg-pink-500',
    iconColor: 'text-pink-600',
  },
];

interface LinkData {
  originalUrl: string;
  delay: number;
  creatorId: string;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  expirationDays?: number;
  clicks: number;
}

export default function RedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ code: string } | null>(null);
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'counting' | 'redirecting' | 'expired' | 'not-found'>('loading');

  // Resolve params
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Fetch link data
  useEffect(() => {
    if (!resolvedParams?.code) return;

    const fetchLink = async () => {
      try {
        const docRef = doc(db, 'short_links', resolvedParams.code);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setStatus('not-found');
          return;
        }

        const data = docSnap.data() as LinkData;

        // Check if link has expired
        if (data.expiresAt) {
          const expirationDate = data.expiresAt.toDate();
          if (new Date() > expirationDate) {
            setStatus('expired');
            return;
          }
        }

        // Increment click count
        await updateDoc(docRef, {
          clicks: increment(1)
        });

        setLinkData(data);

        // Set up countdown or immediate redirect (default to 2 seconds if not set)
        const delaySeconds = data.delay !== undefined ? data.delay : 2;
        if (delaySeconds > 0) {
          setCountdown(delaySeconds);
          setStatus('counting');
        } else {
          setStatus('redirecting');
          window.location.href = data.originalUrl;
        }
      } catch (error) {
        console.error('Error fetching link:', error);
        setStatus('not-found');
      }
    };

    fetchLink();
  }, [resolvedParams?.code]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'counting' || countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        setStatus('redirecting');
        if (linkData?.originalUrl) {
          window.location.href = linkData.originalUrl;
        }
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, status, linkData?.originalUrl]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-16 pb-20 lg:pb-0">
        <div className="text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">Loading link...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (status === 'not-found') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-20 pb-24 lg:pb-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Link Not Found
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
            This short link doesn&apos;t exist or may have been removed.
          </p>
          <Link
            href="/go"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm sm:text-base"
          >
            <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Create a Short Link
          </Link>
        </div>
      </div>
    );
  }

  // Expired state
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-20 pb-24 lg:pb-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Link Expired
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
            This short link has expired and is no longer active. Short links are available for 7, 30, or 90 days.
          </p>
          <Link
            href="/go"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm sm:text-base"
          >
            <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
            Create a New Link
          </Link>
        </div>
      </div>
    );
  }

  // Counting down or redirecting - Show services
  const effectiveDelay = linkData?.delay !== undefined ? linkData.delay : 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pt-20 pb-24 lg:pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with countdown */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image
              src="/skilldash-logo.png"
              alt="SkillDash"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">SkillDash</span>
          </Link>

          {status === 'counting' && countdown !== null && (
            <div className="flex flex-col items-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-3">
                Redirecting in
              </p>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    className="text-blue-600"
                    style={{
                      strokeDasharray: 283,
                      strokeDashoffset: effectiveDelay > 0 ? 283 - (283 * countdown) / effectiveDelay : 0,
                      transition: 'stroke-dashoffset 1s linear',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">{countdown}</span>
                </div>
              </div>
            </div>
          )}

          {status === 'redirecting' && (
            <div className="flex flex-col items-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-3">
                Redirecting now...
              </p>
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Destination URL */}
        {linkData && (
          <div className="bg-white dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 flex items-center gap-3 border border-slate-200 dark:border-slate-700">
            <ExternalLink className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Destination:</p>
              <a
                href={linkData.originalUrl}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium truncate block"
              >
                {linkData.originalUrl.length > 50 
                  ? linkData.originalUrl.substring(0, 50) + '...' 
                  : linkData.originalUrl}
              </a>
            </div>
            {status === 'counting' && (
              <button
                onClick={() => window.location.href = linkData.originalUrl}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex-shrink-0"
              >
                Skip
              </button>
            )}
          </div>
        )}

        {/* Services Showcase */}
        <div className="mb-6">
          <h2 className="text-center text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6">
            Explore SkillDash Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {SERVICES.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${service.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                    <service.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${service.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Branding Footer */}
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
            Powered by{' '}
            <Link href="/go" className="text-blue-600 hover:underline font-medium">
              SkillDash Link Shortener
            </Link>
            {' '}• Free & Easy URL Shortening
          </p>
        </div>
      </div>
    </div>
  );
}
