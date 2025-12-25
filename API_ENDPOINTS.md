# 🔌 TREVOR V1 - API REST ENDPOINTS

**Version**: 1.0
**Base URL**: `https://api.trevor-alsace.fr/v1`
**Auth**: OTP (One-Time Password) + JWT Bearer Token
**Format**: JSON

---

## 📋 TABLE DES MATIÈRES

1. [Auth](#1-auth)
2. [Profiles](#2-profiles)
3. [Teams](#3-teams)
4. [Availability](#4-availability)
5. [Jobs](#5-jobs)
6. [Matches](#6-matches)
7. [Reviews](#7-reviews)
8. [Search](#8-search)
9. [Notifications](#9-notifications)
10. [Analytics](#10-analytics)

---

## 🔐 SYSTÈME D'AUTHENTIFICATION

### **Roles**
- `public` : Non authentifié
- `worker` : Profil worker
- `team_lead` : Profil team lead
- `employer` : Profil employer
- `admin` : Administrateur plateforme

### **JWT Token Structure**
```json
{
  "sub": "user-uuid",
  "email": "user@email.fr",
  "profiles": [
    {"id": "profile-uuid", "type": "worker"},
    {"id": "profile-uuid", "type": "employer"}
  ],
  "iat": 1703088000,
  "exp": 1703174400
}
```

### **Headers requis (endpoints protégés)**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1️⃣ AUTH

### **POST** `/auth/send-otp`
Demande un code OTP par email ou téléphone.

**Access**: `public`

**Body**:
```typescript
{
  email?: string;      // email@example.fr (requis si pas de phone)
  phone?: string;      // +33612345678 (requis si pas d'email)
}
```

**Response** `200`:
```json
{
  "success": true,
  "message": "Code OTP envoyé à e***l@email.fr",
  "expiresIn": 600,
  "maskedContact": "e***l@email.fr"
}
```

**Errors**:
- `400`: Email/phone invalide
- `429`: Trop de tentatives (max 5/heure)
- `404`: Utilisateur inexistant (optionnel: créer compte auto)

**Règles**:
- Code 6 chiffres
- Expire après 10 minutes
- Max 5 envois par heure par IP
- Email via SMTP (Brevo/Sendinblue)

---

### **POST** `/auth/verify-otp`
Vérifie le code OTP et retourne JWT token.

**Access**: `public`

**Body**:
```typescript
{
  email?: string;      // email@example.fr
  phone?: string;      // +33612345678
  code: string;        // "123456"
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
    "email": "user@email.fr",
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
}
```

**Errors**:
- `400`: Code invalide ou expiré
- `401`: Code incorrect (max 3 tentatives)
- `404`: Utilisateur inexistant

**Règles**:
- Max 3 tentatives de vérification
- Token JWT expire après 7 jours
- Refresh token expire après 30 jours

---

### **POST** `/auth/refresh`
Rafraîchit le JWT token.

**Access**: `authenticated`

**Body**:
```typescript
{
  refreshToken: string;
}
```

**Response** `200`:
```json
{
  "accessToken": "new-jwt-token",
  "expiresIn": 604800
}
```

**Errors**:
- `401`: Refresh token invalide ou expiré

---

### **POST** `/auth/logout`
Révoque le refresh token.

**Access**: `authenticated`

**Response** `204`: No Content

---

## 2️⃣ PROFILES

### **GET** `/profiles`
Liste des profils avec filtres.

**Access**: `public`

**Query Params**:
```typescript
{
  type?: 'worker' | 'team_lead' | 'employer';
  city?: string;                    // "Strasbourg"
  skills?: string[];                // ["viticulture", "taille"]
  minRating?: number;               // 4.0
  minExperience?: number;           // 5 (années)
  available?: boolean;              // true (a des availabilities actives)
  limit?: number;                   // 20 (default)
  offset?: number;                  // 0 (default)
  sortBy?: 'rating' | 'created' | 'experience';
  sortOrder?: 'asc' | 'desc';
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "worker",
      "user": {
        "id": "user-uuid",
        "firstName": "Jean",
        "lastName": "Dupont",
        "avatarUrl": "https://..."
      },
      "bio": "Expérience 10 ans viticulture...",
      "city": "Strasbourg",
      "postalCode": "67000",
      "skills": ["viticulture", "taille", "vendanges"],
      "experienceYears": 10,
      "certifications": ["CACES R372"],
      "ratingAvg": 4.5,
      "ratingCount": 12,
      "isComplete": true,
      "availableUntil": "2025-10-31"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Errors**:
- `400`: Paramètres invalides

---

### **GET** `/profiles/:id`
Détails d'un profil public.

**Access**: `public`

**Response** `200`:
```json
{
  "id": "uuid",
  "type": "worker",
  "user": {
    "id": "user-uuid",
    "firstName": "Jean",
    "lastName": "Dupont",
    "avatarUrl": "https://..."
  },
  "bio": "Expérience 10 ans viticulture...",
  "city": "Strasbourg",
  "postalCode": "67000",
  "skills": ["viticulture", "taille", "vendanges"],
  "experienceYears": 10,
  "certifications": ["CACES R372"],
  "ratingAvg": 4.5,
  "ratingCount": 12,
  "whatsappNumber": "+33612345678",
  "preferredContact": "whatsapp",
  "reviews": [
    {
      "id": "review-uuid",
      "rating": 5,
      "title": "Excellent travailleur",
      "comment": "Très professionnel...",
      "reviewerName": "Ferme du Rocher",
      "createdAt": "2024-10-15T10:00:00Z"
    }
  ],
  "availability": [
    {
      "id": "avail-uuid",
      "startDate": "2025-09-01",
      "endDate": "2025-10-31",
      "type": "available",
      "daysOfWeek": [1, 2, 3, 4, 5, 6],
      "hoursPerDay": 8.0
    }
  ],
  "stats": {
    "completedJobs": 15,
    "acceptanceRate": 85
  }
}
```

**Errors**:
- `404`: Profil inexistant ou inactif

---

### **POST** `/profiles`
Créer un nouveau profil.

**Access**: `authenticated`

**Body**:
```typescript
{
  type: 'worker' | 'team_lead' | 'employer';
  bio?: string;
  companyName?: string;          // Requis si type=employer
  siret?: string;                // Requis si type=employer
  city: string;
  postalCode: string;
  address?: string;
  location?: {                   // Lat/lng
    lat: number;
    lng: number;
  };
  skills?: string[];             // Pour worker/team_lead
  experienceYears?: number;      // Pour worker/team_lead
  certifications?: string[];
  whatsappNumber?: string;       // +33612345678
  preferredContact?: 'whatsapp' | 'phone' | 'email';
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "type": "worker",
  "isComplete": false,
  "message": "Profil créé. Complétez vos disponibilités."
}
```

**Errors**:
- `400`: Validation échouée
- `409`: Profil de ce type existe déjà pour cet utilisateur
- `401`: Non authentifié

**Règles**:
- Un user peut avoir max 1 profil par type
- Employer doit fournir SIRET valide (14 chiffres)
- WhatsApp number validé (format français)

---

### **PATCH** `/profiles/:id`
Modifier un profil existant.

**Access**: `owner` (user propriétaire du profil)

**Body**: Champs partiels du POST `/profiles`

**Response** `200`:
```json
{
  "id": "uuid",
  "message": "Profil mis à jour",
  "isComplete": true
}
```

**Errors**:
- `403`: Pas autorisé
- `404`: Profil inexistant
- `400`: Validation échouée

---

### **DELETE** `/profiles/:id`
Désactiver un profil (soft delete).

**Access**: `owner`

**Response** `204`: No Content

**Errors**:
- `403`: Pas autorisé
- `404`: Profil inexistant

---

## 3️⃣ TEAMS

### **GET** `/teams`
Liste des équipes disponibles.

**Access**: `public`

**Query Params**:
```typescript
{
  city?: string;
  minMembers?: number;
  maxMembers?: number;
  hasAvailability?: boolean;
  limit?: number;
  offset?: number;
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Équipe Vendanges Pro",
      "description": "Équipe spécialisée vendanges...",
      "teamLead": {
        "id": "profile-uuid",
        "name": "Thomas Dubois",
        "avatarUrl": "https://...",
        "ratingAvg": 4.7
      },
      "maxMembers": 8,
      "currentMembersCount": 3,
      "availablePlaces": 5,
      "city": "Barr",
      "skills": ["vendanges", "arboriculture"],
      "nextAvailability": {
        "startDate": "2025-09-01",
        "endDate": "2025-10-15"
      }
    }
  ],
  "meta": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

---

### **GET** `/teams/:id`
Détails d'une équipe.

**Access**: `public`

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Équipe Vendanges Pro",
  "description": "Équipe spécialisée...",
  "teamLead": {
    "id": "profile-uuid",
    "name": "Thomas Dubois",
    "avatarUrl": "https://...",
    "bio": "15 ans d'expérience...",
    "ratingAvg": 4.7,
    "whatsappNumber": "+33656789012"
  },
  "members": [
    {
      "id": "member-uuid",
      "profile": {
        "id": "profile-uuid",
        "name": "Jean Dupont",
        "avatarUrl": "https://...",
        "skills": ["viticulture", "taille"]
      },
      "role": "member",
      "joinedAt": "2024-05-01T10:00:00Z"
    }
  ],
  "maxMembers": 8,
  "currentMembersCount": 3,
  "availability": [...],
  "completedJobs": 12,
  "ratingAvg": 4.8
}
```

**Errors**:
- `404`: Équipe inexistante

---

### **POST** `/teams`
Créer une équipe (team_lead uniquement).

**Access**: `team_lead`

**Body**:
```typescript
{
  name: string;                  // "Équipe Vendanges Pro"
  description?: string;
  maxMembers?: number;           // Default: 10
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "name": "Équipe Vendanges Pro",
  "currentMembersCount": 1,
  "message": "Équipe créée. Ajoutez des membres."
}
```

**Errors**:
- `403`: Profil n'est pas team_lead
- `400`: Validation échouée

---

### **POST** `/teams/:id/members`
Ajouter un membre à l'équipe.

**Access**: `team_lead` (owner de l'équipe)

**Body**:
```typescript
{
  workerProfileId: string;       // UUID
  role?: 'member' | 'assistant_lead';
}
```

**Response** `201`:
```json
{
  "id": "member-uuid",
  "message": "Jean Dupont a rejoint l'équipe",
  "currentMembersCount": 4
}
```

**Errors**:
- `403`: Pas team lead de cette équipe
- `404`: Worker profile inexistant
- `409`: Worker déjà dans l'équipe
- `400`: Équipe complète (max members atteint)

---

### **DELETE** `/teams/:id/members/:memberId`
Retirer un membre de l'équipe.

**Access**: `team_lead` (owner)

**Response** `204`: No Content

**Errors**:
- `403`: Pas autorisé
- `404`: Membre inexistant

---

## 4️⃣ AVAILABILITY

### **GET** `/profiles/:profileId/availability`
Liste des disponibilités d'un profil.

**Access**: `public`

**Query Params**:
```typescript
{
  startDate?: string;            // "2025-09-01"
  endDate?: string;              // "2025-10-31"
  type?: 'available' | 'unavailable' | 'maybe';
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "startDate": "2025-09-01",
      "endDate": "2025-10-31",
      "type": "available",
      "daysOfWeek": [1, 2, 3, 4, 5, 6],
      "hoursPerDay": 8.0,
      "notes": "Disponible vendanges"
    }
  ]
}
```

---

### **POST** `/availability`
Ajouter une disponibilité (pour profil OU équipe).

**Access**: `authenticated` (owner du profil/team)

**Body**:
```typescript
{
  profileId?: string;            // UUID (XOR teamId)
  teamId?: string;               // UUID (XOR profileId)
  startDate: string;             // "2025-09-01"
  endDate: string;               // "2025-10-31"
  type: 'available' | 'unavailable' | 'maybe';
  daysOfWeek?: number[];         // [1,2,3,4,5] (optionnel)
  hoursPerDay?: number;          // 8.0
  notes?: string;
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "message": "Disponibilité ajoutée du 01/09 au 31/10"
}
```

**Errors**:
- `400`: Dates invalides (endDate < startDate)
- `403`: Pas owner du profil/team
- `409`: Conflit avec disponibilité existante

---

### **PATCH** `/availability/:id`
Modifier une disponibilité.

**Access**: `owner`

**Body**: Champs partiels du POST

**Response** `200`:
```json
{
  "id": "uuid",
  "message": "Disponibilité mise à jour"
}
```

---

### **DELETE** `/availability/:id`
Supprimer une disponibilité.

**Access**: `owner`

**Response** `204`: No Content

---

## 5️⃣ JOBS

### **GET** `/jobs`
Liste des offres d'emploi avec filtres.

**Access**: `public`

**Query Params**:
```typescript
{
  status?: 'published' | 'closed';           // Default: published
  category?: string;                         // "vendanges", "cueillette"
  city?: string;
  postalCode?: string;
  jobType?: 'full_time' | 'part_time' | 'seasonal' | 'temporary';
  requiredSkills?: string[];
  startDate?: string;                        // "2025-09-01"
  endDate?: string;
  minHourlyRate?: number;
  maxDistance?: number;                      // km depuis location
  location?: { lat: number; lng: number };
  limit?: number;
  offset?: number;
  sortBy?: 'published' | 'startDate' | 'hourlyRate';
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Vendangeurs H/F - Domaine AOC",
      "description": "Recherche vendangeurs...",
      "category": "vendanges",
      "jobType": "seasonal",
      "employer": {
        "id": "employer-uuid",
        "companyName": "Ferme du Rocher",
        "avatarUrl": "https://...",
        "city": "Dambach-la-Ville",
        "ratingAvg": 4.4
      },
      "city": "Dambach-la-Ville",
      "postalCode": "67650",
      "startDate": "2025-09-15",
      "endDate": "2025-10-10",
      "workersNeeded": 6,
      "workersMatched": 2,
      "availablePlaces": 4,
      "requiredSkills": ["viticulture", "vendanges"],
      "minExperience": 2,
      "hourlyRateMin": 11.50,
      "hourlyRateMax": 13.00,
      "publishedAt": "2024-12-23T10:00:00Z",
      "distance": 15.3
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

---

### **GET** `/jobs/:id`
Détails d'une offre.

**Access**: `public`

**Response** `200`:
```json
{
  "id": "uuid",
  "title": "Vendangeurs H/F - Domaine AOC",
  "description": "Recherche vendangeurs pour récolte...",
  "category": "vendanges",
  "jobType": "seasonal",
  "employer": {
    "id": "employer-uuid",
    "companyName": "Ferme du Rocher",
    "siret": "12345678901234",
    "bio": "Exploitation viticole familiale...",
    "avatarUrl": "https://...",
    "ratingAvg": 4.4,
    "ratingCount": 10,
    "whatsappNumber": "+33388123456",
    "contactName": "François Rocher",
    "contactPhone": "+33388123456",
    "contactEmail": "contact@fermedurocher.fr"
  },
  "location": {
    "city": "Dambach-la-Ville",
    "postalCode": "67650",
    "address": "12 Route du Vin",
    "coordinates": {
      "lat": 48.3247,
      "lng": 7.4269
    }
  },
  "workersNeeded": 6,
  "workersMatched": 2,
  "availablePlaces": 4,
  "startDate": "2025-09-15",
  "endDate": "2025-10-10",
  "requiredSkills": ["viticulture", "vendanges"],
  "requiredCertifications": [],
  "minExperience": 2,
  "hourlyRateMin": 11.50,
  "hourlyRateMax": 13.00,
  "currency": "EUR",
  "status": "published",
  "publishedAt": "2024-12-23T10:00:00Z",
  "viewsCount": 145,
  "applicationsCount": 12,
  "expiresAt": "2025-09-14T23:59:59Z",
  "matches": [
    {
      "id": "match-uuid",
      "status": "accepted",
      "workerName": "Jean Dupont",
      "matchScore": 87.5
    }
  ]
}
```

**Errors**:
- `404`: Job inexistant

**Règles**:
- Incrémente `viewsCount` à chaque appel
- Track analytics event `job_view`

---

### **POST** `/jobs`
Créer une offre (employer uniquement).

**Access**: `employer`

**Body**:
```typescript
{
  title: string;                             // "Vendangeurs H/F"
  description: string;
  category?: string;                         // "vendanges"
  jobType: 'full_time' | 'part_time' | 'seasonal' | 'temporary';
  city: string;
  postalCode: string;
  address?: string;
  location?: { lat: number; lng: number };
  startDate: string;                         // "2025-09-15"
  endDate?: string;                          // "2025-10-10"
  workersNeeded: number;                     // 6
  requiredSkills?: string[];
  requiredCertifications?: string[];
  minExperience?: number;                    // 2
  hourlyRateMin?: number;                    // 11.50
  hourlyRateMax?: number;                    // 13.00
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: 'draft' | 'published';            // Default: draft
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "title": "Vendangeurs H/F",
  "status": "draft",
  "message": "Offre créée en brouillon. Publiez-la pour recevoir des candidatures."
}
```

**Errors**:
- `403`: Profil n'est pas employer
- `400`: Validation échouée (dates, rates)

**Règles**:
- Status "draft" par défaut → employer doit publish manuellement
- `hourlyRateMax >= hourlyRateMin`
- `endDate >= startDate`
- Auto-génère `expiresAt` = startDate - 1 jour

---

### **PATCH** `/jobs/:id`
Modifier une offre (employer owner).

**Access**: `owner` (employer qui a créé le job)

**Body**: Champs partiels du POST

**Response** `200`:
```json
{
  "id": "uuid",
  "message": "Offre mise à jour"
}
```

**Errors**:
- `403`: Pas owner
- `400`: Validation échouée
- `409`: Cannot modify if status=closed

---

### **POST** `/jobs/:id/publish`
Publier un job (draft → published).

**Access**: `owner`

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "published",
  "publishedAt": "2024-12-25T14:30:00Z",
  "message": "Offre publiée et visible"
}
```

**Errors**:
- `403`: Pas owner
- `409`: Job déjà publié

---

### **POST** `/jobs/:id/close`
Fermer une offre (published → closed).

**Access**: `owner`

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "closed",
  "closedAt": "2024-12-25T14:30:00Z"
}
```

---

### **DELETE** `/jobs/:id`
Supprimer une offre (soft delete).

**Access**: `owner`

**Response** `204`: No Content

---

## 6️⃣ MATCHES

### **GET** `/matches`
Liste des matches (filtrée selon le rôle).

**Access**: `authenticated`

**Query Params**:
```typescript
{
  jobId?: string;                            // Filtrer par job
  profileId?: string;                        // Filtrer par profil
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  initiatedBy?: 'employer' | 'worker' | 'system';
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'created';
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "job": {
        "id": "job-uuid",
        "title": "Vendangeurs H/F",
        "employer": {
          "companyName": "Ferme du Rocher",
          "avatarUrl": "https://..."
        },
        "startDate": "2025-09-15",
        "hourlyRateMin": 11.50
      },
      "worker": {
        "id": "profile-uuid",
        "name": "Jean Dupont",
        "avatarUrl": "https://...",
        "ratingAvg": 4.5
      },
      "status": "pending",
      "initiatedBy": "employer",
      "matchScore": 87.5,
      "matchReasons": {
        "skills": 3,
        "distance_km": 2.5,
        "experience": "excellent"
      },
      "employerMessage": "Votre profil correspond parfaitement",
      "workerMessage": null,
      "expiresAt": "2025-01-01T23:59:59Z",
      "createdAt": "2024-12-24T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

**Règles**:
- Worker voit ses matches (où il est candidat)
- Employer voit matches de ses jobs
- Team lead voit matches de son équipe

---

### **GET** `/matches/:id`
Détails d'un match.

**Access**: `authenticated` (participant du match)

**Response** `200`:
```json
{
  "id": "uuid",
  "job": {
    "id": "job-uuid",
    "title": "Vendangeurs H/F",
    "description": "...",
    "employer": {...},
    "startDate": "2025-09-15",
    "city": "Dambach-la-Ville"
  },
  "worker": {
    "id": "profile-uuid",
    "name": "Jean Dupont",
    "bio": "10 ans expérience...",
    "skills": ["viticulture", "vendanges"],
    "ratingAvg": 4.5,
    "whatsappNumber": "+33612345678"
  },
  "status": "pending",
  "initiatedBy": "employer",
  "matchScore": 87.5,
  "matchReasons": {
    "skills_matched": 3,
    "distance_km": 2.5,
    "experience_years": 10,
    "rating": 4.5
  },
  "employerMessage": "Votre profil correspond parfaitement. Quand pouvez-vous commencer ?",
  "workerMessage": null,
  "respondedAt": null,
  "acceptedAt": null,
  "expiresAt": "2025-01-01T23:59:59Z",
  "createdAt": "2024-12-24T10:00:00Z"
}
```

**Errors**:
- `404`: Match inexistant
- `403`: Pas participant de ce match

---

### **POST** `/matches`
Créer un match (candidature worker ou proposition employer).

**Access**: `authenticated` (worker OU employer)

**Body**:
```typescript
{
  jobId: string;                             // UUID
  workerProfileId?: string;                  // UUID (si employer initie)
  teamId?: string;                           // UUID (alternative à workerProfileId)
  message?: string;                          // Message accompagnement
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "status": "pending",
  "matchScore": 87.5,
  "message": "Candidature envoyée à Ferme du Rocher",
  "expiresAt": "2025-01-01T23:59:59Z"
}
```

**Errors**:
- `400`: Worker ne correspond pas aux critères minimaux
- `409`: Match déjà existant pour ce job/worker
- `404`: Job ou profil inexistant
- `403`: Job fermé ou expiré

**Règles**:
- Auto-calcul `matchScore` (algorithme)
- `expiresAt` = NOW + 7 jours
- Notification envoyée à l'autre partie
- `initiatedBy` = 'worker' ou 'employer' selon caller

---

### **POST** `/matches/:id/accept`
Accepter un match.

**Access**: `participant` (employer OU worker)

**Body**:
```typescript
{
  message?: string;                          // Message de réponse
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "accepted",
  "acceptedAt": "2024-12-25T14:30:00Z",
  "message": "Match confirmé ! Contactez-vous via WhatsApp.",
  "whatsappLink": "https://wa.me/33612345678?text=Bonjour,%20suite%20à%20notre%20match%20sur%20Trevor..."
}
```

**Errors**:
- `403`: Pas participant ou déjà répondu
- `409`: Match expiré ou déjà traité
- `400`: Job complet (workers_matched >= workers_needed)

**Règles**:
- Incrémente `jobs.workers_matched`
- Notification envoyée à l'autre partie
- Retourne lien WhatsApp pré-rempli

---

### **POST** `/matches/:id/reject`
Refuser un match.

**Access**: `participant`

**Body**:
```typescript
{
  reason?: string;                           // Raison du refus (optionnel)
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "rejected",
  "rejectedAt": "2024-12-25T14:30:00Z",
  "message": "Match refusé"
}
```

**Errors**:
- `403`: Pas participant
- `409`: Match expiré ou déjà traité

---

## 7️⃣ REVIEWS

### **GET** `/reviews`
Liste des avis (filtrés).

**Access**: `public`

**Query Params**:
```typescript
{
  reviewedProfileId?: string;                // Avis reçus par ce profil
  reviewerProfileId?: string;                // Avis donnés par ce profil
  minRating?: number;                        // 4
  isPublic?: boolean;                        // true
  limit?: number;
  offset?: number;
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "reviewer": {
        "id": "profile-uuid",
        "name": "Ferme du Rocher",
        "avatarUrl": "https://..."
      },
      "reviewed": {
        "id": "profile-uuid",
        "name": "Jean Dupont"
      },
      "rating": 5,
      "title": "Travailleur exceptionnel",
      "comment": "Jean a effectué un travail remarquable...",
      "punctualityRating": 5,
      "qualityRating": 5,
      "communicationRating": 5,
      "isVerified": true,
      "createdAt": "2024-10-20T10:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "averageRating": 4.6
  }
}
```

---

### **POST** `/reviews`
Créer un avis après collaboration.

**Access**: `authenticated` (participant d'un match accepté)

**Body**:
```typescript
{
  matchId: string;                           // UUID
  rating: number;                            // 1-5
  title?: string;                            // "Excellent employeur"
  comment?: string;
  punctualityRating?: number;                // 1-5
  qualityRating?: number;                    // 1-5
  communicationRating?: number;              // 1-5
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "rating": 5,
  "message": "Avis publié. Merci pour votre retour !"
}
```

**Errors**:
- `400`: Validation échouée (rating hors range)
- `403`: Pas participant du match
- `409`: Avis déjà laissé pour ce match
- `422`: Match pas en status 'accepted'

**Règles**:
- Match doit être status='accepted'
- Un reviewer ne peut laisser qu'un seul avis par match
- Trigger auto-update `profiles.rating_avg`
- Notification envoyée au reviewé

---

### **PATCH** `/reviews/:id`
Modifier un avis (dans les 48h).

**Access**: `owner` (reviewer)

**Body**: Champs partiels du POST

**Response** `200`:
```json
{
  "id": "uuid",
  "message": "Avis modifié"
}
```

**Errors**:
- `403`: Pas owner ou >48h après création
- `404`: Avis inexistant

---

### **DELETE** `/reviews/:id`
Supprimer un avis (soft delete).

**Access**: `owner` (reviewer) OU `admin`

**Response** `204`: No Content

---

### **POST** `/reviews/:id/report`
Signaler un avis inapproprié.

**Access**: `authenticated`

**Body**:
```typescript
{
  reason: string;                            // "Contenu offensant", "Faux avis"
}
```

**Response** `200`:
```json
{
  "message": "Avis signalé. Notre équipe va vérifier."
}
```

**Règles**:
- Incrémente `reviews.reported_count`
- Si `reported_count >= 3` → avis masqué + review admin

---

## 8️⃣ SEARCH

### **GET** `/search`
Recherche globale (jobs, profiles, teams).

**Access**: `public`

**Query Params**:
```typescript
{
  q: string;                                 // "pomme vendanges strasbourg"
  type?: 'all' | 'jobs' | 'profiles' | 'teams';
  location?: { lat: number; lng: number };
  maxDistance?: number;                      // km
  filters?: {
    jobType?: string;
    profileType?: string;
    minRating?: number;
  };
  limit?: number;
  offset?: number;
}
```

**Response** `200`:
```json
{
  "jobs": {
    "data": [
      {
        "id": "uuid",
        "title": "Cueillette de pommes",
        "relevance": 0.95,
        "highlights": {
          "title": "Cueillette de <mark>pommes</mark>",
          "description": "...récolte <mark>pommes</mark> Golden..."
        },
        "employer": {...},
        "city": "Strasbourg",
        "distance": 5.2
      }
    ],
    "total": 3
  },
  "profiles": {
    "data": [
      {
        "id": "uuid",
        "name": "Jean Dupont",
        "type": "worker",
        "relevance": 0.87,
        "highlights": {
          "bio": "...cueillette <mark>pommes</mark>...",
          "skills": ["<mark>pommes</mark>", "arboriculture"]
        },
        "city": "Strasbourg",
        "distance": 2.1
      }
    ],
    "total": 5
  },
  "teams": {
    "data": [],
    "total": 0
  },
  "meta": {
    "query": "pomme vendanges strasbourg",
    "totalResults": 8,
    "executionTime": 45
  }
}
```

**Règles**:
- Utilise PostgreSQL Full-Text Search (tsvector)
- Recherche dans: title, description, skills, bio, city
- Ranking par pertinence (ts_rank)
- Highlights avec balises `<mark>`
- Support français (stemming, stop words)
- Track analytics event `search`

---

### **GET** `/search/suggestions`
Suggestions auto-complétion.

**Access**: `public`

**Query Params**:
```typescript
{
  q: string;                                 // "vend" (min 3 chars)
  type?: 'skills' | 'cities' | 'categories';
  limit?: number;                            // Default: 10
}
```

**Response** `200`:
```json
{
  "suggestions": [
    {
      "value": "vendanges",
      "type": "skill",
      "count": 42
    },
    {
      "value": "vendeur",
      "type": "category",
      "count": 5
    }
  ]
}
```

**Règles**:
- Utilise trigram similarity (pg_trgm)
- Cache résultats 1h (Redis/in-memory)

---

## 9️⃣ NOTIFICATIONS

### **GET** `/notifications`
Liste des notifications utilisateur.

**Access**: `authenticated`

**Query Params**:
```typescript
{
  isRead?: boolean;                          // false (non lues)
  type?: string;                             // "match_request"
  limit?: number;
  offset?: number;
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "match_request",
      "title": "Nouveau match suggéré",
      "message": "Votre profil correspond à l'offre 'Vendangeurs H/F'",
      "relatedEntityType": "match",
      "relatedEntityId": "match-uuid",
      "isRead": false,
      "createdAt": "2024-12-25T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "unreadCount": 5
  }
}
```

---

### **PATCH** `/notifications/:id/read`
Marquer notification comme lue.

**Access**: `owner`

**Response** `200`:
```json
{
  "id": "uuid",
  "isRead": true,
  "readAt": "2024-12-25T14:30:00Z"
}
```

---

### **POST** `/notifications/read-all`
Marquer toutes comme lues.

**Access**: `authenticated`

**Response** `200`:
```json
{
  "message": "15 notifications marquées comme lues"
}
```

---

## 🔟 ANALYTICS

### **POST** `/analytics/events`
Tracker un événement analytics.

**Access**: `public`

**Body**:
```typescript
{
  eventType: string;                         // "whatsapp_click", "job_view"
  eventData?: object;                        // Metadata custom
}
```

**Response** `201`:
```json
{
  "message": "Event tracked"
}
```

**Exemple événements**:
```typescript
// Click WhatsApp
{
  eventType: "whatsapp_click",
  eventData: {
    profileId: "uuid",
    jobId: "uuid"
  }
}

// Vue job
{
  eventType: "job_view",
  eventData: {
    jobId: "uuid",
    source: "search"
  }
}
```

---

## 📊 CODES D'ERREUR STANDARDS

```typescript
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email"
    },
    {
      "field": "phone",
      "message": "phone must match format +33XXXXXXXXX"
    }
  ],
  "timestamp": "2024-12-25T14:30:00Z",
  "path": "/auth/send-otp"
}
```

### **Status Codes**
- `200` OK - Succès
- `201` Created - Ressource créée
- `204` No Content - Succès sans body
- `400` Bad Request - Validation échouée
- `401` Unauthorized - Non authentifié
- `403` Forbidden - Pas autorisé
- `404` Not Found - Ressource inexistante
- `409` Conflict - Conflit (duplicate, etc.)
- `422` Unprocessable Entity - Règle métier violée
- `429` Too Many Requests - Rate limit dépassé
- `500` Internal Server Error - Erreur serveur

---

## 🔐 RATE LIMITING

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `POST /auth/send-otp` | 5 requêtes | 1 heure |
| `POST /auth/verify-otp` | 3 requêtes | 10 minutes |
| `GET /search` | 30 requêtes | 1 minute |
| Autres GET | 100 requêtes | 1 minute |
| Autres POST/PATCH/DELETE | 60 requêtes | 1 minute |

**Response** `429`:
```json
{
  "statusCode": 429,
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45
}
```

---

## 🔄 PAGINATION

### **Query Params**
```typescript
{
  limit?: number;     // Max: 100, Default: 20
  offset?: number;    // Default: 0
}
```

### **Response Meta**
```json
{
  "meta": {
    "total": 142,
    "limit": 20,
    "offset": 40,
    "hasMore": true,
    "nextOffset": 60,
    "prevOffset": 20
  }
}
```

---

## 📝 FLOWS UTILISATEURS CLÉS

### **Flow 1: Worker cherche job "pomme" et contacte via WhatsApp**

1. **Recherche**
   ```bash
   GET /search?q=pomme&type=jobs&location={lat,lng}
   ```

2. **Consulte job détaillé**
   ```bash
   GET /jobs/{jobId}
   # → Récupère whatsappNumber de l'employer
   ```

3. **Track click WhatsApp** (optionnel)
   ```bash
   POST /analytics/events
   {
     "eventType": "whatsapp_click",
     "eventData": { "jobId": "uuid", "employerId": "uuid" }
   }
   ```

4. **Ouvre WhatsApp** (côté client)
   ```
   https://wa.me/33388123456?text=Bonjour, je suis intéressé par votre offre "Cueillette pommes" via Trevor
   ```

---

### **Flow 2: Employer publie job et accepte candidature**

1. **Créer job (draft)**
   ```bash
   POST /jobs
   {
     "title": "Cueillette pommes",
     "jobType": "seasonal",
     ...
     "status": "draft"
   }
   ```

2. **Publier job**
   ```bash
   POST /jobs/{jobId}/publish
   ```

3. **Recevoir candidatures** (matches auto créés par algo)
   ```bash
   GET /matches?jobId={jobId}&status=pending
   ```

4. **Consulter profil worker**
   ```bash
   GET /profiles/{profileId}
   ```

5. **Accepter candidature**
   ```bash
   POST /matches/{matchId}/accept
   {
     "message": "Parfait ! Rendez-vous le 15 septembre à 8h."
   }
   # → Retourne whatsappLink pré-rempli
   ```

6. **Contacter via WhatsApp** (côté client)

---

### **Flow 3: Worker complète profil et ajoute disponibilités**

1. **Authentification OTP**
   ```bash
   POST /auth/send-otp { "email": "worker@email.fr" }
   POST /auth/verify-otp { "email": "worker@email.fr", "code": "123456" }
   ```

2. **Créer profil worker**
   ```bash
   POST /profiles
   {
     "type": "worker",
     "city": "Strasbourg",
     "skills": ["viticulture", "vendanges"],
     "experienceYears": 10,
     ...
   }
   ```

3. **Ajouter disponibilité**
   ```bash
   POST /availability
   {
     "profileId": "{profileId}",
     "startDate": "2025-09-01",
     "endDate": "2025-10-31",
     "type": "available",
     "daysOfWeek": [1,2,3,4,5],
     "hoursPerDay": 8
   }
   ```

4. **Profil complet** → Apparaît dans résultats de recherche

---

## 🧪 EXEMPLES CURL

### **Authentification**
```bash
# Demander OTP
curl -X POST https://api.trevor-alsace.fr/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "jean@email.fr"}'

# Vérifier OTP
curl -X POST https://api.trevor-alsace.fr/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "jean@email.fr", "code": "123456"}'
```

### **Recherche jobs**
```bash
curl -X GET "https://api.trevor-alsace.fr/v1/search?q=pomme&type=jobs" \
  -H "Accept: application/json"
```

### **Créer match (candidature)**
```bash
curl -X POST https://api.trevor-alsace.fr/v1/matches \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-uuid",
    "message": "Disponible du 1er au 30 septembre"
  }'
```

### **Accepter match**
```bash
curl -X POST https://api.trevor-alsace.fr/v1/matches/{matchId}/accept \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Rendez-vous lundi 8h !"
  }'
```

---

## 📚 RESSOURCES ADDITIONNELLES

- **Swagger UI**: `https://api.trevor-alsace.fr/docs`
- **Postman Collection**: `https://api.trevor-alsace.fr/postman.json`
- **GraphQL** (V2): `https://api.trevor-alsace.fr/graphql`
- **WebSocket** (notifications V2): `wss://api.trevor-alsace.fr/ws`

---

**Version**: 1.0
**Date**: 2025-12-25
**Auteur**: Lead Backend NestJS - Trevor
