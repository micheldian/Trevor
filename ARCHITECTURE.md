# 🏗️ ARCHITECTURE TREVOR V1

**Version**: 1.0
**Stack**: NestJS + PostgreSQL + Next.js
**Scope**: MVP Marketplace Agricole Bas-Rhin (67)

---

## 📁 1. STRUCTURE DU REPOSITORY

### **Recommandation: MONOREPO (pnpm workspaces)**

**Justification:**
- ✅ Partage de types TypeScript entre front/back
- ✅ Déploiements coordonnés
- ✅ Gestion des dépendances centralisée
- ✅ Équipe réduite (1-3 devs)
- ❌ Pas de scaling micro-services prévu en V1

```
trevor/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── modules/
│   │   │   │   ├── producers/
│   │   │   │   │   ├── producers.controller.ts
│   │   │   │   │   ├── producers.service.ts
│   │   │   │   │   ├── producers.module.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-producer.dto.ts
│   │   │   │   │   │   └── update-producer.dto.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── producer.entity.ts
│   │   │   │   │   └── producers.repository.ts
│   │   │   │   ├── products/
│   │   │   │   │   ├── products.controller.ts
│   │   │   │   │   ├── products.service.ts
│   │   │   │   │   ├── products.module.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entities/
│   │   │   │   │   └── products.repository.ts
│   │   │   │   ├── search/
│   │   │   │   │   ├── search.controller.ts
│   │   │   │   │   ├── search.service.ts
│   │   │   │   │   └── search.module.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── strategies/
│   │   │   │   │   │   └── otp.strategy.ts
│   │   │   │   │   └── guards/
│   │   │   │   │       └── admin.guard.ts
│   │   │   │   └── uploads/
│   │   │   │       ├── uploads.controller.ts
│   │   │   │       ├── uploads.service.ts
│   │   │   │       └── uploads.module.ts
│   │   │   ├── common/
│   │   │   │   ├── config/
│   │   │   │   │   └── database.config.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── logging.interceptor.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   └── validators/
│   │   │   │       └── phone-number.validator.ts
│   │   │   └── database/
│   │   │       ├── migrations/
│   │   │       └── seeds/
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/            # Next.js 14+ App Router
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx    # Page d'accueil
│       │   │   ├── producteur/
│       │   │   │   └── [slug]/
│       │   │   │       └── page.tsx
│       │   │   ├── admin/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx
│       │   │   │   └── producteurs/
│       │   │   │       ├── page.tsx
│       │   │   │       └── [id]/
│       │   │   │           └── page.tsx
│       │   │   └── a-propos/
│       │   │       └── page.tsx
│       │   ├── components/
│       │   │   ├── ui/         # Composants génériques
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Card.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   └── Modal.tsx
│       │   │   ├── features/   # Composants métier
│       │   │   │   ├── ProducerCard.tsx
│       │   │   │   ├── ProductList.tsx
│       │   │   │   ├── SearchBar.tsx
│       │   │   │   ├── CategoryFilter.tsx
│       │   │   │   └── WhatsAppButton.tsx
│       │   │   └── layout/
│       │   │       ├── Header.tsx
│       │   │       ├── Footer.tsx
│       │   │       └── Container.tsx
│       │   ├── lib/
│       │   │   ├── api/        # API client
│       │   │   │   ├── client.ts
│       │   │   │   ├── producers.ts
│       │   │   │   └── products.ts
│       │   │   ├── hooks/
│       │   │   │   ├── useProducers.ts
│       │   │   │   ├── useSearch.ts
│       │   │   │   └── useAuth.ts
│       │   │   └── utils/
│       │   │       ├── format-phone.ts
│       │   │       └── format-price.ts
│       │   ├── styles/
│       │   │   └── globals.css
│       │   └── types/
│       │       └── index.ts    # Types partagés
│       ├── public/
│       │   ├── images/
│       │   └── favicon.ico
│       ├── package.json
│       ├── next.config.js
│       └── tsconfig.json
│
├── packages/                   # Code partagé
│   └── types/                  # Types TypeScript partagés
│       ├── src/
│       │   ├── producer.types.ts
│       │   ├── product.types.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   └── workflows/
│       ├── api-ci.yml
│       └── web-ci.yml
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
│
├── docs/
│   ├── ARCHITECTURE.md         # Ce fichier
│   ├── API.md                  # Documentation API
│   └── DEPLOYMENT.md
│
├── pnpm-workspace.yaml
├── package.json                # Root package.json
├── .env.example
├── .gitignore
├── turbo.json                  # Optionnel: Turborepo
└── README.md
```

