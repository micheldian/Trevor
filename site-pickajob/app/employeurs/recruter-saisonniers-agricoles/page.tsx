import type { Metadata } from 'next';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Recruter des saisonniers agricoles : la solution Pickajob',
  description:
    "Recruter des saisonniers agricoles est plus simple avec Pickajob, prestataire agricole et viticole : équipes qualifiées, logement organisé, intervention partout en France.",
  path: '/employeurs/recruter-saisonniers-agricoles',
  keywords: ['recruter saisonniers agricoles', 'saisonniers agricoles', 'prestataire saisonnier agricole'],
});

export default function RecruterSaisonniers() {
  return (
    <SeoLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Pickajob prestataire', href: '/employeurs' },
        { name: 'Recruter saisonniers agricoles' },
      ]}
      h1="Recruter des saisonniers agricoles : la solution Pickajob"
      intro="Pickajob, prestataire agricole et viticole, prend le relais sur le recrutement saisonnier : équipes qualifiées, encadrement, logement, logistique. Vous gardez votre énergie pour votre exploitation."
      bullets={[
        'Saisonniers agricoles qualifiés',
        'Logement et logistique organisés',
        'Réactivité en pic de saison',
        'France entière',
      ]}
      sections={[
        {
          h2: 'Recruter des saisonniers agricoles : pourquoi c’est devenu un casse-tête',
          paragraphs: [
            "Recruter des saisonniers agricoles est devenu de plus en plus difficile : le nombre de candidatures spontanées baisse, la fiabilité est inégale, les abandons en cours de saison se multiplient et le marché de la main-d’œuvre est tendu dans toutes les filières (viticulture, arboriculture, maraîchage). Beaucoup d’exploitants passent autant de temps à recruter qu’à exploiter.",
            "Pickajob est conçu pour reprendre cette charge à votre place. En tant que prestataire agricole, nous mobilisons des saisonniers et des équipes qualifiées que nous suivons sur la durée.",
          ],
        },
        {
          h2: 'Avantages de passer par Pickajob plutôt que de recruter en direct',
          paragraphs: ["Recruter via un prestataire agricole comme Pickajob, c’est :"],
          bullets: [
            'Externaliser le sourcing, le tri et la fiabilisation',
            'Disposer d’un vivier de profils déjà qualifiés',
            'Gagner en réactivité quand la météo accélère la saison',
            'Limiter les imprévus liés aux abandons',
            'Bénéficier d’un encadrement Pickajob sur la mission',
          ],
        },
        {
          h2: 'Quels saisonniers Pickajob mobilise ?',
          paragraphs: [
            "Pickajob mobilise des saisonniers agricoles qualifiés pour vendanges, taille, cueillette, maraîchage, conditionnement, travaux en serre. Selon vos besoins, nous mobilisons un renfort ponctuel, une équipe complète ou une équipe encadrée par un chef d’équipe Pickajob.",
          ],
        },
        {
          h2: 'Quand préparer votre saison avec Pickajob ?',
          paragraphs: [
            "Idéalement, prenez contact 2 à 3 mois avant le pic de saison. Cela nous permet de constituer la meilleure équipe possible, de planifier le logement et la logistique, et de sécuriser votre production. Nous prenons aussi des urgences pour pallier un imprévu.",
          ],
        },
        {
          h2: 'Saisonniers étrangers : Pickajob simplifie l’opérationnel',
          paragraphs: [
            "Pour les missions qui le justifient, Pickajob sait mobiliser une main-d’œuvre étrangère qualifiée et expérimentée. Nous gérons l’opérationnel (logement, intégration, encadrement) pour que tout soit fluide pour votre exploitation.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Sourcing externalisé', description: 'Pickajob trouve, sélectionne et brief les saisonniers à votre place.' },
        { title: 'Logement', description: 'Hébergement organisé pour les missions qui le justifient.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pleine saison.' },
        { title: 'Encadrement', description: 'Possibilité d’un chef d’équipe Pickajob sur le chantier.' },
        { title: 'Souplesse', description: 'Renfort ponctuel ou équipe pour toute la saison.' },
        { title: 'Couverture nationale', description: 'Toutes les régions agricoles françaises.' },
      ]}
      faq={[
        { q: 'Combien de temps avant le début de saison faut-il vous contacter ?', a: 'L’idéal est 2 à 3 mois avant. Nous prenons aussi des urgences.' },
        { q: 'Pickajob s’occupe-t-il du logement des saisonniers ?', a: 'Oui, lorsque la mission le justifie, Pickajob organise le logement et la logistique.' },
        { q: 'Pickajob fournit-il aussi des saisonniers étrangers ?', a: 'Oui. Voir la page Main-d’œuvre étrangère agricole.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre agricole qualifiée' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/employeurs/main-oeuvre-etrangere-agriculture', label: 'Main-d’œuvre étrangère agricole' },
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/blog/comment-recruter-des-saisonniers-agricoles', label: 'Article : comment recruter des saisonniers' },
        ],
      }}
    />
  );
}
