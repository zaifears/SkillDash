import { createClient, Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

// Environment variables with fallbacks
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'qz001ds11gs3';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || '9Xkr6hXeKKPMfTCIngLAG7k0n-g4JsIqJ2xeJGcUSb0';

// Create client with optimized settings
const client = createClient({
  space: spaceId,
  environment: 'master',
  accessToken: accessToken,
  timeout: 8000, // 8 second timeout
  retryLimit: 2, // Retry 2 times on failure
});

// --- Cache Implementation ---
// A simple in-memory cache to speed up repeated requests during a session
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time-to-live in ms
}
class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }
}
const cache = new SimpleCache();

// --- Date Formatting Helpers (Lightweight) ---
// Cache for formatted dates to avoid re-calculating
const dateFormatCache = new Map<string, string>();
const MAX_DATE_CACHE_SIZE = 1000;

export function formatDeadline(dateString: string): string {
  if (!dateString) return 'N/A';
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }
  try {
    const date = new Date(dateString);
    // Format: 02 Nov 2025
    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    if (dateFormatCache.size >= MAX_DATE_CACHE_SIZE) dateFormatCache.clear();
    dateFormatCache.set(dateString, formatted);
    return formatted;
  } catch (error) {
    return dateString; // Return original string if formatting fails
  }
}

// === 1. JOB OPPORTUNITIES (Existing) ===

interface JobOpportunitySkeleton extends EntrySkeletonType {
  contentTypeId: 'SkillDashJobs';
  fields: {
    positionName: EntryFieldTypes.Text;
    companyLogo?: EntryFieldTypes.AssetLink;
    companyName: EntryFieldTypes.Text;
    jobLocation: EntryFieldTypes.Text;
    requirements: EntryFieldTypes.Object;
    deadlineToApply: EntryFieldTypes.Date;
    workplaceType: EntryFieldTypes.Text;
    employmentType: EntryFieldTypes.Text;
    applyProcedure: EntryFieldTypes.RichText;
    companyInfo: EntryFieldTypes.Object;
  };
}
export type JobOpportunity = Entry<JobOpportunitySkeleton, undefined, string>;

export interface FormattedJobOpportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  positionName: string;
  companyLogo?: any;
  companyName: string;
  jobLocation: string;
  requirements: {
    education: { degree: string; preferred: string; };
    experience: string;
    skills: string[];
    additional: string;
  };
  deadlineToApply: string;
  formattedDeadline: string;
  isExpired: boolean;
  workplaceType: string;
  employmentType: string;
  applyProcedure: any;
  companyInfo: {
    name: string;
    address: string;
    website: string;
    description: string;
  };
}

// Full formatting for detail views
export function formatJobOpportunity(job: JobOpportunity): FormattedJobOpportunity {
  const deadlineString = job.fields.deadlineToApply || new Date().toISOString();
  const requirements = job.fields.requirements || {};
  const companyInfo = job.fields.companyInfo || {};

  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: job.fields.positionName || 'N/A',
    companyLogo: job.fields.companyLogo,
    companyName: job.fields.companyName || 'N/A',
    jobLocation: job.fields.jobLocation || 'N/A',
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: new Date(deadlineString) < new Date(),
    requirements: {
      education: (requirements as any).education || { degree: '', preferred: '' },
      experience: (requirements as any).experience || '',
      skills: (requirements as any).skills || [],
      additional: (requirements as any).additional || '',
    },
    workplaceType: job.fields.workplaceType || 'N/A',
    employmentType: job.fields.employmentType || 'N/A',
    applyProcedure: job.fields.applyProcedure,
    companyInfo: {
      name: (companyInfo as any).name || '',
      address: (companyInfo as any).address || '',
      website: (companyInfo as any).website || '',
      description: (companyInfo as any).description || '',
    },
  };
}

// Optimized formatting for list views
export function formatJobOpportunityMinimal(job: JobOpportunity): Partial<FormattedJobOpportunity> {
  const deadlineString = job.fields.deadlineToApply || new Date().toISOString();
  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: job.fields.positionName,
    companyLogo: job.fields.companyLogo,
    companyName: job.fields.companyName,
    jobLocation: job.fields.jobLocation,
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: new Date(deadlineString) < new Date(),
    workplaceType: job.fields.workplaceType,
    employmentType: job.fields.employmentType,
  };
}

