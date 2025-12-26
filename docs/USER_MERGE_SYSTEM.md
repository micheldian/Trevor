# User Merge System

Documentation complète du système de fusion d'utilisateurs (merge users) dans Trevor V1.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Cas d'usage](#cas-dusage)
3. [Endpoint API](#endpoint-api)
4. [Règles de sécurité](#règles-de-sécurité)
5. [Stratégie de merge](#stratégie-de-merge)
6. [Données transférées](#données-transférées)
7. [Mode dry run](#mode-dry-run)
8. [Transaction atomique](#transaction-atomique)
9. [Audit logging](#audit-logging)
10. [Exemples d'utilisation](#exemples-dutilisation)
11. [Rollback](#rollback)
12. [Problèmes connus](#problèmes-connus)

---

## Vue d'ensemble

Le système de merge permet à un administrateur de **fusionner deux comptes utilisateurs** en transférant toutes les données de l'utilisateur source vers l'utilisateur cible, puis en désactivant l'utilisateur source.

### Quand utiliser cette fonctionnalité ?

- Utilisateur a créé un compte en double par erreur
- Fusion de comptes après vérification d'identité
- Migration de données d'un compte test vers un compte de production
- Consolidation de profils multiples pour la même personne

### Objectifs principaux

✅ **Sécurité**: Vérifications multiples avant exécution
✅ **Atomicité**: Transaction SQL garantit tout ou rien
✅ **Traçabilité**: Audit log complet avec before/after
✅ **Prévisualisation**: Mode dry run pour vérifier avant d'exécuter
✅ **Réversibilité**: Impossible à annuler (irréversible) - d'où l'importance du dry run

---

## Cas d'usage

### Cas 1: Compte en double

**Scénario:**
Jean Dupont s'est inscrit deux fois:
- User A: jean.dupont@gmail.com (3 profiles, 12 jobs, 45 matches)
- User B: jeandupont@gmail.com (0 profiles, 0 jobs, 0 matches)

**Action:**
Merger User B → User A, puis désactiver User B.

---

### Cas 2: Migration compte test → production

**Scénario:**
Un employeur a testé la plateforme avec un compte test avant de créer son vrai compte:
- User Test: test@company.com (5 jobs postés, 20 matches)
- User Prod: real@company.com (0 jobs, 0 matches)

**Action:**
Merger User Test → User Prod pour transférer l'historique.

---

### Cas 3: Fusion après vérification

**Scénario:**
Support a détecté que deux comptes appartiennent à la même personne (même nom, même adresse, même téléphone).

**Action:**
Vérifier avec l'utilisateur, puis merger les comptes pour simplifier.

---

## Endpoint API

### POST /admin/users/merge

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "sourceUserId": "uuid-of-source-user",
  "targetUserId": "uuid-of-target-user",
  "reason": "Duplicate account - user registered twice",
  "dryRun": false
}
```

**Paramètres:**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `sourceUserId` | UUID | Oui | ID de l'utilisateur source (sera désactivé) |
| `targetUserId` | UUID | Oui | ID de l'utilisateur cible (recevra les données) |
| `reason` | String | Oui | Raison de la fusion (audit) |
| `dryRun` | Boolean | Non | Si true, prévisualise sans exécuter (default: false) |

**Réponse réussie (200):**
```json
{
  "success": true,
  "message": "Successfully merged jean.dupont@gmail.com into jeandupont@gmail.com. Source user has been deactivated.",
  "transferSummary": {
    "profilesTransferred": 3,
    "reviewsGivenTransferred": 5,
    "reviewsReceivedTransferred": 12,
    "matchesTransferred": 45,
    "jobsTransferred": 12,
    "availabilitiesTransferred": 8
  },
  "sourceUser": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "jean.dupont@gmail.com",
    "phone": null,
    "isActive": false,
    "status": "suspended"
  },
  "targetUser": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "jeandupont@gmail.com",
    "phone": "+33612345678",
    "profilesCount": 3
  },
  "auditLogId": "audit-log-uuid",
  "warnings": []
}
```

**Erreurs possibles:**

| Code | Description |
|------|-------------|
| 400 | Validation échouée (self-merge, target inactive, source is admin, etc.) |
| 404 | Source ou target user introuvable |
| 409 | Transaction échouée (rollback effectué) |

---

## Règles de sécurité

### Safety Checks (dans l'ordre)

#### 1. Les deux utilisateurs existent
```typescript
if (!sourceUser || !targetUser) {
  throw new NotFoundException('User not found');
}
```

#### 2. Pas de self-merge
```typescript
if (sourceUserId === targetUserId) {
  throw new BadRequestException('Cannot merge user with itself');
}
```

#### 3. Target doit être actif
```typescript
if (!targetUser.isActive || targetUser.status !== UserStatus.ACTIVE) {
  throw new BadRequestException('Target must be active');
}
```

#### 4. Source ne peut pas être admin
```typescript
if (sourceUser.role === Role.ADMIN) {
  throw new BadRequestException('Cannot merge admin accounts');
}
```
**Raison:** Trop risqué de transférer des permissions admin. Si nécessaire, demander à un super-admin de changer le rôle manuellement d'abord.

#### 5. Warning si target est admin
```typescript
if (targetUser.role === Role.ADMIN) {
  warnings.push('Target is admin - grants admin privileges to all source data');
}
```
**Raison:** Les données transférées hériteront des permissions admin du target.

---

## Stratégie de merge

### Étapes d'exécution

```
┌─────────────────────────────────────────────────────────────┐
│  1. VALIDATION                                              │
│     - Check users exist                                     │
│     - Check not same user                                   │
│     - Check target active                                   │
│     - Check source not admin                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. COUNT DATA                                              │
│     - Profiles count                                        │
│     - Reviews (given + received)                            │
│     - Matches count                                         │
│     - Jobs count                                            │
│     - Availabilities count                                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DRY RUN CHECK                                           │
│     If dryRun == true:                                      │
│       → Return preview                                      │
│       → STOP (no changes)                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. START TRANSACTION                                       │
│     queryRunner.startTransaction()                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. TRANSFER DATA (in transaction)                          │
│     UPDATE profiles SET user_id = target                    │
│     UPDATE reviews SET reviewer_id = target                 │
│     UPDATE reviews SET reviewee_id = target                 │
│     UPDATE jobs SET employer_id = target                    │
│     (matches & availabilities via profiles)                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  6. DEACTIVATE SOURCE                                       │
│     UPDATE users SET                                        │
│       is_active = false,                                    │
│       status = 'suspended',                                 │
│       suspend_reason = 'Merged into ...'                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  7. COMMIT TRANSACTION                                      │
│     queryRunner.commitTransaction()                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  8. AUDIT LOG                                               │
│     action: 'users.merged'                                  │
│     before/after state                                      │
│     transfer summary                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  9. RETURN RESULT                                           │
│     Success response with details                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Données transférées

### 1. Profiles
**Table:** `profiles`
**Champ modifié:** `user_id`
**SQL:** `UPDATE profiles SET user_id = $target WHERE user_id = $source`

**Impact:**
Tous les profils (individual ou team) sont maintenant associés au target user.

---

### 2. Reviews Données (as Reviewer)
**Table:** `reviews`
**Champ modifié:** `reviewer_id`
**SQL:** `UPDATE reviews SET reviewer_id = $target WHERE reviewer_id = $source`

**Impact:**
Toutes les reviews que le source user a écrites sont maintenant attribuées au target.

---

### 3. Reviews Reçues (as Reviewee)
**Table:** `reviews`
**Champ modifié:** `reviewee_id`
**SQL:** `UPDATE reviews SET reviewee_id = $target WHERE reviewee_id = $source`

**Impact:**
Toutes les reviews reçues par le source user sont maintenant liées au target.

---

### 4. Jobs Postés
**Table:** `jobs`
**Champ modifié:** `employer_id`
**SQL:** `UPDATE jobs SET employer_id = $target WHERE employer_id = $source`

**Impact:**
Tous les jobs postés par le source user (employer) sont maintenant du target.

---

### 5. Matches (automatique via profiles)
**Table:** `matches`
**Champ:** `candidate_id` (profile_id)
**SQL:** Aucune requête directe (lié via profiles)

**Impact:**
Comme les profiles sont transférés, tous les matches associés suivent automatiquement.

---

### 6. Availabilities (automatique via profiles)
**Table:** `availabilities`
**Champ:** `profile_id`
**SQL:** Aucune requête directe (lié via profiles)

**Impact:**
Comme les profiles sont transférés, toutes les availabilities suivent automatiquement.

---

## Mode dry run

### Qu'est-ce que le dry run ?

Le **dry run** permet de **prévisualiser** ce qui sera transféré **sans exécuter** réellement la fusion.

### Utilisation

```json
{
  "sourceUserId": "source-uuid",
  "targetUserId": "target-uuid",
  "reason": "Test fusion",
  "dryRun": true  // ← Active le mode prévisualisation
}
```

### Réponse dry run

```json
{
  "success": true,
  "message": "DRY RUN: Would transfer 3 profiles, 17 reviews, 45 matches, 12 jobs, 8 availabilities from jean@example.com to jeandupont@example.com",
  "transferSummary": {
    "profilesTransferred": 3,
    "reviewsGivenTransferred": 5,
    "reviewsReceivedTransferred": 12,
    "matchesTransferred": 45,
    "jobsTransferred": 12,
    "availabilitiesTransferred": 8
  },
  "sourceUser": { "id": "...", "isActive": true, "status": "active" },
  "targetUser": { "id": "...", "profilesCount": 3 },
  "warnings": []
}
```

### Process recommandé

```
1. Exécuter avec dryRun: true → Vérifier les chiffres
2. Si OK → Exécuter avec dryRun: false → Merge réel
3. Vérifier le résultat et l'audit log
```

---

## Transaction atomique

### Garantie ACID

Le merge utilise une **transaction SQL** pour garantir:

- **Atomicité:** Tout ou rien (si une requête échoue, rollback complet)
- **Cohérence:** La base reste cohérente même en cas d'erreur
- **Isolation:** Aucune autre opération ne peut interférer pendant le merge
- **Durabilité:** Une fois committé, les changements sont permanents

### Code

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // 1. Transfer profiles
  await queryRunner.manager.query(...);

  // 2. Transfer reviews (reviewer)
  await queryRunner.manager.query(...);

  // 3. Transfer reviews (reviewee)
  await queryRunner.manager.query(...);

  // 4. Transfer jobs
  await queryRunner.manager.query(...);

  // 5. Deactivate source
  await queryRunner.manager.query(...);

  // Commit all changes
  await queryRunner.commitTransaction();
} catch (error) {
  // Rollback on error
  await queryRunner.rollbackTransaction();
  throw new ConflictException('Failed to merge');
} finally {
  await queryRunner.release();
}
```

### En cas d'erreur

Si **n'importe quelle** requête échoue:
- ✅ Rollback automatique
- ✅ Aucun changement appliqué
- ✅ Base de données reste dans son état initial
- ❌ ConflictException (409) retournée

---

## Audit logging

### Action enregistrée

**Action:** `users.merged`
**Entity Type:** `user`
**Entity ID:** `sourceUserId`

### Before State

```json
{
  "source": {
    "id": "source-uuid",
    "email": "jean@example.com",
    "phone": null,
    "isActive": true,
    "status": "active",
    "profilesCount": 3
  },
  "target": {
    "id": "target-uuid",
    "email": "jeandupont@example.com",
    "phone": "+33612345678",
    "profilesCount": 0
  }
}
```

### After State

```json
{
  "source": {
    "id": "source-uuid",
    "isActive": false,
    "status": "suspended",
    "suspendReason": "Merged into user target-uuid"
  },
  "target": {
    "id": "target-uuid",
    "profilesCount": 3
  },
  "transferred": {
    "profiles": 3,
    "reviewsGiven": 5,
    "reviewsReceived": 12,
    "matches": 45,
    "jobs": 12,
    "availabilities": 8
  }
}
```

### Metadata

```json
{
  "description": "Admin merged two user accounts",
  "reason": "Duplicate account - user registered twice",
  "sourceUserId": "source-uuid",
  "targetUserId": "target-uuid",
  "transferSummary": { ... }
}
```

---

## Exemples d'utilisation

### Exemple 1: Dry run pour prévisualiser

**Requête:**
```bash
POST /admin/users/merge
Authorization: Bearer <admin-token>

{
  "sourceUserId": "aaa-111",
  "targetUserId": "bbb-222",
  "reason": "Test preview",
  "dryRun": true
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "DRY RUN: Would transfer 3 profiles, 17 reviews, 45 matches...",
  "transferSummary": {
    "profilesTransferred": 3,
    "reviewsGivenTransferred": 5,
    "reviewsReceivedTransferred": 12,
    "matchesTransferred": 45,
    "jobsTransferred": 12,
    "availabilitiesTransferred": 8
  },
  "warnings": []
}
```

---

### Exemple 2: Merge réel après dry run

**Requête:**
```bash
POST /admin/users/merge
Authorization: Bearer <admin-token>

{
  "sourceUserId": "aaa-111",
  "targetUserId": "bbb-222",
  "reason": "Duplicate account confirmed",
  "dryRun": false
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Successfully merged jean@example.com into jeandupont@example.com. Source user has been deactivated.",
  "transferSummary": {
    "profilesTransferred": 3,
    "reviewsGivenTransferred": 5,
    "reviewsReceivedTransferred": 12,
    "matchesTransferred": 45,
    "jobsTransferred": 12,
    "availabilitiesTransferred": 8
  },
  "sourceUser": {
    "id": "aaa-111",
    "email": "jean@example.com",
    "isActive": false,
    "status": "suspended"
  },
  "targetUser": {
    "id": "bbb-222",
    "email": "jeandupont@example.com",
    "profilesCount": 3
  },
  "auditLogId": "log-uuid",
  "warnings": []
}
```

---

### Exemple 3: Erreur - tentative de merger un admin

**Requête:**
```bash
POST /admin/users/merge

{
  "sourceUserId": "admin-user-uuid",
  "targetUserId": "normal-user-uuid",
  "reason": "Test",
  "dryRun": false
}
```

**Réponse (400):**
```json
{
  "statusCode": 400,
  "message": "Cannot merge admin accounts for security reasons",
  "error": "Bad Request"
}
```

---

### Exemple 4: Erreur - tentative de self-merge

**Requête:**
```bash
POST /admin/users/merge

{
  "sourceUserId": "same-uuid",
  "targetUserId": "same-uuid",
  "reason": "Test",
  "dryRun": false
}
```

**Réponse (400):**
```json
{
  "statusCode": 400,
  "message": "Cannot merge user with itself",
  "error": "Bad Request"
}
```

---

## Rollback

### Le merge est-il réversible ?

**Non, le merge est IRREVERSIBLE.**

Une fois exécuté:
- ❌ Impossible d'annuler automatiquement
- ❌ Les données transférées ne peuvent pas être "dé-transférées"
- ❌ Le source user ne peut pas être réactivé avec ses anciennes données

### Pourquoi ?

- Les IDs de propriété (user_id, reviewer_id, etc.) ont été modifiés
- Aucune trace de l'ancienne propriété (sauf dans l'audit log)
- Recréer manuellement serait très risqué et sujet aux erreurs

### Solution

**Utiliser le dry run AVANT d'exécuter !**

```bash
# 1. Toujours faire un dry run d'abord
dryRun: true → Vérifier les chiffres

# 2. Si les chiffres sont OK, exécuter pour de vrai
dryRun: false → Merge réel
```

### Cas exceptionnel: Restauration manuelle

Si vraiment nécessaire, un super-admin peut:
1. Consulter l'audit log pour voir les before/after states
2. Identifier tous les IDs modifiés
3. Créer des requêtes SQL manuelles pour inverser
4. **Attention:** Très risqué, à éviter absolument

---

## Problèmes connus

### 1. Conflits d'unicité (email/phone)

**Problème:**
Si source et target ont le même email/phone, le merge peut échouer.

**Solution:**
Modifier l'email/phone du source AVANT de merger.

---

### 2. Merge de comptes avec trop de données

**Problème:**
Merger un compte avec 10 000+ jobs/matches peut prendre plusieurs secondes.

**Solution:**
- Utiliser le dry run pour estimer la taille
- Exécuter pendant les heures creuses
- Augmenter le timeout de la transaction si nécessaire

---

### 3. Permissions héritées

**Problème:**
Si target est admin, les données transférées héritent des permissions admin.

**Solution:**
Le système affiche un warning. Vérifier que c'est intentionnel.

---

### 4. Relations orphelines

**Problème:**
Certaines tables peuvent avoir des relations vers users que nous n'avons pas migrées.

**Solution:**
Vérifier toutes les foreign keys vers `users` et mettre à jour cette documentation si nécessaire.

**Tables actuellement migrées:**
- ✅ profiles (user_id)
- ✅ reviews (reviewer_id, reviewee_id)
- ✅ jobs (employer_id)
- ✅ matches (via profiles)
- ✅ availabilities (via profiles)

**Tables à vérifier:**
- ❓ audit_logs (actor_user_id) - Non migré (historique)
- ❓ teams membership - Si implémenté à l'avenir

---

## Best Practices

### ✅ DO

- **Toujours** utiliser dry run d'abord
- Vérifier les comptes manuellement avant de merger
- Documenter la raison dans le champ `reason`
- Vérifier l'audit log après le merge
- Informer l'utilisateur si possible

### ❌ DON'T

- Ne jamais merger sans dry run
- Ne jamais merger des comptes admin sans autorisation explicite
- Ne pas merger "au cas où" - être sûr que c'est nécessaire
- Ne pas merger pendant les heures de pointe

---

## FAQ

**Q: Peut-on annuler un merge ?**
R: Non, c'est irréversible. Utilisez le dry run !

**Q: Que devient le source user après le merge ?**
R: Il est désactivé (is_active = false, status = suspended) avec une raison expliquant le merge.

**Q: Les matches sont-ils transférés ?**
R: Oui, automatiquement via les profiles.

**Q: Peut-on merger un admin ?**
R: Non, bloqué pour sécurité. Changer le rôle manuellement d'abord si vraiment nécessaire.

**Q: Combien de temps prend un merge ?**
R: Généralement < 1 seconde pour des comptes normaux. Peut prendre plusieurs secondes pour des comptes avec beaucoup de données.

**Q: Le merge affecte-t-il les autres utilisateurs ?**
R: Non, la transaction garantit l'isolation. Les autres opérations ne sont pas impactées.

---

## Auteur & Date

- **Implémentation:** 2025-12-26
- **Version API:** Trevor V1
- **Endpoint:** POST /admin/users/merge
- **Service:** AdminUsersService.mergeUsers()