---

## 🗄️ 2. SCHÉMA BASE DE DONNÉES (PostgreSQL)

### **Tables principales**

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Optionnel V1, recommandé V2

-- Table: producers
CREATE TABLE producers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,  -- URL-friendly (ex: ferme-dupont)
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Contact
    phone_whatsapp VARCHAR(20) NOT NULL,  -- Format: +33XXXXXXXXX
    email VARCHAR(255),

    -- Localisation
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(5) NOT NULL DEFAULT '67000',  -- Bas-Rhin
    address TEXT,
    location GEOGRAPHY(POINT, 4326),  -- PostGIS (optionnel V1)

    -- Média
    photo_url VARCHAR(500),
    cover_photo_url VARCHAR(500),

    -- Métadonnées
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Index
    CONSTRAINT phone_format CHECK (phone_whatsapp ~ '^\+33[0-9]{9}$')
);

CREATE INDEX idx_producers_slug ON producers(slug);
CREATE INDEX idx_producers_city ON producers(city);
CREATE INDEX idx_producers_active ON producers(is_active) WHERE is_active = true;
-- CREATE INDEX idx_producers_location ON producers USING GIST(location);  -- Si PostGIS


-- Table: product_categories
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,  -- Fruits, Légumes, Viandes...
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),  -- Emoji ou nom icon
    sort_order INTEGER DEFAULT 0
);

-- Seed categories
INSERT INTO product_categories (name, slug, icon, sort_order) VALUES
    ('Fruits', 'fruits', '🍎', 1),
    ('Légumes', 'legumes', '🥕', 2),
    ('Viandes', 'viandes', '🥩', 3),
    ('Fromages', 'fromages', '🧀', 4),
    ('Œufs', 'oeufs', '🥚', 5),
    ('Miel', 'miel', '🍯', 6),
    ('Produits transformés', 'transformes', '🥫', 7),
    ('Autres', 'autres', '🌾', 99);


-- Table: products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES product_categories(id),

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Pricing (indicatif, pas de paiement)
    price_indication VARCHAR(100),  -- Ex: "3€/kg", "5€ la barquette"
    unit VARCHAR(50),  -- kg, pièce, litre, etc.

    -- Disponibilité
    is_available BOOLEAN DEFAULT true,
    seasonal_availability TEXT,  -- Ex: "Mai à Septembre"

    -- Média
    photo_url VARCHAR(500),

    -- Métadonnées
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_producer ON products(producer_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available) WHERE is_available = true;


-- Table: admin_users (auth OTP)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',  -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);


-- Table: otp_codes (One-Time Password)
CREATE TABLE otp_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,  -- 6 chiffres
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_user ON otp_codes(admin_user_id);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);


-- Table: analytics_events (optionnel, simple tracking)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL,  -- page_view, whatsapp_click, search
    producer_id UUID REFERENCES producers(id) ON DELETE SET NULL,
    metadata JSONB,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_producer ON analytics_events(producer_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);


-- Fonction: updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_producers_updated_at BEFORE UPDATE ON producers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔧 3. DÉCISIONS TECHNIQUES

### **3.1 Authentification Admin (OTP - One-Time Password)**

**Choix**: Email + Code OTP (6 chiffres) - **Pas de mot de passe**

**Justification:**
- ✅ UX simple pour admin (pas de mdp à retenir)
- ✅ Sécurité suffisante pour V1 (admin restreint)
- ✅ Pas de gestion de reset password
- ❌ Éviter JWT complexe pour V1

**Flow:**
1. Admin entre son email sur `/admin/login`
2. Backend génère code 6 chiffres, expire 10min
3. Envoi email avec code (NodeMailer + SMTP)
4. Admin entre code → Session cookie (httpOnly, secure)
5. Session valide 7 jours

**NestJS Implementation:**
```typescript
// apps/api/src/modules/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  async sendOTP(email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10min

    // Sauvegarder en DB
    await this.otpRepository.create({ email, code, expiresAt });

    // Envoyer email
    await this.mailService.sendOTP(email, code);
  }

  async verifyOTP(email: string, code: string): Promise<string> {
    const otp = await this.otpRepository.findValidOTP(email, code);
    if (!otp) throw new UnauthorizedException('Code invalide');

    // Générer session JWT
    return this.jwtService.sign({ email, sub: otp.adminUserId });
  }
}
```

**Variables d'env:**
```bash
# Auth
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
OTP_EXPIRATION=10m

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@trevor.fr
SMTP_PASS=your-app-password
EMAIL_FROM=Trevor <noreply@trevor.fr>
```

---

