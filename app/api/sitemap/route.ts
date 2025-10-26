import { NextResponse } from 'next/server';

const baseUrl = 'https://skilldash.live';

const staticPages = [
  { url: '/', priority: '1.00' },
  { url: '/discover', priority: '0.80' },
  { url: '/learn-skill', priority: '0.80' },
  { url: '/resume-feedback', priority: '0.80' },
  { url: '/opportunities', priority: '0.80' },
  { url: '/about-us', priority: '0.80' },
  { url: '/mini-test', priority: '0.64' },
  { url: '/opportunities/job-seeker', priority: '0.64' },
  { url: '/opportunities/hiring', priority: '0.64' },
];

export async function GET() {
  const lastmod = new Date().toISOString();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
