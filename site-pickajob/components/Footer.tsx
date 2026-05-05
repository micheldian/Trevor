import Link from 'next/link';
import { SECTORS, REGIONS, COUNTRIES, BLOG_ARTICLES, SITE } from '@/lib/site';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-brand-100 bg-brand-900 text-brand-50">
      <div className="container-content grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-brand-700">P</span>
            {SITE.name}
          </div>
          <p className="mt-3 text-sm text-brand-100/80">
            Prestataire agricole et viticole en France. Mise à disposition de main-d’œuvre qualifiée et expertise terrain pour les exploitations.
          </p>
          <div className="mt-4 space-y-1 text-sm">
            <a href={SITE.phoneHref} className="block hover:underline">{SITE.phoneDisplay}</a>
            <a href={SITE.emailHref} className="block hover:underline">{SITE.email}</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Secteurs</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {SECTORS.map((s) => (
              <li key={s.slug}><Link href={`/secteurs/${s.slug}`} className="hover:underline">{s.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Régions</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {REGIONS.map((r) => (
              <li key={r.slug}><Link href={`/regions/${r.slug}`} className="hover:underline">{r.label}</Link></li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-white">International</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {COUNTRIES.map((c) => (
              <li key={c.slug}><Link href={`/international/travail-agricole-${c.slug}`} className="hover:underline">Travail agricole {c.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">Ressources</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/employeurs" className="hover:underline">Pour les exploitations</Link></li>
            <li><Link href="/employeurs/main-oeuvre-agricole" className="hover:underline">Main-d’œuvre agricole</Link></li>
            <li><Link href="/candidats" className="hover:underline">Rejoindre nos équipes</Link></li>
            <li><Link href="/devis" className="hover:underline">Demander un devis</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-white">Blog</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {BLOG_ARTICLES.slice(0, 4).map((a) => (
              <li key={a.slug}><Link href={`/blog/${a.slug}`} className="hover:underline">{a.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800/60">
        <div className="container-content flex flex-col items-start justify-between gap-2 py-5 text-xs text-brand-100/70 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {SITE.legalName} — Prestataire agricole et viticole, France.</p>
          <p>
            <Link href="/contact" className="hover:underline">Contact</Link> ·{' '}
            <Link href="/devis" className="hover:underline">Devis</Link> ·{' '}
            <Link href="/inscription" className="hover:underline">Rejoindre nos équipes</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
