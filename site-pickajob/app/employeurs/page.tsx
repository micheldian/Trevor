import type { Metadata } from 'next';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';
import { SECTORS, REGIONS } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Recruter des ouvriers agricoles — Pickajob, prestataire agricole et viticole',
  description:
    "Recruter des ouvriers agricoles devient simple avec Pickajob, prestataire agricole et viticole. Équipes qualifiées et expertise terrain pour exploitations, domaines, coopératives.",
  path: '/employeurs',
  keywords: ['recruter des ouvriers agricoles', 'prestataire agricole', 'main d’œuvre agricole', 'équipe agricole'],
});

export default function EmployeursPage() {
  return (
    <SeoLandingTemplate
      breadcrumb={[{ name: 'Accueil', href: '/' }, { name: 'Pickajob prestataire' }]}
      badge="Pour les exploitations & domaines"
      h1="Recruter des ouvriers agricoles, simplement, avec Pickajob"
      intro="Pickajob est votre prestataire agricole et viticole. Nous mettons à disposition des équipes qualifiées et notre expertise terrain pour vous éviter les galères de recrutement et les pics d’activité non couverts."
      bullets={[
        'Équipes complètes prêtes à intervenir',
        'Profils sélectionnés et briefés',
        'Logement et logistique pris en charge',
        'Intervention partout en France',
      ]}
      sections={[
        {
          h2: 'Pickajob, prestataire agricole : une vraie alternative au recrutement classique',
          paragraphs: [
            "Recruter des ouvriers agricoles en direct est devenu un défi : pénurie de main-d’œuvre, calendriers serrés, formalités, logement, encadrement… Pickajob résout cette équation en agissant comme votre prestataire agricole et viticole. Vous ne « publiez » pas une annonce, vous demandez une équipe.",
            "Concrètement, vous nous décrivez votre besoin (culture, dates, volume, contraintes), et nous mobilisons une équipe Pickajob qualifiée, déjà constituée, qui vient sur votre exploitation, avec un encadrement adapté.",
          ],
        },
        {
          h2: 'Pour qui ?',
          paragraphs: [
            "Pickajob accompagne tous les acteurs agricoles français qui ont besoin de renforcer rapidement leurs équipes :",
          ],
          bullets: [
            'Exploitants agricoles individuels et grandes exploitations',
            'Domaines viticoles, châteaux et caves coopératives',
            'Maraîchers en plein champ et sous serre',
            'Arboriculteurs (pommes, poires, cerises, abricots, prunes…)',
            'Coopératives agricoles et stations fruitières',
            'Entreprises agricoles ayant besoin de main-d’œuvre régulière ou ponctuelle',
          ],
        },
        {
          h2: 'Sur quels travaux Pickajob intervient-il ?',
          paragraphs: [
            "Pickajob couvre l’ensemble des travaux agricoles et viticoles, en saisonnier ou ponctuel : vendanges, taille, ébourgeonnage, palissage, cueillette, plantation, désherbage, entretien, conditionnement, chargement, travaux en serre, effeuillage, récolte de fruits et légumes…",
            "Notre force : nos équipes savent se rendre opérationnelles vite, parce que ce sont des profils agricoles, pas des profils généralistes envoyés au hasard.",
          ],
        },
        {
          h2: 'Comment se déroule une mission ?',
          paragraphs: [
            "Vous nous décrivez votre besoin (culture, dates, nombre, logement). Pickajob mobilise une équipe disponible, vous échangeons sur le détail (planning, accès, logement, primes éventuelles), nous validons un devis clair, et la mission démarre. Pendant la mission, vous avez un interlocuteur Pickajob dédié, et nous adaptons l’équipe si vos besoins évoluent.",
          ],
        },
        {
          h2: 'Pourquoi passer par un prestataire agricole comme Pickajob ?',
          paragraphs: [
            "Parce qu’en saison, le temps est votre principale contrainte. Recruter, encadrer, gérer le logement et l’administratif, gérer les imprévus… c’est un vrai métier. En passant par Pickajob, vous gardez le contrôle de votre exploitation et déléguez la complexité de la main-d’œuvre.",
          ],
          bullets: [
            'Vous gagnez du temps en saison',
            'Vous sécurisez vos pics d’activité',
            'Vous bénéficiez de profils déjà qualifiés',
            'Vous avez un interlocuteur dédié',
          ],
        },
        {
          h2: 'Partout en France, dans les grandes régions agricoles',
          paragraphs: [
            "Pickajob intervient partout en France et concentre son expertise dans les régions agricoles et viticoles à forte saisonnalité : Nouvelle-Aquitaine, Gironde, Champagne, Bourgogne, Occitanie, Provence-Alpes-Côte d’Azur, et au-delà.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Équipes qualifiées', description: 'Profils agricoles sélectionnés, briefés et encadrés.' },
        { title: 'Réponse rapide', description: 'Devis et mobilisation rapides, indispensables en pleine saison.' },
        { title: 'Logement & logistique', description: 'Pickajob gère l’hébergement, le transport et l’encadrement quand c’est possible.' },
        { title: 'Souplesse', description: 'Renfort ponctuel, urgence ou mission longue : nous nous adaptons.' },
        { title: 'Un interlocuteur dédié', description: 'Vous avez un référent Pickajob clair pour piloter la mission.' },
        { title: 'France entière', description: 'Nous intervenons dans toutes les grandes régions agricoles et viticoles.' },
      ]}
      steps={[
        { title: 'Vous décrivez votre besoin', description: 'Culture, période, nombre de personnes, logement, contraintes spécifiques.' },
        { title: 'Pickajob qualifie le besoin', description: 'Un référent Pickajob valide la faisabilité et structure la prestation.' },
        { title: 'Mobilisation d’équipe', description: 'Pickajob constitue ou réoriente une équipe qualifiée pour votre mission.' },
        { title: 'Mission & suivi', description: 'L’équipe intervient, avec un suivi pendant toute la durée de la mission.' },
      ]}
      faq={[
        { q: 'Quelle différence entre Pickajob et une plateforme d’annonces ?', a: 'Pickajob est un prestataire : nous mettons nos propres équipes à disposition, nous ne nous contentons pas de publier votre annonce. Vous gagnez du temps et de la fiabilité.' },
        { q: 'Pickajob s’occupe-t-il du logement ?', a: 'Oui, quand c’est nécessaire. Nous gérons logement, transport et encadrement pour les missions qui le justifient.' },
        { q: 'Pour quelles tailles d’exploitations ?', a: 'De l’exploitation individuelle au domaine multi-sites et aux coopératives. Nous adaptons la taille de l’équipe au besoin.' },
        { q: 'Combien de temps avant la mission faut-il vous contacter ?', a: 'Le plus tôt possible. Nous prenons aussi des urgences, mais l’anticipation permet de constituer la meilleure équipe.' },
      ]}
      internalLinks={{
        title: 'Pages utiles pour les exploitations',
        items: [
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole', description: 'Guide complet pour mobiliser de la main-d’œuvre agricole.' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre agricole qualifiée', description: 'Sélection, encadrement, expertise.' },
          { href: '/employeurs/recruter-saisonniers-agricoles', label: 'Recruter des saisonniers agricoles', description: 'Comment recruter en saison sans stress.' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible', description: 'Mobilisez une équipe complète, rapidement.' },
          { href: '/employeurs/main-oeuvre-etrangere-agriculture', label: 'Main-d’œuvre étrangère', description: 'Recruter de la main-d’œuvre étrangère en agriculture.' },
          ...SECTORS.slice(0, 3).map((s) => ({ href: `/secteurs/${s.slug}`, label: `Prestation ${s.label}`, description: `Équipes qualifiées ${s.label.toLowerCase()}.` })),
          ...REGIONS.slice(0, 3).map((r) => ({ href: `/regions/${r.slug}`, label: `Main-d’œuvre en ${r.label}`, description: `Pickajob intervient en ${r.label}.` })),
        ],
      }}
    />
  );
}
