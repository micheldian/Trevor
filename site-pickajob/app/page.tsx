import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Grape, Apple, Sprout, Scissors, PackageCheck, LeafyGreen,
  Clock, Users2, Handshake, MapPinned, ShieldCheck, BadgeCheck,
} from 'lucide-react';
import { Hero } from '@/components/Hero';
import { FeatureGrid } from '@/components/FeatureGrid';
import { Steps } from '@/components/Steps';
import { CtaBar } from '@/components/CtaBar';
import { InternalLinks } from '@/components/InternalLinks';
import { Faq } from '@/components/Faq';
import { JsonLd } from '@/components/JsonLd';
import { buildMetadata, faqJsonLd } from '@/lib/seo';
import { SECTORS, REGIONS } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Pickajob — Prestataire agricole et viticole, main-d’œuvre qualifiée',
  description:
    "Pickajob, prestataire agricole et viticole en France, met à disposition des équipes qualifiées et son expertise terrain pour exploitations, domaines viticoles, maraîchers, arboriculteurs et coopératives.",
  path: '/',
  keywords: [
    'main d’œuvre agricole qualifiée',
    'prestataire agricole',
    'prestataire viticole',
    'équipe agricole',
    'recruter saisonniers agricoles',
  ],
});

const FAQ = [
  {
    q: 'Pickajob est-il une plateforme d’annonces ?',
    a: 'Non. Pickajob est un prestataire agricole et viticole : nous mettons à disposition nos propres équipes qualifiées et notre expertise terrain pour vos travaux saisonniers, ponctuels ou réguliers, partout en France.',
  },
  {
    q: 'Combien de temps pour mobiliser une équipe ?',
    a: 'Pour les besoins urgents, nous mobilisons généralement une équipe en quelques jours selon la région et la saison. Plus votre demande est anticipée, plus nous pouvons constituer une équipe adaptée à votre exploitation.',
  },
  {
    q: 'Sur quels travaux Pickajob intervient ?',
    a: 'Vendanges, taille de vigne, cueillette de fruits, maraîchage, conditionnement, travaux en serre, plantation, entretien… Nous intervenons sur l’ensemble des travaux agricoles et viticoles.',
  },
  {
    q: 'Pickajob intervient-il dans toute la France ?',
    a: 'Oui, nous accompagnons des exploitations dans toutes les grandes régions agricoles et viticoles : Nouvelle-Aquitaine, Gironde, Champagne, Bourgogne, Occitanie, PACA et au-delà.',
  },
  {
    q: 'Comment obtenir un devis ?',
    a: 'Décrivez votre besoin via le formulaire de devis (culture, dates, nombre de personnes, logement). Nous vous rappelons rapidement pour qualifier votre besoin et vous transmettre une proposition.',
  },
];

