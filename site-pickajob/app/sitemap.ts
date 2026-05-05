import type { MetadataRoute } from 'next';
import { SITE, SECTORS, REGIONS, COUNTRIES, BLOG_ARTICLES } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (path: string) => `${SITE.url}${path}`;

  const weekly = 'weekly' as const;
  const monthly = 'monthly' as const;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: u('/'), lastModified: now, changeFrequency: weekly, priority: 1.0 },
    { url: u('/employeurs'), lastModified: now, changeFrequency: weekly, priority: 0.9 },
    { url: u('/employeurs/main-oeuvre-agricole'), lastModified: now, changeFrequency: weekly, priority: 0.9 },
    { url: u('/employeurs/main-oeuvre-agricole-qualifiee'), lastModified: now, changeFrequency: weekly, priority: 0.8 },
    { url: u('/employeurs/recruter-saisonniers-agricoles'), lastModified: now, changeFrequency: weekly, priority: 0.8 },
    { url: u('/employeurs/equipe-agricole'), lastModified: now, changeFrequency: weekly, priority: 0.8 },
    { url: u('/employeurs/main-oeuvre-etrangere-agriculture'), lastModified: now, changeFrequency: weekly, priority: 0.8 },
    { url: u('/candidats'), lastModified: now, changeFrequency: weekly, priority: 0.8 },
    { url: u('/candidats/emploi-agricole-saisonnier'), lastModified: now, changeFrequency: weekly, priority: 0.7 },
    { url: u('/candidats/vendanges'), lastModified: now, changeFrequency: weekly, priority: 0.7 },
    { url: u('/candidats/cueillette-fruits'), lastModified: now, changeFrequency: weekly, priority: 0.7 },
    { url: u('/candidats/travail-agricole-loge'), lastModified: now, changeFrequency: weekly, priority: 0.7 },
    { url: u('/contact'), lastModified: now, changeFrequency: monthly, priority: 0.5 },
    { url: u('/devis'), lastModified: now, changeFrequency: monthly, priority: 0.7 },
    { url: u('/inscription'), lastModified: now, changeFrequency: monthly, priority: 0.6 },
  ];

  const sectorRoutes = SECTORS.map((s) => ({
    url: u(`/secteurs/${s.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const regionRoutes = REGIONS.map((r) => ({
    url: u(`/regions/${r.slug}`),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const intlRoutes = COUNTRIES.map((c) => ({
    url: u(`/international/travail-agricole-${c.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  const blogRoutes = BLOG_ARTICLES.map((a) => ({
    url: u(`/blog/${a.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...sectorRoutes, ...regionRoutes, ...intlRoutes, ...blogRoutes];
}
