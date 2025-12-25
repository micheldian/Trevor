# 📍 Availability Module - Gestion des Disponibilités

Module NestJS pour gérer les disponibilités géolocalisées des workers et team_leads.

---

## 🎯 Fonctionnalités

### **Disponibilité**
- ✅ **Status** : ON / OFF
- ✅ **Date** : TODAY / TOMORROW
- ✅ **Créneau** : MORNING (8-12h) / AFTERNOON (14-18h) / DAY (8-18h)
- ✅ **Géolocalisation** : Latitude + Longitude + Rayon (km)
- ✅ **Notes** : Texte libre (max 500 caractères)

### **Restrictions**
- Seuls les profils **worker** et **team_lead** peuvent créer des disponibilités
- Les profils **employer** ne peuvent pas créer de disponibilités
- Ownership requis pour modification/suppression

---

## 📋 Endpoints API

### **POST /availability/profiles/:profileId**
Créer une disponibilité pour un profil.

**Auth**: Requis (JWT)

**Request**:
```json
{
  "status": "on",
  "dateType": "today",
  "timeSlot": "morning",
  "latitude": 48.5734,
  "longitude": 7.7521,
  "radiusKm": 30,
  "notes": "Disponible pour vendanges"
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "profileId": "profile-uuid",
  "status": "on",
  "dateType": "today",
  "timeSlot": "morning",
  "latitude": 48.5734,
  "longitude": 7.7521,
  "radiusKm": 30,
  "notes": "Disponible pour vendanges",
  "isActive": true,
  "createdAt": "2024-12-25T14:30:00Z",
  "updatedAt": "2024-12-25T14:30:00Z"
}
```

**Errors**:
- `403`: Profil n'est pas worker/team_lead
- `404`: Profil non trouvé

---

### **GET /availability**
Lister les disponibilités avec filtres.

**Auth**: Public

**Query Params**:
```typescript
{
  profileId?: string;
  status?: 'on' | 'off';
  dateType?: 'today' | 'tomorrow';
  timeSlot?: 'morning' | 'afternoon' | 'day';
  latitude?: number;  // Pour recherche géo
  longitude?: number; // Pour recherche géo
  maxDistance?: number; // En km (si lat/lng fournis)
  limit?: number; // Default: 20
  offset?: number; // Default: 0
}
```

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "status": "on",
      "dateType": "today",
      "timeSlot": "morning",
      "latitude": 48.5734,
      "longitude": 7.7521,
      "radiusKm": 30,
      "profile": {
        "id": "profile-uuid",
        "type": "worker",
        "city": "Strasbourg",
        "user": {
          "firstName": "Jean",
          "lastName": "Dupont"
        }
      }
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

---

### **GET /availability/nearby**
Trouver les disponibilités à proximité (recherche géospatiale).

**Auth**: Public

**Query Params**:
```typescript
{
  latitude: number;   // Requis
  longitude: number;  // Requis
  radiusKm?: number;  // Default: 50km
}
```

**Response** `200`:
```json
[
  {
    "id": "uuid",
    "status": "on",
    "dateType": "today",
    "timeSlot": "day",
    "latitude": 48.5800,
    "longitude": 7.7600,
    "radiusKm": 30,
    "distance": 2.3,
    "profile": {
      "user": {
        "firstName": "Marie",
        "lastName": "Martin"
      }
    }
  }
]
```

Résultats triés par distance croissante.

---

### **GET /availability/:id**
Détails d'une disponibilité.

**Auth**: Public

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "on",
  "dateType": "today",
  "timeSlot": "morning",
  "latitude": 48.5734,
  "longitude": 7.7521,
  "radiusKm": 30,
  "notes": "Disponible pour vendanges",
  "profile": {
    "id": "profile-uuid",
    "type": "worker",
    "city": "Strasbourg",
    "skills": ["viticulture", "vendanges"],
    "user": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "phone": "+33612345678"
    }
  },
  "createdAt": "2024-12-25T14:30:00Z"
}
```

---

### **PATCH /availability/:id**
Modifier une disponibilité.

**Auth**: Requis (ownership)

**Request**:
```json
{
  "status": "off"
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "off",
  "updatedAt": "2024-12-25T15:00:00Z"
}
```

**Errors**:
- `403`: Pas le propriétaire

---

### **DELETE /availability/:id**
Supprimer une disponibilité (soft delete).

**Auth**: Requis (ownership)

**Response** `204`: No Content

---

## 🧪 Tests

### **Exécuter les tests**

```bash
# Unit tests
pnpm test availability.service.spec

# Controller tests
pnpm test availability.controller.spec

# Tous les tests
pnpm test

