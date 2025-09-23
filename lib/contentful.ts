import { createClient, Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

// ✅ Environment variables with fallbacks (for Next.js 15 compatibility)
const spaceId = process.env.CONTENTFUL_SPACE_ID || 'qz001ds11gs3';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || '9Xkr6hXeKKPMfTCIngLAG7k0n-g4JsIqJ2xeJGcUSb0';

// ✅ Create client with optimized settings
const client = createClient({
  space: spaceId,
  environment: 'master',
  accessToken: accessToken,
  // ✅ OPTIMIZED: Reduced timeout for faster failures
  timeout: 8000, // 8 seconds instead of 10
  retryLimit: 2, // 2 retries instead of 3
});

// ✅ OPTIMIZED: Enhanced cache with hit/miss tracking
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 15 * 60 * 1000; // ✅ OPTIMIZED: 15 minutes instead of 5
  private hitCount = 0;
  private missCount = 0;

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
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

  // ✅ OPTIMIZED: Add cache stats for monitoring
  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount,
      misses: this.missCount
    };
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
}

const cache = new SimpleCache();

// ✅ Interface with correct content type ID
interface JobOpportunitySkeleton extends EntrySkeletonType {
  contentTypeId: 'SkillDashJobs';
  fields: {
    positionName: EntryFieldTypes.Text;
    company: EntryFieldTypes.Text;
    location: EntryFieldTypes.Text;
    educationalRequirement: EntryFieldTypes.Text;
    deadlineToApply: EntryFieldTypes.Date;
    requirements: EntryFieldTypes.Object;
    workplace: EntryFieldTypes.Text;
    employmentStatus: EntryFieldTypes.Text;
    jobLocation: EntryFieldTypes.Text;
    applyProcedure: EntryFieldTypes.RichText;
    companyInfo: EntryFieldTypes.Object;
  };
}

// ✅ Use the Entry type directly
export type JobOpportunity = Entry<JobOpportunitySkeleton, undefined, string>;

// ✅ Formatted job interface
export interface FormattedJobOpportunity {
  id: string;
  createdAt: string;
  updatedAt: string;
  positionName: string;
  company: string;
  location: string;
  educationalRequirement: string;
  deadlineToApply: string;
  formattedDeadline: string;
  isExpired: boolean;
  requirements: {
    education: {
      masters: string;
      bachelor: string;
      additionalEducation: string;
    };
    experience: string;
    additionalRequirements: string;
    skillsExpertise: string[];
  };
  workplace: string;
  employmentStatus: string;
  jobLocation: string;
  applyProcedure: any;
  companyInfo: {
    name: string;
    address: string;
    website: string;
    description: string;
  };
}

// ✅ OPTIMIZED: Reduce initial fetch for faster page loads
export async function getJobOpportunities(limit = 20): Promise<JobOpportunity[]> { // ✅ OPTIMIZED: 20 instead of 100
  const cacheKey = `jobs_${limit}`;
  
  // Check cache first
  const cachedData = cache.get<JobOpportunity[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // ✅ OPTIMIZED: Reduce timeout for faster failures
    const fetchPromise = client.getEntries<JobOpportunitySkeleton>({
      content_type: 'SkillDashJobs',
      order: ['-sys.createdAt'],
      limit
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 6000) // ✅ OPTIMIZED: 6 seconds instead of 8
    );

    const entries = await Promise.race([fetchPromise, timeoutPromise]);
    
    // ✅ OPTIMIZED: Longer cache for job listings
    cache.set(cacheKey, entries.items, 15 * 60 * 1000); // 15 minutes
    
    return entries.items;
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    
    // Return empty array but don't cache failures
    return [];
  }
}

// ✅ Optimized single job fetch with caching
export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  const cacheKey = `job_${id}`;
  
  // Check cache first
  const cachedData = cache.get<JobOpportunity>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const fetchPromise = client.getEntry<JobOpportunitySkeleton>(id);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 6000) // ✅ OPTIMIZED: 6 seconds instead of 8
    );

    const entry = await Promise.race([fetchPromise, timeoutPromise]);
    
    // ✅ OPTIMIZED: Longer cache for individual entries (5 minutes instead of 2)
    cache.set(cacheKey, entry, 5 * 60 * 1000);
    
    return entry;
  } catch (error) {
    console.error('Error fetching job opportunity:', error);
    return null;
  }
}

