import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata, localBusinessJsonLd } from '@/lib/seo';
import { REGION_CONTENT } from '@/lib/regions-content';
import { JsonLd } from '@/components/JsonLd';

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return Object.keys(REGION_CONTENT).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const c = (REGION_CONTENT as any)[params.slug];
  if (!c) return {};
  return buildMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/regions/${c.slug}`,
    keywords: c.keywords,
  });
}

export default function RegionPage({ params }: Params) {
  const c = (REGION_CONTENT as any)[params.slug];
  if (!c) notFound();
  return (
    <>
      <SeoLandingTemplate
        breadcrumb={[
          { name: 'Accueil', href: '/' },
          { name: 'Régions', href: '/regions/nouvelle-aquitaine' },
          { name: c.data.h1.split(':')[0].trim() },
        ]}
        formCulture={c.formCulture}
        {...c.data}
      />
      <JsonLd data={localBusinessJsonLd(c.slug.replace(/-/g, ' '))} />
    </>
  );
}
