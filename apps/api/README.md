# 🔐 Trevor API - Authentication OTP

API NestJS avec authentification OTP par téléphone/email + JWT.

---

## 🚀 Installation

```bash
cd apps/api
pnpm install
```

---

## 🐳 Setup avec Docker

### **1. Démarrer PostgreSQL + Redis**

```bash
docker-compose up -d postgres redis
```

### **2. Variables d'environnement**

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### **3. Démarrer l'API**

```bash
pnpm start:dev
```

---

## 📋 Architecture Auth

### **Flow OTP**

```
1. POST /auth/start { phone: "+33612345678" }
   → Génère code OTP (ex: 123456)
   → Stocke dans Redis (TTL 10min)
   → Envoie SMS (mock en dev)
   → Retourne: { success: true, maskedContact: "+336****5678" }

2. POST /auth/verify { phone: "+33612345678", code: "123456" }
   → Vérifie code dans Redis
   → Crée user si n'existe pas
   → Génère JWT token
   → Retourne: { accessToken, refreshToken, user }

3. Requêtes protégées
   → Header: Authorization: Bearer <accessToken>
   → JwtAuthGuard valide le token
   → Injecte user via @CurrentUser()
```

---

## 🔧 Stockage OTP

### **Redis (Recommandé)**
```typescript
// Clé: otp:+33612345678
{
  code: "123456",
  phone: "+33612345678",
  expiresAt: 1703174400000,
  attempts: 0,
  createdAt: 1703173800000
}
// TTL: 600 secondes (10 minutes)
```

**Avantages** :
- ✅ Auto-expiration (TTL)
- ✅ Performances (in-memory)
- ✅ Pas de cleanup manuel

---

## 🛡️ Sécurité

### **Rate Limiting**

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `POST /auth/start` | 5 req | 1 heure |
| `POST /auth/verify` | 3 req | 10 minutes |
| Autres | 100 req | 1 minute |

**Implémentation** : `@nestjs/throttler`

### **Validation OTP**
- Max **3 tentatives** par code
- Code expire après **10 minutes**
- Auto-suppression après vérification

### **JWT**
- Expiration : 7 jours (configurable)
- Refresh token : 30 jours
- Secret : 32+ caractères (env)

---

## 📝 Endpoints

### **POST /auth/start**
Demande un code OTP.

**Request**:
```json
{
  "phone": "+33612345678"
}
```

**Response** `200`:
```json
{
  "success": true,
  "message": "Code OTP envoyé à +336****5678",
  "expiresIn": 600,
  "maskedContact": "+336****5678"
}
```

**Errors**:
- `400`: Numéro invalide
- `429`: Trop de requêtes (5/heure)

---

### **POST /auth/verify**
Vérifie le code OTP.

**Request**:
```json
{
  "phone": "+33612345678",
  "code": "123456"
}
```

**Response** `200`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800,
  "user": {
    "id": "uuid",
    "phone": "+33612345678",
    "profiles": []
  }
}
```

**Errors**:
- `401`: Code invalide/expiré
- `401`: Trop de tentatives (3 max)

---

### **GET /auth/me**
Profil utilisateur courant.

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** `200`:
```json
{
  "id": "uuid",
  "phone": "+33612345678",
  "firstName": "Jean",
  "lastName": "Dupont",
  "profiles": [
    {
      "id": "profile-uuid",
      "type": "worker",
      "isComplete": true
    }
  ]
}
```

---

## 🧪 Tests

### **Tester en DEV (mock SMS)**

```bash
# 1. Démarrer l'API
pnpm start:dev

# 2. Demander OTP (voir le code dans les logs)
curl -X POST http://localhost:3001/auth/start \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'

# Console API affichera:
# [SMS MOCK] To: +33612345678 | Code: 123456

# 3. Vérifier OTP
curl -X POST http://localhost:3001/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678", "code": "123456"}'

# 4. Utiliser le token
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🔌 Intégration SMS (Production)

### **Option 1: Twilio**

```bash
pnpm add twilio
```

```typescript
// apps/api/src/modules/auth/services/sms.service.ts
import twilio from 'twilio';

async sendOtp(phone: string, code: string): Promise<void> {
  const client = twilio(
    this.configService.get('TWILIO_ACCOUNT_SID'),
    this.configService.get('TWILIO_AUTH_TOKEN'),
  );

  await client.messages.create({
    body: `Votre code Trevor: ${code}. Valide 10 minutes.`,
    from: this.configService.get('TWILIO_PHONE_NUMBER'),
    to: phone,
  });
}
```

**.env** :
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+33123456789
```

### **Option 2: AWS SNS**

```typescript
import { SNS } from 'aws-sdk';

async sendOtp(phone: string, code: string): Promise<void> {
  const sns = new SNS({ region: 'eu-west-1' });

  await sns.publish({
    Message: `Votre code Trevor: ${code}`,
    PhoneNumber: phone,
  }).promise();
}
```

---

## 🔐 Guards & Decorators

### **JwtAuthGuard (Global)**

Protège tous les endpoints par défaut.

```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
]
```

### **@Public() Decorator**

Rend un endpoint public (pas d'auth).

```typescript
@Public()
@Get('public-data')
async getPublicData() {
  return { message: 'Accessible sans token' };
}
```

### **@CurrentUser() Decorator**

Injecte l'utilisateur authentifié.

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

---

## 📦 Structure Fichiers

```
apps/api/src/
├── modules/
│   └── auth/
│       ├── dto/
│       │   ├── start-otp.dto.ts
│       │   └── verify-otp.dto.ts
│       ├── guards/
│       │   └── jwt-auth.guard.ts
│       ├── strategies/
│       │   └── jwt.strategy.ts
│       ├── services/
│       │   ├── otp.service.ts          # Gestion OTP (Redis)
│       │   └── sms.service.ts          # Envoi SMS (Twilio)
│       ├── interfaces/
│       │   └── jwt-payload.interface.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── auth.module.ts
└── common/
    ├── decorators/
    │   ├── public.decorator.ts
    │   └── current-user.decorator.ts
    └── guards/
```

---

## 🐛 Troubleshooting

### **Erreur: Redis connection refused**
```bash
# Vérifier Redis
docker ps | grep redis

# Redémarrer Redis
docker-compose restart redis
```

### **Erreur: JWT secret missing**
```bash
# Vérifier .env
cat .env | grep JWT_SECRET

# Générer secret sécurisé
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **SMS ne s'envoie pas (prod)**
```bash
# Vérifier variables Twilio
echo $TWILIO_ACCOUNT_SID

# Tester directement Twilio
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  --data-urlencode "From=+33123456789" \
  --data-urlencode "To=+33612345678" \
  --data-urlencode "Body=Test" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

---

## 📚 Documentation Swagger

Accéder à la doc interactive :

```
http://localhost:3001/docs
```

Tester directement depuis Swagger UI :
1. Cliquer "Try it out" sur `/auth/start`
2. Copier le code depuis les logs API
3. Utiliser `/auth/verify` avec le code
4. Cliquer "Authorize" en haut et coller le token
5. Tester les endpoints protégés

---

## ✅ Checklist Déploiement

- [ ] Variables d'env production configurées
- [ ] JWT_SECRET généré (min 32 chars)
- [ ] Redis configuré (managed service)
- [ ] Twilio/SNS configuré et testé
- [ ] Rate limiting activé
- [ ] CORS configuré (whitelist domaines)
- [ ] HTTPS activé
- [ ] Logs Sentry configurés
- [ ] Monitoring Redis (uptime, mémoire)

---

**Version**: 1.0
**Date**: 2025-12-25
