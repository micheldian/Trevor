import type { Metadata } from 'next';
import { CandidateLandingTemplate } from '@/components/CandidateLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Trouver un travail agricole : rejoignez les équipes Pickajob',
  description:
    "Vous cherchez un travail agricole ? Rejoignez les équipes Pickajob, prestataire agricole et viticole en France. Vendanges, cueillette, maraîchage, conditionnement, serres.",
  path: '/candidats',
  keywords: ['trouver un travail agricole', 'travail agricole', 'rejoindre Pickajob'],
});

export default function CandidatsPage() {
  return (
    <CandidateLandingTemplate
      breadcrumb={[{ name: 'Accueil', href: '/' }, { name: 'Rejoindre nos équipes' }]}
      h1="Trouver un travail agricole : rejoignez Pickajob"
      intro="Pickajob, prestataire agricole et viticole, mobilise ses équipes pour des exploitations partout en France. Inscrivez-vous pour rejoindre nos équipes saisonnières ou régulières."
      bullets={[
        'Missions partout en France',
        'Logement organisé selon le besoin',
        'Encadrement par un chef d’équipe Pickajob',
        'Cadre clair, contact humain',
      ]}
      sections={[
        {
          h2: 'Pickajob, ce n’est pas un site d’annonces',
          paragraphs: [
            "Pickajob est un prestataire agricole et viticole : nous mettons à disposition nos propres équipes pour les exploitations. Quand vous vous inscrivez chez Pickajob, vous rejoignez une équipe — pas une simple annonce. Nous travaillons à fidéliser nos profils sur la durée, parce que nos clients (les exploitations) recherchent eux aussi de la stabilité.",
          ],
        },
        {
          h2: 'Quels types de missions ?',
          paragraphs: ['Pickajob mobilise des profils sur :'],
          bullets: [
            'Vendanges (Champagne, Bordelais, Bourgogne, Languedoc, Provence…)',
            'Taille de vigne',
            'Cueillette de fruits (pommes, abricots, cerises…)',
            'Maraîchage en plein champ et sous serre',
            'Conditionnement en stations fruitières et coopératives',
            'Travaux en serre toute l’année',
          ],
        },
        {
          h2: 'Comment ça se passe ?',
          paragraphs: [
            "Vous remplissez le formulaire d’inscription (expérience, langues, disponibilité, mobilité, logement). Nous vous recontactons dès qu’une mission correspond à votre profil. Avant chaque mission, nous vous briefons clairement sur l’exploitation, le geste attendu, la cadence, le logement et les conditions.",
          ],
        },
        {
          h2: 'Vous êtes étranger ?',
          paragraphs: [
            "Pickajob mobilise aussi des profils étrangers expérimentés. Nous facilitons l’opérationnel (logement, encadrement, intégration). Voir aussi nos pages internationales (travail agricole en Australie, Canada, Nouvelle-Zélande) si vous voulez explorer hors de France.",
          ],
        },
        {
          h2: 'Logement et mobilité',
          paragraphs: [
            "Pour beaucoup de missions, Pickajob organise le logement. Indiquez dans le formulaire si vous avez besoin d’un hébergement et précisez votre mobilité (régions ou France entière). Nous vous proposerons les missions adaptées.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Missions concrètes', description: 'Pas d’annonce floue : nous mobilisons sur des missions réelles.' },
        { title: 'Briefing clair', description: 'Vous savez exactement où, pour qui, pour combien.' },
        { title: 'Logement', description: 'Hébergement organisé selon la mission.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le terrain.' },
        { title: 'Continuité', description: 'Possibilité d’enchaîner plusieurs missions sur la saison.' },
        { title: 'Contact humain', description: 'Un référent Pickajob répond à vos questions.' },
      ]}
      faq={[
        { q: 'Faut-il une expérience agricole pour rejoindre Pickajob ?', a: 'L’expérience est un vrai plus, mais nous étudions chaque profil. Indiquez précisément votre expérience dans le formulaire.' },
        { q: 'Pickajob propose-t-il du logement ?', a: 'Oui, sur la majorité des missions saisonnières.' },
        { q: 'Comment êtes-vous payé ?', a: 'Selon le cadre légal et les conditions communiquées avant chaque mission.' },
        { q: 'Peut-on enchaîner plusieurs missions ?', a: 'Oui, c’est même encouragé pour les profils mobiles.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/candidats/emploi-agricole-saisonnier', label: 'Emploi agricole saisonnier' },
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
          { href: '/international/travail-agricole-australie', label: 'Travail agricole Australie' },
          { href: '/international/travail-agricole-canada', label: 'Farm jobs Canada' },
        ],
      }}
    />
  );
}
