// app/api/coins/transactions/route.ts - API route for transaction history

import { NextRequest, NextResponse } from 'next/server';
import { CoinManagerServer } from '@/lib/coinManagerServer';

export async function GET(request: NextRequest) {
  try {
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
