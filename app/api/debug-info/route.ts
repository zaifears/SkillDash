import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ip: ip,
    userAgent: req.headers.get('user-agent'),
    origin: req.headers.get('origin'),
    referer: req.headers.get('referer'),
    host: req.headers.get('host'),
    forwardedFor: req.headers.get('x-forwarded-for'),
    realIp: req.headers.get('x-real-ip'),
    country: req.headers.get('x-vercel-ip-country'),
    city: req.headers.get('x-vercel-ip-city'),
    region: req.headers.get('x-vercel-ip-country-region'),
    allHeaders: Object.fromEntries(req.headers.entries())
  });
}
