# 🔍 Search Module - Recherche Avancée de Profils

Module NestJS pour rechercher des profils disponibles avec tri multi-critères sophistiqué.

---

## 🎯 Endpoint Principal

### **GET /search/available**
Recherche de profils (workers/teams) disponibles avec scoring intelligent.

**Auth**: Public

---

## 📋 Paramètres de Recherche

### **Query Params**

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `q` | string | Recherche textuelle (compétences, ville, nom) | `"pomme"` |
| `dateType` | enum | Date de disponibilité (today/tomorrow) | `"today"` |
| `timeSlot` | enum | Créneau horaire (morning/afternoon/day) | `"morning"` |
| `onlyTeams` | boolean | Filtrer uniquement les équipes | `true` |
| `hasVehicle` | boolean | Filtrer uniquement ceux avec véhicule | `true` |
| `minRating` | number | Rating minimum (0-5) | `4.0` |
| `maxDistanceKm` | number | Distance maximale en km | `50` |
| `employerId` | UUID | ID employer (pour calculer distance) | `"uuid"` |
| `skills` | string | Compétences (séparées par virgule) | `"viticulture,vendanges"` |
| `limit` | number | Nombre de résultats (1-100) | `20` |
| `offset` | number | Pagination offset | `0` |

---

## 🎯 Algorithme de Tri

### **Ordre de priorité** (V1)

```
1. Score match compétences (DESC)
   → Nombre de skills qui matchent avec la recherche

2. Rating moyen (DESC)
   → Notes laissées par les employeurs

3. Nombre de missions complétées (DESC)
   → Expérience terrain

4. Distance géographique (ASC)
   → Proximité avec l'employer (si employerId fourni)
```

### **Match Score (0-100)**

```typescript
Match Score =
  (Skills matched / Total skills) * 40
  + (Rating avg / 5) * 30
  + min(Experience years / 10, 1) * 15
  + ((Max distance - Distance) / Max distance) * 15
```

**Composantes** :
- **40%** : Compétences matchées
- **30%** : Rating moyen
- **15%** : Expérience (max 10 ans = 100%)
- **15%** : Proximité (si géolocalisation)

---

## 📊 Exemple de Réponse

### **Request**

```bash
GET /search/available?q=pomme&dateType=today&timeSlot=morning&minRating=4&maxDistanceKm=50&employerId=employer-123&skills=viticulture,vendanges
```

### **Response** `200`

```json
{
  "data": [
    {
      "id": "profile-123",
      "type": "worker",
      "firstName": "Jean",
      "lastName": "Dupont",
      "avatarUrl": "https://...",
      "city": "Strasbourg",
      "postalCode": "67000",
      "bio": "10 ans d'expérience en viticulture...",
      "skills": ["viticulture", "vendanges", "pomme", "taille"],
      "experienceYears": 10,
      "certifications": ["CACES R372"],
      "hasVehicle": true,
      "ratingAvg": 4.5,
      "ratingCount": 12,
      "completedMissions": 25,
      "availability": {
        "id": "availability-123",
        "dateType": "today",
        "timeSlot": "morning",
        "status": "on",
        "notes": "Disponible vendanges"
      },
      "distance": 5.2,
      "matchScore": 87,
      "matchReasons": {
        "skillsMatched": 2,
        "totalSkills": 2,
        "hasVehicle": true,
        "rating": 4.5,
        "experience": 10,
        "distance": 5.2
      },
      "whatsappNumber": "+33612345678"
    },
    {
      "id": "profile-456",
      "type": "team_lead",
      "firstName": "Marie",
      "lastName": "Martin",
      "city": "Obernai",
      "skills": ["arboriculture", "pomme", "cueillette"],
      "experienceYears": 8,
      "hasVehicle": true,
      "ratingAvg": 4.8,
      "ratingCount": 20,
      "completedMissions": 42,
      "availability": {
        "id": "availability-456",
        "dateType": "today",
        "timeSlot": "morning",
        "status": "on"
      },
      "distance": 12.5,
      "matchScore": 85,
      "matchReasons": {
        "skillsMatched": 1,
        "totalSkills": 2,
        "hasVehicle": true,
        "rating": 4.8,
        "experience": 8,
        "distance": 12.5
      },
      "whatsappNumber": "+33623456789"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "searchQuery": "pomme",
    "filters": {
      "dateType": "today",
      "timeSlot": "morning",
      "minRating": 4.0,
      "maxDistance": 50
    }
  }
}
```

---

## 🔍 Recherche Textuelle (q)

### **Champs recherchés**

- `profile.bio` : Biographie
- `profile.city` : Ville
- `user.firstName` : Prénom
- `user.lastName` : Nom
- `profile.skills` : Compétences (array)

### **Mode de recherche**

```sql
WHERE (
  profile.bio ILIKE '%pomme%'
  OR profile.city ILIKE '%pomme%'
  OR user.firstName ILIKE '%pomme%'
  OR user.lastName ILIKE '%pomme%'
  OR profile.skills::text ILIKE '%pomme%'
)
```

**Insensible à la casse** : `pomme` = `Pomme` = `POMME`

---

## 📏 Calcul de Distance

### **Formule Haversine**

```sql
SELECT
  *,
  (
    6371 * acos(
      cos(radians(:employerLat)) * cos(radians(availability.latitude)) *
      cos(radians(availability.longitude) - radians(:employerLng)) +
      sin(radians(:employerLat)) * sin(radians(availability.latitude))
    )
  ) AS distance
FROM availabilities
WHERE distance <= :maxDistanceKm
ORDER BY distance ASC;
```

