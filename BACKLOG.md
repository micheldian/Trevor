# 📋 BACKLOG TREVOR V1 (3 semaines)

**Version**: 1.0
**Objectif**: Marketplace agricole Bas-Rhin (67)
**Contraintes**: Web-only, WhatsApp contact, pas de paiement, pas de carte

---

## 🎯 VISION PRODUIT

Connecter les producteurs agricoles du Bas-Rhin avec les consommateurs via une marketplace simple : profils producteurs, recherche produits, contact WhatsApp direct.

---

## 🚀 SEMAINE 1 (S1) - FONDATIONS & MVP CORE

### **US-1.1** : Configuration projet web
**Priority**: P0 (Critique)
**En tant que** développeur,
**Je veux** initialiser l'infrastructure technique,
**Afin de** pouvoir développer rapidement.

**Critères d'acceptation:**
- [ ] Monorepo pnpm workspaces configuré (`apps/api` + `apps/web` + `packages/types`)
- [ ] NestJS 10+ installé avec modules de base
- [ ] Next.js 14+ (App Router) configuré
- [ ] PostgreSQL 15+ avec PostGIS installé (Docker)
- [ ] TypeScript strict mode activé
- [ ] ESLint + Prettier configurés
- [ ] Git repository initialisé
- [ ] `.env.example` créé avec toutes les variables

**Estimation**: 4h

---

### **US-1.2** : Modèle de données producteurs
**Priority**: P0 (Critique)
**En tant que** système,
**Je veux** une structure de données pour les producteurs,
**Afin de** stocker leurs informations.

**Critères d'acceptation:**
- [ ] Migration TypeORM : table `producers` créée
- [ ] Migration TypeORM : table `product_categories` avec seed (8 catégories)
- [ ] Migration TypeORM : table `products` créée
- [ ] Entité TypeScript `Producer` avec validations
- [ ] Entité TypeScript `Product` avec validations
- [ ] Relations producers → products (OneToMany)
- [ ] Index DB optimisés (slug, city, search_vector)
- [ ] Trigger `updated_at` automatique
- [ ] Seed script avec 5 producteurs de test

**Estimation**: 6h

---

### **US-1.3** : API CRUD Producteurs
**Priority**: P0 (Critique)
**En tant que** développeur,
**Je veux** une API REST pour gérer les producteurs,
**Afin de** alimenter le frontend.

**Critères d'acceptation:**
- [ ] `GET /api/producers` - Liste paginée (limit, offset)
- [ ] `GET /api/producers/:slug` - Détail producteur avec produits
- [ ] `POST /api/producers` - Création (admin only)
- [ ] `PATCH /api/producers/:id` - Mise à jour (admin only)
- [ ] `DELETE /api/producers/:id` - Suppression (admin only)
- [ ] DTO validations (class-validator)
- [ ] Swagger documentation auto-générée
- [ ] Tests E2E sur chaque endpoint

**Estimation**: 8h

---

### **US-1.4** : Page d'accueil avec liste producteurs
**Priority**: P0 (Critique)
**En tant que** visiteur,
**Je veux** voir une liste de cartes producteurs,
**Afin de** découvrir l'offre locale.

**Critères d'acceptation:**
- [ ] Page `/` (Next.js App Router)
- [ ] Grille responsive de cartes (CSS Grid ou Tailwind)
- [ ] Carte producteur affiche : photo, nom, ville, 3 produits principaux
- [ ] Fetch data via `fetch()` server-side (Next.js RSC)
- [ ] Affichage de minimum 10 producteurs
- [ ] Loading state (Skeleton)
- [ ] Design mobile-first (responsive 320px → 1920px)
- [ ] Lighthouse Performance > 80

**Estimation**: 6h

---

### **US-1.5** : Recherche textuelle basique
**Priority**: P0 (Critique)
**En tant que** visiteur,
**Je veux** chercher par mot-clé (ex: "pomme"),
**Afin de** trouver rapidement des producteurs/produits.

**Critères d'acceptation:**
- [ ] Barre de recherche sticky en haut de page
- [ ] Endpoint `GET /api/search?q=pomme`
- [ ] PostgreSQL Full-Text Search (tsvector) sur `name`, `description`, `products.name`
- [ ] Résultats filtrés en temps réel côté client (debounce 300ms)
- [ ] Highlighting des termes recherchés (optionnel)
- [ ] Message "Aucun résultat trouvé" si vide
- [ ] Recherche insensible à la casse et aux accents
- [ ] Tests unitaires sur search service

