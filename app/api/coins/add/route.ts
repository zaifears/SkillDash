// app/api/coins/add/route.ts - API route for adding coins securely

import { NextRequest, NextResponse } from 'next/server';
import { CoinManagerServer } from '@/lib/coinManagerServer';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

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
    return await getAuth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    // 🔒 AUTHENTICATION: Verify user is authenticated
    const authHeader = request.headers.get('Authorization');
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
        { success: false, error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { userId, amount, reason, description } = body;
    
    // 🔒 AUTHORIZATION: Verify user can only modify their own coins or is admin
    if (decodedToken.uid !== userId && !decodedToken.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Cannot modify other user coins' },
        { status: 403 }
      );
    }
    
    // Validate required fields
    if (!userId || !amount || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, amount, reason' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Add coins using server-side manager
    const result = await CoinManagerServer.addCoins(userId, amount, reason, description);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to add coins' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      transactionId: result.transactionId
    });

  } catch (error: any) {
    console.error('❌ Add Coins API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
