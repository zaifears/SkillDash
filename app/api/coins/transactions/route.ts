// app/api/coins/transactions/route.ts - API route for transaction history

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

export async function GET(request: NextRequest) {
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
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const limitStr = url.searchParams.get('limit');
    const action = url.searchParams.get('action') as 'add' | 'deduct' | undefined;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // 🔒 AUTHORIZATION: Verify user can only view their own transactions or is admin
    if (decodedToken.uid !== userId && !decodedToken.admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Cannot view other user transactions' },
        { status: 403 }
      );
    }

    const limit = limitStr ? parseInt(limitStr, 10) : 10;

    // Get transaction history from server
    const result = await CoinManagerServer.getUserTransactions(userId, limit, action);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: result.transactions
    });

  } catch (error: any) {
    console.error('❌ Transactions API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
