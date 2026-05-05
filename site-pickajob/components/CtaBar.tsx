import Link from 'next/link';
import { Phone, MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/site';

type Props = {
  title?: string;
  subtitle?: string;
  variant?: 'light' | 'dark';
};

export function CtaBar({ title, subtitle, variant = 'light' }: Props) {
  const dark = variant === 'dark';
  return (
    <section
      className={
        dark
          ? 'bg-brand-800 text-white'
          : 'bg-brand-50 text-brand-900'
      }
    >
      <div className="container-content flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-12">
        <div>
          <h2 className={dark ? 'text-2xl font-bold sm:text-3xl' : 'text-2xl font-bold sm:text-3xl text-brand-900'}>
            {title ?? 'Besoin d’une équipe agricole rapidement ?'}
          </h2>
          <p className={dark ? 'mt-2 text-brand-100' : 'mt-2 text-brand-800/80'}>
            {subtitle ?? 'Pickajob, prestataire agricole et viticole, intervient partout en France. Décrivez votre besoin, on vous répond rapidement.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/devis" className="btn-primary">Demander de la main-d’œuvre</Link>
          <a href={SITE.whatsappHref} className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a href={SITE.phoneHref} className={dark ? 'btn-secondary' : 'btn-secondary'}>
            <Phone className="h-4 w-4" /> {SITE.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
