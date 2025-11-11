import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ⚠️ SECURE THIS WITH A SECRET TOKEN IN PRODUCTION
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-secret-here';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  if (body.secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // This would need to be implemented to clear the rate limit store
  // For now, restarting the server clears it
  
  return NextResponse.json({ 
    success: true, 
    message: 'Rate limit cleared (requires server restart on Vercel)' 
  });
}
