import type { Metadata } from 'next';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Main-d’œuvre étrangère agricole : la solution Pickajob',
  description:
    "Pickajob mobilise de la main-d’œuvre étrangère agricole qualifiée pour vendanges, cueillette, maraîchage et conditionnement, partout en France.",
  path: '/employeurs/main-oeuvre-etrangere-agriculture',
  keywords: ['main d’œuvre étrangère agricole', 'saisonniers agricoles étrangers', 'recrutement saisonniers étrangers'],
});

export default function Etrangere() {
  return (
    <SeoLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Pickajob prestataire', href: '/employeurs' },
        { name: 'Main-d’œuvre étrangère agricole' },
      ]}
      h1="Main-d’œuvre étrangère agricole : un prestataire qui simplifie l’opérationnel"
      intro="Pickajob, prestataire agricole et viticole, mobilise une main-d’œuvre étrangère agricole expérimentée et fiable. Nous prenons en charge l’opérationnel pour faciliter l’intégration sur votre exploitation."
      bullets={[
        'Profils étrangers expérimentés en agriculture',
        'Logement et logistique organisés',
        'Encadrement Pickajob',
        'Intervention partout en France',
      ]}
      sections={[
        {
          h2: 'Pourquoi mobiliser de la main-d’œuvre étrangère via un prestataire',
          paragraphs: [
            "La main-d’œuvre étrangère agricole apporte souvent une expérience terrain solide, en particulier sur les vendanges, la taille, la cueillette et le conditionnement. Mais la mobiliser en direct demande beaucoup de temps : sourcing, fiabilisation, logement, intégration. C’est là que Pickajob fait la différence.",
            "En tant que prestataire agricole, Pickajob assume cet aspect opérationnel. Nous mobilisons des profils que nous connaissons et que nous suivons sur la durée.",
          ],
        },
        {
          h2: 'Les profils étrangers que Pickajob mobilise',
          paragraphs: ["Pickajob travaille avec des profils variés en provenance de différents pays :"],
          bullets: [
            'Vendangeurs et coupeurs expérimentés',
            'Tailleurs de vigne',
            'Cueilleurs en arboriculture',
            'Ouvriers maraîchers',
            'Opérateurs de conditionnement',
          ],
        },
        {
          h2: 'L’opérationnel pris en main',
          paragraphs: [
            "Pour les missions qui le justifient, Pickajob organise le logement, la logistique d’arrivée, l’intégration sur le terrain et l’encadrement par un chef d’équipe Pickajob. Vous gardez le pilotage de votre exploitation, nous prenons en charge la complexité de l’accueil.",
          ],
        },
        {
          h2: 'Une main-d’œuvre étrangère qui s’ajoute à votre équipe',
          paragraphs: [
            "L’équipe Pickajob ne remplace pas vos saisonniers fidèles : elle complète votre dispositif sur les pics de saison, lorsque le marché local ne suffit plus. C’est une logique d’appui, pas de substitution.",
          ],
        },
        {
          h2: 'Une couverture nationale',
          paragraphs: [
            "Pickajob intervient dans toutes les grandes régions agricoles : Gironde, Champagne, Bourgogne, Vallée du Rhône, Sud-Ouest, Provence, Bretagne… Nous adaptons la mobilisation aux saisons et aux régions.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Profils expérimentés', description: 'Une main-d’œuvre étrangère sélectionnée sur expérience.' },
        { title: 'Logement', description: 'Hébergement organisé et adapté à la mission.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob facilite l’intégration sur place.' },
        { title: 'Souplesse', description: 'Renforts saisonniers ou missions plus longues.' },
        { title: 'Communication', description: 'Profils briefés en plusieurs langues si nécessaire.' },
        { title: 'Couverture nationale', description: 'Toutes les grandes régions agricoles françaises.' },
      ]}
      faq={[
        { q: 'Pickajob s’occupe-t-il de la logistique d’arrivée ?', a: 'Oui, dans la mesure où la mission le justifie : logement, transport, intégration, encadrement.' },
        { q: 'Quelle expérience ont les profils étrangers mobilisés ?', a: 'Des profils sélectionnés et qualifiés sur leur expérience agricole effective.' },
        { q: 'Pickajob accompagne-t-il l’encadrement ?', a: 'Oui, un chef d’équipe Pickajob peut accompagner l’équipe sur le terrain.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
          { href: '/employeurs/recruter-saisonniers-agricoles', label: 'Recruter des saisonniers agricoles' },
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/blog/recruter-des-ouvriers-agricoles-etrangers', label: 'Article : recruter des ouvriers agricoles étrangers' },
          { href: '/regions/champagne', label: 'Vendangeurs Champagne' },
        ],
      }}
    />
  );
}
