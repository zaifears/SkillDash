import { auth } from 'firebase-admin';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { NextRequest, NextResponse } from 'next/server';

// Only initialize on runtime (not build time)
let adminApp: any = null;

function getAdminApp() {
  if (adminApp) return adminApp;
  
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    const credential = cert(JSON.parse(serviceAccountKey));
    const apps = getApps();
    
    if (apps.length === 0) {
      adminApp = initializeApp({
        credential,
      });
    } else {
      adminApp = apps[0];
    }
    
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Failed to initialize Firebase Admin');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Get Firebase Admin app
    const adminApp = getAdminApp();
    const adminAuth = auth(adminApp);

    // Verify the token with Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Create a session cookie (14 days expiration)
    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn: 14 * 24 * 60 * 60 * 1000, // 14 days
    });

    // Return the session cookie in a response header
    const response = NextResponse.json({ success: true, uid });
    response.cookies.set('__session', sessionCookie, {
      maxAge: 14 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}
