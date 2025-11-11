import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { error, userAgent, timestamp, url } = body;
    
    console.error('🚨 [Client Error]:', {
      error,
      userAgent,
      timestamp,
      url,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      country: req.headers.get('x-vercel-ip-country') || 'unknown'
    });
    
    return NextResponse.json({ logged: true });
  } catch (error) {
    return NextResponse.json({ logged: false }, { status: 500 });
  }
}
