// app/api/coins/add/route.ts - API route for adding coins securely

import { NextRequest, NextResponse } from 'next/server';
import { CoinManagerServer } from '@/lib/coinManagerServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, reason, description } = body;
    
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
