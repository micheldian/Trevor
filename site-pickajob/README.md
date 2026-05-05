# Site Pickajob.fr

Site SEO-first pour **Pickajob**, prestataire agricole et viticole en France.

Pickajob met à disposition de la main-d'œuvre qualifiée et son expertise terrain auprès des exploitations agricoles, domaines viticoles, maraîchers, arboriculteurs, coopératives et entreprises agricoles.

## Stack

- Next.js 14 (App Router) — SSG par défaut, idéal pour SEO
- TypeScript
- Tailwind CSS
- React Hook Form + Zod (formulaires)
- lucide-react (icônes)

## Démarrage

```bash
cd site-pickajob
npm install
npm run dev    # http://localhost:3001
```

Build production :

```bash
npm run build
npm run start
```

## Architecture

```
site-pickajob/
├── app/                              # App Router
│   ├── layout.tsx                    # Layout global (header / footer / SEO)
│   ├── page.tsx                      # Accueil
│   ├── globals.css                   # Tailwind + styles globaux
│   ├── sitemap.ts                    # /sitemap.xml généré
│   ├── robots.ts                     # /robots.txt généré
│   ├── not-found.tsx                 # 404
│   ├── api/lead/route.ts             # API formulaires (POST)
│   ├── employeurs/
│   │   ├── page.tsx                  # Pilier employeurs
│   │   ├── main-oeuvre-agricole/
│   │   ├── main-oeuvre-agricole-qualifiee/
│   │   ├── recruter-saisonniers-agricoles/
│   │   ├── equipe-agricole/
│   │   └── main-oeuvre-etrangere-agriculture/
│   ├── secteurs/[slug]/page.tsx      # Routes dynamiques
│   ├── regions/[slug]/page.tsx       # Routes dynamiques
│   ├── candidats/
│   │   ├── page.tsx
│   │   ├── emploi-agricole-saisonnier/
│   │   ├── vendanges/
│   │   ├── cueillette-fruits/
│   │   └── travail-agricole-loge/
│   ├── international/travail-agricole-[country]/page.tsx
│   ├── blog/[slug]/page.tsx          # Routes dynamiques (6 articles)
│   ├── contact/page.tsx
│   ├── devis/page.tsx
│   └── inscription/page.tsx
├── components/                        # Composants réutilisables
│   ├── Header.tsx, Footer.tsx
│   ├── Hero.tsx, CtaBar.tsx
│   ├── FeatureGrid.tsx, Steps.tsx
│   ├── Faq.tsx, InternalLinks.tsx
│   ├── Breadcrumb.tsx, JsonLd.tsx
│   ├── EmployerForm.tsx, CandidateForm.tsx
│   ├── SeoLandingTemplate.tsx        # Template page SEO employeur
│   └── CandidateLandingTemplate.tsx  # Template page SEO candidat
└── lib/
    ├── site.ts                       # Constantes site (nav, secteurs, régions, etc.)
    ├── seo.ts                        # Helpers metadata + JSON-LD
    ├── sectors-content.ts            # Contenu des 6 pages secteurs
    ├── regions-content.ts            # Contenu des 6 pages régions
    ├── international-content.ts      # Contenu international (3 pays)
    └── blog-content.ts               # Contenu des 6 articles blog
```

## Architecture évolutive

**Ajouter une région** : ajoutez la slug dans `lib/site.ts` (`REGIONS`) et le contenu dans `lib/regions-content.ts`. La page `/regions/<slug>` est générée automatiquement.

**Ajouter un secteur** : idem dans `lib/site.ts` (`SECTORS`) et `lib/sectors-content.ts`.

**Ajouter un article de blog** : ajoutez l'entrée dans `lib/blog-content.ts` puis référencez-la dans `lib/site.ts` (`BLOG_ARTICLES`).

Les sitemap.xml et robots.txt sont automatiquement à jour.

## SEO

Chaque page a :
- une `metadata` complète (title, description, canonical, OpenGraph, Twitter)
- un H1 unique
- des H2 structurés
- des liens internes vers les pages liées
- un appel à l'action en haut, au milieu et en bas
- des données structurées JSON-LD (Organization, BreadcrumbList, FAQPage, Article, ProfessionalService selon le type de page)

Le sitemap.xml liste toutes les routes (`/sitemap.xml`).
Le robots.txt autorise l'indexation et pointe vers le sitemap (`/robots.txt`).

## Formulaires

Deux formulaires sont disponibles :
- **EmployerForm** (sur `/devis` et toutes les pages SEO employeur) — soumissions pour exploitations
- **CandidateForm** (sur `/inscription` et `/candidats`) — inscriptions de candidats

Les soumissions arrivent sur `POST /api/lead` qui :
1. valide via Zod
2. log la requête côté serveur
3. forward optionnel vers `PICKAJOB_LEAD_WEBHOOK` (variable d'environnement)

À brancher sur votre CRM / Slack / email selon votre choix.

## Variables d'environnement

```
# Optionnel : URL d'un webhook (Zapier, Make, Slack, votre CRM)
PICKAJOB_LEAD_WEBHOOK=https://...
```

## Positionnement éditorial (à respecter)

Pickajob est :
- un **prestataire agricole**
- un **prestataire viticole**
- un **partenaire opérationnel** des exploitations
- une solution de **main-d'œuvre agricole qualifiée**
- un **appui terrain** pour les pics d'activité
- une entreprise capable d'**intervenir partout en France**

Le site **ne doit pas** présenter Pickajob comme une plateforme d'annonces ou un job board.
