export const SITE = {
  name: 'Pickajob',
  legalName: 'Pickajob',
  domain: 'pickajob.fr',
  url: 'https://pickajob.fr',
  tagline: 'Prestataire agricole et viticole en France',
  defaultTitle:
    'Pickajob — Prestataire agricole et viticole, main-d’œuvre qualifiée en France',
  defaultDescription:
    "Pickajob, prestataire agricole et viticole, met à disposition des équipes qualifiées et son expertise terrain pour accompagner les exploitations agricoles, viticoles, maraîchères et arboricoles partout en France.",
  phone: '+33 6 00 00 00 00',
  phoneDisplay: '06 00 00 00 00',
  phoneHref: 'tel:+33600000000',
  whatsapp: '+33600000000',
  whatsappHref: 'https://wa.me/33600000000',
  email: 'contact@pickajob.fr',
  emailHref: 'mailto:contact@pickajob.fr',
  locale: 'fr_FR',
  positioning: [
    'Prestataire agricole',
    'Prestataire viticole',
    'Partenaire opérationnel des exploitations',
    'Main-d’œuvre agricole qualifiée',
    'Appui terrain pour les pics d’activité',
    'Intervention partout en France',
  ],
};

export type NavItem = { label: string; href: string };

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Pickajob prestataire', href: '/employeurs' },
  { label: 'Secteurs', href: '/secteurs/viticulture' },
  { label: 'Régions', href: '/regions/nouvelle-aquitaine' },
  { label: 'Rejoindre nos équipes', href: '/candidats' },
  { label: 'Blog', href: '/blog/comment-trouver-de-la-main-oeuvre-agricole' },
  { label: 'Contact', href: '/contact' },
];

export const SECTORS = [
  { slug: 'viticulture', label: 'Viticulture' },
  { slug: 'vendanges', label: 'Vendanges' },
  { slug: 'arboriculture', label: 'Arboriculture' },
  { slug: 'maraichage', label: 'Maraîchage' },
  { slug: 'conditionnement', label: 'Conditionnement' },
  { slug: 'serres', label: 'Travaux en serre' },
];

export const REGIONS = [
  { slug: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { slug: 'gironde', label: 'Gironde' },
  { slug: 'champagne', label: 'Champagne' },
  { slug: 'bourgogne', label: 'Bourgogne' },
  { slug: 'occitanie', label: 'Occitanie' },
  { slug: 'provence-alpes-cote-d-azur', label: 'Provence-Alpes-Côte d’Azur' },
];

export const COUNTRIES = [
  { slug: 'australie', label: 'Australie' },
  { slug: 'canada', label: 'Canada' },
  { slug: 'nouvelle-zelande', label: 'Nouvelle-Zélande' },
];

export const BLOG_ARTICLES = [
  {
    slug: 'comment-recruter-des-saisonniers-agricoles',
    title: 'Comment recruter des saisonniers agricoles en 2026',
  },
  {
    slug: 'combien-coute-un-saisonnier-agricole',
    title: 'Combien coûte un saisonnier agricole ?',
  },
  {
    slug: 'ou-trouver-des-vendangeurs',
    title: 'Où trouver des vendangeurs fiables ?',
  },
  {
    slug: 'comment-trouver-de-la-main-oeuvre-agricole',
    title: 'Comment trouver de la main-d’œuvre agricole rapidement',
  },
  {
    slug: 'recruter-des-ouvriers-agricoles-etrangers',
    title: 'Recruter des ouvriers agricoles étrangers : ce qu’il faut savoir',
  },
  {
    slug: 'preparer-sa-saison-de-vendanges',
    title: 'Préparer sa saison de vendanges : checklist pour les domaines',
  },
];
