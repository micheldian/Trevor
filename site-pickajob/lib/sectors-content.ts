import type { LandingProps } from '@/components/SeoLandingTemplate';

type SectorKey = 'viticulture' | 'vendanges' | 'arboriculture' | 'maraichage' | 'conditionnement' | 'serres';

type SectorContent = {
  slug: SectorKey;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  formCulture: string;
  data: Omit<LandingProps, 'breadcrumb'>;
};

export const SECTOR_CONTENT: Record<SectorKey, SectorContent> = {
  viticulture: {
    slug: 'viticulture',
    metaTitle: 'Main-d’œuvre viticole — Pickajob, prestataire viticole en France',
    metaDescription:
      "Pickajob, prestataire viticole, mobilise une main-d’œuvre viticole qualifiée pour vendanges, taille, palissage, ébourgeonnage. Intervention dans tous les vignobles français.",
    keywords: ['main d’œuvre viticole', 'prestataire viticole', 'main d’œuvre vigne'],
    formCulture: 'Viticulture',
    data: {
      h1: 'Main-d’œuvre viticole : Pickajob, prestataire viticole en France',
      intro: "Pickajob est un prestataire viticole : nous mobilisons une main-d’œuvre viticole qualifiée et notre expertise terrain pour vos vendanges, votre taille de vigne, votre palissage et tous vos travaux viticoles, partout en France.",
      bullets: [
        'Tailleurs et vendangeurs expérimentés',
        'Encadrement par chef d’équipe Pickajob',
        'Logement et logistique organisés',
        'Tous les vignobles français',
      ],
      sections: [
        {
          h2: 'Une main-d’œuvre viticole pensée pour les domaines',
          paragraphs: [
            "La viticulture exige une main-d’œuvre qualifiée, capable de respecter une cadence et une qualité de travail. Pickajob mobilise des profils expérimentés sur l’ensemble du cycle viticole : taille de vigne (Guyot, Cordon de Royat), ébourgeonnage, palissage, relevage, vendanges en vert, vendanges, tri… Nous intervenons aussi bien sur les domaines familiaux que sur les châteaux et coopératives.",
          ],
        },
        {
          h2: 'Sur quels travaux viticoles intervient Pickajob ?',
          paragraphs: ['Pickajob intervient sur l’ensemble du calendrier viticole :'],
          bullets: [
            'Taille de vigne (hiver / fin d’hiver)',
            'Tirage des bois et brûlage',
            'Ébourgeonnage et épamprage',
            'Palissage, relevage, accolage',
            'Effeuillage et vendange en vert',
            'Vendanges manuelles (équipes complètes)',
            'Tri et chargement à la cave',
          ],
        },
        {
          h2: 'L’apport d’un prestataire viticole sur la qualité',
          paragraphs: [
            "Une équipe viticole qualifiée préserve la santé du pied de vigne, optimise la récolte et limite les pertes. Confier vos travaux à Pickajob, c’est choisir un prestataire viticole capable de monter une équipe homogène et briefée sur vos exigences.",
          ],
        },
        {
          h2: 'Une intervention partout en France',
          paragraphs: [
            "Pickajob intervient dans les grands vignobles français : Bordeaux et Gironde, Champagne, Bourgogne, Vallée du Rhône, Languedoc, Provence, Sud-Ouest, Loire, Alsace. Nous adaptons l’équipe aux pratiques locales.",
          ],
        },
        {
          h2: 'Pourquoi anticiper avec Pickajob',
          paragraphs: [
            "L’anticipation est clé en viticulture : météo, maturité, calendriers serrés. En contactant Pickajob plusieurs semaines avant le pic de saison, vous sécurisez une équipe expérimentée et adaptée à votre domaine.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils viticoles', description: 'Tailleurs, vendangeurs, équipes expérimentées en vigne.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible sur les missions importantes.' },
        { title: 'Logement', description: 'Hébergement et logistique organisés en région viticole.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic de saison.' },
        { title: 'Qualité', description: 'Une équipe briefée pour préserver la qualité de votre récolte.' },
        { title: 'Tous les vignobles', description: 'De la Gironde à la Champagne, en passant par la Bourgogne.' },
      ],
      steps: [
        { title: 'Brief domaine', description: 'Variétés, surface, calendrier, contraintes de qualité.' },
        { title: 'Mobilisation équipe', description: 'Pickajob constitue une équipe viticole adaptée.' },
        { title: 'Logistique & arrivée', description: 'Logement, transport, encadrement.' },
        { title: 'Mission & suivi', description: 'Présence d’un chef d’équipe Pickajob et suivi continu.' },
      ],
      faq: [
        { q: 'Pickajob fournit-il des tailleurs de vigne ?', a: 'Oui, des tailleurs expérimentés sur les principales méthodes (Guyot, Cordon de Royat, etc.).' },
        { q: 'Pickajob intervient-il en Champagne ?', a: 'Oui, voir notre page Vendangeurs Champagne et notre couverture nationale.' },
        { q: 'Peut-on retrouver la même équipe chaque saison ?', a: 'Oui, dans la mesure du possible, c’est l’une des forces de Pickajob.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/vendanges', label: 'Équipe de vendangeurs' },
          { href: '/regions/gironde', label: 'Main-d’œuvre viticole Gironde' },
          { href: '/regions/champagne', label: 'Vendangeurs Champagne' },
          { href: '/regions/bourgogne', label: 'Main-d’œuvre viticole Bourgogne' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre agricole qualifiée' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
        ],
      },
    },
  },
  vendanges: {
    slug: 'vendanges',
    metaTitle: 'Équipe de vendangeurs — Pickajob, prestataire viticole',
    metaDescription:
      "Pickajob mobilise une équipe de vendangeurs qualifiés et encadrés pour les vendanges manuelles, partout en France. Réactivité, logement, logistique organisés.",
    keywords: ['équipe de vendangeurs', 'vendangeurs', 'prestataire vendanges'],
    formCulture: 'Vendanges',
    data: {
      h1: 'Équipe de vendangeurs : Pickajob mobilise pour votre récolte',
      intro: "Pickajob, prestataire viticole, mobilise une équipe de vendangeurs qualifiés et encadrés pour vos vendanges manuelles. Une réponse claire à la pénurie de vendangeurs et aux calendriers de plus en plus serrés.",
      bullets: [
        'Équipes vendanges complètes (coupeurs + porteurs)',
        'Chef d’équipe Pickajob sur le terrain',
        'Logement et logistique pris en main',
        'Mobilisation rapide sur appel',
      ],
      sections: [
        {
          h2: 'Pourquoi une équipe de vendangeurs prête à intervenir',
          paragraphs: [
            "Les vendanges sont la mission la plus tendue du calendrier viticole. La maturité dicte le calendrier, la météo accélère les choses, et trouver des vendangeurs fiables au bon moment est devenu très difficile pour les domaines. Pickajob existe précisément pour cela : une équipe de vendangeurs prête à intervenir, sans gestion administrative et logistique à votre charge.",
          ],
        },
        {
          h2: 'Comment Pickajob compose ses équipes de vendangeurs',
          paragraphs: ["Une équipe vendanges Pickajob, c’est :"],
          bullets: [
            'Des coupeurs expérimentés (capables de respecter le tri à la vigne)',
            'Des porteurs robustes',
            'Un chef d’équipe Pickajob qui pilote la cadence',
            'Un référent Pickajob disponible pendant la mission',
            'Un logement et une logistique organisés quand nécessaire',
          ],
        },
        {
          h2: 'Réactivité et anticipation',
          paragraphs: [
            "Plus la demande est anticipée, mieux Pickajob peut constituer l’équipe idéale. Mais nous savons aussi répondre aux urgences : un domaine qui doit avancer son chantier de quelques jours peut nous solliciter avec un délai très court.",
          ],
        },
        {
          h2: 'Une équipe vendanges pour chaque vignoble',
          paragraphs: [
            "Pickajob mobilise des équipes dans tous les grands vignobles : Champagne, Gironde, Bourgogne, Vallée du Rhône, Languedoc, Provence, Loire, Alsace. La taille et le profil de l’équipe sont adaptés au type de récolte, à la pente, au type de bac, et à la cadence attendue.",
          ],
        },
        {
          h2: 'Qualité de vendange et tri',
          paragraphs: [
            "Une équipe Pickajob sait travailler avec exigence : tri sélectif, gestion des grappes abîmées, respect des consignes du domaine. La qualité du jus commence à la vigne, et nos équipes sont briefées pour cela.",
          ],
        },
      ],
      whyItems: [
        { title: 'Équipes complètes', description: 'Coupeurs et porteurs déjà constitués.' },
        { title: 'Chef d’équipe Pickajob', description: 'Pour piloter la cadence et la qualité.' },
        { title: 'Logement', description: 'Hébergement organisé près du domaine.' },
        { title: 'Réactivité', description: 'Capacité à intervenir vite en cas d’avancement de récolte.' },
        { title: 'Qualité', description: 'Tri à la vigne respecté.' },
        { title: 'Tous les vignobles', description: 'Champagne, Bordeaux, Bourgogne, Rhône, Languedoc…' },
      ],
      faq: [
        { q: 'Quelle taille d’équipe Pickajob mobilise ?', a: 'De quelques renforts à des équipes de plusieurs dizaines de vendangeurs avec encadrement.' },
        { q: 'Pickajob s’occupe-t-il du logement ?', a: 'Oui, lorsque la mission le justifie.' },
        { q: 'Combien de temps faut-il prévoir avant la récolte ?', a: 'Le plus tôt possible, idéalement plusieurs semaines, mais nous prenons les urgences.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/viticulture', label: 'Prestation viticulture' },
          { href: '/regions/champagne', label: 'Vendangeurs Champagne' },
          { href: '/regions/gironde', label: 'Main-d’œuvre viticole Gironde' },
          { href: '/regions/bourgogne', label: 'Main-d’œuvre viticole Bourgogne' },
          { href: '/blog/ou-trouver-des-vendangeurs', label: 'Article : où trouver des vendangeurs' },
          { href: '/blog/preparer-sa-saison-de-vendanges', label: 'Article : préparer sa saison de vendanges' },
        ],
      },
    },
  },
  arboriculture: {
    slug: 'arboriculture',
    metaTitle: 'Ouvriers agricoles cueillette fruits — Pickajob, prestataire arboricole',
    metaDescription:
      "Pickajob mobilise des ouvriers agricoles pour la cueillette de fruits dans les vergers : pommes, poires, abricots, cerises, prunes. Équipes qualifiées partout en France.",
    keywords: ['ouvriers agricoles cueillette fruits', 'cueillette fruits', 'prestataire arboriculture'],
    formCulture: 'Arboriculture',
    data: {
      h1: 'Ouvriers agricoles cueillette de fruits : Pickajob, prestataire arboricole',
      intro: "Pickajob, prestataire agricole, mobilise des ouvriers agricoles qualifiés pour la cueillette de fruits dans vos vergers. Pommes, poires, abricots, cerises, prunes, fruits à pépins et à noyau : nous adaptons l’équipe à votre verger.",
      bullets: [
        'Cueilleurs expérimentés en arboriculture',
        'Encadrement Pickajob',
        'Logement et logistique organisés',
        'Vergers partout en France',
      ],
      sections: [
        {
          h2: 'Une cueillette qualifiée pour préserver la valeur des fruits',
          paragraphs: [
            "En arboriculture, le geste de cueillette détermine la qualité finale des fruits : un fruit mal cueilli est un fruit déclassé. Pickajob mobilise des cueilleurs expérimentés, capables de respecter le geste de cueillette, le calibre attendu et la cadence demandée par le verger.",
          ],
        },
        {
          h2: 'Pour quels fruits Pickajob intervient ?',
          paragraphs: ['Pickajob intervient sur la plupart des productions arboricoles :'],
          bullets: [
            'Pommes et poires',
            'Abricots, pêches, nectarines',
            'Cerises',
            'Prunes',
            'Kiwis',
            'Petits fruits (selon les régions)',
          ],
        },
        {
          h2: 'Comment se déroule une mission de cueillette',
          paragraphs: [
            "Pickajob constitue une équipe adaptée, organise le logement quand nécessaire, brief les cueilleurs sur les exigences du verger (couleur, calibre, technique), et accompagne la mission via un chef d’équipe ou un référent Pickajob.",
          ],
        },
        {
          h2: 'Une couverture nationale',
          paragraphs: [
            "Pickajob mobilise des équipes dans toutes les régions arboricoles françaises : Vallée du Rhône, Sud-Ouest, Provence, Val de Loire, Limousin, Tarn-et-Garonne… Selon la saison et la production, l’équipe est adaptée au verger.",
          ],
        },
        {
          h2: 'Anticiper sa saison',
          paragraphs: [
            "L’anticipation est clé : un verger qui anticipe ses besoins de main-d’œuvre obtient une meilleure équipe et une meilleure qualité de cueillette. Contactez Pickajob plusieurs semaines avant la maturité.",
          ],
        },
      ],
      whyItems: [
        { title: 'Cueilleurs qualifiés', description: 'Expérience verger réelle, geste préservé.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob disponible.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Souplesse', description: 'Renforts ou équipes complètes.' },
        { title: 'Qualité', description: 'Cadence et calibre respectés.' },
        { title: 'Couverture nationale', description: 'Vallée du Rhône, Sud-Ouest, Provence…' },
      ],
      faq: [
        { q: 'Pickajob intervient pour les fruits à noyau ?', a: 'Oui : abricots, pêches, cerises, prunes…' },
        { q: 'Pickajob fournit aussi des opérateurs station fruitière ?', a: 'Oui, voir la page Conditionnement.' },
        { q: 'Quel est le délai avant intervention ?', a: 'Idéalement plusieurs semaines avant la maturité, mais nous prenons les urgences.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/conditionnement', label: 'Conditionnement / station fruitière' },
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
          { href: '/regions/occitanie', label: 'Saisonniers Occitanie' },
          { href: '/regions/provence-alpes-cote-d-azur', label: 'Saisonniers PACA' },
          { href: '/blog/comment-trouver-de-la-main-oeuvre-agricole', label: 'Article : trouver de la main-d’œuvre agricole' },
        ],
      },
    },
  },
  maraichage: {
    slug: 'maraichage',
    metaTitle: 'Main-d’œuvre maraîchage — Pickajob, prestataire agricole',
    metaDescription:
      "Pickajob mobilise une main-d’œuvre maraîchage qualifiée pour plantation, désherbage, récolte et conditionnement, en plein champ ou sous serre, partout en France.",
    keywords: ['main d’œuvre maraîchage', 'ouvriers maraîchers', 'prestataire maraîchage'],
    formCulture: 'Maraîchage',
    data: {
      h1: 'Main-d’œuvre maraîchage : Pickajob, prestataire pour les exploitations maraîchères',
      intro: "Pickajob, prestataire agricole, mobilise une main-d’œuvre maraîchage qualifiée pour plantation, désherbage, récolte, palissage et conditionnement, en plein champ comme sous serre.",
      bullets: [
        'Ouvriers maraîchers qualifiés',
        'Plein champ ou serre',
        'Logement et logistique organisés',
        'France entière',
      ],
      sections: [
        {
          h2: 'Une main-d’œuvre maraîchage adaptée à toutes les cultures',
          paragraphs: [
            "Le maraîchage exige une main-d’œuvre rigoureuse : geste de plantation, geste de récolte, gestion du calibre, cadence sur le tri. Pickajob mobilise des profils expérimentés capables de s’adapter rapidement à votre culture (tomates, fraises, salades, courgettes, melons, asperges…).",
          ],
        },
        {
          h2: 'Pour quels travaux maraîchers Pickajob intervient',
          paragraphs: ['Pickajob couvre l’essentiel du calendrier maraîcher :'],
          bullets: [
            'Plantation',
            'Désherbage manuel',
            'Palissage et taille (tomates, concombres…)',
            'Effeuillage',
            'Récolte (plein champ ou serre)',
            'Tri, calibre et conditionnement',
          ],
        },
        {
          h2: 'Plein champ ou sous serre',
          paragraphs: [
            "Pickajob intervient aussi bien sur des exploitations en plein champ que sur des exploitations sous serre. Voir aussi notre page Travaux en serre pour les besoins spécifiques sous abri.",
          ],
        },
        {
          h2: 'Une couverture nationale',
          paragraphs: [
            "Pickajob mobilise des équipes maraîchage dans toutes les grandes zones de production françaises : Bretagne, Provence, Nantais, Sud-Ouest, Occitanie, Île-de-France.",
          ],
        },
        {
          h2: 'Pourquoi externaliser à un prestataire agricole',
          paragraphs: [
            "L’externalisation à Pickajob libère du temps de pilotage pour le maraîcher. Vous pilotez votre exploitation, nous nous occupons de la mobilisation, de la logistique et de l’encadrement de la main-d’œuvre.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils maraîchage', description: 'Ouvriers qualifiés sur les gestes spécifiques.' },
        { title: 'Plein champ + serre', description: 'Une seule prestation pour toutes vos surfaces.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob possible sur le chantier.' },
        { title: 'Souplesse', description: 'Renforts ou équipes complètes selon la saison.' },
        { title: 'France entière', description: 'Toutes les grandes zones de maraîchage françaises.' },
      ],
      faq: [
        { q: 'Pickajob intervient-il pour la fraise et la tomate sous serre ?', a: 'Oui, voir aussi notre page Travaux en serre.' },
        { q: 'Pickajob fournit-il du personnel de tri / conditionnement ?', a: 'Oui, voir la page Conditionnement.' },
        { q: 'Pickajob intervient en Bretagne et en Provence ?', a: 'Oui, et plus largement dans toutes les grandes régions maraîchères françaises.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/serres', label: 'Travaux en serre' },
          { href: '/secteurs/conditionnement', label: 'Conditionnement' },
          { href: '/secteurs/arboriculture', label: 'Cueillette fruits' },
          { href: '/regions/nouvelle-aquitaine', label: 'Main-d’œuvre Nouvelle-Aquitaine' },
          { href: '/regions/occitanie', label: 'Saisonniers Occitanie' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
        ],
      },
    },
  },
  conditionnement: {
    slug: 'conditionnement',
    metaTitle: 'Ouvriers conditionnement agricole — Pickajob, prestataire',
    metaDescription:
      "Pickajob mobilise des ouvriers conditionnement agricole pour stations fruitières, légumières et coopératives : tri, calibrage, palettisation. Partout en France.",
    keywords: ['ouvriers conditionnement agricole', 'station fruitière', 'tri conditionnement'],
    formCulture: 'Conditionnement',
    data: {
      h1: 'Ouvriers conditionnement agricole : Pickajob, prestataire pour stations et coopératives',
      intro: "Pickajob, prestataire agricole, mobilise des ouvriers conditionnement agricole pour les stations fruitières, légumières et coopératives. Tri, calibrage, mise en barquette, palettisation : nous adaptons l’équipe à votre cadence.",
      bullets: [
        'Opérateurs station fruitière / légumière',
        'Équipes briefées sur cadence et qualité',
        'Logement organisé selon le besoin',
        'France entière',
      ],
      sections: [
        {
          h2: 'Le conditionnement : un poste critique en saison',
          paragraphs: [
            "Le conditionnement est souvent le goulot d’étranglement en saison : sans équipe stable, la station ralentit, et toute la chaîne en pâtit. Pickajob mobilise des opérateurs disponibles, capables de monter en charge sur les pics.",
          ],
        },
        {
          h2: 'Quels postes Pickajob mobilise',
          paragraphs: ['Pickajob mobilise les profils typiques d’une station :'],
          bullets: [
            'Opérateurs de tri',
            'Opérateurs calibrage / mise en barquette',
            'Opérateurs palettisation',
            'Renforts logistiques (préparation commande, chargement)',
            'Chef d’équipe pour piloter la cadence',
          ],
        },
        {
          h2: 'Cadence et fiabilité',
          paragraphs: [
            "Une équipe de conditionnement Pickajob est briefée sur la cadence attendue, la qualité (tri, calibre, propreté), et la rigueur logistique. L’objectif : une station qui tourne à plein régime sans dégradation de qualité.",
          ],
        },
        {
          h2: 'Une intervention partout en France',
          paragraphs: [
            "Pickajob mobilise des équipes pour stations partout en France : stations fruitières du Sud-Ouest, de la Vallée du Rhône, du Tarn-et-Garonne, stations légumières de Bretagne et de Provence, coopératives en Occitanie et Nouvelle-Aquitaine.",
          ],
        },
        {
          h2: 'Souplesse selon la saison',
          paragraphs: [
            "Pickajob s’adapte à la saisonnalité de votre station : équipe renforcée sur les pics, équipe réduite hors pic. Vous lissez vos coûts.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils opérateurs', description: 'Tri, calibrage, palettisation, logistique.' },
        { title: 'Encadrement', description: 'Chef d’équipe pour piloter la cadence.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Souplesse', description: 'Effectifs adaptés à la saisonnalité.' },
        { title: 'Réactivité', description: 'Mobilisation rapide en pic d’activité.' },
        { title: 'France entière', description: 'Stations fruitières, légumières, coopératives.' },
      ],
      faq: [
        { q: 'Pickajob mobilise-t-il un chef d’équipe ?', a: 'Oui, sur les missions importantes, un chef d’équipe Pickajob pilote la cadence.' },
        { q: 'Pickajob fournit aussi des cueilleurs ?', a: 'Oui, voir Cueillette de fruits.' },
        { q: 'Quel délai avant la saison ?', a: 'Le plus tôt possible. Anticipez si vous le pouvez.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/arboriculture', label: 'Cueillette de fruits' },
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/regions/occitanie', label: 'Saisonniers Occitanie' },
          { href: '/regions/nouvelle-aquitaine', label: 'Main-d’œuvre Nouvelle-Aquitaine' },
          { href: '/employeurs/main-oeuvre-agricole', label: 'Main-d’œuvre agricole' },
        ],
      },
    },
  },
  serres: {
    slug: 'serres',
    metaTitle: 'Ouvriers agricoles sous serre — Pickajob, prestataire serre',
    metaDescription:
      "Pickajob mobilise des ouvriers agricoles sous serre pour palissage, effeuillage, récolte et entretien sous abri. Tomate, concombre, fraise, plants ornementaux. France entière.",
    keywords: ['ouvriers agricoles sous serre', 'travaux en serre', 'main d’œuvre serre'],
    formCulture: 'Serres',
    data: {
      h1: 'Ouvriers agricoles sous serre : Pickajob, prestataire spécialisé',
      intro: "Pickajob, prestataire agricole, mobilise des ouvriers agricoles sous serre pour vos travaux d’entretien et de récolte : palissage, effeuillage, récolte tomate / concombre / fraise, plants ornementaux.",
      bullets: [
        'Profils habitués à la cadence en serre',
        'Récolte, palissage, effeuillage, entretien',
        'Logement organisé selon le besoin',
        'France entière',
      ],
      sections: [
        {
          h2: 'Travailler sous serre demande des profils adaptés',
          paragraphs: [
            "Les travaux en serre demandent une main-d’œuvre rigoureuse, capable de tenir la cadence dans un environnement spécifique (chaleur, humidité, gestes répétitifs). Pickajob mobilise des profils habitués à ce contexte, briefés sur votre culture et votre méthode.",
          ],
        },
        {
          h2: 'Quels travaux en serre Pickajob couvre',
          paragraphs: ['Pickajob intervient sur la plupart des travaux en serre :'],
          bullets: [
            'Plantation et repiquage',
            'Palissage et taille',
            'Effeuillage',
            'Récolte (tomate, concombre, fraise…)',
            'Tri et conditionnement',
            'Entretien général de la serre',
          ],
        },
        {
          h2: 'Un service adapté aux serristes',
          paragraphs: [
            "Pickajob s’adapte à la production : tomate sous serre, concombre, fraise hors-sol, poivron, plants ornementaux. Nous travaillons aussi pour des coopératives serristes et des exploitations multi-sites.",
          ],
        },
        {
          h2: 'France entière',
          paragraphs: [
            "Pickajob mobilise des équipes serres partout en France : Bretagne, Provence, Sud-Ouest, Vallée du Rhône, Centre-Val de Loire.",
          ],
        },
        {
          h2: 'Pourquoi passer par Pickajob',
          paragraphs: [
            "Recruter pour la serre est un casse-tête : pénurie locale, abandons fréquents, gestion du logement. En passant par un prestataire agricole comme Pickajob, vous obtenez une équipe stable, encadrée et opérationnelle.",
          ],
        },
      ],
      whyItems: [
        { title: 'Profils serre', description: 'Habitués au rythme et à l’environnement.' },
        { title: 'Encadrement', description: 'Chef d’équipe Pickajob possible.' },
        { title: 'Logement', description: 'Hébergement organisé selon le besoin.' },
        { title: 'Polyvalence', description: 'Plantation, palissage, récolte, conditionnement.' },
        { title: 'Souplesse', description: 'Effectifs adaptés à la saisonnalité.' },
        { title: 'France entière', description: 'Toutes les zones serricoles françaises.' },
      ],
      faq: [
        { q: 'Pickajob intervient-il pour la fraise hors-sol ?', a: 'Oui, c’est un classique des missions Pickajob.' },
        { q: 'Pickajob fournit-il un chef d’équipe ?', a: 'Oui, sur les missions importantes.' },
        { q: 'Pickajob s’occupe-t-il du logement ?', a: 'Oui, lorsque la mission le justifie.' },
      ],
      internalLinks: {
        title: 'Aller plus loin',
        items: [
          { href: '/secteurs/maraichage', label: 'Prestation maraîchage' },
          { href: '/secteurs/conditionnement', label: 'Conditionnement' },
          { href: '/employeurs/equipe-agricole', label: 'Équipe agricole disponible' },
          { href: '/employeurs/main-oeuvre-agricole-qualifiee', label: 'Main-d’œuvre qualifiée' },
          { href: '/regions/nouvelle-aquitaine', label: 'Main-d’œuvre Nouvelle-Aquitaine' },
          { href: '/regions/provence-alpes-cote-d-azur', label: 'Saisonniers PACA' },
        ],
      },
    },
  },
};
