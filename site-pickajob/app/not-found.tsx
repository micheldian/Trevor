import Link from 'next/link';

export const metadata = { title: 'Page introuvable — Pickajob' };

export default function NotFound() {
  return (
    <section className="bg-gradient-to-br from-brand-50 via-white to-wheat-50 py-20">
      <div className="container-content max-w-2xl text-center">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-900 sm:text-5xl">Page introuvable</h1>
        <p className="mt-4 text-gray-700">
          La page que vous cherchez n’existe pas ou a été déplacée. Voici quelques pistes pour rebondir :
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Accueil</Link>
          <Link href="/devis" className="btn-secondary">Demander un devis</Link>
          <Link href="/employeurs/main-oeuvre-agricole" className="btn-ghost">Main-d’œuvre agricole</Link>
        </div>
      </div>
    </section>
  );
}
