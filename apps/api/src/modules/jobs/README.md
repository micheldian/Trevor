# Jobs Module

## Description

Module de gestion des missions agricoles créées par les employeurs. Permet de créer, modifier, publier et gérer le cycle de vie complet d'une mission.

## Entités

### Job

Représente une mission agricole créée par un employeur.

**Champs principaux:**
- `title`: Titre de la mission
- `description`: Description détaillée
- `culture`: Type de culture (ex: Riesling, Pomme)
- `tags`: Tags pour catégoriser la mission
- `requiredSkills`: Compétences requises
- `dateType`: Type de date (today, tomorrow, this_week, next_week, specific_date)
- `specificDate`: Date spécifique (requis si dateType = specific_date)
- `timeSlot`: Créneau horaire (morning, afternoon, day)
- `nbPeople`: Nombre de personnes recherchées (1-100)
- `latitude`, `longitude`: Localisation de la mission
- `status`: Statut actuel de la mission
- `hourlyRate`: Taux horaire (optionnel)
- `estimatedHours`: Nombre d'heures estimées (optionnel)
- `isUrgent`: Mission urgente (boolean)

## Statuts et Transitions

### Statuts disponibles

1. **draft** - Brouillon (défaut à la création)
2. **published** - Publiée (visible pour les workers)
3. **in_contact** - En contact avec des candidats
4. **confirmed** - Confirmée (mission attribuée)
5. **completed** - Terminée (état final)
6. **cancelled** - Annulée (état final)

### Diagramme de transitions

```
draft ──────────┬──────────> published ──────┬──────> in_contact ──┬──────> confirmed ────> completed
                │                             │                     │
                │                             │                     │
                └────────────────────────────>└─────────────────────┴────────────> cancelled
```

### Transitions autorisées

| De | Vers | Validations |
|---|---|---|
| draft | published | Tous les champs requis + date future si specific_date |
| draft | cancelled | Raison requise |
| published | in_contact | - |
| published | cancelled | Raison requise |
| published | draft | - |
| in_contact | confirmed | - |
| in_contact | cancelled | Raison requise |
| in_contact | published | - |
| confirmed | completed | - |
| confirmed | cancelled | Raison requise |
| completed | - | État final |
| cancelled | - | État final |

### Validations spécifiques

#### Publishing (draft → published)
- `title` minimum 5 caractères
- `culture` requis
- `nbPeople` >= 1
- `latitude` et `longitude` requis
- Si `dateType = specific_date`, la date doit être dans le futur

#### Cancellation (vers cancelled)
- `reason` obligatoire (max 500 caractères)

## Endpoints API

### Créer une mission
```
POST /jobs/profiles/:profileId
Headers: Authorization: Bearer <token>
Body: CreateJobDto
```

**Restrictions:**
- Seuls les profils de type `employer` peuvent créer des missions
- L'utilisateur doit être propriétaire du profil

### Récupérer toutes les missions
```
GET /jobs?status=<status>&employerId=<id>&culture=<culture>&isUrgent=<boolean>
```

**Filtres optionnels:**
- `status`: Filtrer par statut
- `employerId`: Missions d'un employeur spécifique
- `culture`: Recherche textuelle sur la culture
- `isUrgent`: Missions urgentes uniquement

### Récupérer une mission
```
GET /jobs/:id
```

### Récupérer les missions d'un employeur
```
GET /jobs/profiles/:profileId/jobs
Headers: Authorization: Bearer <token>
```

### Mettre à jour une mission
```
PUT /jobs/:id
Headers: Authorization: Bearer <token>
Body: UpdateJobDto
```

**Restrictions:**
- Seul le propriétaire peut modifier
- Impossible de modifier si statut = confirmed, completed ou cancelled

### Changer le statut
```
PATCH /jobs/:id/status
Headers: Authorization: Bearer <token>
Body: { status: JobStatus, reason?: string }
```

**Restrictions:**
- Transition doit être autorisée
- `reason` obligatoire pour status = cancelled

### Supprimer une mission (soft delete)
```
DELETE /jobs/:id
Headers: Authorization: Bearer <token>
```

