import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import * as admin from 'firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Firebase Admin SDK
function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Check if authenticated as admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminApp = getAdminApp();
    const adminAuth = getAuth(adminApp);

    // Verify token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check admin role
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Not admin' }, { status: 403 });
    }

    // ✅ Analyze users collection
    const usersSnapshot = await admin.firestore().collection('users').get();
    const allUsers = usersSnapshot.docs.map(doc => doc.data());

    const analytics = {
      totalUsers: allUsers.length,
      usersWithCoins: allUsers.filter((u: any) => u.coins && u.coins > 0).length,
      usersWithZeroCoins: allUsers.filter((u: any) => !u.coins || u.coins === 0).length,
      usersWithEmail: allUsers.filter((u: any) => u.email).length,
      usersWithProvider: {
        email: allUsers.filter((u: any) => u.provider === 'password').length,
        google: allUsers.filter((u: any) => u.provider === 'google.com').length,
        github: allUsers.filter((u: any) => u.provider === 'github.com').length,
        other: allUsers.filter((u: any) => !u.provider || (u.provider !== 'password' && u.provider !== 'google.com' && u.provider !== 'github.com')).length,
      },
      usersWithStatus: {
        school: allUsers.filter((u: any) => u.status === 'School').length,
        college: allUsers.filter((u: any) => u.status === 'College').length,
        university: allUsers.filter((u: any) => u.status === 'University').length,
        job: allUsers.filter((u: any) => u.status === 'Job').length,
        other: allUsers.filter((u: any) => u.status === 'Other' || !u.status).length,
      },
      sampleUsers: allUsers.slice(0, 5).map((u: any) => ({
        uid: u.uid,
        email: u.email,
        coins: u.coins,
        status: u.status,
        provider: u.provider,
        createdAt: u.createdAt
      }))
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('Error analyzing users:', error);
    return NextResponse.json(
      { error: 'Failed to analyze users', details: (error as any).message },
      { status: 500 }
    );
  }
}