### **3.2 Stockage Images**

**Choix**: **Cloudinary** (recommandé) ou **S3 + CloudFront**

**Option 1: Cloudinary (Recommandé V1)**
- ✅ Free tier généreux (25 crédits/mois = ~25GB)
- ✅ Transformation d'images à la volée (resize, crop, webp)
- ✅ CDN intégré
- ✅ SDK NestJS simple
- ❌ Vendor lock-in

**Option 2: AWS S3 + CloudFront**
- ✅ Plus flexible long terme
- ✅ Coût prévisible
- ❌ Setup plus complexe
- ❌ Transformations manuelles (Sharp.js)

**Recommandation**: **Cloudinary pour V1**, migrer S3 si >1000 producteurs.

**NestJS Integration (Cloudinary):**
```typescript
// apps/api/src/modules/uploads/uploads.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadProducerPhoto(file: Express.Multer.File): Promise<string> {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'trevor/producers',
      transformation: [
        { width: 800, height: 800, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    return result.secure_url;
  }
}
```

**Variables d'env:**
```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OU AWS S3
AWS_REGION=eu-west-3
AWS_S3_BUCKET=trevor-uploads
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

---

### **3.3 Logging & Monitoring**

**Choix**: **Winston (logs) + Sentry (erreurs) + Uptime Robot (monitoring)**

**NestJS Logging:**
```typescript
// apps/api/src/common/logger.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) => {
          return `[${timestamp}] ${level} [${context}] ${message}`;
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
});
```

**Sentry Integration:**
```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Variables d'env:**
```bash
# Logging
LOG_LEVEL=info
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Monitoring
UPTIME_ROBOT_API_KEY=xxx  # Optionnel
```

---

### **3.4 Variables d'Environnement**

**Structure `.env` (root du monorepo):**
```bash
# ============================
# GLOBAL
# ============================
NODE_ENV=development  # development | staging | production

# ============================
# API (NestJS)
# ============================
API_PORT=3001
API_URL=http://localhost:3001
API_CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=trevor_user
DATABASE_PASSWORD=trevor_pass_change_me
DATABASE_NAME=trevor_db
DATABASE_SSL=false  # true en production

# Auth
JWT_SECRET=super-secret-change-in-production-min-32-chars
JWT_EXPIRATION=7d
OTP_EXPIRATION=10m

# Email (SMTP - Brevo/Sendinblue recommandé)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@trevor.fr
SMTP_PASS=your-smtp-key
EMAIL_FROM=Trevor Alsace <noreply@trevor.fr>

# Cloudinary
CLOUDINARY_CLOUD_NAME=trevor-prod
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-secret

# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# ============================
# WEB (Next.js)
# ============================
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Trevor Alsace

# Analytics (optionnel)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics
```

**Gestion par environnement:**
- `.env.development` (local)
- `.env.staging` (staging)
- `.env.production` (production)
- `.env.example` (template committé)

**NestJS Config Module:**
```typescript
// apps/api/src/common/config/configuration.ts
export default () => ({
  port: parseInt(process.env.API_PORT, 10) || 3001,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
});
```

---

### **3.5 Recherche & Filtres**

**Choix V1**: **PostgreSQL Full-Text Search (sans ElasticSearch)**

**Justification:**
- ✅ Suffisant pour <1000 producteurs
- ✅ Pas d'infrastructure additionnelle
- ✅ Support français natif (tsconfig)
- ❌ Migration ElasticSearch/Algolia si >10k produits

**Implémentation:**
```sql
-- Migration: Ajouter colonne tsvector
ALTER TABLE producers ADD COLUMN search_vector tsvector;

CREATE INDEX idx_producers_search ON producers USING GIN(search_vector);

-- Trigger auto-update search_vector
CREATE OR REPLACE FUNCTION producers_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.city, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_update BEFORE INSERT OR UPDATE
  ON producers FOR EACH ROW EXECUTE FUNCTION producers_search_trigger();
```

**NestJS Service:**
```typescript
// apps/api/src/modules/search/search.service.ts
async searchProducers(query: string, filters?: SearchFilters) {
  const qb = this.producerRepo
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.products', 'products')
    .where('p.is_active = true');

  if (query) {
    qb.andWhere(
      `p.search_vector @@ plainto_tsquery('french', :query)
       OR products.name ILIKE :likeQuery`,
      { query, likeQuery: `%${query}%` }
    );
  }

  if (filters?.categoryIds?.length) {
    qb.andWhere('products.category_id IN (:...categoryIds)', {
      categoryIds: filters.categoryIds,
    });
  }

  return qb.getMany();
}
```

