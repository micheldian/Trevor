import type { CandidateLandingProps } from '@/components/CandidateLandingTemplate';

type IntlKey = 'australie' | 'canada' | 'nouvelle-zelande';

type IntlContent = {
  slug: IntlKey;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  data: Omit<CandidateLandingProps, 'breadcrumb'>;
};

export const INTL_CONTENT: Record<IntlKey, IntlContent> = {
  australie: {
    slug: 'australie',
    metaTitle: 'Travail agricole Australie : guide pratique Pickajob',
    metaDescription:
      "Travail agricole en Australie : visa, régions, salaires, conseils pratiques. Pickajob, prestataire agricole, vous oriente avant ou après l’expérience australienne.",
    keywords: ['travail agricole Australie', 'farm jobs Australia', 'PVT Australie agricole'],
    data: {
      h1: 'Travail agricole en Australie : guide pratique',
      intro: "L’Australie reste l’une des destinations phares du travail agricole pour les voyageurs. Pickajob fait le point sur les visas, les régions, les types de missions et les bonnes pratiques.",
      bullets: [
        'Visa Working Holiday (PVT)',
        'Régions agricoles principales',
        'Conseils pratiques',
        'Retour en France : rejoignez Pickajob',
      ],
      sections: [
        {
          h2: 'Pourquoi l’Australie attire pour le travail agricole',
          paragraphs: [
            "L’Australie combine de hauts salaires horaires, des fermes très organisées, et un visa adapté aux jeunes voyageurs (Working Holiday Visa). C’est l’un des chemins les plus rapides pour cumuler une expérience agricole internationale.",
          ],
        },
        {
          h2: 'Le visa Working Holiday',
          paragraphs: [
            "Le Working Holiday Visa permet aux jeunes voyageurs de travailler en Australie. Travailler dans une ferme permet, sous certaines conditions, d’obtenir une seconde année de visa. Vérifiez toujours les conditions à jour sur les sources officielles australiennes.",
          ],
        },
        {
          h2: 'Régions agricoles principales',
          paragraphs: ['Les principales régions agricoles australiennes sont :'],
          bullets: [
            'Queensland (cueillette de fruits)',
            'New South Wales (vergers, vignobles)',
            'Victoria (vignobles, fruits, légumes)',
            'South Australia (vignobles)',
            'Western Australia (céréales, fruits)',
            'Tasmania (fruits)',
          ],
        },
        {
          h2: 'Conseils pratiques',
          paragraphs: [
            "Préparez votre départ : compte bancaire local, TFN (Tax File Number), choix de la région selon la saison, vérification des employeurs (lutte contre les fermes peu sérieuses), assurance santé. Documentez-vous via les sources officielles et les communautés de voyageurs.",
          ],
        },
        {
          h2: 'Retour en France : rejoignez Pickajob',
          paragraphs: [
            "Si vous avez une expérience agricole internationale et cherchez un cadre pour la valoriser à votre retour en France, rejoignez Pickajob. Nous mobilisons des profils expérimentés sur des missions agricoles et viticoles partout en France.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils internationaux', description: 'Pickajob valorise les expériences à l’étranger.' },
        { title: 'Logement', description: 'Hébergement organisé sur la majorité des missions.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le terrain.' },
        { title: 'Variété', description: 'Vendanges, cueillette, maraîchage, conditionnement, serres.' },
        { title: 'Continuité', description: 'Enchaînez les missions de saison en saison.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
      ],
      faq: [
        { q: 'Pickajob organise-t-il le départ en Australie ?', a: 'Non, c’est un guide informatif. Pour la France, Pickajob mobilise ses propres équipes.' },
        { q: 'Une expérience australienne aide-t-elle pour Pickajob ?', a: 'Oui, c’est un vrai plus côté expérience.' },
        { q: 'Combien de temps pour un PVT Australie ?', a: 'Généralement 12 mois renouvelable selon conditions.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/international/travail-agricole-canada', label: 'Farm jobs Canada' },
          { href: '/international/travail-agricole-nouvelle-zelande', label: 'Farm jobs New Zealand' },
          { href: '/candidats', label: 'Rejoindre Pickajob en France' },
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
        ],
      },
    },
  },
  canada: {
    slug: 'canada',
    metaTitle: 'Farm jobs Canada : guide pratique Pickajob',
    metaDescription:
      "Farm jobs Canada : visas, régions, types de missions agricoles. Pickajob vous oriente avant ou après votre expérience canadienne.",
    keywords: ['farm jobs Canada', 'travail agricole Canada', 'PVT Canada ferme'],
    data: {
      h1: 'Farm jobs Canada : guide pratique',
      intro: "Le Canada offre des opportunités agricoles dans des grandes plaines céréalières et des bassins fruitiers (Ontario, Colombie-Britannique, Québec). Pickajob fait le point.",
      bullets: [
        'Visa Working Holiday (EIC)',
        'Régions agricoles principales',
        'Conseils pratiques',
        'Retour en France : rejoignez Pickajob',
      ],
      sections: [
        {
          h2: 'Pourquoi le Canada pour un travail agricole',
          paragraphs: [
            "Le Canada attire les profils agricoles internationaux pour ses fermes structurées, ses bassins fruitiers (vallée de l’Okanagan), et son cadre légal clair pour les saisonniers.",
          ],
        },
        {
          h2: 'Visas',
          paragraphs: [
            "Le Programme Expérience Internationale Canada (EIC) inclut un volet Working Holiday accessible aux jeunes voyageurs. Vérifiez toujours les conditions à jour sur les sources officielles canadiennes.",
          ],
        },
        {
          h2: 'Régions agricoles principales',
          paragraphs: ['Les régions clés pour le travail agricole au Canada :'],
          bullets: [
            'Colombie-Britannique (vergers, vignobles)',
            'Ontario (vergers, maraîchage)',
            'Québec (maraîchage, vergers)',
            'Provinces des Prairies (céréales)',
            'Nouvelle-Écosse (fruits)',
          ],
        },
        {
          h2: 'Conseils pratiques',
          paragraphs: [
            "Anticipez : visa, billet, assurance, hébergement, choix de la province. Documentez-vous via les sources officielles et les communautés.",
          ],
        },
        {
          h2: 'Retour en France',
          paragraphs: [
            "Au retour, valorisez votre expérience auprès de Pickajob, prestataire agricole et viticole en France. Les profils ayant travaillé à l’étranger sont appréciés.",
          ],
        },
      ],
      whyItems: [
        { title: 'Expérience valorisée', description: 'Pickajob apprécie les profils internationaux.' },
        { title: 'Missions variées', description: 'Vendanges, cueillette, maraîchage, conditionnement.' },
        { title: 'Logement organisé', description: 'Sur la majorité des missions saisonnières.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le terrain.' },
        { title: 'Continuité', description: 'Possibilité d’enchaîner plusieurs missions.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
      ],
      faq: [
        { q: 'Pickajob organise-t-il le départ au Canada ?', a: 'Non, c’est un guide informatif.' },
        { q: 'Une expérience canadienne aide pour Pickajob ?', a: 'Oui, c’est un atout.' },
        { q: 'Quels visas pour travailler dans une ferme au Canada ?', a: 'Programmes EIC / Working Holiday selon conditions.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/international/travail-agricole-australie', label: 'Travail agricole Australie' },
          { href: '/international/travail-agricole-nouvelle-zelande', label: 'Farm jobs New Zealand' },
          { href: '/candidats', label: 'Rejoindre Pickajob en France' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
        ],
      },
    },
  },
  'nouvelle-zelande': {
    slug: 'nouvelle-zelande',
    metaTitle: 'Farm jobs New Zealand : guide pratique Pickajob',
    metaDescription:
      "Farm jobs New Zealand : Working Holiday Visa, régions agricoles (kiwis, vignobles), conseils. Pickajob vous oriente avant ou après l’expérience.",
    keywords: ['farm jobs New Zealand', 'travail agricole Nouvelle-Zélande', 'PVT Nouvelle-Zélande'],
    data: {
      h1: 'Farm jobs New Zealand : guide pratique',
      intro: "La Nouvelle-Zélande propose des opportunités fortes en arboriculture (kiwi notamment) et en viticulture. Pickajob fait le point sur les visas et les régions.",
      bullets: [
        'Visa Working Holiday',
        'Régions agricoles principales',
        'Conseils pratiques',
        'Retour en France : rejoignez Pickajob',
      ],
      sections: [
        {
          h2: 'Pourquoi la Nouvelle-Zélande',
          paragraphs: [
            "La Nouvelle-Zélande est connue pour son arboriculture (kiwis dans la région de Tauranga, pommes à Hawke’s Bay), ses vignobles (Marlborough), et ses fermes très structurées.",
          ],
        },
        {
          h2: 'Visa',
          paragraphs: [
            "Le Working Holiday Visa permet aux jeunes voyageurs de travailler dans des fermes néo-zélandaises. Vérifiez toujours les conditions à jour sur les sources officielles.",
          ],
        },
        {
          h2: 'Régions agricoles principales',
          paragraphs: ['Les régions clés :'],
          bullets: [
            'Bay of Plenty (kiwis)',
            'Hawke’s Bay (pommes, vignobles)',
            'Marlborough (vignobles)',
            'Otago (fruits, vignobles)',
            'Nelson (fruits, houblon)',
          ],
        },
        {
          h2: 'Conseils pratiques',
          paragraphs: [
            "Préparez bien votre arrivée : visa, hébergement, choix de la saison (hémisphère sud), repérage des fermes sérieuses.",
          ],
        },
        {
          h2: 'Retour en France',
          paragraphs: [
            "Une expérience néo-zélandaise est très appréciée sur les missions Pickajob (cueillette, vendanges, maraîchage).",
          ],
        },
      ],
      whyItems: [
        { title: 'Expérience valorisée', description: 'Pickajob apprécie les profils internationaux.' },
        { title: 'Missions variées', description: 'Cueillette, vendanges, maraîchage, conditionnement.' },
        { title: 'Logement organisé', description: 'Sur la majorité des missions saisonnières.' },
        { title: 'Encadrement', description: 'Un chef d’équipe Pickajob sur le terrain.' },
        { title: 'Continuité', description: 'Possibilité d’enchaîner plusieurs missions.' },
        { title: 'Référent', description: 'Un interlocuteur Pickajob pour vos questions.' },
      ],
      faq: [
        { q: 'Pickajob organise-t-il le départ en Nouvelle-Zélande ?', a: 'Non, ce guide est purement informatif.' },
        { q: 'Faut-il un visa spécifique ?', a: 'Oui, généralement le Working Holiday Visa.' },
        { q: 'Quelle saison de récolte ?', a: 'Hémisphère sud : la haute saison correspond à notre hiver.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/international/travail-agricole-australie', label: 'Travail agricole Australie' },
          { href: '/international/travail-agricole-canada', label: 'Farm jobs Canada' },
          { href: '/candidats', label: 'Rejoindre Pickajob en France' },
          { href: '/candidats/vendanges', label: 'Travailler dans les vendanges' },
          { href: '/candidats/cueillette-fruits', label: 'Travail cueillette fruits' },
          { href: '/candidats/travail-agricole-loge', label: 'Travail agricole logé' },
        ],
      },
    },
  },
};
