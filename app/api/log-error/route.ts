import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 🚦 RATE LIMITING (In-Memory Store)
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 error logs per minute per IP

// Periodic cleanup to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean every minute

const checkRateLimit = (ip: string): { allowed: boolean; retryAfter?: number } => {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);
    
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(ip, { 
            count: 1, 
            resetTime: now + RATE_LIMIT_WINDOW
        });
        return { allowed: true };
    }
    
    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
    }
    
    entry.count++;
    rateLimitStore.set(ip, entry);
    return { allowed: true };
};

export async function POST(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    
    // 🚦 Check rate limit
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { logged: false, error: 'Too many error logs. Please try again later.' },
        { 
          status: 429,
          headers: rateLimitResult.retryAfter 
            ? { 'Retry-After': String(rateLimitResult.retryAfter) }
            : {}
        }
      );
    }

    const body = await req.json();
    const { error, userAgent, timestamp, url, context } = body;
    
    // 🔒 Validate input
    if (!error || typeof error !== 'string' || error.length === 0) {
      return NextResponse.json(
        { logged: false, error: 'Invalid error message' },
        { status: 400 }
      );
    }

    if (error.length > 1000) {
      return NextResponse.json(
        { logged: false, error: 'Error message too long' },
        { status: 400 }
      );
    }

    // 🚨 Log error securely (don't expose sensitive details)
    console.error('🚨 [Client Error]:', {
      timestamp: timestamp || new Date().toISOString(),
      errorMessage: error.substring(0, 500), // Truncate for safety
      url: url ? url.split('?')[0] : 'unknown', // Remove query params
      country: req.headers.get('x-vercel-ip-country') || 'unknown',
      context: context ? JSON.stringify(context).substring(0, 200) : undefined
    });
    
    return NextResponse.json({ logged: true });
  } catch (error: any) {
    // Don't expose error details
    return NextResponse.json(
      { logged: false, error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
