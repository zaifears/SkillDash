'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hrDb, hrAuth } from '@/lib/firebaseHR';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, where, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import HRDashboardStats from '@/components/hiring/HRDashboardStats';
import HRJobPostings from '@/components/hiring/HRJobPostings';
import HRApplicants from '@/components/hiring/HRApplicants';
import HRAnalytics from '@/components/hiring/HRAnalytics';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'part-time' | 'full-time' | 'contract' | 'freelance';
  status: 'active' | 'closed' | 'draft';
  postedDate: any;
  applicants: number;
  budget?: number;
  description?: string;
  requirements?: string[];
}

interface Applicant {
  id: string;
  jobId: string;
  candidateName: string;
  email: string;
  phone?: string;
  appliedDate: any;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  rating?: number;
  notes?: string;
}

interface DashboardStats {
  totalPostings: number;
  activePostings: number;
  totalApplicants: number;
  pendingReview: number;
  shortlisted: number;
  hired: number;
}

export default function HRDashboardPage() {
  const router = useRouter();
  const [hrUser, setHrUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPostings: 0,
    activePostings: 0,
    totalApplicants: 0,
    pendingReview: 0,
    shortlisted: 0,
    hired: 0
  });
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'postings' | 'applicants' | 'analytics'>('overview');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Check HR authentication
  useEffect(() => {
    if (!hrAuth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(hrAuth, async (user) => {
      if (!user) {
        setAuthLoading(false);
        return;
      }

      // Verify user has admin role
      if (hrDb) {
        const userDoc = await getDoc(doc(hrDb, 'hr_users', user.uid));
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          setAuthLoading(false);
          return;
        }
      }

      setHrUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    if (!hrUser || !hrDb) return;

    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    try {
      // Fetch job postings
      const jobsRef = collection(hrDb, 'job_postings');
      const jobsQuery = query(jobsRef, orderBy('postedDate', 'desc'), limit(50));
      const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
        const jobs: JobPosting[] = [];
        snapshot.forEach((doc) => {
          jobs.push({
            id: doc.id,
            ...doc.data()
          } as JobPosting);
        });
        setJobPostings(jobs);
      }, (error) => {
        console.error('Error fetching jobs:', error);
      });
      unsubscribes.push(unsubscribeJobs);

      // Fetch applicants
      const applicantsRef = collection(hrDb, 'job_applicants');
      const applicantsQuery = query(applicantsRef, orderBy('appliedDate', 'desc'), limit(100));
      const unsubscribeApplicants = onSnapshot(applicantsQuery, (snapshot) => {
        const apps: Applicant[] = [];
        snapshot.forEach((doc) => {
          apps.push({
            id: doc.id,
            ...doc.data()
          } as Applicant);
        });
        setApplicants(apps);
      }, (error) => {
        console.error('Error fetching applicants:', error);
      });
      unsubscribes.push(unsubscribeApplicants);

      // Fetch stats
      const fetchStats = async () => {
        try {
          // Count total postings
          const totalPostingsCount = await getCountFromServer(jobsRef);
          const activePostingsCount = await getCountFromServer(
            query(jobsRef, where('status', '==', 'active'))
          );
          
          // Count applicants
          const totalApplicantsCount = await getCountFromServer(applicantsRef);
          const pendingCount = await getCountFromServer(
            query(applicantsRef, where('status', '==', 'applied'))
          );
          const shortlistedCount = await getCountFromServer(
            query(applicantsRef, where('status', '==', 'shortlisted'))
          );
          const hiredCount = await getCountFromServer(
            query(applicantsRef, where('status', '==', 'hired'))
          );

          setStats({
            totalPostings: totalPostingsCount.data().count,
            activePostings: activePostingsCount.data().count,
            totalApplicants: totalApplicantsCount.data().count,
            pendingReview: pendingCount.data().count,
            shortlisted: shortlistedCount.data().count,
            hired: hiredCount.data().count
          });

          setLoading(false);
        } catch (error) {
          console.error('Error fetching stats:', error);
          setLoading(false);
        }
      };

      fetchStats();
    } catch (error) {
      console.error('Error setting up listeners:', error);
      setLoading(false);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [hrUser]);

  if (authLoading) {
    return (
      <div className="pt-32 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!hrUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SkillDash HR</h1>
            <p className="text-slate-400">Log in to manage your job postings</p>
          </div>
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <p className="text-center text-slate-300 mb-6">
              Please log in with your HR credentials to access the dashboard.
            </p>
            <Link
              href="/auth"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-32 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Loading HR Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="pt-24 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              HR Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage job postings, track applicants, and grow your team
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-wrap">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'postings', label: '💼 Job Postings', icon: '💼' },
                { id: 'applicants', label: '👥 Applicants', icon: '👥' },
                { id: 'analytics', label: '📈 Analytics', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 font-semibold transition-all text-center ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b-4 border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b-2 border-transparent'
                  }`}
                >
                  <span className="text-xl mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <HRDashboardStats stats={stats} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <HRJobPostings 
                    postings={jobPostings.slice(0, 5)} 
                    isPreview={true}
                    onViewAll={() => setActiveTab('postings')}
                  />
                  <HRApplicants 
                    applicants={applicants.slice(0, 5)} 
                    isPreview={true}
                    onViewAll={() => setActiveTab('applicants')}
                  />
                </div>
              </>
            )}

            {/* Job Postings Tab */}
            {activeTab === 'postings' && (
              <HRJobPostings 
                postings={jobPostings} 
                isPreview={false}
                onSelectJob={setSelectedJob}
                selectedJob={selectedJob}
              />
            )}

            {/* Applicants Tab */}
            {activeTab === 'applicants' && (
              <HRApplicants 
                applicants={selectedJob ? applicants.filter(a => a.jobId === selectedJob) : applicants}
                isPreview={false}
                selectedJob={selectedJob}
                onSelectJob={setSelectedJob}
                jobs={jobPostings}
              />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <HRAnalytics 
                postings={jobPostings}
                applicants={applicants}
                stats={stats}
              />
            )}
          </div>

          {/* Call to Action for creating first posting */}
          {stats.totalPostings === 0 && activeTab === 'overview' && (
            <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white shadow-2xl">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Ready to hire?</h2>
                <p className="text-lg text-blue-100 mb-6">
                  Post your first job opportunity and start connecting with talented students and graduates from our verified talent pool.
                </p>
                <a
                  href="mailto:alshahoriar.hossain@gmail.com?subject=Create%20Job%20Posting%20-%20SkillDash&body=I%20would%20like%20to%20post%20a%20new%20job%20opportunity."
                  className="inline-flex items-center justify-center bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  <span className="text-2xl mr-3">📝</span>
                  Create Your First Job Posting
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