---

## 🚀 4. CONVENTIONS DE CODE

### **4.1 Naming Conventions**

| Type | Convention | Exemple |
|------|------------|---------|
| **Fichiers** | kebab-case | `producer-card.tsx` |
| **Components** | PascalCase | `ProducerCard` |
| **Fonctions/variables** | camelCase | `getProducers()` |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| **Types/Interfaces** | PascalCase | `Producer`, `IProducerService` |
| **Enums** | PascalCase | `ProductCategory` |
| **DB Tables** | snake_case | `producers`, `product_categories` |

### **4.2 Git Workflow**

```bash
# Branches
main                    # Production
develop                 # Staging
feature/TRE-123-xxx     # Features (TRE = Trevor JIRA)
bugfix/TRE-456-xxx      # Bugfixes
hotfix/xxx              # Hotfixes production

# Commits (Conventional Commits)
feat: add WhatsApp button component
fix: correct phone number validation
docs: update architecture documentation
chore: upgrade dependencies
```

### **4.3 TypeScript Strict Mode**

**tsconfig.json (partagé):**
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 🔒 5. SÉCURITÉ V1

### **Checklist**

- [ ] **CORS**: Whitelist domaines frontend uniquement
- [ ] **Rate Limiting**: 100 req/min par IP (NestJS Throttler)
- [ ] **Helmet.js**: Headers HTTP sécurisés
- [ ] **CSRF Protection**: Tokens pour formulaires admin
- [ ] **SQL Injection**: TypeORM parameterized queries (par défaut)
- [ ] **XSS**: Sanitize inputs (class-validator)
- [ ] **File Upload**: Whitelist MIME types (image/jpeg, image/png, image/webp)
- [ ] **Secrets**: Jamais commité (`.env` dans `.gitignore`)
- [ ] **HTTPS**: Obligatoire en production
- [ ] **DB Backups**: Automatiques quotidiens (pg_dump)

**NestJS Security Config:**
```typescript
// apps/api/src/main.ts
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: process.env.API_CORS_ORIGIN.split(','),
    credentials: true,
  });

  await app.listen(3001);
}
```

---

## 📦 6. DÉPLOIEMENT

### **Recommandation V1:**

| Service | Provider | Coût |
|---------|----------|------|
| **API** | Railway / Render | ~$5-10/mois |
| **Frontend** | Vercel | Gratuit |
| **Database** | Supabase / Neon | Gratuit (500MB) |
| **Images** | Cloudinary | Gratuit (25GB) |
| **Monitoring** | Sentry | Gratuit (5k events) |

**Docker Compose (dev local):**
```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_USER: trevor_user
      POSTGRES_PASSWORD: trevor_pass
      POSTGRES_DB: trevor_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "3001:3001"
    env_file: .env
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - api

volumes:
  pgdata:
```

---

## 📊 7. MÉTRIQUES & KPIs TECHNIQUES

**À monitorer:**
- API Response Time < 200ms (p95)
- Frontend LCP < 2.5s
- Database queries < 50ms (p95)
- Error rate < 0.1%
- Uptime > 99.5%

---

## ✅ 8. CHECKLIST PRÉ-LANCEMENT

### **Backend**
- [ ] Migrations DB exécutées
- [ ] Seeds catégories produits
- [ ] Auth OTP testée (email reçu)
- [ ] Upload images Cloudinary fonctionnel
- [ ] API docs générées (Swagger)
- [ ] Rate limiting configuré
- [ ] Logs Sentry configurés
- [ ] Health check endpoint `/health`

### **Frontend**
- [ ] Meta tags SEO configurés
- [ ] Open Graph tags configurés
- [ ] Images optimisées (WebP)
- [ ] Lighthouse score >85
- [ ] Tests mobile iOS + Android
- [ ] WhatsApp button testé (mobile + desktop)
- [ ] Formulaires validés (frontend + backend)

### **DevOps**
- [ ] CI/CD configuré (GitHub Actions)
- [ ] Environnements staging + prod
- [ ] Variables d'env sécurisées
- [ ] Backups DB automatiques
- [ ] Monitoring Uptime configuré
- [ ] SSL/HTTPS activé
- [ ] DNS configuré

---

## 🎯 PROCHAINES ÉTAPES

**Voulez-vous que je :**

1. **Génère le boilerplate initial** (monorepo structure + configs) ?
2. **Crée les migrations DB** avec TypeORM ?
3. **Implémente un module exemple** (ex: module Producers complet) ?
4. **Configure le Docker Compose** pour dev local ?

**Prêt à démarrer le développement !** 🚀