**Restrictions:**
- Seules les missions draft, published ou cancelled peuvent être supprimées

## Exemples d'utilisation

### Créer un brouillon de mission

```typescript
POST /jobs/profiles/employer-123
{
  "title": "Vendanges Riesling 2024",
  "description": "Recherche 5 personnes pour vendanges de Riesling",
  "culture": "Riesling",
  "tags": ["vendanges", "urgent"],
  "requiredSkills": ["viticulture", "vendanges"],
  "dateType": "this_week",
  "timeSlot": "day",
  "nbPeople": 5,
  "latitude": 48.5734,
  "longitude": 7.7521,
  "city": "Barr",
  "postalCode": "67140",
  "hourlyRate": 12.50,
  "estimatedHours": 8,
  "isUrgent": true
}
```

**Réponse:** Job créé avec `status: "draft"`

### Publier la mission

```typescript
PATCH /jobs/job-456/status
{
  "status": "published"
}
```

**Réponse:** Job avec `status: "published"`, `publishedAt` défini

### Passer en contact

```typescript
PATCH /jobs/job-456/status
{
  "status": "in_contact"
}
```

### Confirmer la mission

```typescript
PATCH /jobs/job-456/status
{
  "status": "confirmed"
}
```

**Réponse:** Job avec `status: "confirmed"`, `confirmedAt` défini

### Terminer la mission

```typescript
PATCH /jobs/job-456/status
{
  "status": "completed"
}
```

**Réponse:** Job avec `status: "completed"`, `completedAt` défini

### Annuler une mission

```typescript
PATCH /jobs/job-456/status
{
  "status": "cancelled",
  "reason": "Conditions météorologiques défavorables"
}
```

**Réponse:** Job avec `status: "cancelled"`, `cancelledAt` et `cancellationReason` définis

## Règles métier

1. **Création**: Seuls les employers peuvent créer des jobs
2. **Modification**: Seul le propriétaire peut modifier
3. **Statuts finaux**: completed et cancelled sont des états finaux (aucune transition possible)
4. **Suppression**: Soft delete (isActive = false), impossible si confirmed
5. **Dates futures**: Les missions publiées avec specific_date doivent avoir une date future
6. **Annulation**: Toujours avec raison explicite

## Tests

### Unit tests
```bash
npm test -- jobs.service.spec.ts
```

**Couverture:**
- Création de jobs (employers uniquement)
- Filtres (status, employerId, culture, isUrgent)
- Mise à jour avec ownership check
- Suppression (soft delete)
- Transitions de statuts avec validations
- Validation de publishing
- Raison obligatoire pour cancellation

### E2E tests
```bash
npm run test:e2e -- jobs.e2e-spec.ts
```

**Couverture:**
- CRUD complet
- Workflow complet (draft → completed)
- Authentification et autorisations
- Validations DTOs
- Filtres et recherche

## Migration

```bash
psql -U <user> -d <database> -f database/migrations/005_create_jobs_table.sql
```

**Crée:**
- Table `jobs` avec contraintes
- ENUMs: job_status, job_date_type, job_time_slot
- Indexes pour performance (status, employerId, location, tags, full-text search)
- Trigger pour updated_at

## Architecture

```
jobs/
├── entities/
│   └── job.entity.ts          # Entity TypeORM avec ENUMs
├── dto/
│   ├── create-job.dto.ts      # DTO création avec validations
│   ├── update-job.dto.ts      # DTO mise à jour (PartialType)
│   └── transition-job-status.dto.ts  # DTO transition de statut
├── jobs.service.ts            # Logique métier + transitions
├── jobs.controller.ts         # Endpoints REST
├── jobs.module.ts             # Module NestJS
└── README.md                  # Documentation
```

## Dépendances

- `@nestjs/typeorm` - ORM
- `class-validator` - Validation DTOs
- `class-transformer` - Transformation DTOs
- Profile entity (pour la relation employer)

## À venir (V2)

- Notification aux workers quand mission publiée
- Recherche avancée de missions (par compétences, distance)
- Historique des changements de statut
- Intégration avec module Matches
- Ratings/Reviews après completion
