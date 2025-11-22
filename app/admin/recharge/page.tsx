'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, where, limit } from 'firebase/firestore';

interface RechargeRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  coins: number;
  trxId: string;
  bkashNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  processedAt?: any;
  processedBy?: string;
}

export default function AdminRechargePage() {
  const { user } = useAuth();
  
  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasMore, setHasMore] = useState(false); // ✅ For pagination

  // Fetch recharge requests with pagination and status filtering
  // 🔥 OPTIMIZED: Start with pending requests only, use pagination for performance
  useEffect(() => {
    // Fetch recharge requests with cursor-based pagination (first 20 per page)
    const baseQuery = query(
      collection(db, 'recharge_requests'),
      orderBy('createdAt', 'desc'),
      limit(21) // Fetch one extra to determine if there are more pages
    );

    const unsubscribe = onSnapshot(baseQuery, (snapshot) => {
      let requestsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RechargeRequest[];
      
      // Filter client-side to avoid composite index requirement
      if (filter !== 'all') {
        requestsData = requestsData.filter(req => req.status === filter);
      }
      
      // ✅ Pagination: Only show first 20, rest handled by "Load More"
      setRequests(requestsData.slice(0, 20));
      setHasMore(requestsData.length > 20);
    }, (error) => {
      console.error('Error fetching requests:', error);
    });

    return () => unsubscribe();
  }, [filter]);

  // Show toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Approve request
  const handleApprove = async (requestId: string, userId: string, coins: number, userName: string) => {
    if (!confirm(`✅ Approve and credit ${coins} coins to ${userName}?`)) return;

    setProcessing(requestId);

    try {
      // Update request status
      await updateDoc(doc(db, 'recharge_requests', requestId), {
        status: 'approved',
        processedAt: new Date(),
        processedBy: user?.uid
      });

      // Credit coins to user
      await updateDoc(doc(db, 'users', userId), {
        coins: increment(coins)
      });

      // Create transaction record for user's history
      await addDoc(collection(db, 'coinTransactions'), {
        userId: userId,
        type: 'recharge',
        amount: coins,
        description: 'Coin recharge via bKash',
        timestamp: new Date(),
        metadata: {
          requestId: requestId,
          approvedBy: user?.uid,
          approverName: user?.displayName || 'Admin'
        }
      });

      showToast(`✅ Approved! ${coins} coins credited to ${userName}`);
    } catch (error: any) {
      alert('❌ Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  // Reject request
  const handleReject = async (requestId: string, userName: string) => {
    const reason = prompt('Rejection reason (optional):');
    if (reason === null) return;

    setProcessing(requestId);

    try {
      await updateDoc(doc(db, 'recharge_requests', requestId), {
        status: 'rejected',
        processedAt: new Date(),
        processedBy: user?.uid,
        rejectionReason: reason || 'No reason provided'
      });

      showToast(`❌ Request from ${userName} rejected`);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  // Filter and search requests
  const filteredRequests = requests
    .filter(req => filter === 'all' ? true : req.status === filter)
    .filter(req => 
      req.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.trxId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Stats
  const stats = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="pt-32 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-24 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Recharge Management</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Review and process coin recharge requests</p>
              </div>
            </div>
            
            {/* Quick Nav */}
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <span>📊</span>
                <span>Dashboard</span>
              </a>
              <a
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <span>🏠</span>
                <span>Home</span>
              </a>
            </div>
          </div>

          {/* Real-time indicator */}
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">Live Updates Active</span>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <svg className="absolute left-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or TrxID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
              const icons = {
                all: '📊',
                pending: '⏳',
                approved: '✅',
                rejected: '❌'
              };
              
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all text-lg ${
                    filter === status
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl">{icons[status]}</span>
                  <span>{status.toUpperCase()}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    filter === status ? 'bg-white/20' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {stats[status]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center shadow-xl">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-8 flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No {filter} requests found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchTerm ? 'Try adjusting your search' : 'Requests will appear here when submitted'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border-l-4 transition-all hover:shadow-2xl hover:scale-[1.01] ${
                  req.status === 'approved'
                    ? 'border-green-500'
                    : req.status === 'rejected'
                    ? 'border-red-500'
                    : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start gap-8">
                  <div className="flex-1">
                    {/* Status Badge & Time */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-bold shadow-lg ${
                        req.status === 'approved'
                          ? 'bg-green-500 text-white'
                          : req.status === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white animate-pulse'
                      }`}>
                        {req.status === 'approved' && '✅'}
                        {req.status === 'rejected' && '❌'}
                        {req.status === 'pending' && '⏳'}
                        {req.status.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 text-base text-gray-500 dark:text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(req.createdAt?.toDate()).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Request Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* User Info */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <label className="text-sm font-bold text-blue-700 dark:text-blue-300 uppercase">User</label>
                        </div>
                        <div className="font-bold text-xl text-gray-900 dark:text-white mb-1">{req.userName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 break-all">{req.userEmail}</div>
                      </div>

                      {/* Amount Info */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <label className="text-sm font-bold text-green-700 dark:text-green-300 uppercase">Amount</label>
                        </div>
                        <div className="font-bold text-3xl text-green-600 dark:text-green-400 mb-1">{req.amount} BDT</div>
                        <div className="text-base font-bold text-green-700 dark:text-green-300">{req.coins} Coins</div>
                      </div>

                      {/* Transaction Info */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <label className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase">TrxID</label>
                        </div>
                        <div className="font-mono font-bold text-xl text-gray-900 dark:text-white break-all mb-2">{req.trxId}</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold">bKash: {req.bkashNumber}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {req.status === 'pending' && (
                    <div className="flex flex-col gap-4">
                      <button
                        onClick={() => handleApprove(req.id, req.userId, req.coins, req.userName)}
                        disabled={processing === req.id}
                        className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all disabled:opacity-50 hover:scale-105 shadow-xl flex items-center gap-3"
                      >
                        {processing === req.id ? (
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
                            <span>Approve</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.userName)}
                        disabled={processing === req.id}
                        className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all disabled:opacity-50 hover:scale-105 shadow-xl flex items-center gap-3"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