export default function HomePage() {
  return (
    <>
      <Hero
        badge="Prestataire agricole & viticole"
        title="Trouvez rapidement de la main-d’œuvre agricole qualifiée"
        subtitle="Pickajob accompagne les exploitants agricoles, viticulteurs, maraîchers et arboriculteurs en mettant à disposition des équipes qualifiées et son expertise terrain pour leurs besoins saisonniers, ponctuels ou urgents."
        primaryCta={{ label: 'Je cherche des ouvriers agricoles', href: '/devis' }}
        secondaryCta={{ label: 'Je cherche un travail agricole', href: '/candidats' }}
        bullets={[
          'Équipes qualifiées disponibles',
          'Réponse rapide pour vos urgences',
          'Intervention partout en France',
          'Logement et logistique organisés',
        ]}
      />

      <FeatureGrid
        title="Pour quels besoins ?"
        intro="Pickajob intervient sur l’ensemble des travaux agricoles et viticoles, en saisonnier, ponctuel ou régulier."
        items={[
          { title: 'Vendanges', description: 'Équipes de vendangeurs prêtes pour la récolte, du tri à la cave.', icon: Grape },
          { title: 'Cueillette de fruits', description: 'Ouvriers expérimentés pour la cueillette en vergers : pommes, poires, fruits à noyau.', icon: Apple },
          { title: 'Maraîchage', description: 'Plantation, entretien, récolte et conditionnement en plein champ ou sous serre.', icon: Sprout },
          { title: 'Taille de vigne', description: 'Tailleurs formés aux différentes méthodes (Guyot, Cordon, Royat…).', icon: Scissors },
          { title: 'Conditionnement', description: 'Équipes pour stations fruitières, légumières et coopératives, en pleine saison.', icon: PackageCheck },
          { title: 'Travaux en serre', description: 'Effeuillage, palissage, récolte, entretien sous serre toute l’année.', icon: LeafyGreen },
        ]}
        columns={3}
      />

      <Steps
        title="Comment ça marche ?"
        intro="Une logique simple et opérationnelle, pensée pour les contraintes du terrain."
        steps={[
          { title: 'Vous indiquez votre besoin', description: 'Culture, dates, nombre de personnes, logement, contraintes spécifiques.' },
          { title: 'Pickajob mobilise une équipe', description: 'Nous identifions les profils ou équipes qualifiées disponibles dans votre zone.' },
          { title: 'Échange et validation', description: 'Devis clair, conditions, logistique, encadrement : tout est cadré avant le départ.' },
          { title: 'La mission démarre', description: 'L’équipe Pickajob intervient sur votre exploitation, avec un suivi pendant la mission.' },
        ]}
      />

      <FeatureGrid
        title="Pourquoi choisir Pickajob ?"
        intro="Un prestataire agricole et viticole, pas une simple plateforme. Nous sommes votre partenaire opérationnel."
        items={[
          { title: 'Réponse rapide', description: 'Une réponse sous 24-48h, indispensable quand la météo ou la maturité dictent vos calendriers.', icon: Clock },
          { title: 'Profils agricoles', description: 'Nos profils sont sélectionnés pour leur expérience terrain (vigne, vergers, serres, maraîchage).', icon: BadgeCheck },
          { title: 'Équipes disponibles', description: 'Des équipes constituées et briefées, capables de monter en charge rapidement.', icon: Users2 },
          { title: 'Contact humain', description: 'Un interlocuteur dédié pour qualifier votre besoin et suivre la mission.', icon: Handshake },
          { title: 'Adapté aux urgences', description: 'Pic de récolte, météo, absence : nous nous adaptons aux imprévus du terrain.', icon: ShieldCheck },
          { title: 'Partout en France', description: 'Nous intervenons dans les grandes régions agricoles et viticoles françaises.', icon: MapPinned },
        ]}
        columns={3}
      />

      <InternalLinks
        title="Zones couvertes"
        intro="Pickajob intervient partout en France et concentre son expertise dans les grandes régions agricoles et viticoles."
        items={REGIONS.map((r) => ({
          href: `/regions/${r.slug}`,
          label: r.label,
          description: `Main-d’œuvre agricole et viticole en ${r.label}.`,
        }))}
      />

      <InternalLinks
        title="Nos secteurs d’intervention"
        items={SECTORS.map((s) => ({
          href: `/secteurs/${s.slug}`,
          label: s.label,
          description: `Prestation ${s.label.toLowerCase()} : équipes qualifiées et expertise terrain.`,
        }))}
      />

      <CtaBar
        title="Besoin d’une équipe agricole rapidement ?"
        subtitle="Contactez Pickajob dès maintenant. Nous qualifions votre besoin et mobilisons une équipe partout en France."
        variant="dark"
      />

      <Faq items={FAQ} />

      <section className="bg-white py-12">
        <div className="container-content text-center">
          <p className="text-sm text-gray-500">Vous cherchez un travail agricole ?</p>
          <Link href="/candidats" className="btn-secondary mt-3">Rejoindre nos équipes Pickajob</Link>
        </div>
      </section>

      <JsonLd data={faqJsonLd(FAQ)} />
    </>
  );
}
