import type { Metadata } from 'next';
import { CandidateLandingTemplate } from '@/components/CandidateLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Travail cueillette fruits : rejoignez Pickajob, prestataire arboricole',
  description:
    "Vous cherchez un travail cueillette fruits ? Rejoignez les équipes Pickajob : pommes, abricots, cerises, prunes, dans les vergers français. Logement organisé.",
  path: '/candidats/cueillette-fruits',
  keywords: ['travail cueillette fruits', 'job cueillette', 'cueillette saisonnier'],
});

export default function CandidatCueillette() {
  return (
    <CandidateLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Rejoindre nos équipes', href: '/candidats' },
        { name: 'Travail cueillette fruits' },
      ]}
      h1="Travail cueillette fruits : rejoignez les équipes Pickajob"
      intro="Pickajob, prestataire arboricole, mobilise des équipes de cueilleurs dans les vergers français : pommes, abricots, cerises, prunes, kiwis. Inscrivez-vous pour rejoindre une équipe."
      bullets={[
        'Vergers partout en France',
        'Logement organisé',
        'Équipes encadrées',
        'Saison étalée du printemps à l’automne',
      ]}
      sections={[
        {
          h2: 'Travailler en cueillette de fruits avec Pickajob',
          paragraphs: [
            "La cueillette de fruits est une mission saisonnière classique mais exigeante : il faut respecter le geste de cueillette, le calibre, la cadence. Pickajob brief ses équipes pour que la qualité soit au rendez-vous, et organise la logistique (logement, transport, encadrement).",
          ],
        },
        {
          h2: 'Quels fruits ?',
          paragraphs: ['Selon la saison, Pickajob mobilise pour la cueillette de :'],
          bullets: [
            'Pommes et poires (été-automne)',
            'Abricots (été)',
            'Cerises (printemps-été)',
            'Prunes (été)',
            'Kiwis (automne)',
            'Petits fruits selon les régions',
          ],
        },
        {
          h2: 'Quelles régions ?',
          paragraphs: [
            "Pickajob intervient dans les principales régions arboricoles : Vallée du Rhône, Sud-Ouest (Tarn-et-Garonne notamment), Provence, Val de Loire, Limousin.",
          ],
        },
        {
          h2: 'Conditions et logement',
          paragraphs: [
            "Pour la majorité des missions cueillette, Pickajob organise le logement. Les conditions précises sont communiquées avant chaque mission.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Logement organisé', description: 'Hébergement près du verger.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le chantier.' },
        { title: 'Briefing clair', description: 'Vous savez où, pour qui, comment.' },
        { title: 'Variété', description: 'Possibilité d’enchaîner différents fruits dans la saison.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
        { title: 'Cadre fiable', description: 'Conditions communiquées avant le départ.' },
      ]}
      faq={[
        { q: 'Faut-il une expérience ?', a: 'C’est un plus, mais des profils motivés peuvent intégrer certaines équipes.' },
        { q: 'Pickajob fournit le logement ?', a: 'Sur la majorité des missions cueillette, oui.' },
        { q: 'Combien de temps dure une mission cueillette ?', a: 'De quelques jours à plusieurs semaines selon le verger.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/candidats/emploi-agricole-saisonnier', label: 'Emploi agricole saisonnier' },
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
          { href: '/secteurs/arboriculture', label: 'Page arboriculture' },
          { href: '/regions/occitanie', label: 'Saisonniers Occitanie' },
          { href: '/regions/provence-alpes-cote-d-azur', label: 'Saisonniers PACA' },
        ],
      }}
    />
  );
}
