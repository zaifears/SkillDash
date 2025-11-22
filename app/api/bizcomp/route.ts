import { NextRequest, NextResponse } from 'next/server';
import { getBusinessCompetitions } from '@/lib/contentful';

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    // Fetch up to 20 business competitions
    const competitions = await getBusinessCompetitions(20);
    
    return NextResponse.json(competitions, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching business competitions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    );
  }
}
