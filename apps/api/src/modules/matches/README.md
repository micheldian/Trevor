# Matches Module

## Description

Module de gestion des **matches** entre missions (jobs) et candidats (workers/team_leads). Un match est créé quand un employeur clique sur le bouton "WhatsApp" d'une carte profil. Le système génère automatiquement un lien WhatsApp click-to-chat et implémente une **anti-duplication stricte**.

## Concept

Dans Trevor V1, le workflow est simple:
1. Employeur consulte les profils disponibles (via `/search/available`)
2. Employeur clique sur "Contacter via WhatsApp" sur une carte profil
3. → **Création d'un Match** (ou récupération si déjà existant)
4. → **Génération du lien WhatsApp** avec message pré-rempli
5. → Redirection vers WhatsApp (web ou mobile)

## Anti-Duplication

**Contrainte UNIQUE** en base: `(job_id, candidate_id)`

- ✅ **Un seul match** par combinaison (job, candidat)
- ✅ **Idempotence**: cliquer plusieurs fois sur "WhatsApp" retourne le match existant
- ✅ **Flag `isNewMatch`**: indique si le match vient d'être créé ou existait déjà

## Entités

### Match

**Champs principaux:**
- `jobId` - ID de la mission
- `candidateId` - ID du profil candidat (worker ou team_lead)
- `status` - Statut actuel du match
- `employerNotes` - Notes de l'employeur
- `candidateNotes` - Notes du candidat
- `whatsappContacted` - Flag: employeur a cliqué sur WhatsApp
- `whatsappContactedAt` - Date du premier click WhatsApp

**Contraintes:**
- UNIQUE (job_id, candidate_id) - Anti-duplication
- Seuls workers et team_leads peuvent être candidats

## Statuts

### 5 Statuts Disponibles

1. **discussed** - Discussion en cours (défaut à la création)
2. **interested** - Candidat intéressé
3. **rejected** - Refusé (par employer ou candidat)
4. **confirmed** - Confirmé (mission attribuée)
5. **completed** - Terminé

**Note**: Contrairement au module Jobs, il n'y a pas de machine à états stricte. Les deux parties (employer et candidat) peuvent changer le statut librement.

## Endpoints API

### Créer un match (click WhatsApp)

```http
POST /matches
Authorization: Bearer <token>
Body: {
  "jobId": "job-uuid",
  "candidateId": "worker-uuid",
  "employerNotes": "Profil intéressant" (optionnel)
}
```

**Réponse:**
```json
{
  "match": {
    "id": "match-uuid",
    "jobId": "job-uuid",
    "candidateId": "worker-uuid",
    "status": "discussed",
    "whatsappContacted": true,
    "whatsappContactedAt": "2024-09-15T10:30:00Z",
    "createdAt": "2024-09-15T10:30:00Z"
  },
  "whatsappLink": "https://wa.me/33612345678?text=Bonjour%2C%20je%20vous%20contacte%20via%20Trevor%20concernant%20la%20mission%20%22Vendanges%20Riesling%202024%22.%20Je%20suis%20int%C3%A9ress%C3%A9%20par%20votre%20profil.%0A%0AVignobles%20du%20Rhin",
  "candidatePhone": "+33612345678",
  "isNewMatch": true
}
```

**Restrictions:**
- Utilisateur doit être propriétaire du job (employer)
- Le candidat doit être un worker ou team_lead
- Le candidat doit avoir un numéro WhatsApp configuré

**Anti-duplication:**
- Si un match existe déjà pour (job, candidat), il est retourné avec `isNewMatch: false`
- Le flag `whatsappContacted` est mis à jour si ce n'était pas déjà fait

### Lister les matches

```http
GET /matches?jobId=<uuid>&candidateId=<uuid>&status=<status>
Authorization: Bearer <token>
```

**Filtres optionnels:**
- `jobId` - Matches d'un job spécifique
- `candidateId` - Matches d'un candidat spécifique
- `status` - Filtrer par statut

### Récupérer un match

```http
GET /matches/:id
Authorization: Bearer <token>
```

### Matches d'un employeur

```http
GET /matches/employer/:employerId
Authorization: Bearer <token>
```

Retourne tous les matches pour tous les jobs de l'employeur.

### Matches d'un candidat

```http
GET /matches/candidate/:candidateId
Authorization: Bearer <token>
```

Retourne tous les matches où le candidat est impliqué.

### Mettre à jour le statut

```http
PATCH /matches/:id/status
Authorization: Bearer <token>
Body: {
  "status": "interested",
  "notes": "Je suis intéressé par cette mission" (optionnel)
}
```

**Qui peut modifier:**
- L'employeur (propriétaire du job)
- Le candidat (propriétaire du profil candidat)

**Notes:**
- Si l'employeur modifie: les notes vont dans `employerNotes`
- Si le candidat modifie: les notes vont dans `candidateNotes`

