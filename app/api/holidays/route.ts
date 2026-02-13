import { NextRequest, NextResponse } from 'next/server';
import { getHolidayDetails } from '@/lib/bangladeshHolidays';

/**
 * Bangladesh Stock Exchange Holiday API
 * Primary: Google Calendar API (Bangladesh Public Holidays)
 * Fallback: Local comprehensive dataset
 * 
 * Google Calendar ID for Bangladesh: en.bd#holiday@group.v.calendar.google.com
 */

const BD_CALENDAR_ID = 'en.bd%23holiday%40group.v.calendar.google.com';

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: { date: string };
  end: { date: string };
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
}

interface Holiday {
  date: string;
  name: string;
  type: 'public' | 'observance';
  source: 'google' | 'local';
}

/**
 * Fetch holidays from Google Calendar API
 * Filters for "Public holiday" descriptions only (DSE closures)
 */
async function fetchFromGoogleCalendar(year: number): Promise<Holiday[]> {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_CALENDAR_API_KEY not configured');
  }

  const timeMin = `${year}-01-01T00:00:00Z`;
  const timeMax = `${year}-12-31T23:59:59Z`;

  const url = `https://www.googleapis.com/calendar/v3/calendars/${BD_CALENDAR_ID}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    next: { revalidate: 86400 } // Cache for 24 hours
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar API error: ${response.status} - ${errorText}`);
  }

  const data: GoogleCalendarResponse = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid response from Google Calendar API');
  }

  // Filter for public holidays only (DSE closures)
  // Google marks public holidays with "Public holiday" in description
  return data.items
    .filter(event => event.description?.includes('Public holiday'))
    .map((event) => ({
      date: event.start.date,
      name: event.summary.replace(' (tentative)', ''),
      type: 'public' as const,
      source: 'google' as const,
    }));
}

/**
 * GET /api/holidays?year=2026
 * Returns Bangladesh public holidays for the specified year
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10);

    let holidays: Holiday[];
    let source: string;

    try {
      // Primary: Fetch from Google Calendar API
      holidays = await fetchFromGoogleCalendar(year);
      source = 'google-calendar-api';
      console.log(`✅ Fetched ${holidays.length} public holidays for BD ${year} from Google Calendar`);
    } catch (apiError) {
      // Fallback: Use local comprehensive dataset
      console.warn(`⚠️ Google Calendar API failed, using local fallback for ${year}:`, apiError);
      const localHolidays = getHolidayDetails(year);
      holidays = localHolidays.map(h => ({ 
        date: h.date, 
        name: h.name, 
        type: 'public' as const,
        source: 'local' as const 
      }));
      source = 'local-fallback';
    }

    // Sort by date
    const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(
      {
        success: true,
        year,
        source,
        holidays: sortedHolidays,
        count: sortedHolidays.length,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
        }
      }
    );
  } catch (error) {
    console.error('Error in holidays API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
}