**Estimation**: 6h

---

## 🔧 SEMAINE 2 (S2) - FEATURES ESSENTIELLES

### **US-2.1** : Page profil producteur détaillée
**Priority**: P0 (Critique)
**En tant que** visiteur,
**Je veux** voir le profil complet d'un producteur,
**Afin de** connaître son offre et le contacter.

**Critères d'acceptation:**
- [ ] Route `/producteur/[slug]` (Next.js dynamic route)
- [ ] Affiche : photo cover, nom, description complète, ville + 67
- [ ] Liste complète des produits groupés par catégorie
- [ ] Produits affichent : photo, nom, prix indicatif, disponibilité
- [ ] Bouton "Contacter via WhatsApp" sticky (mobile)
- [ ] Breadcrumb : Accueil > Nom producteur
- [ ] Meta tags dynamiques (SEO)
- [ ] Open Graph tags (partage social)
- [ ] Images lazy loaded (next/image)
- [ ] 404 page si slug inexistant

**Estimation**: 8h

---

### **US-2.2** : Intégration WhatsApp
**Priority**: P0 (Critique)
**En tant que** visiteur,
**Je veux** cliquer sur un bouton WhatsApp,
**Afin de** contacter directement le producteur.

**Critères d'acceptation:**
- [ ] Composant `<WhatsAppButton />` réutilisable
- [ ] Lien format : `https://wa.me/33XXXXXXXXX?text=Bonjour, je suis intéressé par vos produits via Trevor`
- [ ] Validation numéro téléphone côté backend (regex `+33[0-9]{9}`)
- [ ] Bouton affiche icône WhatsApp + texte "Contacter"
- [ ] Design adapté mobile (bouton flottant) et desktop
- [ ] Analytics : track click WhatsApp (`POST /api/analytics/whatsapp-click`)
- [ ] Tests : fonctionne sur iOS Safari, Android Chrome, Desktop
- [ ] Fallback si numéro invalide (affiche email à la place)

**Estimation**: 4h

---

### **US-2.3** : Filtres par catégorie produits
**Priority**: P1 (Important)
**En tant que** visiteur,
**Je veux** filtrer par catégorie (fruits, légumes, viandes...),
**Afin d'** affiner ma recherche.

**Critères d'acceptation:**
- [ ] Sidebar filtres (desktop) / Drawer (mobile)
- [ ] Liste catégories avec icônes (🍎 Fruits, 🥕 Légumes...)
- [ ] Sélection multiple (checkboxes)
- [ ] Endpoint `GET /api/producers?categoryIds=uuid1,uuid2`
- [ ] Compteur résultats dynamique (ex: "42 producteurs")
- [ ] Combinable avec recherche textuelle
- [ ] Bouton "Réinitialiser les filtres"
- [ ] URL synchronisée (query params : `/producteurs?categories=fruits,legumes`)
- [ ] Animation smooth des résultats

**Estimation**: 8h

---

### **US-2.4** : Interface admin pour gérer producteurs
**Priority**: P1 (Important)
**En tant qu'** administrateur,
**Je veux** ajouter/modifier/supprimer des producteurs,
**Afin de** maintenir le catalogue à jour.

**Critères d'acceptation:**
- [ ] Route `/admin` protégée par AuthGuard
- [ ] Page login admin (`/admin/login`) avec OTP email
- [ ] Dashboard : stats (nb producteurs, produits, clics WhatsApp)
- [ ] Page `/admin/producteurs` : liste avec actions (éditer, supprimer)
- [ ] Formulaire création producteur avec upload photo
- [ ] Formulaire édition producteur
- [ ] Gestion produits par producteur (CRUD inline)
- [ ] Upload images via Cloudinary
- [ ] Validation frontend (React Hook Form + Zod)
- [ ] Validation backend (class-validator)
- [ ] Messages de succès/erreur (toast notifications)
- [ ] Pagination liste producteurs (20 par page)

**Estimation**: 12h

---

### **US-2.5** : Authentification Admin OTP
**Priority**: P0 (Critique)
**En tant qu'** administrateur,
**Je veux** me connecter avec un code par email,
**Afin d'** accéder à l'interface admin.