// Fetch multiple jobs
export async function getJobOpportunities(limit = 20): Promise<JobOpportunity[]> {
  const cacheKey = `jobs-${limit}`;
  const cachedData = cache.get<JobOpportunity[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const entries = await client.getEntries<JobOpportunitySkeleton>({
      content_type: 'SkillDashJobs',
      order: ['-sys.createdAt'],
      limit,
    });
    cache.set(cacheKey, entries.items, 15 * 60 * 1000); // 15 min cache
    return entries.items;
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    return [];
  }
}

// Fetch a single job by ID
export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  const cacheKey = `job-${id}`;
  const cachedData = cache.get<JobOpportunity>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const entry = await client.getEntry<JobOpportunitySkeleton>(id);
    cache.set(cacheKey, entry, 5 * 60 * 1000); // 5 min cache
    return entry;
  } catch (error) {
    console.error('Error fetching job opportunity by ID:', error);
    return null;
  }
}


// === 2. BUSINESS COMPETITIONS (New) ===

// This interface MUST match your Contentful 'bizComp' model
interface BusinessCompetitionSkeleton extends EntrySkeletonType {
  contentTypeId: 'bizComp';
  fields: {
    competitionName: EntryFieldTypes.Text;
    competitionOrganizer: EntryFieldTypes.Text;
    teamSize: EntryFieldTypes.Text;
    registrationFee: EntryFieldTypes.Text;
    registrationDeadline: EntryFieldTypes.Date;
    prizePool: EntryFieldTypes.Text;
    detailsLink: EntryFieldTypes.Text;
    registrationLink: EntryFieldTypes.Text;
    ovcRequirement: EntryFieldTypes.Text;
  };
}
export type BusinessCompetition = Entry<BusinessCompetitionSkeleton, undefined, string>;

// This interface defines the clean data for the frontend
export interface FormattedBusinessCompetition {
  id: string;
  competitionName: string;
  competitionOrganizer: string;
  teamSize: string;
  registrationFee: string;
  registrationDeadline: string;
  formattedDeadline: string;
  prizePool: string;
  detailsLink: string;
  registrationLink: string;
  ovcRequirement: string;
}

// This function formats the data from Contentful
export function formatBusinessCompetition(comp: BusinessCompetition): FormattedBusinessCompetition {
  const deadlineString = comp.fields.registrationDeadline || new Date().toISOString();
  return {
    id: comp.sys.id,
    competitionName: comp.fields.competitionName || 'N/A',
    competitionOrganizer: comp.fields.competitionOrganizer || 'N/A',
    teamSize: comp.fields.teamSize || 'N/A',
    registrationFee: comp.fields.registrationFee || 'Free',
    registrationDeadline: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    prizePool: comp.fields.prizePool || 'N/A',
    detailsLink: comp.fields.detailsLink || '',
    registrationLink: comp.fields.registrationLink || '',
    ovcRequirement: comp.fields.ovcRequirement || 'Info not available',
  };
}

// This function fetches the competition data
export async function getBusinessCompetitions(limit = 20): Promise<FormattedBusinessCompetition[]> {
  const cacheKey = `bizComps-${limit}`;
  const cachedData = cache.get<FormattedBusinessCompetition[]>(cacheKey);
  if (cachedData) return cachedData;

  try {
    const entries = await client.getEntries<BusinessCompetitionSkeleton>({
      content_type: 'bizComp', // This API ID must match your Contentful model
      order: ['-fields.registrationDeadline'], // Order by deadline
      limit,
    });
    
    // Format the data before caching and returning
    const formattedComps = entries.items.map(formatBusinessCompetition);
    cache.set(cacheKey, formattedComps, 15 * 60 * 1000); // 15 min cache
    return formattedComps;
    
  } catch (error) {
    console.error('Error fetching business competitions:', error);
    return [];
  }
}

