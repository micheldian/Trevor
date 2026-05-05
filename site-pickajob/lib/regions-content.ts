import type { LandingProps } from '@/components/SeoLandingTemplate';

type RegionKey =
  | 'nouvelle-aquitaine'
  | 'gironde'
  | 'champagne'
  | 'bourgogne'
  | 'occitanie'
  | 'provence-alpes-cote-d-azur';

type RegionContent = {
  slug: RegionKey;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  formCulture?: string;
  data: Omit<LandingProps, 'breadcrumb'>;
};

export const REGION_CONTENT: Record<RegionKey, RegionContent> = {
  'nouvelle-aquitaine': {
    slug: 'nouvelle-aquitaine',
    metaTitle: 'Main-d’œuvre agricole Nouvelle-Aquitaine — Pickajob, prestataire',
    metaDescription:
      "Pickajob mobilise une main-d’œuvre agricole en Nouvelle-Aquitaine pour viticulture, arboriculture, maraîchage et conditionnement. Bordeaux, Charentes, Limousin, Pays Basque.",
    keywords: ['main d’œuvre agricole Nouvelle-Aquitaine', 'prestataire agricole Nouvelle-Aquitaine'],
    formCulture: 'Nouvelle-Aquitaine',
    data: {
      h1: 'Main-d’œuvre agricole en Nouvelle-Aquitaine : Pickajob, prestataire régional',
      intro: "Pickajob, prestataire agricole et viticole, mobilise des équipes qualifiées en Nouvelle-Aquitaine : viticulture en Gironde, arboriculture en Lot-et-Garonne, maraîchage en Charentes, conditionnement en coopératives.",
      bullets: [
        'Équipes locales et mobiles',
        'Viticulture, arboriculture, maraîchage',
        'Logement organisé selon le besoin',
        'Toute la Nouvelle-Aquitaine',
      ],
      sections: [
        {
          h2: 'La Nouvelle-Aquitaine, première région agricole de France',
          paragraphs: [
            "La Nouvelle-Aquitaine est la première région agricole française par sa surface et la diversité de ses productions : vignobles bordelais et charentais, vergers du Lot-et-Garonne et de la Dordogne, maraîchage charentais, productions sous serre. Cette diversité crée des besoins de main-d’œuvre denses et étalés sur l’année.",
          ],
        },
        {
          h2: 'Sur quels travaux Pickajob intervient en Nouvelle-Aquitaine',
          paragraphs: ['Pickajob mobilise des équipes en Nouvelle-Aquitaine pour :'],
          bullets: [
            'Vendanges et taille de vigne (Bordelais, Cognac, Bergeracois)',
            'Cueillette de fruits (pommes, poires, fraises, kiwi)',
            'Maraîchage en plein champ et sous serre',
            'Conditionnement en coopératives et stations',
          ],
        },
        {
          h2: 'Une mobilisation rapide en région',
          paragraphs: [
            "Pickajob mobilise des équipes locales et mobiles, capables d’intervenir vite en Gironde, Dordogne, Lot-et-Garonne, Charente, Charente-Maritime, Pyrénées-Atlantiques.",
          ],
        },
        {
          h2: 'Pourquoi passer par Pickajob en Nouvelle-Aquitaine',
          paragraphs: [
            "La pression sur la main-d’œuvre est forte dans la région. Passer par Pickajob, c’est sécuriser un volant d’équipes qualifiées, en évitant la course aux saisonniers en pleine saison.",
          ],
        },
      ],
      whyItems: [
        { title: 'Couverture régionale', description: 'Toute la Nouvelle-Aquitaine, des vignobles aux vergers.' },
        { title: 'Profils qualifiés', description: 'Vendangeurs, tailleurs, cueilleurs, opérateurs station.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible.' },
        { title: 'Souplesse', description: 'Renforts ponctuels ou équipes complètes.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic de saison.' },
      ],
      faq: [
        { q: 'Pickajob intervient à Bordeaux ?', a: 'Oui, et plus largement en Gironde. Voir notre page dédiée Gironde.' },
        { q: 'Pickajob intervient en Charentes pour Cognac ?', a: 'Oui, notamment sur les vendanges et la taille.' },
        { q: 'Pickajob intervient pour la fraise du Lot-et-Garonne ?', a: 'Oui, en serre comme en plein champ.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/regions/gironde', label: 'Main-d’œuvre viticole Gironde' },
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/arboriculture', label: 'Cueillette de fruits' },
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/secteurs/conditionnement', label: 'Conditionnement' },
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
        ],
      },
    },
  },
  gironde: {
    slug: 'gironde',
    metaTitle: 'Main-d’œuvre viticole Gironde — Pickajob, prestataire viticole',
    metaDescription:
      "Pickajob mobilise une main-d’œuvre viticole en Gironde : vendanges, taille, palissage, ébourgeonnage. Châteaux, domaines et coopératives bordelaises.",
    keywords: ['main d’œuvre viticole Gironde', 'vendangeurs Gironde', 'prestataire viticole Bordeaux'],
    formCulture: 'Viticulture Gironde',
    data: {
      h1: 'Main-d’œuvre viticole Gironde : Pickajob, prestataire viticole',
      intro: "Pickajob mobilise une main-d’œuvre viticole qualifiée en Gironde pour les châteaux, domaines et coopératives bordelaises : vendanges, taille de vigne, palissage, ébourgeonnage.",
      bullets: [
        'Profils habitués aux exigences bordelaises',
        'Équipes vendanges complètes',
        'Logement organisé selon le besoin',
        'Tous les terroirs girondins',
      ],
      sections: [
        {
          h2: 'Une main-d’œuvre viticole pour le vignoble bordelais',
          paragraphs: [
            "La Gironde concentre une grande partie de la viticulture française. Les domaines bordelais ont des exigences fortes en matière de tri à la vigne et de qualité de récolte. Pickajob mobilise des équipes briefées sur ces exigences, capables de respecter les standards des grands châteaux comme des domaines familiaux.",
          ],
        },
        {
          h2: 'Pour quels travaux en Gironde ?',
          paragraphs: ['Pickajob mobilise des profils qualifiés pour :'],
          bullets: [
            'Vendanges manuelles (équipes complètes)',
            'Taille de vigne (Guyot, Cordon)',
            'Tirage des bois et brûlage',
            'Ébourgeonnage et épamprage',
            'Palissage et relevage',
            'Effeuillage et vendange en vert',
          ],
        },
        {
          h2: 'Une couverture sur tout le département',
          paragraphs: [
            "Pickajob intervient sur toutes les appellations girondines : Médoc, Saint-Émilion, Pomerol, Graves, Sauternes, Entre-deux-Mers, Côtes de Bordeaux. Les équipes sont mobiles selon les besoins.",
          ],
        },
        {
          h2: 'Anticipation et urgence',
          paragraphs: [
            "Plus la demande est anticipée, mieux Pickajob constitue l’équipe. Mais nous prenons aussi les urgences (avancement de récolte, météo, absence en équipe).",
          ],
        },
      ],
      whyItems: [
        { title: 'Vignoble bordelais', description: 'Profils briefés sur les standards locaux.' },
        { title: 'Équipes vendanges', description: 'Coupeurs, porteurs, chef d’équipe.' },
        { title: 'Toute la Gironde', description: 'De Saint-Émilion au Médoc, de Sauternes à l’Entre-deux-Mers.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic de saison.' },
      ],
      faq: [
        { q: 'Pickajob intervient à Saint-Émilion ?', a: 'Oui, comme dans tous les terroirs girondins.' },
        { q: 'Pickajob fournit un chef d’équipe ?', a: 'Oui, sur les missions qui le justifient.' },
        { q: 'Délai pour mobiliser une équipe en Gironde ?', a: 'L’idéal est plusieurs semaines, mais nous prenons aussi les urgences.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/regions/nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
          { href: '/blog/preparer-sa-saison-de-vendanges', label: 'Article : préparer ses vendanges' },
        ],
      },
    },
  },
  champagne: {
    slug: 'champagne',
    metaTitle: 'Vendangeurs Champagne — Pickajob, prestataire viticole',
    metaDescription:
      "Pickajob mobilise des équipes de vendangeurs en Champagne : récolte manuelle obligatoire, qualité du tri, encadrement. Maisons, coopératives et vignerons indépendants.",
    keywords: ['vendangeurs Champagne', 'main d’œuvre viticole Champagne', 'prestataire vendanges Champagne'],
    formCulture: 'Viticulture Champagne',
    data: {
      h1: 'Vendangeurs Champagne : Pickajob mobilise des équipes pour la récolte',
      intro: "Pickajob mobilise des équipes de vendangeurs qualifiés en Champagne, pour les maisons, coopératives et vignerons indépendants. La récolte manuelle obligatoire en Champagne demande une organisation de main-d’œuvre exemplaire : c’est notre métier.",
      bullets: [
        'Vendanges manuelles, exigence Champagne',
        'Équipes complètes (coupeurs, porteurs, chef d’équipe)',
        'Logement organisé',
        'Côte des Blancs, Montagne de Reims, Vallée de la Marne',
      ],
      sections: [
        {
          h2: 'La spécificité des vendanges en Champagne',
          paragraphs: [
            "En Champagne, la récolte est obligatoirement manuelle pour préserver la qualité du raisin et permettre un pressurage rigoureux. Cela impose une mobilisation massive de vendangeurs sur quelques jours de récolte. Pickajob est conçu pour répondre exactement à cette exigence.",
          ],
        },
        {
          h2: 'Comment Pickajob organise la récolte en Champagne',
          paragraphs: ['Pickajob compose des équipes adaptées à la Champagne :'],
          bullets: [
            'Coupeurs expérimentés (cadence et tri)',
            'Porteurs robustes',
            'Chef d’équipe Pickajob sur le chantier',
            'Logement organisé près du domaine',
            'Référent Pickajob disponible pendant la récolte',
          ],
        },
        {
          h2: 'Une couverture sur toute la Champagne viticole',
          paragraphs: [
            "Pickajob intervient sur les principales sous-régions : Côte des Blancs, Montagne de Reims, Vallée de la Marne, Côte des Bar.",
          ],
        },
        {
          h2: 'Anticiper sa récolte en Champagne',
          paragraphs: [
            "La récolte en Champagne se joue à quelques jours près. L’anticipation est essentielle : plus la demande est anticipée, mieux Pickajob peut constituer une équipe stable et adaptée à votre exploitation.",
          ],
        },
      ],
      whyItems: [
        { title: 'Spécificité Champagne', description: 'Profils briefés sur les exigences locales.' },
        { title: 'Logement', description: 'Hébergement organisé près du domaine.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob sur le chantier.' },
        { title: 'Réactivité', description: 'Mobilisation rapide selon maturité et météo.' },
        { title: 'Qualité', description: 'Tri à la vigne respecté.' },
        { title: 'Toute la Champagne', description: 'Côte des Blancs, Montagne de Reims, Vallée de la Marne, Côte des Bar.' },
      ],
      faq: [
        { q: 'Pickajob s’occupe-t-il du logement en Champagne ?', a: 'Oui, c’est un point clé en Champagne où le logement est rare en pleine vendange.' },
        { q: 'Quelle taille d’équipe Pickajob mobilise ?', a: 'De quelques renforts à plusieurs dizaines de vendangeurs avec encadrement.' },
        { q: 'Délai pour préparer la récolte ?', a: 'Anticipez plusieurs semaines à l’avance — Pickajob accepte aussi les urgences.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/regions/bourgogne', label: 'Main-d’œuvre viticole Bourgogne' },
          { href: '/employeurs/main-oeuvre-etrangere-agriculture', label: 'Main-d’œuvre étrangère' },
          { href: '/blog/ou-trouver-des-vendangeurs', label: 'Article : où trouver des vendangeurs' },
          { href: '/blog/preparer-sa-saison-de-vendanges', label: 'Article : préparer ses vendanges' },
        ],
      },
    },
  },
  bourgogne: {
    slug: 'bourgogne',
    metaTitle: 'Main-d’œuvre viticole Bourgogne — Pickajob, prestataire viticole',
    metaDescription:
      "Pickajob mobilise une main-d’œuvre viticole en Bourgogne : vendanges, taille, ébourgeonnage. Côte de Nuits, Côte de Beaune, Mâconnais, Chablisien.",
    keywords: ['main d’œuvre viticole Bourgogne', 'vendangeurs Bourgogne', 'prestataire viticole Bourgogne'],
    formCulture: 'Viticulture Bourgogne',
    data: {
      h1: 'Main-d’œuvre viticole Bourgogne : Pickajob, prestataire viticole',
      intro: "Pickajob mobilise une main-d’œuvre viticole qualifiée en Bourgogne pour vendanges, taille, ébourgeonnage et palissage, des grands climats aux domaines familiaux.",
      bullets: [
        'Profils habitués aux climats bourguignons',
        'Équipes vendanges complètes',
        'Logement organisé',
        'Côte de Nuits, Côte de Beaune, Mâconnais, Chablis',
      ],
      sections: [
        {
          h2: 'Une main-d’œuvre viticole pour la Bourgogne',
          paragraphs: [
            "Le vignoble bourguignon est exigeant : parcellaire morcelé, climats prestigieux, pratiques manuelles. Pickajob mobilise des équipes adaptées à cette exigence.",
          ],
        },
        {
          h2: 'Travaux couverts',
          paragraphs: ['Pickajob couvre l’ensemble du calendrier viticole en Bourgogne :'],
          bullets: [
            'Taille de vigne',
            'Ébourgeonnage',
            'Palissage',
            'Effeuillage',
            'Vendanges manuelles',
            'Tri',
          ],
        },
        {
          h2: 'Couverture régionale',
          paragraphs: ["Pickajob intervient sur la Côte de Nuits, la Côte de Beaune, le Mâconnais et le Chablisien."],
        },
        {
          h2: 'Anticipation',
          paragraphs: [
            "La Bourgogne demande une vraie anticipation : la maturité avance vite, et les domaines exigent une équipe stable. Pickajob est votre partenaire pour sécuriser cette saison.",
          ],
        },
      ],
      whyItems: [
        { title: 'Spécificité Bourgogne', description: 'Profils briefés sur les climats et exigences locales.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible.' },
        { title: 'Souplesse', description: 'Renforts ou équipes complètes.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic de saison.' },
        { title: 'Toute la Bourgogne', description: 'Côte de Nuits, Côte de Beaune, Mâconnais, Chablis.' },
      ],
      faq: [
        { q: 'Pickajob intervient sur la Côte de Beaune ?', a: 'Oui, comme sur toute la Bourgogne viticole.' },
        { q: 'Pickajob fournit un chef d’équipe ?', a: 'Oui, sur les missions importantes.' },
        { q: 'Logement organisé ?', a: 'Oui, lorsque la mission le justifie.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/regions/champagne', label: 'Vendangeurs Champagne' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/blog/preparer-sa-saison-de-vendanges', label: 'Article : préparer ses vendanges' },
        ],
      },
    },
  },
  occitanie: {
    slug: 'occitanie',
    metaTitle: 'Saisonniers agricoles Occitanie — Pickajob, prestataire agricole',
    metaDescription:
      "Pickajob mobilise des saisonniers agricoles en Occitanie : viticulture Languedoc-Roussillon, arboriculture Tarn-et-Garonne, maraîchage, conditionnement.",
    keywords: ['saisonniers agricoles Occitanie', 'main d’œuvre agricole Occitanie', 'prestataire agricole Occitanie'],
    formCulture: 'Occitanie',
    data: {
      h1: 'Saisonniers agricoles en Occitanie : Pickajob, prestataire régional',
      intro: "Pickajob mobilise des saisonniers agricoles en Occitanie pour la viticulture (Languedoc-Roussillon), l’arboriculture (Tarn-et-Garonne), le maraîchage et les stations de conditionnement.",
      bullets: [
        'Saisonniers qualifiés Occitanie',
        'Viticulture, fruits, maraîchage, conditionnement',
        'Logement organisé selon besoin',
        'Toute la région',
      ],
      sections: [
        {
          h2: 'L’Occitanie, une région agricole majeure',
          paragraphs: [
            "L’Occitanie est l’une des régions agricoles majeures de France : premier vignoble de France en volume avec le Languedoc-Roussillon, arboriculture forte en Tarn-et-Garonne (pommes, prunes, pêches), maraîchage, élevage. Cette diversité crée des besoins de saisonniers étalés dans l’année.",
          ],
        },
        {
          h2: 'Pour quels travaux en Occitanie',
          paragraphs: ['Pickajob mobilise des équipes en Occitanie pour :'],
          bullets: [
            'Vendanges et taille de vigne (Languedoc, Roussillon, Sud-Ouest)',
            'Cueillette de fruits (pommes, prunes, raisin de table)',
            'Maraîchage en plein champ et sous serre',
            'Conditionnement en stations et coopératives',
          ],
        },
        {
          h2: 'Couverture régionale',
          paragraphs: [
            "Pickajob intervient dans tous les départements de l’Occitanie : Hérault, Aude, Gard, Pyrénées-Orientales, Tarn-et-Garonne, Tarn, Haute-Garonne, Aveyron…",
          ],
        },
        {
          h2: 'Anticiper sa saison en Occitanie',
          paragraphs: [
            "La saison agricole est tendue en Occitanie : pic vendanges, pic récolte fruits, pression sur les saisonniers. Anticiper avec Pickajob, c’est sécuriser sa saison.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils Occitanie', description: 'Saisonniers habitués à la diversité régionale.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible.' },
        { title: 'Souplesse', description: 'Renforts ou équipes complètes.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic de saison.' },
        { title: 'Toute la région', description: 'De Perpignan à Toulouse en passant par Montpellier.' },
      ],
      faq: [
        { q: 'Pickajob intervient pour le Languedoc viticole ?', a: 'Oui, sur l’ensemble du vignoble.' },
        { q: 'Pickajob intervient pour les vergers du Tarn-et-Garonne ?', a: 'Oui, avec des cueilleurs expérimentés.' },
        { q: 'Pickajob fournit aussi du conditionnement ?', a: 'Oui, voir notre page Conditionnement.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/arboriculture', label: 'Cueillette de fruits' },
          { href: '/secteurs/conditionnement', label: 'Conditionnement' },
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
          { href: '/regions/provence-alpes-cote-d-azur', label: 'Saisonniers PACA' },
        ],
      },
    },
  },
  'provence-alpes-cote-d-azur': {
    slug: 'provence-alpes-cote-d-azur',
    metaTitle: 'Ouvriers agricoles PACA — Pickajob, prestataire agricole',
    metaDescription:
      "Pickajob mobilise des ouvriers agricoles en PACA : maraîchage de Provence, arboriculture Vallée du Rhône, viticulture Côtes du Rhône et Provence.",
    keywords: ['ouvriers agricoles PACA', 'main d’œuvre agricole PACA', 'prestataire agricole Provence'],
    formCulture: 'PACA',
    data: {
      h1: 'Ouvriers agricoles en PACA : Pickajob, prestataire en Provence-Alpes-Côte d’Azur',
      intro: "Pickajob mobilise des ouvriers agricoles en PACA pour le maraîchage de Provence, l’arboriculture Vallée du Rhône, la viticulture Côtes du Rhône et Provence.",
      bullets: [
        'Profils qualifiés PACA',
        'Maraîchage, fruits, vigne',
        'Logement organisé selon besoin',
        'Toute la région PACA',
      ],
      sections: [
        {
          h2: 'PACA : une région agricole intense',
          paragraphs: [
            "La PACA combine maraîchage de pleine saison (tomates, courgettes, melons), arboriculture en Vallée du Rhône, et viticulture (Côtes du Rhône, Provence). Cette intensité crée des besoins de main-d’œuvre étalés sur l’année et des pics importants.",
          ],
        },
        {
          h2: 'Pour quels travaux en PACA',
          paragraphs: ['Pickajob mobilise des ouvriers agricoles en PACA pour :'],
          bullets: [
            'Maraîchage (Bouches-du-Rhône, Vaucluse, Var)',
            'Arboriculture (pommes, poires, abricots, cerises, pêches)',
            'Vendanges et taille (Côtes du Rhône, Provence)',
            'Conditionnement et stations',
          ],
        },
        {
          h2: 'Couverture régionale',
          paragraphs: [
            "Pickajob intervient en Vaucluse, Bouches-du-Rhône, Var, Alpes-Maritimes, Alpes-de-Haute-Provence, Hautes-Alpes.",
          ],
        },
        {
          h2: 'Anticiper sa saison en PACA',
          paragraphs: [
            "Anticipez votre saison PACA avec Pickajob : la pression sur les saisonniers y est forte, et l’anticipation reste votre meilleur allié.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils PACA', description: 'Saisonniers habitués au climat et aux cadences.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible.' },
        { title: 'Souplesse', description: 'Renforts ou équipes complètes.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic de saison.' },
        { title: 'Toute la région', description: 'Du Vaucluse au Var, en passant par les Bouches-du-Rhône.' },
      ],
      faq: [
        { q: 'Pickajob intervient pour la Vallée du Rhône arboricole ?', a: 'Oui, avec des cueilleurs expérimentés.' },
        { q: 'Pickajob intervient pour les vendanges des Côtes du Rhône ?', a: 'Oui, équipes vendanges complètes.' },
        { q: 'Pickajob intervient pour le maraîchage de Provence ?', a: 'Oui, plein champ et serre.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/secteurs/arboriculture', label: 'Cueillette de fruits' },
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/secteurs/serres', label: 'Travaux en serre' },
          { href: '/regions/occitanie', label: 'Saisonniers Occitanie' },
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
        ],
      },
    },
  },
};
