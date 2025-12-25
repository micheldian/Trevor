# 🌾 Trevor - Plateforme de Matching Agricole (Bas-Rhin 67)

Marketplace connectant travailleurs agricoles et employeurs via matching intelligent + contact WhatsApp direct.

---

## 📋 Documentation

- **[Architecture](./ARCHITECTURE.md)** - Architecture technique complète
- **[Backlog](./BACKLOG.md)** - Product backlog (13 user stories, 3 semaines)
- **[Database Schema](./database/SCHEMA_DESIGN.md)** - Design decisions & optimisations
- **[API Endpoints](./API_ENDPOINTS.md)** - Spec REST API complète (100+ endpoints)
- **[API DTOs](./API_DTOS.md)** - Validation DTOs NestJS
- **[Auth README](./apps/api/README.md)** - Guide auth OTP

---

## 🚀 Quick Start

### **1. Prérequis**

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### **2. Installation**

```bash
# Cloner le repo
git clone https://github.com/micheldian/Trevor.git
cd Trevor

# Installer dépendances
cd apps/api
pnpm install
```

### **3. Setup Base de Données**

```bash
# Démarrer PostgreSQL + Redis
docker-compose up -d postgres redis

# Attendre que Postgres soit prêt (healthcheck)
docker-compose logs -f postgres

# Le schéma + seed data sont auto-chargés au démarrage
```

### **4. Configuration**

```bash
# Copier .env.example
cp apps/api/.env.example apps/api/.env

# Éditer si nécessaire (optionnel pour dev local)
nano apps/api/.env
```

### **5. Démarrer l'API**

```bash
cd apps/api
pnpm start:dev

# API démarrée sur http://localhost:3001
# Swagger docs: http://localhost:3001/docs
```

---

## 🧪 Tester l'Auth OTP

```bash
# 1. Demander code OTP (mock SMS en dev)
curl -X POST http://localhost:3001/auth/start \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'

# Copier le code depuis les logs API:
# [SMS MOCK] To: +33612345678 | Code: 123456

# 2. Vérifier OTP
curl -X POST http://localhost:3001/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678", "code": "123456"}'

# Réponse contient accessToken

# 3. Tester endpoint protégé
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🐳 Services Docker

| Service | Port | UI | Credentials |
|---------|------|----|----- -------|
| **PostgreSQL** | 5432 | - | `trevor_user` / `trevor_pass` |
| **Redis** | 6379 | - | Pas de password |
| **pgAdmin** | 5050 | http://localhost:5050 | `admin@trevor.local` / `admin` |
| **Redis Commander** | 8081 | http://localhost:8081 | - |
| **Swagger API** | 3001 | http://localhost:3001/docs | - |

### **Commandes utiles**

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Reset complet (⚠️ supprime données)
docker-compose down -v
docker-compose up -d
```

---

## 📦 Structure du Projet

```
Trevor/
├── apps/
│   └── api/                      # Backend NestJS
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/         # ✅ Auth OTP + JWT
│       │   │   ├── users/        # ✅ Entité User
│       │   │   ├── profiles/     # ✅ Entité Profile
│       │   │   ├── teams/        # TODO
│       │   │   ├── jobs/         # TODO
│       │   │   ├── matches/      # TODO
│       │   │   └── reviews/      # TODO
│       │   ├── common/
│       │   │   ├── decorators/   # @Public(), @CurrentUser()
│       │   │   └── guards/       # JwtAuthGuard
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── package.json
│       └── README.md
│
├── database/
│   ├── schema.sql                # Schéma PostgreSQL complet
│   ├── seed.sql                  # Données de test
│   └── SCHEMA_DESIGN.md          # Documentation design
│
├── docker-compose.yml            # PostgreSQL + Redis + UIs
├── ARCHITECTURE.md
├── BACKLOG.md
├── API_ENDPOINTS.md
├── API_DTOS.md
└── README.md
```

---

## ✅ Checklist Implémentation

### **Phase 1: Backend Core** (✅ Complété)
- [x] Schéma PostgreSQL (10 tables + triggers)
- [x] Seed data réalistes (Bas-Rhin)
- [x] Auth OTP par téléphone
- [x] JWT strategy + guards
- [x] Rate limiting
- [x] Validation DTOs
- [x] Swagger documentation
- [x] Docker Compose setup

### **Phase 2: Modules API** (🚧 En cours)
- [ ] Module Profiles (CRUD)
- [ ] Module Teams
- [ ] Module Jobs (CRUD + search)
- [ ] Module Matches (scoring algorithm)
- [ ] Module Reviews
- [ ] Module Search (full-text)
- [ ] Module Notifications

### **Phase 3: Frontend** (⏳ À venir)
- [ ] Setup Next.js 14
- [ ] Pages : Home, Jobs, Profiles
- [ ] Composants : SearchBar, JobCard, WhatsAppButton
- [ ] Intégration API
- [ ] WhatsApp deep linking

---

## 🔐 Sécurité

### **Authentification**
- OTP 6 chiffres (10 min expiration)
- Max 3 tentatives de vérification
- Rate limit : 5 OTP/heure par numéro
- JWT token (7 jours)
- Refresh token (30 jours)

### **API Protection**
- JwtAuthGuard global (sauf routes `@Public()`)
- Rate limiting : 100 req/min par IP
- CORS whitelist
- Helmet.js (headers sécurisés)
- Validation stricte (class-validator)

### **Database**
- Contraintes CHECK (formats, ranges)
- Foreign keys avec CASCADE
- Indexes optimisés
- Triggers auto-update

---

## 📊 Stack Technique

| Layer | Technologie |
|-------|-------------|
| **Backend** | NestJS 10, TypeScript |
| **Database** | PostgreSQL 15 + PostGIS |
| **Cache** | Redis 7 |
| **ORM** | TypeORM |
| **Auth** | Passport JWT + OTP |
| **Validation** | class-validator |
| **API Docs** | Swagger / OpenAPI |
| **SMS** | Twilio (prod) / Mock (dev) |
| **Rate Limit** | @nestjs/throttler |
| **Container** | Docker Compose |

---

## 🧪 Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

---

## 📚 Ressources

- **Swagger UI** : http://localhost:3001/docs
- **pgAdmin** : http://localhost:5050
- **Redis Commander** : http://localhost:8081
- **Postman Collection** : (TODO: générer depuis Swagger)

---

## 🤝 Contribution

1. Fork le repo
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

---

## 📝 License

MIT

---

## 🎯 Roadmap V1

- [x] **S1** : Setup + Auth OTP
- [ ] **S2** : API Modules (Jobs, Profiles, Matches)
- [ ] **S3** : Frontend Next.js + Déploiement

**Target lancement** : 3 semaines (20 producteurs Bas-Rhin)

---

**Équipe** : Trevor V1
**Contact** : [À définir]
**Version** : 1.0.0
