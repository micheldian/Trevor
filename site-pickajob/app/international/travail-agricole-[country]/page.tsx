import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CandidateLandingTemplate } from '@/components/CandidateLandingTemplate';
import { buildMetadata } from '@/lib/seo';
import { INTL_CONTENT } from '@/lib/international-content';

type Params = { params: { country: string } };

export function generateStaticParams() {
  return Object.keys(INTL_CONTENT).map((country) => ({ country }));
}

export function generateMetadata({ params }: Params): Metadata {
  const c = (INTL_CONTENT as any)[params.country];
  if (!c) return {};
  return buildMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/international/travail-agricole-${c.slug}`,
    keywords: c.keywords,
  });
}

export default function IntlPage({ params }: Params) {
  const c = (INTL_CONTENT as any)[params.country];
  if (!c) notFound();
  return (
    <CandidateLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'International', href: '/international/travail-agricole-australie' },
        { name: c.data.h1.split(':')[0].trim() },
      ]}
      {...c.data}
    />
  );
}
