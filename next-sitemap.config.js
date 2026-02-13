/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://skilldash.live',
  generateRobotsTxt: true,
  autoLastmod: true,
  outDir: './public', // Explicitly define output directory for safety
  
  // 1. Force add the virtual /simulator/trade page (since it's a modal, not a file)
  additionalPaths: async (config) => {
    return [
      {
        loc: '/simulator/trade',
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
    ]
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/debug/', '/minitest/', '/mini-test/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://skilldash.live/server-sitemap.xml',
    ],
  },
  
  exclude: [
    '/api/*',
    '/admin/*',
    '/404',
    '/500',
    '/debug',
    '/minitest/*',
    '/mini-test',
    '/_*',
    '/auth',
    '/coins',
    '/policy',
    '/profile',
    '/opportunities/hiring',
  ],

  transform: async (config, path) => {
    // Custom transform for priorities and change frequencies
    const priorities = {
      '/': 1.0,
      '/opportunities': 0.9,
      '/go': 0.9,
      '/simulator': 0.9,
      '/about-us': 0.3,
      '/discover': 0.3,
      '/learn-skill': 0.3,
      '/opportunities/bizcomp': 0.3,
      '/opportunities/job-seeker': 0.3,
      '/resume-feedback': 0.2,
    };

    const changefreqs = {
      '/': 'daily',
      '/discover': 'weekly',
      '/learn-skill': 'weekly',
      '/resume-feedback': 'weekly',
      '/opportunities': 'daily',
      '/about-us': 'monthly',
      // MERGED: New Simulator Frequency
      '/simulator': 'weekly',
    };

    return {
      loc: path,
      changefreq: changefreqs[path] || 'weekly',
      priority: priorities[path] || 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};