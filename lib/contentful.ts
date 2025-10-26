import { createClient, Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

// Environment variables with fallbacks for Next.js 15 compatibility
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'qz001ds11gs3';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || '9Xkr6hXeKKPMfTCIngLAG7k0n-g4JsIqJ2xeJGcUSb0';

// Create client with optimized settings
const client = createClient({
  space: spaceId,
  environment: 'master',
  accessToken: accessToken,
  timeout: 8000,
  retryLimit: 2,
});

// Enhanced cache with hit/miss tracking
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 15 * 60 * 1000;
  private hitCount = 0;
  private missCount = 0;

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      this.missCount++;
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return item.data as T;
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount,
      misses: this.missCount,
    };
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

const cache = new SimpleCache();

// ✅ UPDATED Interface with Requirements field
interface JobOpportunitySkeleton extends EntrySkeletonType {
  contentTypeId: 'SkillDashJobs';
  fields: {
    positionName: EntryFieldTypes.Text;
    companyLogo?: EntryFieldTypes.AssetLink;
    companyName: EntryFieldTypes.Text;
    jobLocation: EntryFieldTypes.Text;
    requirements: EntryFieldTypes.Object; // ✅ NEW Requirements field
    deadlineToApply: EntryFieldTypes.Date;
    workplaceType: EntryFieldTypes.Text;
    employmentType: EntryFieldTypes.Text;
    applyProcedure: EntryFieldTypes.RichText;
    companyInfo: EntryFieldTypes.Object;
  };
}

// Use the Entry type directly
export type JobOpportunity = Entry<JobOpportunitySkeleton, undefined, string>;

// Helper function to safely access fields
function getJobField<T>(job: JobOpportunity, fieldName: string): T {
  return (job.fields as any)[fieldName] as T;
}

// Enhanced memoized date formatting with larger cache
const dateFormatCache = new Map<string, string>();
const MAX_DATE_CACHE_SIZE = 1000;

export function formatDeadline(dateString: string): string {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }

  try {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (dateFormatCache.size >= MAX_DATE_CACHE_SIZE) {
      const firstKey = dateFormatCache.keys().next().value;
      dateFormatCache.delete(firstKey);
    }

    dateFormatCache.set(dateString, formatted);
    return formatted;
  } catch (error) {
    dateFormatCache.set(dateString, dateString);
    return dateString;
  }
}

// Enhanced memoized deadline checking
const deadlineCache = new Map<string, boolean>();
const MAX_DEADLINE_CACHE_SIZE = 1000;

export function isDeadlinePassed(dateString: string): boolean {
  const cacheKey = dateString + new Date().toDateString();
  if (deadlineCache.has(cacheKey)) {
    return deadlineCache.get(cacheKey)!;
  }

  try {
    const deadline = new Date(dateString);
    const now = new Date();
    const isPassed = deadline < now;

    if (deadlineCache.size >= MAX_DEADLINE_CACHE_SIZE) {
      const firstKey = deadlineCache.keys().next().value;
      deadlineCache.delete(firstKey);
    }

    deadlineCache.set(cacheKey, isPassed);
    return isPassed;
  } catch (error) {
    deadlineCache.set(cacheKey, false);
    return false;
  }
}

// ✅ UPDATED Formatted job interface with Requirements field
export interface FormattedJobOpportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  positionName: string;
  companyLogo?: {
    fields: {
      file: {
        url: string;
        details: {
          image: {
            width: number;
            height: number;
          };
        };
      };
      title: string;
    };
  };
  companyName: string;
  jobLocation: string;
  requirements: { // ✅ UPDATED to use the Requirements JSON field
    education: {
      degree: string;
      preferred: string;
    };
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

// ✅ UPDATED Optimized formatting for list views
export function formatJobOpportunityMinimal(job: JobOpportunity): Partial<FormattedJobOpportunity> {
  const deadlineString = getJobField<string>(job, 'deadlineToApply');

  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: getJobField<string>(job, 'positionName'),
    companyLogo: getJobField<any>(job, 'companyLogo'),
    companyName: getJobField<string>(job, 'companyName'),
    jobLocation: getJobField<string>(job, 'jobLocation'),
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: isDeadlinePassed(deadlineString),
    workplaceType: getJobField<string>(job, 'workplaceType'),
    employmentType: getJobField<string>(job, 'employmentType'),
  };
}

// ✅ UPDATED Full formatting for detail views
export function formatJobOpportunity(job: JobOpportunity): FormattedJobOpportunity {
  const deadlineString = getJobField<string>(job, 'deadlineToApply');
  const requirements = getJobField<any>(job, 'requirements') || {}; // ✅ Get Requirements JSON
  const companyInfo = getJobField<any>(job, 'companyInfo') || {};

  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: getJobField<string>(job, 'positionName'),
    companyLogo: getJobField<any>(job, 'companyLogo'),
    companyName: getJobField<string>(job, 'companyName'),
    jobLocation: getJobField<string>(job, 'jobLocation'),
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: isDeadlinePassed(deadlineString),
    requirements: { // ✅ UPDATED to use Requirements JSON structure
      education: {
        degree: requirements.education?.degree || '',
        preferred: requirements.education?.preferred || '',
      },
      experience: requirements.experience || '',
      skills: requirements.skills || [],
      additional: requirements.additional || '',
    },
    workplaceType: getJobField<string>(job, 'workplaceType'),
    employmentType: getJobField<string>(job, 'employmentType'),
    applyProcedure: getJobField<any>(job, 'applyProcedure'),
    companyInfo: {
      name: companyInfo?.name || '',
      address: companyInfo?.address || '',
      website: companyInfo?.website || '',
      description: companyInfo?.description || '',
    },
  };
}

// Reduce initial fetch for faster page loads
export async function getJobOpportunities(limit = 20): Promise<JobOpportunity[]> {
  const cacheKey = `jobs-${limit}`;

  // Check cache first
  const cachedData = cache.get<JobOpportunity[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const fetchPromise = client.getEntries<JobOpportunitySkeleton>({
      content_type: 'SkillDashJobs',
      order: ['-sys.createdAt'],
      limit,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 6000)
    );

    const entries = await Promise.race([fetchPromise, timeoutPromise]);

    cache.set(cacheKey, entries.items, 15 * 60 * 1000);

    return entries.items;
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    return [];
  }
}

// Optimized single job fetch with caching
export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  const cacheKey = `job-${id}`;

  // Check cache first
  const cachedData = cache.get<JobOpportunity>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const fetchPromise = client.getEntry<JobOpportunitySkeleton>(id);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 6000)
    );

    const entry = await Promise.race([fetchPromise, timeoutPromise]);

    cache.set(cacheKey, entry, 5 * 60 * 1000);

    return entry;
  } catch (error) {
    console.error('Error fetching job opportunity:', error);
    return null;
  }
}

// Enhanced cache management
export function clearCache(): void {
  cache.clear();
  dateFormatCache.clear();
  deadlineCache.clear();
}
