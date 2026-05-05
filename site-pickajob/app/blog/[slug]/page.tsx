import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CtaBar } from '@/components/CtaBar';
import { JsonLd } from '@/components/JsonLd';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { BLOG } from '@/lib/blog-content';
import { SITE } from '@/lib/site';

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return Object.keys(BLOG).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const a = BLOG[params.slug];
  if (!a) return {};
  return buildMetadata({
    title: a.metaTitle,
    description: a.metaDescription,
    path: `/blog/${a.slug}`,
    type: 'article',
  });
}

export default function BlogArticle({ params }: Params) {
  const a = BLOG[params.slug];
  if (!a) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.h1,
    description: a.metaDescription,
    datePublished: a.publishedAt,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}/blog/${a.slug}`,
  };

  return (
    <>
      <Breadcrumb
        items={[
          { name: 'Accueil', href: '/' },
          { name: 'Blog', href: `/blog/${a.slug}` },
          { name: a.h1 },
        ]}
      />

      <article className="bg-white py-10">
        <div className="container-content max-w-3xl">
          <p className="text-sm text-brand-700">Article — Pickajob</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl">
            {a.h1}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">{a.intro}</p>

          <div className="prose-pickajob mt-8">
            {a.body.map((s, i) => (
              <section key={i}>
                <h2>{s.h2}</h2>
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
                {s.bullets && (
                  <ul>
                    {s.bullets.map((b, k) => (
                      <li key={k}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <h3 className="text-lg font-bold text-brand-900">Pour aller plus loin</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {a.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="text-sm font-semibold text-brand-700 hover:underline">
                    → {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <CtaBar />

      <JsonLd
        data={[
          articleJsonLd,
          breadcrumbJsonLd([
            { name: 'Accueil', url: SITE.url },
            { name: 'Blog', url: `${SITE.url}/blog/${a.slug}` },
            { name: a.h1, url: `${SITE.url}/blog/${a.slug}` },
          ]),
        ]}
      />
    </>
  );
}
