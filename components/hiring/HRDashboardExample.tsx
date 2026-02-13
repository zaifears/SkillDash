// components/hiring/HRDashboardExample.tsx
// This shows HOW to integrate the API client with your dashboard components

import React, { useEffect, useState } from 'react';
import { 
  fetchJobPostings, 
  fetchApplicants, 
  updateApplicantStatus,
  createJobPosting 
} from '@/lib/utils/hrApiClient';

/**
 * EXAMPLE 1: Fetch job postings with API client
 */
export function Example1_FetchJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        // Call API helper instead of direct Firestore
        const response = await fetchJobPostings({ 
          status: 'active',
          limit: 50 
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  return (
    <div>
      {loading ? <p>Loading...</p> : <p>Found {jobs.length} jobs</p>}
    </div>
  );
}

/**
 * EXAMPLE 2: Fetch applicants with filtering
 */
export function Example2_FetchApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [status, setStatus] = useState('applied');

  useEffect(() => {
    const loadApplicants = async () => {
      try {
        // Call API with filters
        const response = await fetchApplicants({ 
          status,
          limit: 100 
        });
        setApplicants(response.data);
      } catch (error) {
        console.error('Failed to fetch applicants:', error);
      }
    };

    loadApplicants();
  }, [status]);

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="applied">Applied</option>
        <option value="reviewed">Reviewed</option>
        <option value="shortlisted">Shortlisted</option>
        <option value="hired">Hired</option>
      </select>
      <p>Showing {applicants.length} applicants</p>
    </div>
  );
}

/**
 * EXAMPLE 3: Create new job posting
 */
export function Example3_CreateJob() {
  const [loading, setLoading] = useState(false);

  const handleCreateJob = async () => {
    try {
      setLoading(true);
      
      // Call API to create job
      const response = await createJobPosting({
        title: 'Senior React Developer',
        company: 'Tech Startup',
        description: 'Build amazing UIs...',
        location: 'Remote',
        type: 'full-time',
        requirements: ['React', 'TypeScript', 'Node.js'],
        postedBy: 'recruiter_uid_123',
        budget: undefined
      });

      console.log('Job created:', response.data);
      // Refresh job list
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCreateJob} disabled={loading}>
      {loading ? 'Creating...' : 'Create Job'}
    </button>
  );
}

/**
 * EXAMPLE 4: Update applicant status
 */
export function Example4_UpdateApplicantStatus() {
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (applicantId: string) => {
    try {
      setLoading(true);

      // Call API to update status
      await updateApplicantStatus(applicantId, {
        status: 'shortlisted',
        rating: 4.5,
        notes: 'Excellent technical skills and communication'
      });

      console.log('Applicant updated');
      // Refresh applicants list
    } catch (error) {
      console.error('Failed to update applicant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={() => handleUpdateStatus('app_123')} 
      disabled={loading}
    >
      {loading ? 'Updating...' : 'Move to Shortlisted'}
    </button>
  );
}

/**
 * EXAMPLE 5: Complete dashboard data fetching
 */
export function Example5_CompleteDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0
  });
  const [jobs, setJobs] = useState<Array<{ id: string; title: string; company: string; location: string; applicants: number }>>([]);
  const [applicants, setApplicants] = useState<Array<{ id: string; candidateName: string; email: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch jobs
        const jobsResponse = await fetchJobPostings();
        const activeJobsResponse = await fetchJobPostings({ status: 'active' });
        setJobs(jobsResponse.data);

        // Fetch applicants
        const applicantsResponse = await fetchApplicants();
        const shortlistedResponse = await fetchApplicants({ status: 'shortlisted' });
        setApplicants(applicantsResponse.data);

        // Update stats
        setStats({
          totalJobs: jobsResponse.data.length,
          activeJobs: activeJobsResponse.data.length,
          totalApplicants: applicantsResponse.data.length,
          shortlisted: shortlistedResponse.data.length
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>HR Dashboard</h1>
      
      {/* Stats Grid */}
      <div>
        <div>
          <p>Total Jobs</p>
          <p>{stats.totalJobs}</p>
        </div>
        <div>
          <p>Active Jobs</p>
          <p>{stats.activeJobs}</p>
        </div>
        <div>
          <p>Total Applicants</p>
          <p>{stats.totalApplicants}</p>
        </div>
        <div>
          <p>Shortlisted</p>
          <p>{stats.shortlisted}</p>
        </div>
      </div>

      {/* Jobs List */}
      <section>
        <h2>Job Postings ({jobs.length})</h2>
        <ul>
          {jobs.map(job => (
            <li key={job.id}>
              <h3>{job.title}</h3>
              <p>{job.company} - {job.location}</p>
              <p>Applicants: {job.applicants}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Applicants List */}
      <section>
        <h2>Recent Applications ({applicants.length})</h2>
        <ul>
          {applicants.slice(0, 5).map(app => (
            <li key={app.id}>
              <p>{app.candidateName}</p>
              <p>{app.email}</p>
              <p>Status: {app.status}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * HOW TO INTEGRATE WITH YOUR EXISTING COMPONENTS
 * 
 * In your HRDashboardPage (app/opportunities/hiring/page.tsx):
 * 
 * 1. Replace direct Firebase queries with API client:
 * 
 *    OLD:
 *    const jobsQuery = query(jobsRef, orderBy('postedDate', 'desc'));
 *    onSnapshot(jobsQuery, (snapshot) => { ... })
 * 
 *    NEW:
 *    const response = await fetchJobPostings();
 *    setJobPostings(response.data);
 * 
 * 2. Update stat fetching:
 * 
 *    OLD:
 *    const countSnapshot = await getCountFromServer(
 *      query(jobsRef, where('status', '==', 'active'))
 *    );
 * 
 *    NEW:
 *    const response = await fetchJobPostings({ status: 'active' });
 *    setStats(prev => ({ ...prev, activePostings: response.data.length }))
 * 
 * 3. Pass API handlers to components:
 * 
 *    <HRJobPostings 
 *      postings={jobs}
 *      onCreateJob={createJobPosting}
 *      onUpdateJob={updateJobPosting}
 *      onDeleteJob={deleteJobPosting}
 *    />
 * 
 * 4. Import and use in components:
 * 
 *    import { updateApplicantStatus } from '@/lib/utils/hrApiClient';
 *    
 *    const handleStatusChange = (id, status) => {
 *      updateApplicantStatus(id, { status })
 *    }
 */
