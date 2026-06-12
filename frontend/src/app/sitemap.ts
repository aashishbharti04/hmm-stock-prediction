import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-06-12');
  const routes = [
    { path: '', priority: 1 },
    { path: 'guide', priority: 0.8 },
    { path: 'about', priority: 0.6 },
    { path: 'contact', priority: 0.6 },
  ];
  return routes.map((r) => ({
    url: `${siteUrl}${r.path ? `/${r.path}` : ''}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: r.priority,
  }));
}
