/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://skilldash.live',
  generateRobotsTxt: true,
  autoLastmod: true,
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
  ],
  transform: async (config, path) => {
    // Custom transform for priorities and change frequencies
    const priorities = {
      '/': 1.0,
      '/discover': 0.9,
      '/learn-skill': 0.9,
      '/resume-feedback': 0.9,
      '/opportunities': 0.9,
      '/about-us': 0.8,
      '/opportunities/job-seeker': 0.75,
      '/opportunities/hiring': 0.75,
      '/opportunities/bizcomp': 0.7,
    };

    const changefreqs = {
      '/': 'daily',
      '/discover': 'weekly',
      '/learn-skill': 'weekly',
      '/resume-feedback': 'weekly',
      '/opportunities': 'daily',
      '/about-us': 'monthly',
    };

    return {
      loc: path,
      changefreq: changefreqs[path] || 'weekly',
      priority: priorities[path] || 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
