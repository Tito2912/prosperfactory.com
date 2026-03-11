import { getAllPosts, LOCALES } from '@/lib/content';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://prosperfactory.com';

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/fr/`, lastModified: new Date() },
    { url: `${baseUrl}/es/`, lastModified: new Date() },
    { url: `${baseUrl}/de/`, lastModified: new Date() },
  ];

  for (const locale of LOCALES) {
    const posts = await getAllPosts(locale);
    for (const p of posts) {
      const url =
        locale === 'en'
          ? `${baseUrl}/${p.slug}/`
          : `${baseUrl}/${locale}/${p.slug}/`;
      entries.push({
        url,
        lastModified: new Date(p.updatedAt ?? p.date ?? new Date().toISOString()),
      });
    }
  }

  return entries;
}
