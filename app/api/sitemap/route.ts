import { NextResponse } from 'next/server';

const baseUrl = 'https://skilldash.live';

const staticPages = [
  // Primary Pages (High Priority)
  { url: '/', priority: '1.00', changefreq: 'daily' },
  { url: '/discover', priority: '0.90', changefreq: 'weekly' },
  { url: '/learn-skill', priority: '0.90', changefreq: 'weekly' },
  { url: '/resume-feedback', priority: '0.90', changefreq: 'weekly' },
  { url: '/opportunities', priority: '0.90', changefreq: 'daily' },
  
  // Secondary Pages (Medium-High Priority)
  { url: '/about-us', priority: '0.80', changefreq: 'monthly' },
  { url: '/opportunities/job-seeker', priority: '0.75', changefreq: 'weekly' },
  { url: '/opportunities/hiring', priority: '0.75', changefreq: 'weekly' },
  { url: '/opportunities/bizcomp', priority: '0.70', changefreq: 'weekly' },
  
  // Tertiary Pages (Medium Priority)
  { url: '/mini-test', priority: '0.64', changefreq: 'weekly' },
];

export async function GET() {
  const lastmod = new Date().toISOString();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