### **Logique**

1. Si `employerId` fourni :
   - Récupérer position de l'employer (lat/lng)
   - Calculer distance pour chaque profil
   - Filtrer par `maxDistanceKm`
   - Inclure distance dans tri final

2. Si pas d'`employerId` :
   - Pas de calcul de distance
   - Tri uniquement par skills + rating + missions

---

## 🧮 Calcul du Match Score

### **Algorithme détaillé**

```typescript
function calculateMatchScore(
  profile: Profile,
  availability: Availability,
  searchSkills: string[],
  employerDistance?: number,
  maxDistanceKm?: number
): number {
  let score = 0;

  // 1. Compétences (40 points)
  const skillsMatched = profile.skills.filter(skill =>
    searchSkills.includes(skill)
  ).length;

  if (searchSkills.length > 0) {
    score += (skillsMatched / searchSkills.length) * 40;
  }

  // 2. Rating (30 points)
  score += (profile.ratingAvg / 5) * 30;

  // 3. Expérience (15 points)
  // Max 10 ans = 100%
  score += Math.min(profile.experienceYears / 10, 1) * 15;

  // 4. Distance (15 points)
  if (employerDistance !== undefined && maxDistanceKm) {
    const proximityScore = ((maxDistanceKm - employerDistance) / maxDistanceKm) * 15;
    score += Math.max(proximityScore, 0);
  } else {
    score += 15; // Score max si pas de distance
  }

  return Math.round(score);
}
```

### **Exemples de scores**

| Profil | Skills | Rating | Exp | Distance | Score |
|--------|--------|--------|-----|----------|-------|
| Jean | 2/2 (100%) | 4.5/5 (90%) | 10 ans (100%) | 5 km (90%) | **87** |
| Marie | 1/2 (50%) | 4.8/5 (96%) | 8 ans (80%) | 12 km (76%) | **85** |
| Pierre | 2/2 (100%) | 3.5/5 (70%) | 3 ans (30%) | 25 km (50%) | **67** |

---

## 🧪 Exemples d'Utilisation

### **Cas 1: Recherche simple "pomme"**

```bash
curl "http://localhost:3001/search/available?q=pomme&limit=10"
```

Retourne tous les profils disponibles mentionnant "pomme" (compétences, bio, etc.)

---

### **Cas 2: Recherche avec filtres**

```bash
curl "http://localhost:3001/search/available?dateType=today&timeSlot=morning&minRating=4&hasVehicle=true"
```

Filtres :
- Disponible aujourd'hui matin
- Rating >= 4
- Possède un véhicule

---

### **Cas 3: Recherche avec compétences + géolocalisation**

```bash
curl "http://localhost:3001/search/available?skills=viticulture,vendanges&employerId=employer-123&maxDistanceKm=30"
```

Tri par :
1. Nombre de compétences matchées (viticulture + vendanges)
2. Rating
3. Missions complétées
4. Distance (< 30km)

---

### **Cas 4: Recherche équipes uniquement**

```bash
curl "http://localhost:3001/search/available?onlyTeams=true&dateType=tomorrow&timeSlot=day"
```

Filtres :
- Uniquement équipes (team_leads)
- Disponibles demain toute la journée

---

## 🔒 Sécurité

### **Access Control**
- Endpoint **public** (pas d'auth requise)
- Données sensibles masquées :
  - WhatsApp number visible uniquement si match
  - Données personnelles limitées

### **Rate Limiting**
- 30 requêtes / minute par IP (global throttler)
- Peut être ajusté pour cet endpoint si besoin

---

## ⚡ Optimisations

### **Index Database**

```sql
-- Profils
CREATE INDEX idx_profiles_rating ON profiles(rating_avg DESC);
CREATE INDEX idx_profiles_has_vehicle ON profiles(has_vehicle) WHERE has_vehicle = true;
CREATE INDEX idx_profiles_skills ON profiles USING gin(skills);

-- Availabilities
CREATE INDEX idx_availabilities_status ON availabilities(status) WHERE status = 'on';
CREATE INDEX idx_availabilities_date_type ON availabilities(date_type);
CREATE INDEX idx_availabilities_time_slot ON availabilities(time_slot);
CREATE INDEX idx_availabilities_location ON availabilities(latitude, longitude);
```

### **Caching (V2)**

```typescript
// Cache résultats 5 minutes (Redis)
@Cacheable('search:available', { ttl: 300 })
async searchAvailable(dto: SearchAvailableDto) {
  // ...
}
```

---

## 🚀 Améliorations V2

- [ ] **Machine Learning** : Scoring basé sur historique matches
- [ ] **Préférences employer** : Poids personnalisés (ex: rating > distance)
- [ ] **Elasticsearch** : Recherche full-text avancée
- [ ] **Cache intelligent** : Invalidation par trigger
- [ ] **Matching temps réel** : WebSocket notifications
- [ ] **Filtres avancés** : Certifications, langues, disponibilité récurrente

---

## 📊 Métriques

### **KPIs à tracker**

- Temps de réponse moyen (target: <200ms)
- Nombre de résultats moyen par recherche
- Taux de conversion (recherche → contact WhatsApp)
- Compétences les plus recherchées
- Distance moyenne des matches

---

**Version**: 1.0
**Date**: 2025-12-25
