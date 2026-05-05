import type { Metadata } from 'next';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Équipe agricole disponible : mobilisez une équipe Pickajob rapidement',
  description:
    "Pickajob mobilise une équipe agricole disponible et qualifiée pour vos travaux saisonniers : vendanges, cueillette, maraîchage, conditionnement, serres, partout en France.",
  path: '/employeurs/equipe-agricole',
  keywords: ['équipe agricole disponible', 'équipe agricole', 'prestataire agricole équipe'],
});

export default function EquipeAgricole() {
  return (
    <SeoLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Pickajob prestataire', href: '/employeurs' },
        { name: 'Équipe agricole disponible' },
      ]}
      h1="Équipe agricole disponible : Pickajob mobilise pour vous"
      intro="Pickajob, prestataire agricole et viticole, met à votre disposition une équipe agricole disponible et qualifiée. Plus besoin de recruter individu par individu : vous obtenez une équipe complète, encadrée et opérationnelle."
      bullets={[
        'Équipes complètes prêtes à intervenir',
        'Encadrement par un chef d’équipe Pickajob',
        'Logement et logistique pris en main',
        'Réactivité saisonnière',
      ]}
      sections={[
        {
          h2: 'Pourquoi choisir une équipe agricole plutôt que des profils isolés',
          paragraphs: [
            "Une équipe agricole déjà constituée est plus performante qu’une somme de profils recrutés un à un. Les ouvriers se connaissent, ont déjà travaillé ensemble, partagent un rythme et un standard de qualité. Pour les exploitations qui doivent traiter de gros volumes en quelques jours (vendanges, cueillette de fruits, conditionnement), l’écart de productivité peut être considérable.",
            "Pickajob privilégie cette logique d’équipe à chaque fois que c’est pertinent. Nous mobilisons des équipes que nous connaissons, et nous les briefons selon vos exigences.",
          ],
        },
        {
          h2: 'Quelles équipes agricoles Pickajob met à disposition ?',
          paragraphs: ["Selon votre besoin, Pickajob mobilise différents formats d’équipe :"],
          bullets: [
            'Équipe vendanges (coupeurs + porteurs)',
            'Équipe taille de vigne',
            'Équipe cueillette en arboriculture',
            'Équipe maraîchage en plein champ ou serre',
            'Équipe conditionnement / station fruitière',
            'Renforts ponctuels intégrés à votre équipe interne',
          ],
        },
        {
          h2: 'Comment Pickajob encadre ses équipes agricoles',
          paragraphs: [
            "Chaque équipe Pickajob est briefée avant la mission, encadrée pendant la mission, et suivie par un référent Pickajob qui garantit la qualité de la prestation. Pour les missions importantes, nous proposons systématiquement un chef d’équipe Pickajob qui devient votre interlocuteur sur le terrain.",
          ],
        },
        {
          h2: 'Une équipe agricole disponible à l’échelle nationale',
          paragraphs: [
            "Pickajob intervient partout en France et adapte la composition de l’équipe selon la culture, le calibre attendu, le type de chantier et les contraintes locales. Vous pouvez nous solliciter pour une équipe en Gironde pour les vendanges, ou pour une équipe maraîchage en Provence ou Bretagne.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Équipe constituée', description: 'Des ouvriers qui se connaissent, plus efficaces ensemble.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible pour les missions importantes.' },
        { title: 'Logement', description: 'Logement et logistique pris en main quand nécessaire.' },
        { title: 'Briefing', description: 'Chaque équipe est briefée selon vos exigences spécifiques.' },
        { title: 'Souplesse', description: 'Adaptation du nombre d’ouvriers selon l’avancée du chantier.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en saison.' },
      ]}
      faq={[
        { q: 'Quelle est la taille minimale d’une équipe Pickajob ?', a: 'Cela dépend de votre besoin. Nous mobilisons aussi bien 2 personnes en renfort qu’une équipe de 20 vendangeurs avec encadrement.' },
        { q: 'Pickajob fournit-il un chef d’équipe ?', a: 'Oui, sur les missions qui le justifient, un chef d’équipe Pickajob encadre l’équipe sur le terrain.' },
        { q: 'Peut-on retrouver la même équipe la saison suivante ?', a: 'Oui, dans la mesure du possible Pickajob fidélise les équipes par exploitation pour gagner en efficacité.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/regions/gironde', label: 'Équipes en Gironde' },
        ],
      }}
    />
  );
}
