'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// FIXED: Proper TypeScript interface with optional properties
interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  underlined?: boolean;
}

interface FooterSection {
  useful: FooterLink[];
}

const FOOTER_LINKS: FooterSection = {
  useful: [
    { label: 'Discover', href: '/discover' },
    { label: 'AI Resume Feedback', href: '/resume-feedback' },
    { label: 'Find Opportunities', href: '/opportunities' }
  ],
};

const Footer = React.memo(() => {
  const currentYear = new Date().getFullYear();
  
  // ✅ State for user count
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Fetch from public_stats document (SECURE & FAST)
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        // Read public stats document (allowed by security rules)
        const statsDocRef = doc(db, 'public_stats', 'site_stats');
        const statsDoc = await getDoc(statsDocRef);
        
        if (statsDoc.exists()) {
          const count = statsDoc.data()?.userCount || 0;
          
          // Round up to nearest hundred for better display
          const roundedCount = Math.ceil(count / 100) * 100;
          setUserCount(roundedCount);
        } else {
          console.warn('⚠️ Stats document not found. Please create public_stats/site_stats in Firestore.');
          setUserCount(null);
        }
      } catch (error) {
        console.error('❌ Failed to fetch user count:', error);
        setUserCount(null); // Silent fail - don't show count if error
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-800/50 pt-10 mt-16 bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-t-3xl">
      <div className="max-w-5xl mx-auto px-4 pb-6 flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-between">
        {/* Logo and About */}
        <div className="flex flex-col gap-3 min-w-[150px]">
          <div className="relative">
            <img
              src="/skilldash-logo.png"
              alt="SkillDash Logo"
              width={56}
              height={56}
              className="mb-2 transform hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SkillDash</span>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
            Empowering students with AI-driven career guidance and skill development.
          </p>
          
          {/* ✅ OPTION 2: Larger with Subtitle */}
          {!loading && userCount !== null && (
            <div className="flex flex-col items-start mt-3 space-y-1">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  {userCount.toLocaleString()}+
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium pl-7">
                registered users
              </span>
            </div>
          )}
        </div>
        
        {/* Footer Links */}
        <div className="flex justify-center flex-1">
          <div>
            <h4 className="text-md font-bold text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Useful Links</h4>
            <ul className="flex flex-col gap-1 text-gray-500 dark:text-gray-400 text-sm">
              {FOOTER_LINKS.useful.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className={`hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 ${link.underlined ? 'underline' : ''}`}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center my-4 py-4 border-t border-gray-200/30 dark:border-gray-700/30">
        <span className="text-xs text-gray-400 dark:text-gray-600">
          &copy; {currentYear} SkillDash. All rights reserved.
        </span>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
export default Footer;
