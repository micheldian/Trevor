# Match Confirmation avec Transaction

## Vue d'ensemble

La **confirmation d'un match** est une opération critique qui effectue **3 actions simultanées dans une transaction atomique**:

1. **Match** → `status: confirmed`
2. **Job** → `status: confirmed`
3. **Availability** du candidat → **bloquée** (anti double-booking)

## Endpoint

```http
POST /matches/:id/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Mission confirmée avec Jean Dupont" (optionnel)
}
```

## Transaction

Toutes les opérations sont effectuées dans une **transaction PostgreSQL** grâce à `DataSource.createQueryRunner()`.

### Flux de la Transaction

```typescript
BEGIN TRANSACTION
  1. SELECT match (avec relations job, candidate)
  2. Vérifier ownership (employer uniquement)
  3. Vérifier que match.status != confirmed
  4. Vérifier que job.status IN ['published', 'in_contact']
  5. SELECT availability (candidat + créneau job)
  6. Vérifier que availability.bookedByMatchId IS NULL

  7. UPDATE matches SET status='confirmed', confirmedAt=NOW()
  8. UPDATE jobs SET status='confirmed', confirmedAt=NOW()
  9. UPDATE availabilities SET bookedByMatchId=:matchId, bookedAt=NOW()

COMMIT
```

**En cas d'erreur → ROLLBACK automatique**

## Règles de Validation

### 1. Permission (403 Forbidden)
✅ **Seul l'employeur** (propriétaire du job) peut confirmer un match

```
Vérification: employerProfile.userId === req.user.userId
```

### 2. État du Match (400 Bad Request)
✅ Le match ne doit **pas être déjà confirmé**

```
if (match.status === 'confirmed')
  → "Ce match est déjà confirmé"
```

### 3. État du Job (400 Bad Request)
✅ Le job doit être en statut **`published`** ou **`in_contact`**

```
Allowed: ['published', 'in_contact']
Rejected: ['draft', 'confirmed', 'completed', 'cancelled']

→ "Le job doit être en statut 'published' ou 'in_contact' pour être confirmé"
```

### 4. Disponibilité Requise (400 Bad Request)
✅ Le candidat doit avoir une **availability correspondante au créneau du job**

```
Recherche:
  profileId = candidate.id
  dateType = job.dateType   (ex: 'today')
  timeSlot = job.timeSlot   (ex: 'morning')
  isActive = true

→ "Aucune disponibilité trouvée pour le candidat sur le créneau today morning"
```

### 5. Anti Double-Booking (409 Conflict)
✅ L'availability ne doit **pas être déjà réservée**

```
if (availability.bookedByMatchId IS NOT NULL)
  → "Cette disponibilité est déjà réservée par un autre match (xxx)"
```

## Réponse

### Success (201 Created)

```json
{
  "match": {
    "id": "match-uuid",
    "status": "confirmed",
    "confirmedAt": "2024-09-15T14:30:00Z",
    "employerNotes": "Mission confirmée avec Jean Dupont"
  },
  "job": {
    "id": "job-uuid",
    "status": "confirmed",
    "confirmedAt": "2024-09-15T14:30:00Z",
    "title": "Vendanges Riesling 2024"
  },
  "blockedAvailability": {
    "id": "availability-uuid",
    "profileId": "worker-uuid",
    "dateType": "today",
    "timeSlot": "morning",
    "bookedByMatchId": "match-uuid",
    "bookedAt": "2024-09-15T14:30:00Z"
  },
  "message": "Match confirmé avec succès. Le job et la disponibilité ont été mis à jour."
}
```

### Errors

| Code | Raison | Message |
|------|--------|---------|
| 400 | Match déjà confirmé | "Ce match est déjà confirmé" |
| 400 | Job en mauvais statut | "Le job doit être en statut 'published' ou 'in_contact'..." |
| 400 | Pas d'availability | "Aucune disponibilité trouvée pour le candidat sur le créneau..." |
| 403 | Pas l'employeur | "Seul l'employeur peut confirmer un match" |
| 404 | Match introuvable | "Match non trouvé" |
| 409 | Double booking | "Cette disponibilité est déjà réservée par un autre match" |

