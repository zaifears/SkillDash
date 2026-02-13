import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import * as admin from 'firebase-admin';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds for scraping

const GROUPS = ['A', 'B', 'N', 'Z'];

// ── Firebase Admin initialization with credentials ──
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  
  // Initialize with credentials from environment variables
  const credentials = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  };

  return initializeApp({
    credential: admin.credential.cert(credentials as any),
  });
}

function getDb() {
  return getFirestore(getAdminApp());
}

async function scrapeGroup(group: string) {
  const url = `https://www.dsebd.org/latest_share_price_scroll_group.php?group=${group}`;
  try {
    const response = await fetch(url, { next: { revalidate: 0 } });
    const html = await response.text();
    const $ = cheerio.load(html);
    const symbols: string[] = [];

    // DSE Table Parsing Logic
    // The table contains trading codes in the 2nd column (index 1)
    $('.table-bordered tr').each((_, row) => {
      let symbol = $(row).find('td').eq(1).text().trim();
      // Cleanup: Remove any extra spaces or newlines
      symbol = symbol.replace(/\s+/g, '').trim();

      // Basic validation: DSE codes are alphanumeric, ignore headers
      if (symbol && symbol !== 'TradingCode' && !symbol.includes('Unknown') && symbol.length > 0) {
        symbols.push(symbol);
      }
    });

    return { group, symbols };
  } catch (error) {
    console.error(`Failed to scrape group ${group}:`, error);
    return { group, symbols: [] };
  }
}

export async function GET(req: NextRequest) {
  // Security: Check for Vercel Cron secret (optional but recommended)
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Scrape all 4 groups in parallel
    const results = await Promise.all(GROUPS.map(scrapeGroup));
    
    // Create a map of symbol -> category for quick lookup
    const categoryMap = new Map<string, string>();
    for (const { group, symbols } of results) {
      for (const symbol of symbols) {
        categoryMap.set(symbol, group);
      }
    }

    // 2. Get the current market data from artifacts
    const db = getDb();
    const appId = process.env.NEXT_PUBLIC_SIMULATOR_APP_ID || 'skilldash-dse-v1';
    const marketRef = db.collection('artifacts').doc(appId)
      .collection('public').doc('data')
      .collection('market_info').doc('latest');
    
    const marketSnapshot = await marketRef.get();
    if (!marketSnapshot.exists) {
      return NextResponse.json({ error: 'Market data not found' }, { status: 404 });
    }

    const marketData = marketSnapshot.data() as any;
    const stocks = marketData.stocks || [];

    // 3. Add categories to each stock in the array
    const updatedStocks = stocks.map((stock: any) => ({
      ...stock,
      category: categoryMap.get(stock.symbol) || undefined
    }));

    // 4. Update the market_info document with categories
    await marketRef.set({
      stocks: updatedStocks,
      lastUpdated: new Date().toISOString(),
      totalStocks: stocks.length
    });

    const totalUpdated = Array.from(categoryMap.values()).length;
    console.log(`✅ Scraper completed: Updated ${totalUpdated} stocks with categories in market data`);

    return NextResponse.json({
      success: true,
      updated: totalUpdated,
      marketStocksUpdated: stocks.length,
      details: results.map(r => ({ group: r.group, count: r.symbols.length }))
    });

  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
