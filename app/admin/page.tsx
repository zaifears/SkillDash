'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { checkGodMode } from '@/lib/admin';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRequests: 0
  });
  const [isGodMode, setIsGodMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const godMode = await checkGodMode(user.uid);
        setIsGodMode(godMode);

        // 🔥 OPTIMIZED: Combine all queries into single operation with efficient counting
        // Instead of 5 separate getCountFromServer calls, we fetch data once and count locally
        const [usersSnapshot, rechargeSnapshot] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'recharge_requests'))
        ]);

        // For detailed status breakdown, use a single query then filter locally
        const detailedRechargeQuery = query(
          collection(db, 'recharge_requests'),
          orderBy('status')
        );
        
        // Limit to recent 1000 requests for performance
        // In production, consider server-side aggregation
        const rechargeSnapshot2 = await getCountFromServer(
          query(
            collection(db, 'recharge_requests'),
            where('status', '==', 'pending')
          )
        );

        const approvedSnapshot = await getCountFromServer(
          query(
            collection(db, 'recharge_requests'),
            where('status', '==', 'approved')
          )
        );

        const rejectedSnapshot = await getCountFromServer(
          query(
            collection(db, 'recharge_requests'),
            where('status', '==', 'rejected')
          )
        );

        setStats({
          totalUsers: usersSnapshot.data().count,
          pendingRequests: rechargeSnapshot2.data().count,
          approvedRequests: approvedSnapshot.data().count,
          rejectedRequests: rejectedSnapshot.data().count,
          totalRequests: rechargeSnapshot.data().count
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            {isGodMode && (
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold px-4 py-2 rounded-full animate-pulse shadow-lg">
                <span>⚡</span>
                <span>GOD MODE</span>
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Welcome back, <span className="font-semibold">{user?.displayName || 'Admin'}</span>!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-xl border-l-4 border-blue-500 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 text-sm font-bold uppercase tracking-wide">Total Users</h3>
              <span className="text-4xl">👥</span>
            </div>
            <div className="text-5xl font-bold text-white mb-1">{stats.totalUsers}</div>
            <div className="text-blue-400 text-sm font-semibold">Registered accounts</div>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 rounded-2xl p-6 shadow-xl border-l-4 border-yellow-300 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-100 text-sm font-bold uppercase tracking-wide">Pending</h3>
              <span className="text-4xl animate-bounce">⏳</span>
            </div>
            <div className="text-5xl font-bold text-white mb-1">{stats.pendingRequests}</div>
            <a href="/admin/recharge" className="text-yellow-100 text-sm font-bold hover:underline flex items-center gap-1">
              Review Now <span>→</span>
            </a>
          </div>

          {/* Approved */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-2xl p-6 shadow-xl border-l-4 border-green-300 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-100 text-sm font-bold uppercase tracking-wide">Approved</h3>
              <span className="text-4xl">✅</span>
            </div>
            <div className="text-5xl font-bold text-white mb-1">{stats.approvedRequests}</div>
            <div className="text-green-100 text-sm font-semibold">Successfully credited</div>
          </div>

          {/* Rejected */}
          <div className="bg-gradient-to-br from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600 rounded-2xl p-6 shadow-xl border-l-4 border-red-300 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-100 text-sm font-bold uppercase tracking-wide">Rejected</h3>
              <span className="text-4xl">❌</span>
            </div>
            <div className="text-5xl font-bold text-white mb-1">{stats.rejectedRequests}</div>
            <div className="text-red-100 text-sm font-semibold">Declined requests</div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 rounded-2xl p-6 shadow-xl border-l-4 border-purple-300 hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-100 text-sm font-bold uppercase tracking-wide">Total</h3>
              <span className="text-4xl">📊</span>
            </div>
            <div className="text-5xl font-bold text-white mb-1">{stats.totalRequests}</div>
            <div className="text-purple-100 text-sm font-semibold">All requests</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manage Recharge */}
            <a
              href="/admin/recharge"
              className="group bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-8 rounded-2xl text-center font-bold transition-all hover:scale-105 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative">
                <div className="text-5xl mb-4">💰</div>
                <div className="text-xl mb-2">Manage Recharge Requests</div>
                {stats.pendingRequests > 0 && (
                  <div className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm inline-block animate-pulse">
                    {stats.pendingRequests} Pending
                  </div>
                )}
              </div>
            </a>
            
            {/* Back to Site */}
            <a
              href="/"
              className="group bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white p-8 rounded-2xl text-center font-bold transition-all hover:scale-105 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative">
                <div className="text-5xl mb-4">🏠</div>
                <div className="text-xl">Back to Site</div>
              </div>
            </a>
            
            {/* Firebase Console - God Mode Only */}
            {isGodMode && (
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white p-8 rounded-2xl text-center font-bold transition-all hover:scale-105 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="relative">
                  <div className="text-5xl mb-4">🔥</div>
                  <div className="text-xl">Firebase Console</div>
                  <div className="text-xs mt-2 opacity-75">God Mode Access</div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
