import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';
import { resetRateLimitForIdentifier } from '@/lib/utils/persistentRateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 🔒 Centralized admin verification
    const adminCheck = await verifyAdminAccess(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: adminCheck.error,
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // Extract identifier from request body
    const body = await req.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid identifier parameter',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 🔓 Reset persistent rate limit for the identifier
    await resetRateLimitForIdentifier(identifier);

    return NextResponse.json({
      success: true,
      message: `Rate limit reset for identifier: ${identifier}`,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error resetting rate limit:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset rate limit',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
