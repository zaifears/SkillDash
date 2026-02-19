/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://skilldash.live',
  generateRobotsTxt: true,
  autoLastmod: true,
  outDir: './public',
  
  // Only include DSE Paper Trading pages
  additionalPaths: async (config) => {
    return [
      {
        loc: '/simulator/trade',
        changefreq: 'weekly',
        priority: 0.95,
        lastmod: new Date().toISOString(),
      },
    ]
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: ['/', '/simulator', '/simulator/trade'],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/debug/',
          '/minitest/',
          '/mini-test/',
          '/auth/',
          '/coins/',
          '/policy/',
          '/profile/',
          '/discover/',
          '/learn-skill/',
          '/opportunities/',
          '/resume-feedback/',
          '/hr/',
          '/upload/',
          '/go/',
          '/about-us/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/simulator', '/simulator/trade'],
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/debug/',
          '/minitest/',
          '/mini-test/',
          '/auth/',
          '/coins/',
          '/policy/',
          '/profile/',
          '/discover/',
          '/learn-skill/',
          '/opportunities/',
          '/resume-feedback/',
          '/hr/',
          '/upload/',
          '/go/',
          '/about-us/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/simulator', '/simulator/trade'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/simulator', '/simulator/trade'],
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/simulator', '/simulator/trade'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: ['/', '/simulator', '/simulator/trade'],
      },
    ],
    additionalSitemaps: [
      'https://skilldash.live/server-sitemap.xml',
    ],
  },
  
  exclude: [
    '/api/*',
    '/api/**/*',
    '/admin',
    '/admin/*',
    '/admin/**/*',
    '/404',
    '/500',
    '/debug',
    '/debug/*',
    '/minitest',
    '/minitest/*',
    '/mini-test',
    '/mini-test/*',
    '/_*',
    '/_*/*',
    '/auth',
    '/auth/*',
    '/coins',
    '/coins/*',
    '/policy',
    '/policy/*',
    '/profile',
    '/profile/*',
    '/discover',
    '/discover/*',
    '/learn-skill',
    '/learn-skill/*',
    '/opportunities',
    '/opportunities/*',
    '/opportunities/**/*',
    '/resume-feedback',
    '/resume-feedback/*',
    '/hr',
    '/hr/*',
    '/hr/**/*',
    '/upload',
    '/upload/*',
    '/go',
    '/go/*',
    '/about-us',
    '/about-us/*',
  ],

  transform: async (config, path) => {
    // Only allow DSE simulator pages in the sitemap
    const allowedPaths = ['/', '/simulator', '/simulator/trade'];
    
    if (!allowedPaths.includes(path)) {
      return null; // Exclude this path from sitemap
    }

    // Custom transform for DSE Paper Trading pages only
    const priorities = {
      '/': 1.0,
      '/simulator': 0.95,
      '/simulator/trade': 0.95,
    };

    const changefreqs = {
      '/': 'daily',
      '/simulator': 'weekly',
      '/simulator/trade': 'weekly',
    };

    return {
      loc: path,
      changefreq: changefreqs[path] || 'weekly',
      priority: priorities[path] || 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
}