# Avec couverture
pnpm test:cov
```

### **Scénarios testés**

#### **Service**
- ✅ Création disponibilité pour worker
- ✅ Création disponibilité pour team_lead
- ✅ Erreur si profil employer
- ✅ Erreur si profil inexistant
- ✅ Récupération par ID
- ✅ Modification avec ownership
- ✅ Erreur modification si pas owner
- ✅ Suppression avec ownership
- ✅ Erreur suppression si pas owner
- ✅ Validation latitude/longitude
- ✅ Validation radiusKm (1-200)

#### **Controller**
- ✅ Création via endpoint
- ✅ Liste paginée
- ✅ Recherche proximité
- ✅ Récupération détails
- ✅ Modification
- ✅ Suppression

---

## 📝 Validation DTOs

### **CreateAvailabilityDto**

| Champ | Type | Validation | Exemple |
|-------|------|------------|---------|
| `status` | enum | on \| off | `"on"` |
| `dateType` | enum | today \| tomorrow | `"today"` |
| `timeSlot` | enum | morning \| afternoon \| day | `"morning"` |
| `latitude` | number | -90 à 90 | `48.5734` |
| `longitude` | number | -180 à 180 | `7.7521` |
| `radiusKm` | number | 1 à 200 | `30` |
| `notes` | string | max 500 chars | `"Disponible vendanges"` |

### **Erreurs Validation**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "latitude",
      "message": "Latitude invalide (-90 à 90)"
    },
    {
      "field": "radiusKm",
      "message": "Rayon minimum: 1 km"
    }
  ]
}
```

---

## 🌍 Recherche Géospatiale

### **Formule Distance (Haversine)**

```sql
SELECT *,
  (
    6371 * acos(
      cos(radians(:lat)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(:lng)) +
      sin(radians(:lat)) * sin(radians(latitude))
    )
  ) AS distance_km
FROM availabilities
WHERE (distance_km) <= :radius
ORDER BY distance_km ASC;
```

**6371** = Rayon de la Terre en kilomètres

### **Exemple Pratique**

```bash
# Trouver disponibilités dans 30km autour de Strasbourg
curl "http://localhost:3001/availability/nearby?latitude=48.5734&longitude=7.7521&radiusKm=30"
```

Retourne les disponibilités triées de la plus proche à la plus lointaine.

---

## 🔒 Sécurité

### **Ownership Check**

```typescript
// Vérifier que l'utilisateur possède le profil
const profile = await profileRepo.findOne({
  where: { id: availability.profileId },
});

if (profile.userId !== currentUser.id) {
  throw new ForbiddenException('Pas autorisé');
}
```

### **Profile Type Check**

```typescript
// Seuls workers et team_leads peuvent créer
if (![ProfileType.WORKER, ProfileType.TEAM_LEAD].includes(profile.type)) {
  throw new ForbiddenException('Type de profil non autorisé');
}
```

---

## 📊 Cas d'Usage

### **Cas 1: Worker signale disponibilité aujourd'hui matin**

```bash
curl -X POST http://localhost:3001/availability/profiles/profile-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "on",
    "dateType": "today",
    "timeSlot": "morning",
    "latitude": 48.5734,
    "longitude": 7.7521,
    "radiusKm": 50,
    "notes": "Disponible vendanges"
  }'
```

### **Cas 2: Employer cherche workers dispos demain après-midi dans 30km**

```bash
curl "http://localhost:3001/availability?dateType=tomorrow&timeSlot=afternoon&latitude=48.5734&longitude=7.7521&maxDistance=30&status=on"
```

### **Cas 3: Worker met status OFF (indisponible)**

```bash
curl -X PATCH http://localhost:3001/availability/availability-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "off"}'
```

---

## 🗄️ Base de Données

### **Table `availabilities`**

```sql
CREATE TABLE availabilities (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    status availability_status DEFAULT 'on',
    date_type date_type NOT NULL,
    time_slot time_slot NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    radius_km INTEGER DEFAULT 50,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Indexes**

- `idx_availabilities_profile` : Requêtes par profil
- `idx_availabilities_status` : Filtrer ON/OFF
- `idx_availabilities_date_type` : Filtrer TODAY/TOMORROW
- `idx_availabilities_time_slot` : Filtrer créneaux
- `idx_availabilities_location` : Recherche géospatiale

---

## 🚀 Prochaines Améliorations (V2)

- [ ] **Disponibilités récurrentes** : Répéter chaque semaine
- [ ] **Plages horaires custom** : Pas limité aux 3 créneaux
- [ ] **Notifications push** : Alerter workers si job proche
- [ ] **Matching automatique** : Suggérer jobs selon dispo
- [ ] **Historique** : Tracker anciennes disponibilités
- [ ] **Export calendrier** : iCal/Google Calendar

---

**Version**: 1.0
**Date**: 2025-12-25
