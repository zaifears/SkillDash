'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const CoinDisplay = ({ className = '', showLabel = true, onClick = null, size = 'default' }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  // Size variants
  const sizeClasses = {
    small: {
      container: 'gap-1',
      coin: 'w-4 h-4',
      number: 'text-xs',
      label: 'text-[9px]'
    },
    default: {
      container: 'gap-1.5',
      coin: 'w-6 h-6',
      number: 'text-sm',
      label: 'text-[10px]'
    },
    large: {
      container: 'gap-2',
      coin: 'w-8 h-8',
      number: 'text-base',
      label: 'text-xs'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  // Fast coin redirect handler
  const handleCoinClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/coins');
    }
  };

  // Real-time coin updates using Firestore listener
  useEffect(() => {
    if (!user?.uid) {
      setCoins(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set up real-time listener for user's coin balance
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setCoins(userData.coins || 0);
        } else {
          setCoins(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching coins:', error);
        setCoins(0);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user?.uid]);

  // If not logged in, show only the coin icon with updated tooltip
  if (!user) {
    return (
      <div 
        className={`flex items-center ${currentSize.container} cursor-pointer hover:scale-105 transition-transform duration-200 ${className}`}
        onClick={handleCoinClick}
        title="Join SkillDash to use Coins"
      >
        <div className="relative">
          <Image
            src="/coin/coin.png"
            alt="SkillDash Coin"
            width={24}
            height={24}
            className={`${currentSize.coin} object-contain`}
            priority
            unoptimized={false}
          />
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-amber-400/20 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        </div>
      </div>
    );
  }

  // If logged in, show coin icon + number in modern design with click functionality
  return (
    <div 
      className={`flex items-center ${currentSize.container} cursor-pointer hover:scale-105 transition-transform duration-200 ${className}`}
      onClick={handleCoinClick}
      title={`You have ${coins.toLocaleString()} coins - Click to manage`}
    >
      {/* Coin Icon */}
      <div className="relative flex-shrink-0">
        <Image
          src="/coin/coin.png"
          alt="SkillDash Coin"
          width={24}
          height={24}
          className={`${currentSize.coin} object-contain transition-transform duration-200`}
          priority
          unoptimized={false}
        />
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-amber-400/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
      </div>
      
      {/* Coin Count - Modern Style */}
      {showLabel ? (
        <div className="flex flex-col min-w-0">
          <span className={`${currentSize.number} font-bold text-gray-800 dark:text-white transition-colors duration-200`}>
            {loading ? (
              <div className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              coins.toLocaleString()
            )}
          </span>
          <span className={`${currentSize.label} text-gray-500 dark:text-gray-400 -mt-0.5 font-medium`}>
            Coins
          </span>
        </div>
      ) : (
        <span className={`${currentSize.number} font-bold text-gray-800 dark:text-white min-w-0 transition-colors duration-200`}>
          {loading ? (
            <div className="w-6 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            coins.toLocaleString()
          )}
        </span>
      )}
    </div>
  );
};

export default CoinDisplay;
