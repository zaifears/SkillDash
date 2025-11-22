import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Firebase Admin for token verification
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    } as any),
  });
}

// 🔒 Verify Firebase ID token
const verifyIdToken = async (token: string) => {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.admin ? decodedToken : null;
  } catch (error) {
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    // 🔒 AUTHENTICATION: Verify user is authenticated and is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid token or not admin' },
        { status: 401 }
      );
    }

    // Rate limit clearing is not fully implemented - requires server restart on Vercel
    // This endpoint validates admin access but doesn't clear the in-memory store
    return NextResponse.json({
      success: false,
      message: 'Rate limit store is ephemeral. Requires server restart to clear. Use persistent Redis for production.'
    }, { status: 501 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
