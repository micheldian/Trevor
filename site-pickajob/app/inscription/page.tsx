import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CandidateForm } from '@/components/CandidateForm';
import { CheckCircle2 } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Rejoindre les équipes Pickajob : inscription candidat agricole',
  description:
    "Inscription chez Pickajob, prestataire agricole et viticole : missions saisonnières et régulières partout en France. Logement organisé, encadrement Pickajob.",
  path: '/inscription',
});

export default function InscriptionPage() {
  return (
    <>
      <Breadcrumb items={[{ name: 'Accueil', href: '/' }, { name: 'Inscription' }]} />

      <section className="bg-gradient-to-br from-brand-50 via-white to-wheat-50 py-12">
        <div className="container-content grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="badge">Rejoindre nos équipes</span>
            <h1 className="mt-3 text-3xl font-extrabold text-brand-900 sm:text-4xl">
              Inscrivez-vous chez Pickajob
            </h1>
            <p className="mt-4 text-gray-700">
              Pickajob mobilise ses équipes pour des exploitations agricoles et viticoles partout en France.
              Inscrivez-vous : nous vous recontactons dès qu’une mission correspond à votre profil.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-gray-700">
              {[
                'Missions saisonnières partout en France',
                'Logement organisé selon le besoin',
                'Encadrement Pickajob',
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
    </>
  );
}
