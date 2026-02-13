import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { verifyAdminAccess } from '@/lib/utils/adminVerification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 🔒 Centralized admin verification
    const adminCheck = await verifyAdminAccess(req);
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: adminCheck.error }, { status: 401 });
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