## Cas d'Usage

### Scénario 1: Confirmation Normale

```typescript
// 1. Employeur consulte ses matches
GET /matches/employer/employer-123

// 2. Employeur confirme un match
POST /matches/match-456/confirm
{
  "notes": "Mission confirmée avec Jean Dupont"
}

// → Response 201
{
  "match": { status: "confirmed", ... },
  "job": { status: "confirmed", ... },
  "blockedAvailability": { bookedByMatchId: "match-456", ... }
}

// 3. Résultat:
//    - Jean ne peut plus être contacté sur ce créneau
//    - Le job n'apparaît plus comme "à pourvoir"
//    - L'availability de Jean est bloquée
```

### Scénario 2: Tentative de Double Booking (Conflict)

```typescript
// État initial:
// - availability-1: today/morning (worker-1)
// - match-A: employer-1 → worker-1 (CONFIRMED ✓, availability bloquée)
// - match-B: employer-2 → worker-1 (DISCUSSED)

// Employer-2 essaie de confirmer match-B
POST /matches/match-B/confirm

// → Response 409 Conflict
{
  "statusCode": 409,
  "message": "Cette disponibilité est déjà réservée par un autre match (match-A)"
}

// ✅ Transaction rollback: rien n'a changé
```

### Scénario 3: Job en Mauvais Statut

```typescript
// État: job en statut "draft"

POST /matches/match-789/confirm

// → Response 400 Bad Request
{
  "statusCode": 400,
  "message": "Le job doit être en statut 'published' ou 'in_contact' pour être confirmé. Statut actuel: draft"
}
```

## Base de Données

### Champs Ajoutés sur `availabilities`

```sql
ALTER TABLE availabilities
ADD COLUMN booked_by_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
ADD COLUMN booked_at TIMESTAMP;
```

### Index Créés

```sql
-- Trouver rapidement les availabilities bookées
CREATE INDEX idx_availabilities_booked_by_match
  ON availabilities(booked_by_match_id)
  WHERE booked_by_match_id IS NOT NULL;

-- Rechercher les availabilities disponibles
CREATE INDEX idx_availabilities_not_booked
  ON availabilities(profile_id, date_type, time_slot)
  WHERE booked_by_match_id IS NULL AND is_active = true;
```

## Sécurité

### Isolation des Transactions

- **Read Committed** (défaut PostgreSQL)
- Chaque transaction voit uniquement ses propres modifications non-committées
- Protection contre les races conditions grâce au lock implicite sur les rows

### Rollback Automatique

```typescript
try {
  await queryRunner.startTransaction();

  // ... opérations ...

  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction(); // ✅ ROLLBACK
  throw error;
} finally {
  await queryRunner.release(); // ✅ Libérer les ressources
}
```

## Tests

### Unit Tests

Les tests de transaction sont complexes car il faut mocker le `QueryRunner`. Pour l'instant, un test basique vérifie que la méthode existe.

**TODO**: Utiliser E2E tests pour valider le workflow complet.

### E2E Tests (Recommandé)

```typescript
describe('POST /matches/:id/confirm', () => {
  it('should confirm match and block availability', async () => {
    // 1. Créer job (published)
    // 2. Créer match (discussed)
    // 3. Créer availability (worker, today/morning)

    // 4. Confirmer
    const response = await request(app)
      .post(`/matches/${match.id}/confirm`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ notes: 'Confirmed' })
      .expect(201);

    // 5. Vérifier résultats
    expect(response.body.match.status).toBe('confirmed');
    expect(response.body.job.status).toBe('confirmed');
    expect(response.body.blockedAvailability.bookedByMatchId).toBe(match.id);

    // 6. Vérifier double booking impossible
    await request(app)
      .post(`/matches/${otherMatch.id}/confirm`)
      .expect(409); // Conflict
  });
});
```

## Considérations V2

- **Notifications** push au candidat quand confirmé
- **Calendrier** sync (Google Calendar, iCal)
- **Historique** des confirmations/annulations
- **Deadline** auto-release si pas de confirmation dans X jours
- **Paiement** intégration (acompte à la confirmation)
