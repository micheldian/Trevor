type BlogContent = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  publishedAt: string;
  body: { h2: string; paragraphs: string[]; bullets?: string[] }[];
  related: { href: string; label: string }[];
};

export const BLOG: Record<string, BlogContent> = {
  'comment-recruter-des-saisonniers-agricoles': {
    slug: 'comment-recruter-des-saisonniers-agricoles',
    metaTitle: 'Comment recruter des saisonniers agricoles en 2026 — guide pratique Pickajob',
    metaDescription:
      "Comment recruter des saisonniers agricoles en 2026 : sourcing, fiabilisation, logement, encadrement, options de prestation. Guide pratique signé Pickajob, prestataire agricole.",
    h1: 'Comment recruter des saisonniers agricoles en 2026',
    intro: "Recruter des saisonniers agricoles est devenu l’un des sujets les plus tendus de la gestion d’exploitation. Voici un guide pratique 2026, par Pickajob, prestataire agricole et viticole.",
    publishedAt: '2026-04-15',
    body: [
      {
        h2: 'Pourquoi le recrutement saisonnier est devenu si difficile',
        paragraphs: [
          "La pénurie de main-d’œuvre agricole touche tous les bassins de production. Les candidats sont moins nombreux, les abandons en cours de mission plus fréquents, le marché du travail concurrentiel. Les exploitations passent un temps croissant à recruter, fiabiliser, gérer le logement.",
        ],
      },
      {
        h2: 'Trois leviers pour sécuriser sa saison',
        paragraphs: ['Trois leviers complémentaires se dégagent :'],
        bullets: [
          'Anticiper le sourcing en amont (et non au dernier moment)',
          'Fidéliser les profils d’une saison à l’autre',
          'Externaliser à un prestataire agricole comme Pickajob',
        ],
      },
      {
        h2: 'L’option prestataire : à qui c’est destiné',
        paragraphs: [
          "Faire appel à un prestataire agricole comme Pickajob convient particulièrement aux exploitations qui ont peu de temps de pilotage, qui doivent renforcer leur équipe sur quelques jours seulement, qui ne veulent pas gérer logement et logistique en interne, ou qui font face à une urgence terrain.",
        ],
      },
      {
        h2: 'Comment Pickajob gère le sourcing à votre place',
        paragraphs: [
          "Pickajob constitue un vivier de profils agricoles, sélectionnés sur expérience et fiabilité. Quand vous nous décrivez votre besoin (culture, dates, nombre, logement), nous mobilisons une équipe que nous briefons.",
        ],
      },
      {
        h2: 'Conclusion',
        paragraphs: [
          "Le recrutement saisonnier agricole en 2026 ne se gère plus comme il y a 10 ans : anticipez, capitalisez, et déléguez à un prestataire si la charge devient trop lourde.",
        ],
      },
    ],
    related: [
      { href: '/employeurs/recruter-saisonniers-agricoles', label: 'Page : recruter des saisonniers agricoles' },
      { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre agricole qualifiée' },
      { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
      { href: '/blog/combien-coute-un-saisonnier-agricole', label: 'Combien coûte un saisonnier agricole ?' },
    ],
  },
  'combien-coute-un-saisonnier-agricole': {
    slug: 'combien-coute-un-saisonnier-agricole',
    metaTitle: 'Combien coûte un saisonnier agricole ? Repères 2026 Pickajob',
    metaDescription:
      "Combien coûte un saisonnier agricole ? Cadre légal, charges, logement, productivité : repères 2026 par Pickajob, prestataire agricole et viticole.",
    h1: 'Combien coûte un saisonnier agricole ? Repères 2026',
    intro: "Question simple, réponse à plusieurs niveaux. Le coût d’un saisonnier agricole dépend du cadre légal, des charges, du logement, et de la productivité réelle.",
    publishedAt: '2026-03-20',
    body: [
      {
        h2: 'Les composantes du coût',
        paragraphs: ['Le coût total d’un saisonnier intègre :'],
        bullets: [
          'Le salaire brut',
          'Les charges patronales',
          'Le logement (parfois)',
          'Le transport (parfois)',
          'Les coûts cachés : sourcing, encadrement, abandons',
        ],
      },
      {
        h2: 'Le coût comparé d’un prestataire agricole',
        paragraphs: [
          "Faire appel à un prestataire agricole comme Pickajob inclut tous ces coûts dans une prestation lisible. Vous achetez un service, pas un poste à gérer. Le coût peut sembler plus élevé en apparence, mais une fois intégrés sourcing, fiabilisation, logement, encadrement et abandons évités, le calcul s’équilibre — voire devient avantageux.",
        ],
      },
      {
        h2: 'Productivité : le facteur qui change tout',
        paragraphs: [
          "Une équipe qualifiée et briefée travaille plus vite et avec moins de pertes (raisin abîmé, fruits déclassés, calibre raté). C’est souvent le facteur qui justifie le passage par un prestataire agricole.",
        ],
      },
      {
        h2: 'Conclusion',
        paragraphs: [
          "Plutôt que de raisonner sur le seul coût horaire d’un saisonnier, raisonnez en coût complet : sourcing, fiabilisation, logement, productivité, abandons. La comparaison avec un prestataire agricole devient alors plus juste.",
        ],
      },
    ],
    related: [
      { href: '/employeurs/recruter-saisonniers-agricoles', label: 'Page : recruter saisonniers agricoles' },
      { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
      { href: '/blog/comment-recruter-des-saisonniers-agricoles', label: 'Comment recruter des saisonniers' },
      { href: '/devis', label: 'Demander un devis Pickajob' },
    ],
  },
  'ou-trouver-des-vendangeurs': {
    slug: 'ou-trouver-des-vendangeurs',
    metaTitle: 'Où trouver des vendangeurs fiables ? Guide 2026 Pickajob',
    metaDescription:
      "Où trouver des vendangeurs fiables en 2026 ? Sources, options, prestataires. Guide pratique signé Pickajob, prestataire viticole.",
    h1: 'Où trouver des vendangeurs fiables en 2026',
    intro: "Trouver des vendangeurs fiables est devenu un vrai défi. Voici les options qui s’offrent aux domaines, et comment Pickajob, prestataire viticole, peut soulager cette charge.",
    publishedAt: '2026-05-01',
    body: [
      {
        h2: 'Les options classiques (et leurs limites)',
        paragraphs: ['Les sources classiques pour trouver des vendangeurs :'],
        bullets: [
          'Le bouche-à-oreille local (limite : profils restreints)',
          'Les saisonniers fidélisés d’une année à l’autre (limite : abandon ou indisponibilité)',
          'Les annonces d’emploi (limite : tri, fiabilisation, logement à votre charge)',
          'Les groupements d’employeurs (limite : disponibilité)',
        ],
      },
      {
        h2: 'Le prestataire viticole : une réponse industrielle',
        paragraphs: [
          "Pickajob mobilise des équipes vendanges complètes (coupeurs, porteurs, chef d’équipe), avec logement organisé et briefing qualité. Le prestataire viticole est probablement la voie la plus solide pour un domaine qui doit sécuriser sa récolte sans surcharger sa cellule administrative.",
        ],
      },
      {
        h2: 'Comment évaluer un prestataire',
        paragraphs: ['Les bons critères :'],
        bullets: [
          'Qualité du briefing pré-mission',
          'Présence d’un chef d’équipe sur le chantier',
          'Capacité à gérer le logement',
          'Réactivité en cas d’imprévu',
          'Capacité de fidélisation des équipes',
        ],
      },
      {
        h2: 'Conclusion',
        paragraphs: [
          "La meilleure source de vendangeurs en 2026 est probablement un mix : profils fidélisés en interne + équipe Pickajob en renfort, surtout sur les pics de récolte.",
        ],
      },
    ],
    related: [
      { href: '/secteurs/vendanges', label: 'Page : équipe de vendangeurs' },
      { href: '/regions/champagne', label: 'Vendangeurs Champagne' },
      { href: '/regions/gironde', label: 'Main-d’œuvre viticole Gironde' },
      { href: '/blog/preparer-sa-saison-de-vendanges', label: 'Préparer ses vendanges' },
    ],
  },
  'comment-trouver-de-la-main-oeuvre-agricole': {
    slug: 'comment-trouver-de-la-main-oeuvre-agricole',
    metaTitle: 'Comment trouver de la main-d’œuvre agricole — guide pratique Pickajob',
    metaDescription:
      "Comment trouver de la main-d’œuvre agricole en 2026 : canaux, anticipation, prestation. Guide pratique de Pickajob, prestataire agricole et viticole.",
    h1: 'Comment trouver de la main-d’œuvre agricole en 2026',
    intro: "Trouver de la main-d’œuvre agricole en 2026 demande méthode et anticipation. Voici un guide complet par Pickajob, prestataire agricole et viticole.",
    publishedAt: '2026-04-05',
    body: [
      {
        h2: 'Les canaux pour trouver de la main-d’œuvre agricole',
        paragraphs: ['Plusieurs canaux existent :'],
        bullets: [
          'Sourcing local (bouche-à-oreille, agences d’emploi)',
          'Plateformes d’annonces',
          'Groupements d’employeurs',
          'Prestataires agricoles comme Pickajob',
        ],
      },
      {
        h2: 'Le bon mix selon votre exploitation',
        paragraphs: [
          "Le bon mix dépend de votre taille, de votre saisonnalité et de votre besoin de fiabilité. Un domaine qui doit absorber 50 vendangeurs en 10 jours n’a pas la même équation qu’un maraîcher qui cherche un renfort de 2 personnes pendant 3 semaines.",
        ],
      },
      {
        h2: 'Pourquoi externaliser à un prestataire',
        paragraphs: [
          "Externaliser une partie du sourcing à un prestataire agricole comme Pickajob libère du temps de pilotage, sécurise la production et limite les imprévus.",
        ],
      },
      {
        h2: 'Conclusion',
        paragraphs: [
          "Trouver de la main-d’œuvre agricole en 2026 = anticipation + diversification des canaux + recours à un prestataire pour les pics.",
        ],
      },
    ],
    related: [
      { href: '/employeurs/main-oeuvre-agricole', label: 'Page : main-d’œuvre agricole' },
      { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
      { href: '/blog/comment-recruter-des-saisonniers-agricoles', label: 'Comment recruter des saisonniers' },
      { href: '/devis', label: 'Demander un devis' },
    ],
  },
  'recruter-des-ouvriers-agricoles-etrangers': {
    slug: 'recruter-des-ouvriers-agricoles-etrangers',
    metaTitle: 'Recruter des ouvriers agricoles étrangers — guide Pickajob',
    metaDescription:
      "Recruter des ouvriers agricoles étrangers en 2026 : options, intégration, logement, prestation. Guide signé Pickajob, prestataire agricole et viticole.",
    h1: 'Recruter des ouvriers agricoles étrangers en 2026',
    intro: "Recruter des ouvriers agricoles étrangers peut sécuriser des saisons tendues. Voici un guide pratique par Pickajob.",
    publishedAt: '2026-02-12',
    body: [
      {
        h2: 'Pourquoi élargir aux profils étrangers',
        paragraphs: [
          "Le marché local n’est plus suffisant dans beaucoup de bassins de production. Les profils étrangers, souvent expérimentés, complètent utilement les équipes des exploitations.",
        ],
      },
      {
        h2: 'Les enjeux opérationnels',
        paragraphs: ['Les principales contraintes opérationnelles :'],
        bullets: [
          'Cadre légal et formalités',
          'Logement et logistique d’arrivée',
          'Communication / langues',
          'Encadrement sur place',
        ],
      },
      {
        h2: 'Pourquoi passer par un prestataire',
        paragraphs: [
          "Pickajob, prestataire agricole, simplifie l’opérationnel : nous mobilisons des profils que nous connaissons, avec logement, encadrement et chef d’équipe Pickajob. L’exploitation pilote son activité, nous prenons la complexité.",
        ],
      },
      {
        h2: 'Conclusion',
        paragraphs: [
          "Recruter des ouvriers agricoles étrangers est une option pertinente pour les pics, à condition de bien gérer l’opérationnel — c’est ce que Pickajob prend en charge.",
        ],
      },
    ],
    related: [
      { href: '/employeurs/main-oeuvre-etrangere-agriculture', label: 'Page : main-d’œuvre étrangère agricole' },
      { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
      { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
      { href: '/devis', label: 'Demander un devis' },
    ],
  },
  'preparer-sa-saison-de-vendanges': {
    slug: 'preparer-sa-saison-de-vendanges',
    metaTitle: 'Préparer sa saison de vendanges : checklist Pickajob',
    metaDescription:
      "Préparer sa saison de vendanges en 2026 : checklist équipe, logement, logistique, qualité. Guide Pickajob, prestataire viticole.",
    h1: 'Préparer sa saison de vendanges : la checklist',
    intro: "La saison de vendanges se prépare des mois à l’avance. Voici une checklist pratique par Pickajob, prestataire viticole.",
    publishedAt: '2026-05-02',
    body: [
      {
        h2: 'Anticiper l’équipe',
        paragraphs: ['L’équipe est le premier sujet à sécuriser :'],
        bullets: [
          'Estimer la taille de l’équipe (selon la surface et la cadence)',
          'Sécuriser un chef d’équipe',
          'Identifier les profils clés (coupeurs expérimentés, porteurs)',
          'Sécuriser un prestataire viticole en backup',
        ],
      },
      {
        h2: 'Anticiper le logement',
        paragraphs: [
          "En Champagne ou en Gironde, le logement vendanges est très tendu. Anticipez plusieurs mois à l’avance, ou faites-le organiser par un prestataire comme Pickajob.",
        ],
      },
      {
        h2: 'Anticiper la logistique',
        paragraphs: ['Les éléments clés :'],
        bullets: [
          'Bacs et caisses en quantité suffisante',
          'Transport vigne → cave',
          'Encadrement de la cadence',
          'Tri à la vigne',
        ],
      },
      {
        h2: 'Sécuriser la qualité',
        paragraphs: [
          "Une équipe briefée sur le tri et la cadence garantit la qualité. C’est l’un des grands apports d’un prestataire viticole comme Pickajob.",
        ],
      },
      {
        h2: 'Conclusion',
        paragraphs: [
          "Une saison de vendanges réussie commence plusieurs mois avant la récolte. Anticipez votre équipe, votre logement, votre logistique — et appuyez-vous sur Pickajob pour les renforts.",
        ],
      },
    ],
    related: [
      { href: '/secteurs/vendanges', label: 'Page : équipe de vendangeurs' },
      { href: '/secteurs/viticulture', label: 'Page : prestation viticulture' },
      { href: '/regions/champagne', label: 'Vendangeurs Champagne' },
      { href: '/regions/gironde', label: 'Main-d’œuvre viticole Gironde' },
    ],
  },
};