// ✅ Helper function to safely access fields
function getJobField<T>(job: JobOpportunity, fieldName: string): T {
  return (job.fields as any)[fieldName] as T;
}

// ✅ OPTIMIZED: Enhanced memoized date formatting with larger cache
const dateFormatCache = new Map<string, string>();
const MAX_DATE_CACHE_SIZE = 1000; // Prevent memory leaks

export function formatDeadline(dateString: string): string {
  if (dateFormatCache.has(dateString)) {
    return dateFormatCache.get(dateString)!;
  }

  try {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
    
    // ✅ OPTIMIZED: Prevent cache from growing too large
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

// ✅ OPTIMIZED: Enhanced memoized deadline checking
const deadlineCache = new Map<string, boolean>();
const MAX_DEADLINE_CACHE_SIZE = 1000;

export function isDeadlinePassed(dateString: string): boolean {
  const cacheKey = `${dateString}_${new Date().toDateString()}`;
  
  if (deadlineCache.has(cacheKey)) {
    return deadlineCache.get(cacheKey)!;
  }

  try {
    const deadline = new Date(dateString);
    const now = new Date();
    const isPassed = deadline < now;
    
    // ✅ OPTIMIZED: Prevent cache from growing too large
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

// ✅ Optimized formatting with minimal processing for list views
export function formatJobOpportunityMinimal(job: JobOpportunity): Partial<FormattedJobOpportunity> {
  const deadlineString = getJobField<string>(job, 'deadlineToApply');
  
  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: getJobField<string>(job, 'positionName'),
    company: getJobField<string>(job, 'company'),
    location: getJobField<string>(job, 'location'),
    educationalRequirement: getJobField<string>(job, 'educationalRequirement'),
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: isDeadlinePassed(deadlineString),
    workplace: getJobField<string>(job, 'workplace'),
    employmentStatus: getJobField<string>(job, 'employmentStatus'),
    jobLocation: getJobField<string>(job, 'jobLocation'),
  };
}

// ✅ Full formatting for detail views only
export function formatJobOpportunity(job: JobOpportunity): FormattedJobOpportunity {
  const deadlineString = getJobField<string>(job, 'deadlineToApply');
  const requirements = getJobField<any>(job, 'requirements') || {};
  const companyInfo = getJobField<any>(job, 'companyInfo') || {};
  
  return {
    id: job.sys.id,
    createdAt: job.sys.createdAt,
    updatedAt: job.sys.updatedAt,
    positionName: getJobField<string>(job, 'positionName'),
    company: getJobField<string>(job, 'company'),
    location: getJobField<string>(job, 'location'),
    educationalRequirement: getJobField<string>(job, 'educationalRequirement'),
    deadlineToApply: deadlineString,
    formattedDeadline: formatDeadline(deadlineString),
    isExpired: isDeadlinePassed(deadlineString),
    requirements: {
      education: {
        masters: requirements.education?.masters || '',
        bachelor: requirements.education?.bachelor || '',
        additionalEducation: requirements.education?.additionalEducation || '',
      },
      experience: requirements.experience || '',
      additionalRequirements: requirements.additionalRequirements || '',
      skillsExpertise: requirements.skillsExpertise || [],
    },
    workplace: getJobField<string>(job, 'workplace'),
    employmentStatus: getJobField<string>(job, 'employmentStatus'),
    jobLocation: getJobField<string>(job, 'jobLocation'),
    applyProcedure: getJobField<any>(job, 'applyProcedure'),
    companyInfo: {
      name: companyInfo.name || '',
      address: companyInfo.address || '',
      website: companyInfo.website || '',
      description: companyInfo.description || '',
    },
  };
}

// ✅ OPTIMIZED: Enhanced cache management
export function clearCache(): void {
  cache.clear();
  dateFormatCache.clear();
  deadlineCache.clear();
}

// ✅ OPTIMIZED: Add cache monitoring (useful for development)
export function getCacheStats() {
  return {
    contentful: cache.getStats(),
    dateFormat: { size: dateFormatCache.size },
    deadline: { size: deadlineCache.size }
  };
}
