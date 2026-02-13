import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SkillDash API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown'
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60' // 1 minute - public, cacheable status
    }
  });
}
