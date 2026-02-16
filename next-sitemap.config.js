// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://reluxemedspa.com',   // <- set it here if you prefer
  generateRobotsTxt: true,
  sitemapSize: 45000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404','/500','/_error','/profile','/profile/**','/api/**'],
  transform: async (config, path) => {
    let priority = 0.7;
    if (path === '/') priority = 1.0;
    else if (path.startsWith('/services')) priority = 0.9;
    else if (path.startsWith('/blog')) priority = 0.8;
    return {
      loc: path,                          // keep relative; next-sitemap prefixes siteUrl
      changefreq: 'weekly',
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async () => ([
    { loc: '/weddings', changefreq: 'monthly', priority: 0.8, lastmod: new Date().toISOString() },
    { loc: '/hot-deals', changefreq: 'daily', priority: 0.9, lastmod: new Date().toISOString() },
  ]),
};
