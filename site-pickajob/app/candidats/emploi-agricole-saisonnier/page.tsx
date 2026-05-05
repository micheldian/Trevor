import type { Metadata } from 'next';
import { CandidateLandingTemplate } from '@/components/CandidateLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Emploi agricole saisonnier : rejoignez Pickajob, prestataire agricole',
  description:
    "Vous cherchez un emploi agricole saisonnier ? Rejoignez Pickajob, prestataire agricole et viticole. Vendanges, cueillette, maraîchage, conditionnement, serres en France.",
  path: '/candidats/emploi-agricole-saisonnier',
  keywords: ['emploi agricole saisonnier', 'travail saisonnier agricole', 'saisonnier agricole'],
});

export default function EmploiSaisonnier() {
  return (
    <CandidateLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Rejoindre nos équipes', href: '/candidats' },
        { name: 'Emploi agricole saisonnier' },
      ]}
      h1="Emploi agricole saisonnier : rejoignez les équipes Pickajob"
      intro="Pickajob, prestataire agricole et viticole, mobilise ses équipes saisonnières partout en France. Vendanges, cueillette, maraîchage, conditionnement, serres : inscrivez-vous, nous vous recontactons."
      bullets={[
        'Missions saisonnières en France',
        'Logement organisé selon le besoin',
        'Encadrement Pickajob',
        'Possibilité d’enchaîner les saisons',
      ]}
      sections={[
        {
          h2: 'Travail agricole saisonnier : quelles missions ?',
          paragraphs: [
            "L’emploi agricole saisonnier en France couvre une grande variété de missions, sur l’ensemble de l’année : taille de vigne en hiver, plantation au printemps, cueillette à partir du printemps, vendanges en septembre, conditionnement en station d’automne, travaux en serre toute l’année.",
          ],
        },
        {
          h2: 'Pourquoi passer par Pickajob plutôt que de chercher seul',
          paragraphs: [
            "Chercher un emploi agricole saisonnier en direct est aléatoire : annonces floues, logement non sécurisé, conditions changeantes. En rejoignant Pickajob, vous avez un cadre clair, un référent, des missions briefées, et la possibilité d’enchaîner plusieurs missions sur la saison.",
          ],
        },
        {
          h2: 'Quels profils Pickajob mobilise ?',
          paragraphs: ['Pickajob mobilise des profils variés :'],
          bullets: [
            'Avec ou sans expérience agricole (selon la mission)',
            'Profils français et étrangers',
            'Profils mobiles ou avec contraintes géographiques',
            'Profils avec ou sans besoin de logement',
          ],
        },
        {
          h2: 'Comment maximiser ses chances',
          paragraphs: [
            "Inscrivez-vous tôt, avant le pic de saison. Indiquez clairement votre expérience, vos langues, votre mobilité, vos disponibilités, et votre besoin éventuel de logement. Plus le profil est précis, plus la mise en relation est efficace.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Cadre clair', description: 'Vous savez où, pour qui, et dans quelles conditions.' },
        { title: 'Logement', description: 'Hébergement organisé selon la mission.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le terrain.' },
        { title: 'Variété', description: 'Vendanges, cueillette, maraîchage, conditionnement, serres.' },
        { title: 'Continuité', description: 'Enchaînez les missions de saison en saison.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
      ]}
      faq={[
        { q: 'Quand commencer à chercher pour la saison ?', a: 'Plusieurs semaines voire mois avant le pic de saison.' },
        { q: 'Pickajob fournit le logement ?', a: 'Sur la majorité des missions saisonnières.' },
        { q: 'Peut-on enchaîner plusieurs missions ?', a: 'Oui, c’est l’un des intérêts de rejoindre Pickajob.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
          { href: '/candidats', label: 'Rejoindre nos équipes Pickajob' },
        ],
      }}
    />
  );
}
