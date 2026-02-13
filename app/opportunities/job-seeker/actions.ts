'use server';

import { getJobOpportunities, getJobOpportunityById } from '@/lib/contentful';

export async function fetchJobs(limit: number = 50) {
  try {
    return await getJobOpportunities(limit);
  } catch (error) {
    console.error('Server action error:', error);
    throw error;
  }
}

export async function fetchJobById(id: string) {
  try {
    return await getJobOpportunityById(id);
  } catch (error) {
    console.error('Server action error:', error);
    throw error;
  }
}
