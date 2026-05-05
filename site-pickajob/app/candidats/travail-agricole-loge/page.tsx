import type { Metadata } from 'next';
import { CandidateLandingTemplate } from '@/components/CandidateLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Travail agricole logé : missions Pickajob avec hébergement',
  description:
    "Vous cherchez un travail agricole logé ? Pickajob, prestataire agricole et viticole, organise le logement sur la majorité des missions saisonnières en France.",
  path: '/candidats/travail-agricole-loge',
  keywords: ['travail agricole logé', 'travail agricole avec logement', 'saisonnier logé'],
});

export default function CandidatLoge() {
  return (
    <CandidateLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Rejoindre nos équipes', href: '/candidats' },
        { name: 'Travail agricole logé' },
      ]}
      h1="Travail agricole logé : missions Pickajob avec hébergement organisé"
      intro="Pickajob, prestataire agricole et viticole, organise le logement sur la majorité de ses missions saisonnières. Vendanges, cueillette, maraîchage : un cadre clair, un hébergement adapté à la mission."
      bullets={[
        'Hébergement organisé selon la mission',
        'Encadrement Pickajob',
        'Toutes régions agricoles françaises',
        'Conditions communiquées avant départ',
      ]}
      sections={[
        {
          h2: 'Pourquoi un travail agricole logé change tout',
          paragraphs: [
            "Trouver un emploi agricole sans solution de logement, c’est compliqué : se loger en pleine vendange en Champagne ou en Gironde est presque impossible. Les missions Pickajob avec logement organisé sont donc particulièrement intéressantes : vous arrivez, vous travaillez, vous êtes logé(e).",
          ],
        },
        {
          h2: 'Comment Pickajob gère le logement',
          paragraphs: [
            "Selon les missions, Pickajob propose : hébergement collectif sur le domaine, location dédiée, gîte ou camping. Les conditions sont précisées avant chaque mission, vous savez à quoi vous attendre.",
          ],
        },
        {
          h2: 'Sur quelles missions Pickajob propose un logement',
          paragraphs: ['Le logement est très souvent inclus pour :'],
          bullets: [
            'Vendanges manuelles (Champagne, Gironde, Bourgogne, Languedoc, Provence)',
            'Cueillette dans les grands bassins arboricoles',
            'Travaux maraîchage en saison haute',
            'Missions étrangères en France',
          ],
        },
        {
          h2: 'Inscription',
          paragraphs: [
            "Indiquez clairement dans votre formulaire d’inscription si vous avez besoin d’un logement. Cela orientera Pickajob vers les missions adaptées.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Hébergement organisé', description: 'Un logement adapté à la mission, sans stress.' },
        { title: 'Cadre clair', description: 'Conditions communiquées avant le départ.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le terrain.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
        { title: 'France entière', description: 'Toutes les régions agricoles françaises.' },
        { title: 'Continuité', description: 'Possibilité d’enchaîner plusieurs missions.' },
      ]}
      faq={[
        { q: 'Le logement est-il systématique ?', a: 'Non, mais il est très fréquent sur les missions saisonnières. Indiquez votre besoin à l’inscription.' },
        { q: 'Quel type de logement ?', a: 'Cela dépend des missions : collectif, gîte, location dédiée, camping…' },
        { q: 'Le logement est-il payant ?', a: 'Les conditions sont précisées avant chaque mission.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/candidats/emploi-agricole-saisonnier', label: 'Emploi agricole saisonnier' },
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/international/travail-agricole-australie', label: 'Travail agricole Australie' },
          { href: '/international/travail-agricole-canada', label: 'Farm jobs Canada' },
          { href: '/candidats', label: 'Rejoindre les équipes Pickajob' },
        ],
      }}
    />
  );
}
