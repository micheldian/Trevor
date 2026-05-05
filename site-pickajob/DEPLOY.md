# Mettre Pickajob.fr en ligne — guide pas à pas

Ce site est un projet **Next.js 14**. La méthode la plus simple, gratuite et la plus rapide pour le mettre en ligne : **Vercel** (l'éditeur de Next.js).

---

## 1. Tester le site en local (recommandé avant de déployer)

```bash
cd site-pickajob
npm install
npm run dev
```

Ouvrez **http://localhost:3001** dans votre navigateur. Vérifiez que :
- L'accueil s'affiche
- Les liens (Employeurs, Secteurs, Régions, Candidats, Blog) fonctionnent
- Le formulaire `/devis` se soumet (vous verrez un log dans le terminal)

Si tout est OK → on déploie.

---

## 2. Pousser le code sur GitHub

Le code est déjà sur la branche `claude/pickajob-seo-site-lAfal` du repo `Trevor`.

Pour Vercel, il suffit que cette branche soit accessible depuis votre compte GitHub.

---

## 3. Déployer sur Vercel

### a. Créer un compte
1. Allez sur [vercel.com](https://vercel.com)
2. **Sign up with GitHub** (c'est plus simple — pas besoin de mot de passe)

### b. Importer le projet
1. Dans le dashboard Vercel : **Add New… → Project**
2. Sélectionnez le repo **Trevor** dans la liste
3. **Important : configurer le Root Directory**
   - Cliquez sur **Edit** à côté de "Root Directory"
   - Choisissez `site-pickajob`
   - Validez

### c. Configurer la branche
- Dans **Settings → Git → Production Branch** (après le 1er déploiement) : mettez `claude/pickajob-seo-site-lAfal` comme branche de production, OU mergez cette branche sur `main` et laissez `main` comme production.

### d. (Optionnel) Variables d'environnement
Si vous voulez recevoir les soumissions formulaire ailleurs que dans les logs Vercel :

- **Settings → Environment Variables**
- Ajoutez `PICKAJOB_LEAD_WEBHOOK` = `https://...` (URL Zapier, Make, Slack webhook, votre CRM)

### e. Déployer
- Cliquez **Deploy**
- Patientez ~1-2 minutes
- Vercel vous donne une URL publique du type `pickajob-xxxx.vercel.app`

**À ce stade, votre site est en ligne et accessible au monde.**

---

## 4. Brancher votre domaine pickajob.fr

### a. Acheter ou récupérer le domaine
Si vous avez déjà acheté `pickajob.fr` (chez OVH, Gandi, Namecheap, Google Domains…), notez où.

### b. Ajouter le domaine dans Vercel
1. Dans le projet Vercel : **Settings → Domains**
2. Tapez `pickajob.fr` → **Add**
3. Vercel vous indique 2 enregistrements DNS à ajouter

### c. Configurer les DNS chez votre registrar
Connectez-vous à votre registrar (OVH, Gandi, etc.) et ajoutez :

```
Type    Nom     Valeur
A       @       76.76.21.21          (l'IP fournie par Vercel)
CNAME   www     cname.vercel-dns.com
```

(Les valeurs exactes sont affichées par Vercel — copiez-les.)

### d. Attendre la propagation
- 5 min à 24 h selon le registrar (généralement < 1 h)
- Vercel coche automatiquement les domaines vérifiés
- Le certificat HTTPS (Let's Encrypt) est généré automatiquement par Vercel — rien à faire

---

## 5. Vérifier après mise en ligne

Une fois `pickajob.fr` actif, vérifiez :

- [ ] Page d'accueil s'affiche en HTTPS sur `https://pickajob.fr`
- [ ] `https://pickajob.fr/sitemap.xml` renvoie le sitemap
- [ ] `https://pickajob.fr/robots.txt` renvoie les directives
- [ ] Le formulaire `/devis` se soumet sans erreur
- [ ] Les pages se chargent vite (test sur mobile)

---

## 6. Soumettre le sitemap à Google

Pour accélérer l'indexation SEO :

1. Allez sur [search.google.com/search-console](https://search.google.com/search-console)
2. Ajoutez la propriété `pickajob.fr` (vérification par TXT DNS)
3. **Sitemaps** → soumettez `https://pickajob.fr/sitemap.xml`
4. Idem côté Bing : [bing.com/webmasters](https://www.bing.com/webmasters)

Google indexera vos 33 pages dans les jours/semaines suivantes.

---

## 7. Mettre à jour le site

Toute modification du code, une fois pushée sur la branche de production de Vercel, **déploie automatiquement** une nouvelle version (en ~1 minute).

Pas besoin de FTP, pas besoin de "publier" : commit → push → en ligne.

---

## Coûts

- **Vercel Hobby** : gratuit pour ce volume (largement suffisant pour Pickajob)
- **Domaine pickajob.fr** : ~10-15 €/an chez OVH/Gandi
- **Total** : ~12 €/an

---

## Si vous préférez ne pas passer par Vercel

Alternatives 100 % compatibles Next.js, ordre de simplicité :

1. **Netlify** (gratuit) — proche de Vercel
2. **Cloudflare Pages** (gratuit) — très rapide
3. **Un VPS OVH/Hetzner** (~5 €/mois) — vous gérez tout vous-même : `npm run build && npm run start` derrière nginx

Vercel reste l'option recommandée pour la simplicité et l'optimisation Next.js.
