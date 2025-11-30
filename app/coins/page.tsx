'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CoinManager } from '@/lib/coinManager';
import TransactionHistory from '@/components/coins/TransactionHistory';
import Footer from '@/components/shared/Footer';
import { LoadingScreen } from '@/lib/components/shared';
import { ROUTES, MESSAGES, LIMITS } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

// Adapted CoinStats interface for modern fixes
interface CoinStats {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  featuresUsed: number;
  lastActivity?: Date;
}

const CoinsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [coinBalance, setCoinBalance] = useState<number>(0);
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Recharge form state
  const [bkashNumber, setBkashNumber] = useState('');
  const [pricePerCoin, setPricePerCoin] = useState(10);
  const [minCoins, setMinCoins] = useState(1);
  const [maxCoins, setMaxCoins] = useState(100);
  const [coinAmount, setCoinAmount] = useState(10);
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rechargeError, setRechargeError] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [showRechargeForm, setShowRechargeForm] = useState(false);

  // Auth redirect logic
  useEffect(() => {
    if (!authLoading && !user) {
      sessionStorage.setItem('redirectMessage', MESSAGES.AUTH_REQUIRED);
      sessionStorage.setItem('redirectAfterLogin', ROUTES.COINS);
      router.replace(ROUTES.AUTH);
    }
  }, [user, authLoading, router]);

  // Fetch payment config
  useEffect(() => {
    const fetchConfig = async () => {
      const configDoc = await getDoc(doc(db, 'config', 'payment_settings'));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setBkashNumber(data.bkashNumber || '');
        setPricePerCoin(data.pricePerCoin || 10);
        setMinCoins(data.minCoins || 1);
        setMaxCoins(data.maxCoins || 100);
      }
    };
    fetchConfig();
  }, []);

  // Fetch user's recharge requests
  // 🔥 OPTIMIZED: Limit to last 10 requests for performance, use one-time read initially
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'recharge_requests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
      // Limit not directly supported in onSnapshot, so we limit in the component
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsData = snapshot.docs
        .slice(0, 10) // Keep only last 10 requests in state
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      setRequests(requestsData);
    }, (error) => {
      console.error('Error fetching recharge requests:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch coin data
  const fetchCoinData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      const [balance, serverStats] = await Promise.all([
        CoinManager.getCoinBalance(user.uid),
        CoinManager.getCoinStatistics(user.uid)
      ]);
      
      setCoinBalance(balance);

      if (serverStats) {
        setCoinStats({
          currentBalance: balance,
          totalEarned: serverStats.totalEarned || 0,
          totalSpent: serverStats.totalSpent || 0,
          featuresUsed: (serverStats.topFeatures && serverStats.topFeatures.length) || 0,
          lastActivity: serverStats.lastActivity ? new Date(serverStats.lastActivity) : undefined
        });
      }
    } catch (err: any) {
      setError('Failed to load coin information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh on load and when external events call window.refreshCoinBalance()
  useEffect(() => {
    fetchCoinData();
  }, [user, refreshKey]);

  useEffect(() => {
    (window as any).refreshCoinBalance = () => setRefreshKey(prev => prev + 1);
    return () => { delete (window as any).refreshCoinBalance; };
  }, []);

  // Calculate total price
  const totalPrice = coinAmount * pricePerCoin;

  // Submit recharge request
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !coinAmount || !trxId.trim()) {
      setRechargeError('Please fill all fields');
      return;
    }

    if (coinAmount < minCoins || coinAmount > maxCoins) {
      setRechargeError(`Coin amount must be between ${minCoins} and ${maxCoins}`);
      return;
    }

    setIsSubmitting(true);
    setRechargeError('');
    setRechargeSuccess('');

    let retries = 3;
    let lastError: any = null;

    while (retries > 0) {
      try {
        await addDoc(collection(db, 'recharge_requests'), {
          userId: user.uid,
          userName: user.displayName || 'User',
          userEmail: user.email,
          amount: totalPrice,
          coins: coinAmount,
          trxId: trxId.trim(),
          bkashNumber: bkashNumber,
          status: 'pending',
          createdAt: new Date(),
          processedAt: null,
          processedBy: null
        });

        setRechargeSuccess('✅ Recharge request submitted! Wait for approval.');
        setTrxId('');
        setCoinAmount(10);
        
        // Auto-hide form after success
        setTimeout(() => {
          setShowRechargeForm(false);
          setRechargeSuccess('');
        }, 3000);
        
        setIsSubmitting(false);
        return; // Success, exit
      } catch (err: any) {
        lastError = err;
        retries--;
        
        if (retries > 0) {
          // Wait 1 second before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // All retries failed
    setRechargeError(`Failed to submit request after ${3} attempts: ${lastError?.message || 'Network error'}`);
    setIsSubmitting(false);
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{error}</p>
              <button
                onClick={fetchCoinData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
              <Image
                src="/coin/coin.png"
                alt="SkillDash Coin"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              Your SkillCoins
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Use SkillCoins to unlock powerful AI features. Complete activities to earn more coins!
          </p>
        </div>

        {/* Current Balance - Hero Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-1 mb-8 shadow-xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 w-full justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                <Image
                  src="/coin/coin.png"
                  alt="SkillDash Coin"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1">
                  {coinBalance}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                  SkillCoins Available
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buy More Coins Button - Separate Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowRechargeForm(!showRechargeForm)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all duration-200 hover:scale-105 shadow-2xl flex items-center justify-center gap-3"
          >
            <span className="text-3xl">💰</span>
            <span>{showRechargeForm ? 'Hide Recharge Form' : 'Buy More Coins'}</span>
          </button>
        </div>

        {/* Recharge Form (Collapsible) */}
        {showRechargeForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-8 border-2 border-green-500 dark:border-green-600">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Recharge with bKash</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Quick and secure payment</p>
              </div>
            </div>
            
            {/* bKash Number Display */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl mb-8 border-2 border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide">Send Money To:</p>
              </div>
              <div className="flex items-center justify-center gap-4 my-4">
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 tracking-wider font-mono">
                  {bkashNumber}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(bkashNumber);
                    alert('bKash number copied to clipboard!');
                  }}
                  className="flex-shrink-0 bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                  title="Copy bKash number"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Use <strong>"Send Money"</strong> option in bKash app, then copy your <strong>TrxID</strong> and submit below.</p>
              </div>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-8">
              {/* Coin Amount Input */}
              <div>
                <label className="flex text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide items-center gap-2">
                  Select Coin Amount (Min: {minCoins}, Max: {maxCoins})
                </label>
                <input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(Math.max(minCoins, Math.min(maxCoins, parseInt(e.target.value) || minCoins)))}
                  min={minCoins}
                  max={maxCoins}
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-3xl font-bold text-center focus:ring-4 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <div className="mt-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Price per coin:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{pricePerCoin} BDT</span>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Total: {totalPrice} BDT
                  </div>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <span>⚡</span>
                  <span>Quick Select:</span>
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[5, 10, 25, 50].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCoinAmount(amount)}
                      className={`group p-5 rounded-xl border-2 transition-all duration-200 ${
                        coinAmount === amount
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:scale-105'
                      }`}
                    >
                      <div className={`text-2xl font-bold mb-1 ${
                        coinAmount === amount ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {amount}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        {amount * pricePerCoin} BDT
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* TrxID Input */}
              <div>
                <label className="flex text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>bKash Transaction ID:</span>
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="Example: 9C7B2A1D3E"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-lg font-mono focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Find this in your bKash transaction details
                </p>
              </div>

              {/* Error Message */}
              {rechargeError && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{rechargeError}</span>
                </div>
              )}

              {/* Success Message */}
              {rechargeSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-start gap-3">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{rechargeSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-5 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Submit Request ({totalPrice} BDT)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Recharge Request History */}
        {requests.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">📜 Your Recharge Requests</h2>
            
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    req.status === 'approved'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : req.status === 'rejected'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">
                        {req.coins} Coins - {req.amount} BDT
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        TrxID: <span className="font-mono">{req.trxId}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(req.createdAt?.toDate()).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'approved'
                          ? 'bg-green-500 text-white'
                          : req.status === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {req.status === 'approved' && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-2">
                      ✅ Coins credited to your account!
                    </div>
                  )}
                  
                  {req.status === 'rejected' && (
                    <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                      ❌ Request rejected. Contact support for details.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h3 className="text-green-600 dark:text-green-400 font-semibold text-sm sm:text-base">Earned</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{coinStats?.totalEarned || 0}</div>
            <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">coins total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h3 className="text-red-600 dark:text-red-400 font-semibold text-sm sm:text-base">Spent</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{coinStats?.totalSpent || 0}</div>
            <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">coins used</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base">Used</h3>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{coinStats?.featuresUsed || 0}</div>
            <div className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">times</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-purple-600 dark:text-purple-400 font-semibold text-sm sm:text-base">Last</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {coinStats?.lastActivity
                ? new Date(coinStats.lastActivity).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })
                : 'None'
              }
            </div>
            <div className="text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">activity</div>
          </div>
        </div>

        {/* How to Earn Coins */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              💡
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How to Earn Coins</h2>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                🎯
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">Welcome Bonus</h3>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    Already Issued ✅
                  </span>
                </div>
                <p className="text-green-700 dark:text-green-300 mb-3">Get 5 coins when you create your account</p>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">+5 coins</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-4">Coming Soon</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center text-xl opacity-50">
                  📅
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300">Daily Login</h4>
                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-bold">SOON</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">+1 coin per day</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center text-xl opacity-50">
                  👥
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300">Referrals</h4>
                    <span className="bg-gray-400 text-white px-2 py-1 rounded-full text-xs font-bold">SOON</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">+3 coins per friend</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Costs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🔥
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SkillDash Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-300 flex-1">Resume Feedback AI</h3>
                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold self-start flex items-center justify-center min-w-[70px]">
                  {LIMITS.COINS_PER_FEATURE} coin
                </div>
              </div>
              <p className="text-blue-800 dark:text-blue-200 mb-4 text-sm sm:text-base leading-relaxed">
                Get comprehensive AI-powered feedback on your resume with expert insights tailored to your career goals.
              </p>
              <button
                onClick={() => router.push(ROUTES.RESUME_FEEDBACK)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Try Resume Feedback
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900 dark:text-purple-300 flex-1">Discover Career Paths</h3>
                <div className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold self-start flex items-center justify-center min-w-[70px]">
                  {LIMITS.COINS_PER_FEATURE} coin
                </div>
              </div>
              <p className="text-purple-800 dark:text-purple-200 mb-4 text-sm sm:text-base leading-relaxed">
                Discover personalized career recommendations based on your interests and skills.
              </p>
              <button
                onClick={() => router.push(ROUTES.DISCOVER)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Explore Discover
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <TransactionHistory />
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push(ROUTES.RESUME_FEEDBACK)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Analyze Resume ({LIMITS.COINS_PER_FEATURE} coin)
          </button>
          
          <button
            onClick={() => router.push(ROUTES.DISCOVER)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Careers ({LIMITS.COINS_PER_FEATURE} coin)
          </button>

          <button
            onClick={fetchCoinData}
            className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 shadow-lg sm:col-span-2 lg:col-span-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Balance
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-4 mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default CoinsPage;