**Critères d'acceptation:**
- [ ] Endpoint `POST /api/auth/send-otp` (email en body)
- [ ] Génération code 6 chiffres aléatoires
- [ ] Email envoi via SMTP (NodeMailer + Brevo/Sendinblue)
- [ ] Code expire après 10 minutes
- [ ] Endpoint `POST /api/auth/verify-otp` (email + code)
- [ ] Retourne JWT token (expires 7 jours)
- [ ] Session stockée en cookie httpOnly + secure
- [ ] Guard NestJS : `@UseGuards(AdminGuard)`
- [ ] Middleware Next.js : redirect `/admin` si non authentifié
- [ ] Rate limiting : max 5 tentatives OTP par heure par IP

**Estimation**: 8h

---

## ✨ SEMAINE 3 (S3) - POLISH & LANCEMENT

### **US-3.1** : Optimisation performance
**Priority**: P1 (Important)
**En tant que** visiteur,
**Je veux** une expérience rapide,
**Afin de** naviguer fluidement.

**Critères d'acceptation:**
- [ ] Lighthouse Performance > 85 (mobile)
- [ ] Time to Interactive < 3s (mobile 3G)
- [ ] Images optimisées (WebP, AVIF via Cloudinary)
- [ ] Next.js Image component partout
- [ ] Lazy loading composants lourds (React.lazy)
- [ ] API response time < 200ms (p95)
- [ ] Pagination ou infinite scroll liste producteurs
- [ ] Cache API responses (SWR ou React Query)
- [ ] Compression Brotli activée (Next.js)
- [ ] CDN configuré (Vercel Edge Network)

**Estimation**: 6h

---

### **US-3.2** : SEO & partage social
**Priority**: P1 (Important)
**En tant que** producteur,
**Je veux** que mon profil soit bien référencé,
**Afin d'** attirer plus de clients.

**Critères d'acceptation:**
- [ ] Meta tags dynamiques par page (title, description)
- [ ] Open Graph tags (og:title, og:image, og:description)
- [ ] Twitter Cards configurées
- [ ] `sitemap.xml` généré dynamiquement (`/sitemap.xml`)
- [ ] `robots.txt` configuré (allow all)
- [ ] Schema.org markup : LocalBusiness sur profils producteurs
- [ ] URLs SEO-friendly (slugs : `/producteur/ferme-dupont`)
- [ ] Canonical URLs configurées
- [ ] Alt tags sur toutes les images
- [ ] Tests : preview Facebook Debugger + Twitter Card Validator

**Estimation**: 5h

---

### **US-3.3** : Pages institutionnelles
**Priority**: P2 (Nice to have)
**En tant que** visiteur,
**Je veux** comprendre Trevor et voir les mentions légales,
**Afin de** faire confiance à la plateforme.

**Critères d'acceptation:**
- [ ] Page `/a-propos` : mission, équipe, contact
- [ ] Page `/mentions-legales` : éditeur, hébergeur, RGPD
- [ ] Page `/contact` : formulaire simple (email direct)
- [ ] Footer avec liens vers ces pages
- [ ] Email contact : contact@trevor-alsace.fr
- [ ] Design cohérent avec le reste du site

**Estimation**: 3h

---

### **US-3.4** : Tests utilisateurs & ajustements
**Priority**: P1 (Important)
**En tant que** product manager,
**Je veux** tester avec 5-10 utilisateurs réels,
**Afin d'** identifier les bugs et points de friction.

**Critères d'acceptation:**
- [ ] 5 utilisateurs non-tech testent le parcours complet
- [ ] Scénario 1 : Recherche "pomme" → Contact producteur via WhatsApp
- [ ] Scénario 2 : Filtrer catégorie "Légumes" → Consulter profil
- [ ] Scénario 3 : Admin ajoute nouveau producteur avec photo
- [ ] Feedback collecté (questionnaire Google Forms)
- [ ] Bugs P0 corrigés avant lancement
- [ ] Bugs P1-P2 ajoutés au backlog V1.1
- [ ] Tests cross-browser (Chrome, Safari, Firefox)
- [ ] Tests mobile (iOS Safari, Android Chrome)

**Estimation**: 6h

---

### **US-3.5** : Déploiement production
**Priority**: P0 (Critique)
**En tant que** équipe,
**Je veux** déployer Trevor en production,
**Afin de** lancer officiellement.

