// app/api/coins/statistics/route.ts - API route for coin statistics

import { NextRequest, NextResponse } from 'next/server';
import { CoinManagerServer } from '@/lib/coinManagerServer';
import { auth } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers or query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get coin statistics from server
    const result = await CoinManagerServer.getCoinStatistics(userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      statistics: result.stats
    });

  } catch (error: any) {
    console.error('❌ Statistics API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
