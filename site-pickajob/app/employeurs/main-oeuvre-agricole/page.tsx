import type { Metadata } from 'next';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Main-d’œuvre agricole : trouver des ouvriers rapidement avec Pickajob',
  description:
    "Pickajob, prestataire agricole et viticole, mobilise de la main-d’œuvre agricole partout en France pour vendanges, cueillette, maraîchage, conditionnement et travaux en serre.",
  path: '/employeurs/main-oeuvre-agricole',
  keywords: ['main d’œuvre agricole', 'trouver de la main d’œuvre agricole', 'prestataire agricole'],
});

export default function MainOeuvreAgricolePage() {
  return (
    <SeoLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Pickajob prestataire', href: '/employeurs' },
        { name: 'Main-d’œuvre agricole' },
      ]}
      h1="Main-d’œuvre agricole : la solution Pickajob pour les exploitations"
      intro="Pickajob est votre prestataire agricole et viticole en France : nous mettons à disposition de la main-d’œuvre agricole qualifiée et notre expertise terrain, pour vos travaux saisonniers, ponctuels ou réguliers."
      bullets={[
        'Main-d’œuvre agricole disponible et qualifiée',
        'Mobilisation rapide en saison',
        'Logement et logistique organisés',
        'Intervention France entière',
      ]}
      sections={[
        {
          h2: 'Trouver de la main-d’œuvre agricole : pourquoi c’est de plus en plus tendu',
          paragraphs: [
            "La pénurie de main-d’œuvre agricole touche toutes les régions françaises. Vendanges, cueillette de fruits, maraîchage, travaux en serre, conditionnement : les exploitants ont besoin d’ouvriers fiables, au bon moment, avec une vraie capacité de travail. Or, recruter en direct prend du temps, génère beaucoup d’abandons en cours de mission, et complique la gestion du logement et de l’encadrement.",
            "Pickajob est conçu pour répondre exactement à cette problématique. En tant que prestataire agricole, nous mettons à votre disposition de la main-d’œuvre agricole qualifiée, encadrée et briefée — vous gagnez du temps et vous sécurisez votre saison.",
          ],
        },
        {
          h2: 'Quels types de main-d’œuvre agricole mobilise Pickajob ?',
          paragraphs: [
            "Pickajob couvre tous les profils dont une exploitation a besoin :",
          ],
          bullets: [
            'Ouvriers agricoles polyvalents (cueillette, plantation, désherbage, récolte)',
            'Vendangeurs et coupeurs expérimentés',
            'Tailleurs de vigne (taille Guyot, Cordon de Royat, etc.)',
            'Ouvriers maraîchers en serre et plein champ',
            'Ouvriers conditionnement / tri / station fruitière',
            'Chefs d’équipe pour encadrer une équipe sur le terrain',
          ],
        },
        {
          h2: 'Comment Pickajob mobilise sa main-d’œuvre agricole',
          paragraphs: [
            "Notre force, c’est de fonctionner comme un prestataire opérationnel, pas comme une plateforme d’annonces. Nous constituons et entretenons un vivier de profils agricoles. Quand un exploitant nous décrit son besoin, nous identifions les profils ou les équipes adaptés, nous les briefons, nous organisons leur arrivée, et nous restons disponibles pendant la mission.",
            "Cette manière de travailler change la donne pour les exploitations qui n’ont plus le temps de gérer le sourcing en interne.",
          ],
        },
        {
          h2: 'Main-d’œuvre agricole : un service partout en France',
          paragraphs: [
            "Pickajob intervient dans toutes les grandes régions agricoles françaises et adapte ses équipes aux contraintes locales : viticulture en Gironde, Bourgogne, Champagne, arboriculture en Vallée du Rhône et Sud-Ouest, maraîchage en Bretagne et Provence, cultures spécialisées en Occitanie et Nouvelle-Aquitaine.",
          ],
        },
        {
          h2: 'Quand contacter Pickajob ?',
          paragraphs: [
            "Le plus tôt possible. Plus vous nous contactez en amont de votre saison, plus nous pouvons constituer une équipe stable, alignée avec votre exploitation et votre culture. Nous prenons aussi les urgences (météo, absences, pic non anticipé), mais l’anticipation reste votre meilleur allié.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Profils agricoles', description: 'Sélection sur expérience terrain, pas seulement sur disponibilité.' },
        { title: 'Encadrement', description: 'Chef d’équipe et référent Pickajob pour fluidifier la mission.' },
        { title: 'Logement', description: 'Hébergement organisé selon les besoins de la mission.' },
        { title: 'Réactivité', description: 'Devis et mobilisation rapides en pleine saison.' },
        { title: 'Souplesse', description: 'Adaptation du nombre de personnes selon l’avancée du chantier.' },
        { title: 'Couverture nationale', description: 'Pickajob intervient dans toute la France.' },
      ]}
      faq={[
        { q: 'Comment Pickajob trouve-t-il sa main-d’œuvre agricole ?', a: 'Nous constituons un vivier durable de profils agricoles, sélectionnés pour leur expérience terrain et briefés sur les exigences de chaque exploitation.' },
        { q: 'Combien coûte une main-d’œuvre agricole via Pickajob ?', a: 'Cela dépend de la culture, de la durée, du nombre de personnes et des besoins logistiques. Demandez un devis : la réponse est rapide.' },
        { q: 'Pickajob fournit-il une équipe ou des profils individuels ?', a: 'Les deux. Selon votre besoin, nous mobilisons un ou plusieurs profils, ou bien une équipe complète avec encadrement.' },
        { q: 'Pickajob travaille-t-il avec des saisonniers étrangers ?', a: 'Oui, et nous gérons l’aspect opérationnel pour faciliter leur intégration sur votre exploitation. Voir notre page main-d’œuvre étrangère.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre agricole qualifiée' },
          { href: '/employeurs/recruter-saisonniers-agricoles', label: 'Recruter des saisonniers agricoles' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/employeurs/main-oeuvre-etrangere-agriculture', label: 'Main-d’œuvre étrangère agricole' },
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
        ],
      }}
    />
  );
}
