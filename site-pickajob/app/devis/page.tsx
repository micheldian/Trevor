import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { EmployerForm } from '@/components/EmployerForm';
import { CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Demander un devis main-d’œuvre agricole — Pickajob, prestataire agricole',
  description:
    "Demander un devis pour mobiliser une équipe agricole ou viticole avec Pickajob, prestataire agricole et viticole. Réponse rapide, intervention partout en France.",
  path: '/devis',
});

export default function DevisPage() {
  return (
    <>
      <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Demander un devis' }]} />

      <section className="bg-gradient-to-br from-brand-50 via-white to-wheat-50 py-12">
        <div className="container-content grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="badge">Prestataire agricole & viticole</span>
            <h1 className="mt-3 text-3xl font-extrabold text-brand-900 sm:text-4xl">
              Demander un devis main-d’œuvre agricole
            </h1>
            <p className="mt-4 text-gray-700">
              Décrivez votre besoin : Pickajob qualifie votre demande et vous propose une équipe agricole ou viticole adaptée.
              Réponse rapide, intervention partout en France.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {[
                'Réponse sous 24 à 48 h',
                'Profils agricoles qualifiés',
                'Logement et logistique organisés',
                'Souplesse selon votre besoin',
                'Intervention France entière',
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2 text-sm text-gray-700">
              <a className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline" href={SITE.phoneHref}>
                <Phone className="h-4 w-4" /> Appeler : {SITE.phoneDisplay}
              </a>
              <a className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline" href={SITE.whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
              <EmployerForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
