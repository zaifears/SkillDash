/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://skilldash.live',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
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
    '/_*',
  ],
  transform: async (config, path) => {
    // Custom transform for priorities and change frequencies
    const priorities = {
      '/': 1.0,
      '/discover': 0.8,
      '/learn-skill': 0.8,
      '/resume-feedback': 0.8,
      '/opportunities': 0.8,
      '/about-us': 0.6,
    };

    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: priorities[path] || 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
