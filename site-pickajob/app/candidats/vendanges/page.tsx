import type { Metadata } from 'next';
import { CandidateLandingTemplate } from '@/components/CandidateLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Travailler dans les vendanges avec Pickajob, prestataire viticole',
  description:
    "Travailler dans les vendanges avec Pickajob, prestataire viticole : équipes encadrées, logement organisé, missions partout en France (Champagne, Gironde, Bourgogne…).",
  path: '/candidats/vendanges',
  keywords: ['travailler dans les vendanges', 'job vendanges', 'vendanges saisonnier'],
});

export default function CandidatVendanges() {
  return (
    <CandidateLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Rejoindre nos équipes', href: '/candidats' },
        { name: 'Travailler dans les vendanges' },
      ]}
      h1="Travailler dans les vendanges : rejoignez les équipes Pickajob"
      intro="Pickajob, prestataire viticole, mobilise des équipes de vendangeurs en Champagne, Gironde, Bourgogne, Vallée du Rhône, Languedoc et Provence. Inscrivez-vous pour rejoindre une équipe."
      bullets={[
        'Vendanges manuelles partout en France',
        'Logement organisé',
        'Équipes encadrées',
        'Possibilité d’enchaîner les régions',
      ]}
      sections={[
        {
          h2: 'Travailler dans les vendanges, comment ça se passe ?',
          paragraphs: [
            "Les vendanges sont une expérience intense : un travail physique, en équipe, sur quelques jours à quelques semaines. Pickajob organise ces missions de bout en bout : briefing, transport (selon les cas), logement, encadrement par un chef d’équipe, suivi quotidien.",
          ],
        },
        {
          h2: 'Quelles régions ?',
          paragraphs: ['Pickajob mobilise des équipes vendanges dans les principaux vignobles français :'],
          bullets: [
            'Champagne (Côte des Blancs, Montagne de Reims, Vallée de la Marne)',
            'Gironde / Bordelais',
            'Bourgogne (Côte de Nuits, Côte de Beaune, Mâconnais, Chablis)',
            'Vallée du Rhône',
            'Languedoc-Roussillon',
            'Provence',
          ],
        },
        {
          h2: 'Profil recherché',
          paragraphs: [
            "Pickajob recherche des profils motivés, fiables et capables de tenir la cadence. L’expérience est un plus, mais des profils débutants motivés peuvent être intégrés à certaines équipes. La fiabilité prime — abandonner une équipe vendanges en plein chantier impacte tout le monde.",
          ],
        },
        {
          h2: 'Logement et conditions',
          paragraphs: [
            "Pour la majorité des missions vendanges, Pickajob organise le logement. Les conditions précises sont communiquées avant chaque mission : durée, équipe, encadrement, hébergement.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Logement organisé', description: 'Hébergement près du domaine.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob pour piloter le chantier.' },
        { title: 'Briefing clair', description: 'Vous savez où, pour qui, comment.' },
        { title: 'Variété', description: 'Possibilité d’enchaîner Champagne → Bourgogne → Languedoc.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
        { title: 'Cadre fiable', description: 'Conditions communiquées avant le départ.' },
      ]}
      faq={[
        { q: 'Faut-il avoir déjà fait les vendanges ?', a: 'Non, mais l’expérience est un plus. La motivation et la fiabilité priment.' },
        { q: 'Pickajob organise le logement ?', a: 'Sur la majorité des missions vendanges, oui.' },
        { q: 'Combien de temps durent les vendanges ?', a: 'En général 1 à 3 semaines selon le domaine.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/candidats/emploi-agricole-saisonnier', label: 'Emploi agricole saisonnier' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
          { href: '/secteurs/vendanges', label: 'Page : équipe de vendangeurs' },
          { href: '/regions/champagne', label: 'Vendanges Champagne' },
          { href: '/regions/gironde', label: 'Vendanges Gironde' },
        ],
      }}
    />
  );
}
