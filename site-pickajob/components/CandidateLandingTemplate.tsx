import Link from 'next/link';
import { Hero } from '@/components/Hero';
import { CtaBar } from '@/components/CtaBar';
import { FeatureGrid } from '@/components/FeatureGrid';
import { Faq, type FaqItem } from '@/components/Faq';
import { InternalLinks, type LinkItem } from '@/components/InternalLinks';
import { Breadcrumb, type Crumb } from '@/components/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { CandidateForm } from '@/components/CandidateForm';
import { CheckCircle2 } from 'lucide-react';

export type CandidateLandingProps = {
  breadcrumb: Crumb[];
  badge?: string;
  h1: string;
  intro: string;
  bullets?: string[];
  sections: { h2: string; paragraphs: string[]; bullets?: string[] }[];
  whyItems: { title: string; description: string }[];
  faq: FaqItem[];
  internalLinks: { title: string; items: LinkItem[] };
};

export function CandidateLandingTemplate(p: CandidateLandingProps) {
  const breadcrumbItems = p.breadcrumb.map((c) => ({
    name: c.name,
    url: c.href ? `${SITE.url}${c.href}` : SITE.url,
  }));

  return (
    <>
      <Breadcrumb items={p.breadcrumb} />
      <Hero
        badge={p.badge ?? 'Rejoindre les équipes Pickajob'}
        title={p.h1}
        subtitle={p.intro}
        primaryCta={{ label: 'Je m’inscris', href: '/inscription' }}
        secondaryCta={{ label: 'Demander de la main-d’œuvre', href: '/devis' }}
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

      <FeatureGrid title="Pourquoi rejoindre Pickajob ?" items={p.whyItems} />

      <section className="bg-brand-50/40 py-14" id="inscription">
        <div className="container-content grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">Inscrivez-vous chez Pickajob</h2>
            <p className="mt-3 text-gray-700">
              Pickajob, prestataire agricole et viticole, mobilise ses équipes partout en France.
              Inscrivez-vous : nous vous recontactons dès qu’une mission correspond à votre profil.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-gray-700">
              {[
                'Missions agricoles partout en France',
                'Logement organisé selon le besoin',
                'Encadrement Pickajob sur le terrain',
                'Cadre clair, contact humain',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
              <CandidateForm />
            </div>
          </div>
        </div>
      </section>

      <Faq items={p.faq} />

      <InternalLinks title={p.internalLinks.title} items={p.internalLinks.items} />

      <CtaBar
        title="Vous êtes exploitant ?"
        subtitle="Pickajob mobilise une équipe agricole qualifiée. Décrivez votre besoin."
      />

      <section className="bg-white py-10">
        <div className="container-content text-center">
          <Link href="/contact" className="btn-secondary">Une question ? Contactez-nous</Link>
        </div>
      </section>

      <JsonLd data={[faqJsonLd(p.faq), breadcrumbJsonLd(breadcrumbItems)]} />
    </>
  );
}
