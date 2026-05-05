import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { CtaBar } from '@/components/CtaBar';
import { FeatureGrid } from '@/components/FeatureGrid';
import { Steps } from '@/components/Steps';
import { Faq, type FaqItem } from '@/components/Faq';
import { InternalLinks, type LinkItem } from '@/components/InternalLinks';
import { Breadcrumb, type Crumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { EmployerForm } from '@/components/EmployerForm';
import { CheckCircle2 } from 'lucide-react';

export type LandingProps = {
  breadcrumb: Crumb[];
  badge?: string;
  h1: string;
  intro: string;
  bullets?: string[];
  sections: { h2: string; paragraphs: string[]; bullets?: string[] }[];
  whyItems: { title: string; description: string }[];
  steps?: { title: string; description: string }[];
  faq: FaqItem[];
  internalLinks: { title: string; items: LinkItem[] };
  formCulture?: string;
  formTitle?: string;
};

export function SeoLandingTemplate(p: LandingProps) {
  const breadcrumbItems = p.breadcrumb.map((c) => ({
    name: c.name,
    url: c.href ? `${SITE.url}${c.href}` : SITE.url,
  }));

  return (
    <>
      <Breadcrumb items={p.breadcrumb} />
      <Hero
        badge={p.badge ?? 'Prestataire agricole & viticole'}
        title={p.h1}
        subtitle={p.intro}
        primaryCta={{ label: 'Demander un devis', href: '/devis' }}
        secondaryCta={{ label: 'Nous contacter', href: '/contact' }}
        bullets={p.bullets}
      />

      <article className="bg-white py-14">
        <div className="container-content prose-pickajob max-w-3xl">
          {p.sections.map((s, i) => (
            <section key={i}>
              <h2>{s.h2}</h2>
              {s.paragraphs.map((para, j) => (
                <p key={j}>{para}</p>
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
      </article>

      <CtaBar />

      <FeatureGrid title="Ce que vous obtenez avec Pickajob" items={p.whyItems} />

      {p.steps && p.steps.length > 0 && (
        <Steps title="Comment se déroule une mission Pickajob ?" steps={p.steps} />
      )}

      <section className="bg-brand-50/40 py-14" id="devis">
        <div className="container-content grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
              {p.formTitle ?? 'Décrivez votre besoin'}
            </h2>
            <p className="mt-3 text-gray-700">
              Nous revenons vers vous rapidement pour qualifier votre besoin, vous proposer une équipe
              et un devis adapté.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-gray-700">
              {[
                'Réponse sous 24 à 48 h',
                'Profils agricoles qualifiés',
                'Logement & logistique organisés',
                'Intervention partout en France',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 text-sm text-gray-600">
              Préférez le téléphone ?{' '}
              <a className="font-semibold text-brand-700 hover:underline" href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
              {' · '}
              <a className="font-semibold text-brand-700 hover:underline" href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
              <EmployerForm defaultCulture={p.formCulture ?? ''} />
            </div>
          </div>
        </div>
      </section>

      <Faq items={p.faq} />

      <InternalLinks title={p.internalLinks.title} items={p.internalLinks.items} />

      <CtaBar
        title="Vous avez un besoin précis ?"
        subtitle="Pickajob mobilise une équipe agricole qualifiée. Décrivez votre besoin, on s’occupe du reste."
        variant="dark"
      />

      <section className="bg-white py-10">
        <div className="container-content text-center">
          <p className="text-sm text-gray-500">Vous êtes un travailleur ?</p>
          <Link href="/candidats" className="btn-secondary mt-3">Rejoindre les équipes Pickajob</Link>
        </div>
      </section>

      <JsonLd data={[faqJsonLd(p.faq), breadcrumbJsonLd(breadcrumbItems)]} />
    </>
  );
}
