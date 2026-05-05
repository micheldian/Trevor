import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';
import { SECTOR_CONTENT } from '@/lib/sectors-content';

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return Object.keys(SECTOR_CONTENT).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const c = (SECTOR_CONTENT as any)[params.slug];
  if (!c) return {};
  return buildMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/secteurs/${c.slug}`,
    keywords: c.keywords,
  });
}

export default function SectorPage({ params }: Params) {
  const c = (SECTOR_CONTENT as any)[params.slug];
  if (!c) notFound();
  return (
    <SeoLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Secteurs', href: '/secteurs/viticulture' },
        { name: c.data.h1.split(':')[0].trim() },
      ]}
      formCulture={c.formCulture}
      {...c.data}
    />
  );
}
