'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CoinManager } from '@/lib/coinManager';
import { useRouter } from 'next/navigation';

interface CoinDisplayProps {
  className?: string;
  showLabel?: boolean;
}

export default function CoinDisplay({ className = '', showLabel = true }: CoinDisplayProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      if (!user) {
        setCoins(0);
        setLoading(false);
        return;
      }

      try {
        const balance = await CoinManager.getCoinBalance(user.uid);
        setCoins(balance);
      } catch (error) {
        console.error('Error fetching coins:', error);
        setCoins(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [user]);

  // Function to refresh coin balance (can be called from parent components)
  const refreshBalance = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const balance = await CoinManager.getCoinBalance(user.uid);
      setCoins(balance);
    } catch (error) {
      console.error('Error refreshing coins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent
  useEffect(() => {
    (window as any).refreshCoinBalance = refreshBalance;
    return () => {
      delete (window as any).refreshCoinBalance;
    };
  }, [user]);

  // 🆕 HANDLE CLICK - Navigate to coins page or login
  const handleClick = () => {
    if (!user) {
      // Not logged in - redirect to auth with message
      sessionStorage.setItem('redirectMessage', 'Please log in to view your coin balance and rewards.');
      sessionStorage.setItem('redirectAfterLogin', '/coins');
      router.push('/auth');
    } else {
      // Logged in - go to coins page
      router.push('/coins');
    }
  };

  if (!user) {
    // Show coins for non-logged in users but make it clickable to login
    return (
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 hover:scale-105 transition-transform ${className}`}
      >
        <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md cursor-pointer">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>?</span>
          {showLabel && <span className="hidden sm:inline">Coins</span>}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 hover:scale-105 transition-transform ${className}`}
    >
      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-md cursor-pointer">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {loading ? (
          <div className="animate-pulse bg-white/30 rounded h-4 w-6"></div>
        ) : (
          <span>{coins}</span>
        )}
        {showLabel && <span className="hidden sm:inline">Coins</span>}
      </div>
    </button>
  );
}