## Génération du Lien WhatsApp

### Format

```
https://wa.me/<phone>?text=<message>
```

### Message Pré-rempli

```
Bonjour, je vous contacte via Trevor concernant la mission "<job.title>".
Je suis intéressé par votre profil.

<companyName>
```

**Exemple:**
```
https://wa.me/33612345678?text=Bonjour%2C%20je%20vous%20contacte%20via%20Trevor%20concernant%20la%20mission%20%22Vendanges%20Riesling%202024%22.%20Je%20suis%20int%C3%A9ress%C3%A9%20par%20votre%20profil.%0A%0AVignobles%20du%20Rhin
```

### Traitement du Numéro

1. Récupération depuis `profile.whatsappNumber`
2. Nettoyage: suppression des espaces, tirets, parenthèses
3. Format final: `+33612345678` → `33612345678`

### Compatibilité

- **Desktop**: `https://wa.me/...` (ouvre web.whatsapp.com)
- **Mobile**: `https://wa.me/...` (ouvre l'app WhatsApp)

## Exemples d'Utilisation

### Scénario 1: Premier Contact

```typescript
// Employeur clique "WhatsApp" sur profil Jean Dupont
POST /matches
{
  "jobId": "job-vendanges-123",
  "candidateId": "worker-jean-456"
}

// → Réponse
{
  "match": { ... },
  "whatsappLink": "https://wa.me/33612345678?text=...",
  "isNewMatch": true
}

// Frontend: Redirect vers whatsappLink
window.location.href = response.whatsappLink;
```

### Scénario 2: Re-Click WhatsApp

```typescript
// Employeur re-clique "WhatsApp" (même job, même candidat)
POST /matches
{
  "jobId": "job-vendanges-123",
  "candidateId": "worker-jean-456"
}

// → Réponse (match existant)
{
  "match": { id: "match-789", ... },
  "whatsappLink": "https://wa.me/33612345678?text=...",
  "isNewMatch": false  // ← Match déjà existant
}
```

### Scénario 3: Candidat Marque Intérêt

```typescript
// Candidat consulte ses matches
GET /matches/candidate/worker-jean-456

// Candidat marque son intérêt
PATCH /matches/match-789/status
{
  "status": "interested",
  "notes": "Disponible pour cette période"
}

// → Match mis à jour avec status=interested, candidateNotes rempli
```

### Scénario 4: Confirmation

```typescript
// Employeur confirme le candidat
PATCH /matches/match-789/status
{
  "status": "confirmed",
  "notes": "Mission confirmée pour Jean"
}

// → Match status=confirmed, confirmedAt défini
```

## Règles Métier

1. **Création**: Seul l'employeur (propriétaire du job) peut créer un match
2. **Anti-duplication**: Un seul match par (job, candidat)
3. **WhatsApp requis**: Le candidat doit avoir un numéro WhatsApp
4. **Statut libre**: Pas de machine à états stricte (contrairement à Jobs)
5. **Notes séparées**: Employer et candidat ont leurs propres notes
6. **Tracking**: Premier click WhatsApp est enregistré

## Tests

### Unit Tests

```bash
npm test -- matches.service.spec.ts
```

**Couverture (24 tests):**
- ✅ Création avec anti-duplication
- ✅ Génération lien WhatsApp
- ✅ Validations (job, candidat, ownership)
- ✅ Retour match existant (idempotence)
- ✅ Update whatsappContacted si pas déjà fait
- ✅ Changement statut (employer et candidat)
- ✅ Notes (employer vs candidat)
- ✅ Filtres (jobId, candidateId, status)
- ✅ findByEmployer / findByCandidate

## Migration

```bash
psql -U <user> -d <database> -f database/migrations/006_create_matches_table.sql
```

**Crée:**
- Table `matches` avec UNIQUE constraint
- ENUM `match_status`
- Indexes sur job_id, candidate_id, status
- Trigger pour updated_at

## Architecture

```
matches/
├── entities/
│   └── match.entity.ts          # Entity avec UNIQUE constraint
├── dto/
│   ├── create-match.dto.ts      # DTO création
│   └── update-match-status.dto.ts  # DTO update statut
├── interfaces/
│   └── match-response.interface.ts  # Response avec WhatsApp link
├── matches.service.ts           # Logique métier + anti-duplication
├── matches.controller.ts        # 6 endpoints REST
├── matches.module.ts            # Module NestJS
└── README.md                    # Documentation
```

## Dépendances

- `@nestjs/typeorm` - ORM
- `class-validator` - Validation DTOs
- Job entity (relation)
- Profile entity (relation)

## À Venir (V2)

- Notifications push quand match créé (côté candidat)
- Historique des changements de statut
- Statistiques de matching
- Taux de réponse WhatsApp
- Intégration calendrier pour confirmed matches
