import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hansa.ai.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['ko', 'en'];
  const now = new Date();

  // Define all static routes with their properties
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/saju', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/compatibility', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/couple', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/face-reading', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/saju/fortune', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/premium', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/profile', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/history', priority: 0.5, changeFrequency: 'weekly' as const },
    { path: '/deck', priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    // Korean (default locale - no prefix)
    sitemapEntries.push({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          ko: `${baseUrl}${route.path}`,
          en: `${baseUrl}/en${route.path}`,
          'x-default': `${baseUrl}${route.path}`,
        },
      },
    });

    // English locale
    sitemapEntries.push({
      url: `${baseUrl}/en${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority * 0.9, // Slightly lower priority for non-default locale
      alternates: {
        languages: {
          ko: `${baseUrl}${route.path}`,
          en: `${baseUrl}/en${route.path}`,
          'x-default': `${baseUrl}${route.path}`,
        },
      },
    });
  }

  return sitemapEntries;
}
