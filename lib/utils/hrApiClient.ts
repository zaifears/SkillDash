// lib/utils/hrApiClient.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { auth } from '@/lib/firebase'; // Main Firebase auth
import type { Auth } from 'firebase/auth';

/**
 * Fetch HR API with authentication
 */
export async function fetchHRAPI(
  endpoint: string,
  options: RequestInit = {}
) {
  try {
    // Get auth token from main Firebase
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const typedAuth = auth as Auth;
    const user = typedAuth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const idToken = await user.getIdToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
      ...options.headers
    };

    const response = await fetch(`/api/hr${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('HR API Error:', error);
    throw error;
  }
}

/**
 * Fetch job postings
 */
export async function fetchJobPostings(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return fetchHRAPI(
    `/job-postings?${queryParams.toString()}`,
    { method: 'GET' }
  );
}

/**
 * Create job posting
 */
export async function createJobPosting(data: {
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'internship' | 'part-time' | 'full-time' | 'contract' | 'freelance';
  requirements: string[];
  budget?: number;
  salaryRange?: { min: number; max: number };
  postedBy: string;
}) {
  return fetchHRAPI('/job-postings', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Get job posting details
 */
export async function getJobPosting(jobId: string) {
  return fetchHRAPI(`/job-postings/${jobId}`, { method: 'GET' });
}

/**
 * Update job posting
 */
export async function updateJobPosting(
  jobId: string,
  data: {
    status?: 'active' | 'closed' | 'draft';
    featured?: boolean;
    title?: string;
    description?: string;
    requirements?: string[];
  }
) {
  return fetchHRAPI(`/job-postings/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * Delete job posting
 */
export async function deleteJobPosting(jobId: string) {
  return fetchHRAPI(`/job-postings/${jobId}`, { method: 'DELETE' });
}

/**
 * Fetch applicants
 */
export async function fetchApplicants(params?: {
  jobId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.jobId) queryParams.append('jobId', params.jobId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return fetchHRAPI(
    `/applicants?${queryParams.toString()}`,
    { method: 'GET' }
  );
}

/**
 * Submit job application
 */
export async function submitJobApplication(data: {
  jobId: string;
  candidateName: string;
  email: string;
  phone?: string;
  resume?: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  userId?: string;
}) {
  return fetchHRAPI('/applicants', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Get applicant details
 */
export async function getApplicant(applicantId: string) {
  return fetchHRAPI(`/applicants/${applicantId}`, { method: 'GET' });
}

/**
 * Update applicant status
 */
export async function updateApplicantStatus(
  applicantId: string,
  data: {
    status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
    rating?: number;
    notes?: string;
  }
) {
  return fetchHRAPI(`/applicants/${applicantId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
