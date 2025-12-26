# User Suspension & Ban System

Documentation complète du système de suspension et de bannissement des utilisateurs dans Trevor V1.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Statuts utilisateur](#statuts-utilisateur)
3. [Endpoints admin](#endpoints-admin)
4. [Règles de blocage](#règles-de-blocage)
5. [Implémentation technique](#implémentation-technique)
6. [Audit logging](#audit-logging)
7. [Exemples d'utilisation](#exemples-dutilisation)

---

## Vue d'ensemble

Le système de suspension/ban permet aux administrateurs de :
- **Suspendre** temporairement ou indéfiniment un utilisateur
- **Lever la suspension** d'un utilisateur
- **Bannir** définitivement un utilisateur
- Tracer toutes les actions avec audit logging complet

### Champs de base de données

**Table `users`** - nouveaux champs :

```sql
status              user_status NOT NULL DEFAULT 'active'  -- active, suspended, banned
suspend_reason      TEXT NULL                               -- Raison de la suspension/ban
suspend_until       TIMESTAMP NULL                          -- Date d'expiration (NULL = indéfini)
suspended_at        TIMESTAMP NULL                          -- Quand la suspension a été faite
suspended_by        UUID NULL                               -- Admin qui a suspendu
banned_at           TIMESTAMP NULL                          -- Quand le ban a été fait
banned_by           UUID NULL                               -- Admin qui a banni
```

---

## Statuts utilisateur

### Enum `UserStatus`

```typescript
enum UserStatus {
  ACTIVE = 'active',      // Utilisateur normal, peut se connecter et agir
  SUSPENDED = 'suspended', // Temporairement bloqué
  BANNED = 'banned',      // Banni définitivement
}
```

### Matrice des états

| Statut | Login | Actions | Auto-expiration | Levée de suspension |
|--------|-------|---------|-----------------|---------------------|
| **ACTIVE** | ✅ Oui | ✅ Oui | N/A | N/A |
| **SUSPENDED** | ❌ Non | ❌ Non | ✅ Si `suspend_until` défini | ✅ Oui via `/unsuspend` |
| **BANNED** | ❌ Non | ❌ Non | ❌ Non | ✅ Oui via `/unsuspend` |

---

## Endpoints admin

### 1. POST /admin/users/:userId/suspend

**Suspendre un utilisateur** temporairement ou indéfiniment.

**Body:**
```json
{
  "reason": "Violation des conditions d'utilisation",
  "suspendUntil": "2025-01-15T00:00:00Z"  // Optionnel
}
```

**Comportement:**
- ✅ Met `status = SUSPENDED`
- ✅ Enregistre la raison (obligatoire)
- ✅ Enregistre `suspend_until` si fourni (sinon NULL = indéfini)
- ✅ Enregistre `suspended_at = now()` et `suspended_by = admin_id`
- ✅ Efface les champs `banned_*` si l'utilisateur était banni
- ✅ Crée un audit log avec action `user.suspended`
- ❌ Rejette si l'utilisateur est déjà banni (erreur 400)
- ❌ Rejette si la raison est vide (erreur 400)

**Réponse:** Objet `User` mis à jour

---

### 2. POST /admin/users/:userId/unsuspend

**Lever la suspension** d'un utilisateur.

**Aucun body requis.**

**Comportement:**
- ✅ Met `status = ACTIVE`
- ✅ Efface `suspend_reason`, `suspend_until`, `suspended_at`, `suspended_by`
- ✅ Crée un audit log avec action `user.unsuspended`
- ❌ Rejette si l'utilisateur n'est pas suspendu (erreur 400)

**Réponse:** Objet `User` mis à jour

---

### 3. POST /admin/users/:userId/ban

**Bannir définitivement** un utilisateur.

**Body:**
```json
{
  "reason": "Fraude répétée et harcèlement"
}
```

**Comportement:**
- ✅ Met `status = BANNED`
- ✅ Enregistre la raison (obligatoire)
- ✅ Met `suspend_until = NULL` (pas d'expiration pour les bans)
- ✅ Enregistre `banned_at = now()` et `banned_by = admin_id`
- ✅ Efface les champs `suspended_*`
- ✅ Crée un audit log avec action `user.banned`
- ❌ Rejette si la raison est vide (erreur 400)

**Réponse:** Objet `User` mis à jour

**Note:** Un ban peut être levé via `/unsuspend` (qui restaure le statut `ACTIVE`)

---

## Règles de blocage

### 1. Blocage au login (JWT Strategy)

**Fichier:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

**Moment:** Lors de la validation du token JWT (chaque requête authentifiée)

**Règles:**

#### Si `status = BANNED` :
```typescript
throw new ForbiddenException({
  message: 'Votre compte a été banni de manière permanente',
  reason: user.suspendReason,
  bannedAt: user.bannedAt,
  statusCode: 403,
  errorCode: 'ACCOUNT_BANNED',
});
```
- ❌ **Blocage immédiat** à chaque requête
- 🔴 Code HTTP : **403 Forbidden**
- 🔴 Error code : **ACCOUNT_BANNED**

#### Si `status = SUSPENDED` :

**Cas 1 - Suspension active (pas expiré):**
```typescript
throw new ForbiddenException({
  message: 'Votre compte a été suspendu jusqu\'au 2025-01-15...',
  reason: user.suspendReason,
  suspendedAt: user.suspendedAt,
  suspendUntil: user.suspendUntil,
  statusCode: 403,
  errorCode: 'ACCOUNT_SUSPENDED',
});
```
- ❌ **Blocage immédiat** à chaque requête
- 🔴 Code HTTP : **403 Forbidden**
- 🔴 Error code : **ACCOUNT_SUSPENDED**

**Cas 2 - Suspension expirée:**
```typescript
// Auto-restore to active
user.status = UserStatus.ACTIVE;
user.suspendReason = null;
user.suspendUntil = null;
user.suspendedAt = null;
user.suspendedById = null;
// Continue with login
```
- ✅ **Restauration automatique** vers `ACTIVE`
- ✅ Effacement de toutes les données de suspension
- ✅ **Permet la connexion**

---

### 2. Blocage par UserStatusGuard (optionnel)

**Fichier:** `apps/api/src/common/guards/user-status.guard.ts`

**Usage:**
```typescript
@UseGuards(JwtAuthGuard, UserStatusGuard)
@Post('jobs')
createJob() { ... }
```

**Règles:** Identiques à la JWT Strategy (vérifie le statut en temps réel)

**Note:** Ce guard est **redondant** avec la JWT Strategy mais peut être utilisé sur des routes spécifiques pour plus de clarté.

---

### 3. Service helper methods

**Fichier:** `apps/api/src/modules/admin/services/admin-users.service.ts`

#### `isUserSuspended(user: User): boolean`

Vérifie si un utilisateur est **actuellement** suspendu (considère l'expiration).

```typescript
if (user.status !== UserStatus.SUSPENDED) return false;
if (!user.suspendUntil) return true; // Indéfini = toujours suspendu
return new Date() < user.suspendUntil; // Vérifie si expiré
```

#### `canUserPerformActions(user: User): { allowed: boolean; reason?: string }`

Vérifie si un utilisateur peut effectuer des actions.

```typescript
// Returns:
{ allowed: false, reason: 'Account banned: ...' }          // Si banni
{ allowed: false, reason: 'Account suspended until ...' }  // Si suspendu
{ allowed: true }                                          // Si actif
```

---

## Implémentation technique

### Architecture des vérifications

```
┌─────────────────────────────────────────────────────┐
│  Client fait une requête avec JWT token            │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  JwtAuthGuard (Passport)                            │
│  ├─ Vérifie la validité du token                   │
│  └─ Appelle JwtStrategy.validate()                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  JwtStrategy.validate()                             │
│  1. Fetch user from DB                              │
│  2. Check isActive                                  │
│  3. ❗ CHECK STATUS (BANNED/SUSPENDED)              │
│  4. Auto-expire suspended users                     │
│  5. Update lastLoginAt & lastSeenAt                 │
│  6. Return user or throw ForbiddenException         │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  [Optionnel] UserStatusGuard                        │
│  - Double-check du statut                           │
│  - Utilisé sur routes sensibles                     │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  Route handler exécutée                             │
│  (utilisateur garanti ACTIVE)                       │
└─────────────────────────────────────────────────────┘
```

### Points clés

1. **Blocage au niveau JWT Strategy** :
   - ✅ Bloque **toutes** les requêtes authentifiées
   - ✅ Vérifie le statut à chaque requête (pas de cache)
   - ✅ Auto-expire les suspensions temporaires

2. **Pas de cache de statut** :
   - Le statut est récupéré depuis la DB à chaque validation JWT
   - Garantit que les changements de statut sont **immédiats**

3. **Suspensions temporaires auto-expirées** :
   - Si `suspend_until < now()`, l'utilisateur est automatiquement restauré à `ACTIVE`
   - Pas besoin de cron job pour lever les suspensions expirées

---

## Audit logging

### Actions tracées

Toutes les actions de suspension/ban créent des entrées d'audit log :

| Action | Entity Type | Description |
|--------|-------------|-------------|
| `user.suspended` | `user` | Admin a suspendu un utilisateur |
| `user.unsuspended` | `user` | Admin a levé la suspension |
| `user.banned` | `user` | Admin a banni un utilisateur |

### Données enregistrées

```json
{
  "actorUserId": "uuid-of-admin",
  "action": "user.suspended",
  "entityType": "user",
  "entityId": "uuid-of-target-user",
  "beforeJson": {
    "status": "active",
    "suspendReason": null,
    "suspendUntil": null
  },
  "afterJson": {
    "status": "suspended",
    "suspendReason": "Violation des CGU",
    "suspendUntil": "2025-01-15T00:00:00Z",
    "suspendedAt": "2025-12-26T10:30:00Z",
    "suspendedById": "uuid-of-admin"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "requestMethod": "POST",
  "requestUrl": "/admin/users/xyz/suspend",
  "metadata": {
    "description": "Admin suspended user account",
    "reason": "Violation des CGU",
    "suspendUntil": "2025-01-15T00:00:00Z",
    "isTemporary": true
  }
}
```

---

## Exemples d'utilisation

### Exemple 1 : Suspension temporaire (7 jours)

**Requête:**
```bash
POST /admin/users/550e8400-e29b-41d4-a716-446655440000/suspend
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "reason": "Spam dans les commentaires",
  "suspendUntil": "2025-01-02T23:59:59Z"
}
```

**Réponse:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "status": "suspended",
  "suspendReason": "Spam dans les commentaires",
  "suspendUntil": "2025-01-02T23:59:59.000Z",
  "suspendedAt": "2025-12-26T10:30:00.000Z",
  "suspendedById": "admin-uuid",
  "bannedAt": null,
  "bannedById": null
}
```

**Comportement:**
- ❌ L'utilisateur ne peut plus se connecter jusqu'au 2 janvier 2025
- ✅ Le 2 janvier à 23:59:59, la suspension expire **automatiquement**
- ✅ L'utilisateur peut se reconnecter immédiatement après expiration

---

### Exemple 2 : Suspension indéfinie

**Requête:**
```bash
POST /admin/users/550e8400-e29b-41d4-a716-446655440000/suspend
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "reason": "Enquête en cours - fraude suspectée"
}
```

**Réponse:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "suspended",
  "suspendReason": "Enquête en cours - fraude suspectée",
  "suspendUntil": null,  // Indéfini
  "suspendedAt": "2025-12-26T10:30:00.000Z",
  "suspendedById": "admin-uuid"
}
```

**Comportement:**
- ❌ L'utilisateur ne peut plus se connecter
- ❌ **Aucune expiration automatique** (suspend_until = null)
- ✅ Nécessite une action admin explicite via `/unsuspend` pour lever la suspension

---

### Exemple 3 : Ban définitif

**Requête:**
```bash
POST /admin/users/550e8400-e29b-41d4-a716-446655440000/ban
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "reason": "Violations répétées - fraude confirmée"
}
```

**Réponse:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "banned",
  "suspendReason": "Violations répétées - fraude confirmée",
  "suspendUntil": null,
  "bannedAt": "2025-12-26T10:30:00.000Z",
  "bannedById": "admin-uuid",
  "suspendedAt": null,
  "suspendedById": null
}
```

**Comportement:**
- ❌ L'utilisateur ne peut **jamais** se reconnecter
- ❌ Aucune expiration automatique
- ✅ Peut être levé par un admin via `/unsuspend` (cas exceptionnel)

---

### Exemple 4 : Lever une suspension

**Requête:**
```bash
POST /admin/users/550e8400-e29b-41d4-a716-446655440000/unsuspend
Authorization: Bearer <admin-jwt-token>
```

**Réponse:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "suspendReason": null,
  "suspendUntil": null,
  "suspendedAt": null,
  "suspendedById": null,
  "bannedAt": null,
  "bannedById": null
}
```

**Comportement:**
- ✅ L'utilisateur peut immédiatement se reconnecter
- ✅ Toutes les données de suspension/ban sont effacées

---

### Exemple 5 : Tentative de login d'un utilisateur suspendu

**Requête:**
```bash
GET /jobs
Authorization: Bearer <user-jwt-token>
```

**Réponse (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Votre compte a été suspendu jusqu'au 2025-01-02T23:59:59.000Z",
  "reason": "Spam dans les commentaires",
  "suspendedAt": "2025-12-26T10:30:00.000Z",
  "suspendUntil": "2025-01-02T23:59:59.000Z",
  "errorCode": "ACCOUNT_SUSPENDED"
}
```

---

### Exemple 6 : Tentative de login d'un utilisateur banni

**Requête:**
```bash
GET /jobs
Authorization: Bearer <user-jwt-token>
```

**Réponse (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Votre compte a été banni de manière permanente",
  "reason": "Violations répétées - fraude confirmée",
  "bannedAt": "2025-12-26T10:30:00.000Z",
  "errorCode": "ACCOUNT_BANNED"
}
```

---

## Contraintes SQL

### Contraintes de cohérence

La migration inclut des contraintes CHECK pour garantir la cohérence des données :

1. **suspend_reason requis si suspendu/banni:**
   ```sql
   CHECK (
     (status = 'active') OR
     (status IN ('suspended', 'banned') AND suspend_reason IS NOT NULL)
   )
   ```

2. **Champs suspended_* cohérents:**
   ```sql
   CHECK (
     (status != 'suspended') OR
     (status = 'suspended' AND suspended_at IS NOT NULL AND suspended_by IS NOT NULL)
   )
   ```

3. **Champs banned_* cohérents:**
   ```sql
   CHECK (
     (status != 'banned') OR
     (status = 'banned' AND banned_at IS NOT NULL AND banned_by IS NOT NULL)
   )
   ```

---

## Sécurité

### Protection des endpoints

Tous les endpoints de suspension/ban sont protégés par :

1. **JwtAuthGuard** - Authentification requise
2. **RolesGuard** - Rôle `ADMIN` requis
3. **AdminRateLimitGuard** - Protection contre le spam
4. **AdminIpLockGuard** - Blocage IP après échecs multiples
5. **AdminFailureInterceptor** - Tracking des tentatives échouées
6. **@SensitiveAction()** - Marqueur d'action sensible

### Permissions requises

```typescript
@Roles(Role.ADMIN)  // Seuls les admins peuvent suspendre/bannir
@Post('users/:userId/suspend')
async suspendUser(...) { ... }
```

---

## Migration

**Fichier:** `database/migrations/013_add_user_suspension_fields.sql`

**Commande:**
```bash
# Appliquer la migration
psql -U postgres -d trevor -f database/migrations/013_add_user_suspension_fields.sql
```

**Rollback (si nécessaire):**
```sql
-- Supprimer les contraintes
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_suspend_reason_required;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_suspended_fields_consistency;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_banned_fields_consistency;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_suspended_by;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_banned_by;

-- Supprimer les index
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_suspend_until;
DROP INDEX IF EXISTS idx_users_suspended_by;
DROP INDEX IF EXISTS idx_users_banned_by;
DROP INDEX IF EXISTS idx_users_suspended_active;

-- Supprimer les colonnes
ALTER TABLE users DROP COLUMN IF EXISTS status;
ALTER TABLE users DROP COLUMN IF EXISTS suspend_reason;
ALTER TABLE users DROP COLUMN IF EXISTS suspend_until;
ALTER TABLE users DROP COLUMN IF EXISTS suspended_at;
ALTER TABLE users DROP COLUMN IF EXISTS suspended_by;
ALTER TABLE users DROP COLUMN IF EXISTS banned_at;
ALTER TABLE users DROP COLUMN IF EXISTS banned_by;

-- Supprimer l'enum
DROP TYPE IF EXISTS user_status;
```

---

## Tests recommandés

### Tests unitaires

1. **AdminUsersService:**
   - ✅ `suspendUser()` - suspension temporaire
   - ✅ `suspendUser()` - suspension indéfinie
   - ✅ `suspendUser()` - rejet si utilisateur banni
   - ✅ `suspendUser()` - rejet si raison vide
   - ✅ `unsuspendUser()` - levée de suspension
   - ✅ `unsuspendUser()` - rejet si non suspendu
   - ✅ `banUser()` - ban permanent
   - ✅ `banUser()` - rejet si raison vide
   - ✅ `isUserSuspended()` - vérifie expiration
   - ✅ `canUserPerformActions()` - vérifie permissions

2. **JwtStrategy:**
   - ✅ Bloque les utilisateurs bannis
   - ✅ Bloque les utilisateurs suspendus
   - ✅ Auto-expire les suspensions temporaires
   - ✅ Permet les utilisateurs actifs

### Tests d'intégration

1. **E2E - Suspension flow:**
   - ✅ Admin suspend un utilisateur
   - ✅ Utilisateur suspendu ne peut plus se connecter
   - ✅ Admin lève la suspension
   - ✅ Utilisateur peut se reconnecter

2. **E2E - Ban flow:**
   - ✅ Admin bannit un utilisateur
   - ✅ Utilisateur banni ne peut plus se connecter
   - ✅ Admin lève le ban
   - ✅ Utilisateur peut se reconnecter

3. **E2E - Auto-expiration:**
   - ✅ Admin suspend avec date d'expiration
   - ✅ Utilisateur bloqué avant expiration
   - ✅ Utilisateur peut se connecter après expiration

---

## FAQ

**Q: Quelle est la différence entre suspension et ban ?**
- **Suspension :** Temporaire ou indéfini, peut avoir une date d'expiration auto
- **Ban :** Permanent (mais peut être levé manuellement)

**Q: Comment lever un ban ?**
- Utiliser l'endpoint `/unsuspend` (fonctionne pour les deux)

**Q: Les suspensions temporaires expirent-elles automatiquement ?**
- ✅ Oui, lors de la prochaine tentative de connexion après `suspend_until`

**Q: Un utilisateur suspendu peut-il voir son profil ?**
- ❌ Non, la vérification du statut se fait au niveau JWT (blocage total)

**Q: Les admins peuvent-ils être suspendus ?**
- ✅ Oui, aucune exception (un super-admin peut suspendre un admin)

**Q: Que se passe-t-il si on suspend un utilisateur déjà banni ?**
- ❌ Erreur 400 : "Cannot suspend a banned user. Unban first if needed."

---

## Auteur & Date

- **Implémentation:** 2025-12-26
- **Version API:** Trevor V1
- **Commit:** `ed53af8` (feature: add user verification/unverification endpoints)
- **Migration:** `013_add_user_suspension_fields.sql`
