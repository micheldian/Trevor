import type { Metadata } from 'next';
import { SeoLandingTemplate } from '@/components/SeoLandingTemplate';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Main-d’œuvre agricole qualifiée — équipes Pickajob, prestataire agricole',
  description:
    "Pickajob mobilise une main-d’œuvre agricole qualifiée pour vos travaux viticoles, fruitiers, maraîchers et de conditionnement, partout en France.",
  path: '/employeurs/main-oeuvre-agricole-qualifiee',
  keywords: ['main d’œuvre agricole qualifiée', 'ouvriers agricoles qualifiés', 'prestataire agricole qualifié'],
});

export default function Qualifiee() {
  return (
    <SeoLandingTemplate
      breadcrumb={[
        { name: 'Accueil', href: '/' },
        { name: 'Pickajob prestataire', href: '/employeurs' },
        { name: 'Main-d’œuvre agricole qualifiée' },
      ]}
      h1="Main-d’œuvre agricole qualifiée : des équipes prêtes à intervenir"
      intro="Pickajob, prestataire agricole et viticole, met à votre disposition une main-d’œuvre agricole qualifiée : profils sélectionnés, expérience terrain réelle, encadrement et fiabilité opérationnelle."
      bullets={[
        'Profils sélectionnés sur expérience terrain',
        'Briefing et encadrement Pickajob',
        'Réponse rapide en saison',
        'Service France entière',
      ]}
      sections={[
        {
          h2: 'Pourquoi miser sur une main-d’œuvre agricole qualifiée',
          paragraphs: [
            "En agriculture, la qualification fait toute la différence : un coupeur de vigne expérimenté est jusqu’à deux fois plus productif qu’un débutant, un cueilleur de fruits qualifié réduit drastiquement le taux de fruits abîmés, un tailleur expérimenté préserve la santé du pied de vigne sur plusieurs années. La main-d’œuvre agricole qualifiée n’est pas un luxe : c’est ce qui sécurise votre saison et la qualité de votre récolte.",
            "Pickajob a construit son service autour de cette exigence. Nous ne mettons pas à disposition n’importe quel profil : nous sélectionnons, briefons et accompagnons des profils agricoles capables d’être opérationnels rapidement.",
          ],
        },
        {
          h2: 'Comment Pickajob qualifie sa main-d’œuvre agricole',
          paragraphs: [
            "Tout profil mobilisé par Pickajob passe par une qualification structurée :",
          ],
          bullets: [
            'Vérification de l’expérience agricole (cultures, gestes techniques)',
            'Évaluation des capacités physiques et de la fiabilité',
            'Briefing spécifique avant chaque mission (variété, geste, cadence)',
            'Encadrement par un chef d’équipe ou référent Pickajob',
          ],
        },
        {
          h2: 'Des profils agricoles pour chaque type de mission',
          paragraphs: [
            "Pickajob mobilise des profils qualifiés pour les missions les plus techniques :",
          ],
          bullets: [
            'Tailleurs de vigne (Guyot, Cordon, Royat)',
            'Vendangeurs avec expérience plusieurs saisons',
            'Cueilleurs en arboriculture (pommes, abricots, cerises…)',
            'Ouvriers maraîchers (effeuillage, palissage, récolte)',
            'Opérateurs de tri et de conditionnement',
            'Chefs d’équipe agricoles',
          ],
        },
        {
          h2: 'L’apport d’un prestataire agricole sur la qualification',
          paragraphs: [
            "Quand vous travaillez seul, qualifier vos saisonniers chaque année est un coût caché : sourcing, tests, abandons, formations qui ne servent qu’une saison. Avec Pickajob, vous bénéficiez du travail de qualification que nous menons en continu, et vous capitalisez sur la même équipe d’une saison à l’autre, lorsque c’est possible.",
          ],
        },
        {
          h2: 'Une qualification adaptée à votre exploitation',
          paragraphs: [
            "Nous adaptons notre qualification à votre exploitation : type de culture, variété, cadence, contraintes qualité, équipement. Cette personnalisation permet à nos équipes d’être réellement efficaces dès le premier jour.",
          ],
        },
      ]}
      whyItems={[
        { title: 'Sélection rigoureuse', description: 'Profils choisis sur expérience terrain, pas sur déclaration.' },
        { title: 'Briefing dédié', description: 'Chaque mission est briefée selon vos exigences.' },
        { title: 'Encadrement', description: 'Un chef d’équipe ou un référent Pickajob accompagne la mission.' },
        { title: 'Qualité de récolte', description: 'Une équipe qualifiée préserve la valeur de votre production.' },
        { title: 'Productivité', description: 'Une cadence terrain plus régulière, plus prévisible.' },
        { title: 'Capitalisation', description: 'Possibilité de retrouver les mêmes profils saison après saison.' },
      ]}
      faq={[
        { q: 'Comment Pickajob s’assure-t-il de la qualification ?', a: 'Sur la base de l’expérience réelle, des références, et d’un briefing pré-mission systématique. Nous adaptons aussi le profil à votre culture spécifique.' },
        { q: 'Peut-on retrouver la même équipe d’une saison à l’autre ?', a: 'Oui, c’est l’un des atouts de Pickajob : la fidélisation d’équipes qualifiées par exploitation, quand c’est possible.' },
        { q: 'Pickajob fournit-il un chef d’équipe ?', a: 'Oui, sur les missions qui le justifient, un chef d’équipe Pickajob encadre l’équipe sur le terrain.' },
      ]}
      internalLinks={{
        title: 'Aller plus loin',
        items: [
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
          { href: '/employeurs/recruter-saisonniers-agricoles', label: 'Recruter des saisonniers agricoles' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/secteurs/arboriculture', label: 'Cueillette de fruits' },
        ],
      }}
    />
  );
}
