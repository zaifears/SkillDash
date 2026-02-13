'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, Timestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Link2, Clock, Copy, Check, AlertCircle, Calendar, Trash2, Info } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';

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

// Expiration options in days
const EXPIRATION_OPTIONS = [
  { value: 7, label: '7 Days', description: 'Free' },
  { value: 30, label: '30 Days', description: 'Free' },
  { value: 90, label: '90 Days', description: 'Free' },
];

interface ShortLink {
  id: string;
  originalUrl: string;
  delay: number;
  creatorId: string;
  createdAt: Date;
  expiresAt: Date;
  expirationDays: number;
  clicks: number;
}

export default function UrlShortener() {
  const { user } = useAuth();
  
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [delay, setDelay] = useState(2); // Default 2 seconds
  const [expirationDays, setExpirationDays] = useState(7); // Default 7 days
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCode, setSuccessCode] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [userLinks, setUserLinks] = useState<ShortLink[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch user's links when logged in
  useEffect(() => {
    if (user?.uid) {
      fetchUserLinks();
    } else {
      setUserLinks([]);
    }
  }, [user?.uid]);

  const fetchUserLinks = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingHistory(true);
      const q = query(collection(db, 'short_links'), where('creatorId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const links: ShortLink[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          originalUrl: data.originalUrl,
          delay: data.delay,
          creatorId: data.creatorId,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          expiresAt: data.expiresAt?.toDate?.() || new Date(),
          expirationDays: data.expirationDays,
          clicks: data.clicks || 0,
        };
      });
      
      setUserLinks(links.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (err) {
      console.error('Error fetching user links:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteLink = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await deleteDoc(doc(db, 'short_links', code));
      setUserLinks(userLinks.filter(link => link.id !== code));
    } catch (err: any) {
      setError('Failed to delete link: ' + err.message);
    }
  };

  // Generate random 6-char code if no alias provided
  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    setSuccessCode('');

    try {
      // 1. Validation
      let code = customAlias.trim();
      
      // Basic URL validation
      try {
        new URL(longUrl);
      } catch {
        throw new Error('Please enter a valid URL (include http:// or https://)');
      }

      // If no custom alias, generate random
      if (!code) {
        code = generateRandomCode();
      } else {
        // Validate alias format (alphanumeric and dashes only)
        if (!/^[a-zA-Z0-9-_]+$/.test(code)) {
          throw new Error('Custom alias can only contain letters, numbers, dashes, and underscores.');
        }
      }

      // 2. Check for collision
      const docRef = doc(db, 'short_links', code);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        throw new Error(customAlias ? 'This alias is already taken.' : 'Collision error, please try again.');
      }

      // 3. Calculate expiration date
      const now = new Date();
      const expireAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000);

      // 4. Save to Firestore (creatorId is optional for anonymous users)
      await setDoc(docRef, {
        originalUrl: longUrl,
        delay: Number(delay),
        creatorId: user?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expireAt),
        expirationDays: expirationDays,
        clicks: 0
      });

      setSuccessCode(code);
      setExpirationDate(expireAt);
      setLongUrl('');
      setCustomAlias('');
      setDelay(2);
      setExpirationDays(7);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = successCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/go/${successCode}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-24 lg:pb-12 px-4 sm:px-6">
      {/* Enhanced Schema Markup for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'SkillDash URL Shortener',
          description: 'Free URL shortener with custom delays and expiration. Shorten links with custom delays and expiration. Free, no limits. Track clicks.',
          url: 'https://skilldash.live/go',
          applicationCategory: 'Utility',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BDT',
            description: 'Completely free forever'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '5',
            ratingCount: '100'
          },
          author: {
            '@type': 'Organization',
            name: 'SkillDash',
            url: 'https://skilldash.live'
          },
          featureList: [
            'Create custom short links',
            'Custom URL aliases',
            'Set redirect delays (2-10 seconds)',
            'Expiration dates (7, 30, 90 days)',
            'Click tracking and analytics',
            'Link history and management',
            'Free forever with no limits'
          ]
        })}
      </script>
      {/* Schema Markup for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'SkillDash URL Shortener',
          description: 'Free URL shortener with custom aliases, countdown timers, and flexible expiration',
          url: 'https://skilldash.live/go',
          applicationCategory: 'Utility',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BDT',
            description: 'Free URL shortening service'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1000+'
          },
          potentialAction: {
            '@type': 'CreateAction',
            target: 'https://skilldash.live/go'
          }
        })}
      </script>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 sm:gap-3">
            <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            Free URL Shortener
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Create branded short links with custom aliases, countdown timers, and flexible expiration (7-90 days). No login required.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-500 font-medium">
            ✨ Completely free • 🔗 Custom aliases • ⏱️ Countdown timers • 🔐 Secure & fast
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Spans 2 columns on desktop */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Long URL Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Destination URL
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/very-long-url..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Alias Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Custom Alias (Optional)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl text-slate-500 text-sm">
                    /go/
                  </span>
                  <input
                    type="text"
                    placeholder="my-link"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    disabled={!user}
                    className={`w-full px-4 py-3 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                      !user ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Timer Option */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Redirect Timer
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={delay}
                    onChange={(e) => setDelay(Number(e.target.value))}
                    disabled={!user}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-700 dark:text-slate-300 ${
                      !user ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>Instant (0s)</option>
                    <option value={2}>2 Seconds (Default)</option>
                    <option value={5}>5 Seconds</option>
                    <option value={10}>10 Seconds</option>
                    <option value={15}>15 Seconds</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Link Expiration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Link Expiration
              </label>
              <div className="flex gap-2">
                {EXPIRATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => user && setExpirationDays(option.value)}
                    disabled={!user}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      expirationDays === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {option.label}
                    {option.value === 7 && expirationDays !== 7 && (
                      <span className="ml-1 text-[10px] opacity-60">(default)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Info notice for anonymous users */}
            {!user && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-start gap-2 text-sm border border-blue-100 dark:border-blue-900/30">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Anonymous Mode:</strong> Your links will expire in 7 days with a 2-second redirect timer. 
                  <a href="/auth" className="underline ml-1">Sign in</a> to customize these settings and manage your links.
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              {loading ? 'Shortening...' : 'Create Short Link'}
            </button>
          </form>

          {/* Success Result */}
          {successCode && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl animation-fade-in">
              <div className="flex items-center gap-2 mb-2 text-green-700 dark:text-green-400 font-bold">
                <Check className="w-5 h-5" />
                Link Created Successfully!
              </div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  readOnly
                  value={shortUrl}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800/30 rounded-xl text-slate-600 dark:text-slate-300 font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {expirationDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Expires on: <strong>{expirationDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
          </div>

          {/* User Links History Sidebar - Only show when logged in */}
          {user && (
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 h-fit">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Links</h2>
              
              {loadingHistory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : userLinks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No links created yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {userLinks.map((link) => {
                    const isExpired = new Date() > link.expiresAt;
                    return (
                      <div
                        key={link.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isExpired
                            ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                              /go/{link.id}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                              {link.originalUrl}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                            title="Delete link"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {isExpired ? 'Expired' : 'Expires'} {link.expiresAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}