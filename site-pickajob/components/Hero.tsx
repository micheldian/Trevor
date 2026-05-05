import Link from 'next/link';
import { Phone, MessageCircle, CheckCircle2 } from 'lucide-react';
import { SITE } from '@/lib/site';

type Props = {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  bullets?: string[];
};

export function Hero({ badge, title, subtitle, primaryCta, secondaryCta, bullets }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-wheat-50">
      <div className="container-content grid gap-10 py-12 md:grid-cols-5 md:py-20">
        <div className="md:col-span-3">
          {badge && <span className="badge">{badge}</span>}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-brand-900 sm:text-4xl md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-700">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={primaryCta?.href ?? '/devis'} className="btn-primary">
              {primaryCta?.label ?? 'Je cherche des ouvriers agricoles'}
            </Link>
            <Link href={secondaryCta?.href ?? '/candidats'} className="btn-secondary">
              {secondaryCta?.label ?? 'Je cherche un travail agricole'}
            </Link>
            <a href={SITE.whatsappHref} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <a href={SITE.phoneHref} className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline">
              <Phone className="h-4 w-4" /> {SITE.phoneDisplay}
            </a>
            <span className="mx-2 text-gray-400">·</span>
            <span>Réponse rapide, intervention partout en France.</span>
          </div>

          {bullets && bullets.length > 0 && (
            <ul className="mt-8 grid max-w-xl gap-2 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-brand-900">Pickajob, prestataire agricole & viticole</h2>
            <p className="mt-2 text-sm text-gray-600">
              Nous mettons à votre disposition des équipes qualifiées et notre expertise terrain
              pour accompagner les exploitations partout en France.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              {[
                'Équipes prêtes pour vos pics d’activité',
                'Profils agricoles testés et briefés',
                'Encadrement et logistique simplifiés',
                'Intervention nationale (viti, maraîchage, arbo…)',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link href="/devis" className="btn-primary mt-5 w-full">
              Décrire mon besoin en 2 min
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