**Critères d'acceptation:**
- [ ] Domaine acheté (ex: `trevor-alsace.fr`)
- [ ] DNS configuré (A records vers Vercel + Railway)
- [ ] Frontend déployé sur Vercel (auto-deploy `main`)
- [ ] Backend déployé sur Railway / Render
- [ ] Base de données production (Supabase / Neon PostgreSQL)
- [ ] SSL/HTTPS activé (Let's Encrypt)
- [ ] Variables d'environnement production configurées
- [ ] Migrations DB exécutées en production
- [ ] Seeds production : 20+ vrais producteurs Bas-Rhin
- [ ] Monitoring configuré (Sentry + Uptime Robot)
- [ ] Backups DB automatiques quotidiens
- [ ] CI/CD GitHub Actions configuré (tests + deploy auto)
- [ ] Health check endpoint `/api/health` testé

**Estimation**: 8h

---

## 📊 RÉCAPITULATIF PRIORITÉS

| Priorité | Description | Nombre de stories |
|----------|-------------|-------------------|
| **P0** | Critique - Bloquant pour le lancement | 7 stories |
| **P1** | Important - Fortement recommandé | 5 stories |
| **P2** | Nice to have - Peut attendre V1.1 | 1 story |

---

## 🎯 DÉFINITION OF DONE (DoD) V1

**Une user story est "Done" quand :**
- [ ] Code écrit et testé localement
- [ ] Tests unitaires/E2E passent (couverture >70%)
- [ ] Code review approuvée (1+ développeur)
- [ ] Documentation technique mise à jour
- [ ] Déployé en staging et validé
- [ ] Critères d'acceptation cochés à 100%
- [ ] Pas de régressions introduites

**Le produit V1 est "Done" quand :**
- [ ] Minimum 20 producteurs du Bas-Rhin référencés avec photos
- [ ] Recherche et filtres fonctionnels (testés)
- [ ] Contact WhatsApp opérationnel sur 100% des profils
- [ ] Responsive mobile/desktop (testé iOS + Android)
- [ ] Déployé sur domaine public avec HTTPS
- [ ] 0 bugs critiques (P0)
- [ ] Lighthouse Performance > 85
- [ ] Documentation admin créée (guide PDF)
- [ ] Plan de communication préparé

---

## 📈 VELOCITY ESTIMÉE

**Capacité par semaine** : 40h (1 développeur full-time)

| Semaine | Stories | Heures estimées | Heures réelles | Vélocité |
|---------|---------|-----------------|----------------|----------|
| **S1**  | US-1.1 à US-1.5 | 30h | - | - |
| **S2**  | US-2.1 à US-2.5 | 40h | - | - |
| **S3**  | US-3.1 à US-3.5 | 28h | - | - |
| **Total** | 13 stories | **98h** (~2.5 semaines) | - | - |

**Note** : Marge de 20% recommandée → **3 semaines réelles**

---

## 💡 RISQUES & DÉPENDANCES

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Manque de producteurs volontaires | 🔴 Élevé | Moyenne | Démarcher 50+ producteurs dès S1, offrir référencement gratuit 1 an |
| Numéros WhatsApp invalides/refus | 🟡 Moyen | Faible | Validation format + test manuel avant mise en ligne, alternative email |
| Performance avec 100+ producteurs | 🟡 Moyen | Moyenne | Pagination dès S3, monitoring continu |
| SMTP bloqué (spam filters) | 🟡 Moyen | Faible | Utiliser Brevo (délivrabilité 99%), SPF/DKIM configurés |
| Dépendance Cloudinary (vendor lock) | 🟢 Faible | Élevée | Accepté pour V1, migration S3 planifiée V2 si besoin |

---

## 🚀 POST-V1 (Backlog V1.1)

**Features prioritaires après lancement :**

1. **Carte interactive** (PostGIS) - Afficher producteurs sur carte Bas-Rhin
2. **Système d'avis** - Clients laissent avis producteurs (modération admin)
3. **Notifications producteurs** - Email quand cliqué WhatsApp (optionnel)
4. **Export catalogue PDF** - Producteur télécharge son catalogue
5. **Multi-départements** - Étendre au Haut-Rhin (68), puis Grand Est
6. **PWA** - Installation app mobile (offline mode basique)
7. **Analytics producteurs** - Dashboard stats pour chaque producteur

---

## 📞 CONTACTS & RESSOURCES

**Équipe :**
- Product Owner : [À définir]
- Tech Lead : [À définir]
- Développeur(s) : [À définir]

**Outils :**
- Gestion projet : GitHub Projects / Linear
- Communication : Slack / Discord
- Documentation : Notion / Confluence
- Design : Figma (wireframes)

---

**Date de création** : 2025-12-25
**Prochaine révision** : Fin S1 (retrospective)
