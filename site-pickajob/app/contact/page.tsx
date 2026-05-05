import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Contacter Pickajob, prestataire agricole et viticole en France',
  description:
    "Contactez Pickajob, prestataire agricole et viticole : téléphone, WhatsApp, email. Réponse rapide pour vos besoins de main-d’œuvre agricole partout en France.",
  path: '/contact',
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Contact' }]} />
      <section className="bg-gradient-to-br from-brand-50 via-white to-wheat-50 py-16">
        <div className="container-content max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold text-brand-900 sm:text-5xl">Contacter Pickajob</h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">
            Pickajob, prestataire agricole et viticole, intervient partout en France. Décrivez-nous votre besoin :
            nous revenons vers vous rapidement.
          </p>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container-content grid gap-5 md:grid-cols-3">
          <Card icon={<Phone className="h-5 w-5" />} title="Téléphone" body={SITE.phoneDisplay} cta={{ href: SITE.phoneHref, label: 'Appeler' }} />
          <Card icon={<MessageCircle className="h-5 w-5" />} title="WhatsApp" body="Réponse rapide" cta={{ href: SITE.whatsappHref, label: 'Ouvrir WhatsApp', external: true }} />
          <Card icon={<Mail className="h-5 w-5" />} title="Email" body={SITE.email} cta={{ href: SITE.emailHref, label: 'Envoyer un email' }} />
        </div>

        <div className="container-content mt-10 max-w-3xl text-center">
          <p className="text-gray-700">
            Vous êtes un exploitant qui cherche de la main-d’œuvre ?{' '}
            <Link href="/devis" className="font-semibold text-brand-700 hover:underline">
              Demander un devis
            </Link>
            .
            <br />
            Vous cherchez un travail agricole ?{' '}
            <Link href="/inscription" className="font-semibold text-brand-700 hover:underline">
              Rejoindre les équipes Pickajob
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}

function Card({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta: { href: string; label: string; external?: boolean } }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-soft">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">{icon}</div>
      <h2 className="mt-4 text-lg font-bold text-brand-900">{title}</h2>
      <p className="mt-1 text-gray-700">{body}</p>
      <a
        href={cta.href}
        target={cta.external ? '_blank' : undefined}
        rel={cta.external ? 'noopener noreferrer' : undefined}
        className="btn-primary mt-4"
      >
        {cta.label}
      </a>
    </div>
  );
}
