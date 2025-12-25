# 🗄️ SCHEMA DATABASE - DESIGN DECISIONS

## 📋 Vue d'ensemble

**Contexte** : Plateforme de matching pour travailleurs agricoles (Bas-Rhin 67)
**SGBD** : PostgreSQL 15+ avec extensions PostGIS et pg_trgm
**Tables** : 10 tables principales + 3 vues

---

## 🏗️ Architecture des tables

### **1. users** (Authentification)
Compte utilisateur unique avec authentification OTP.

**Décisions clés** :
- ✅ **Email + Phone** : Support double authentification (email OU téléphone)
- ✅ **OTP intégré** : Code stocké directement (pas de table séparée V1)
- ✅ **Soft delete** : `is_active` plutôt que DELETE physique
- ✅ **Index nom complet** : `gin_trgm_ops` pour recherche fuzzy (Dupont ≈ Dupon)

**Contraintes** :
```sql
phone ~ '^\+33[0-9]{9}$'  -- Format strict français
email ~* '^[A-Za-z0-9._%+-]+@...'  -- RFC 5322 simplifié
```

---

### **2. profiles** (Multi-rôles)
Un user peut avoir **plusieurs profils** (worker + employer simultanément).

**Décisions clés** :
- ✅ **Multi-role** : `UNIQUE(user_id, profile_type)` permet 3 profils max par user
- ✅ **Compétences en array** : `TEXT[]` pour flexibilité (pas de table `skills` en V1)
- ✅ **PostGIS** : Géolocalisation pour matching par distance
- ✅ **Rating dénormalisé** : `rating_avg` + `rating_count` mis à jour par trigger

**Pourquoi pas de table `skills` séparée ?**
- V1 : Liste limitée (~50 compétences), array suffit
- V2 : Migration vers table si >200 skills ou taxonomie complexe

**Index critiques** :
```sql
-- Recherche géospatiale (rayon 50km)
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);

-- Recherche texte full-text français
CREATE INDEX idx_profiles_text_search ON profiles USING gin(
    to_tsvector('french', coalesce(bio, '') || ' ' || coalesce(company_name, ''))
);

-- Recherche skills (ANY operator)
CREATE INDEX idx_profiles_skills ON profiles USING gin(skills);
```

---

### **3. teams** + **team_members** (Équipes)
Équipes gérées par un `team_lead`, avec membres (workers).

**Décisions clés** :
- ✅ **Dénormalisation** : `current_members_count` pour perf (évite COUNT(*) répété)
- ✅ **Trigger auto** : Incrémente/décrémente count lors INSERT/DELETE team_members
- ✅ **Soft delete membre** : `is_active` + `left_at` (historique)
- ✅ **Contrainte capacité** : `current_members_count <= max_members`

**Cas d'usage** :
```sql
-- Query fréquente : "Équipes avec places disponibles"
SELECT * FROM teams
WHERE is_active = true
AND current_members_count < max_members;
-- Index: idx_teams_active (partial index)
```

---

### **4. availability** (Disponibilités)
Disponibilités des workers OU teams (exclusif).

**Décisions clés** :
- ✅ **Polymorphique** : `profile_id` XOR `team_id` (contrainte CHECK)
- ✅ **Plage de dates** : `daterange` PostgreSQL pour overlap queries
- ✅ **Jours de semaine** : Array `INTEGER[]` (1=Lundi, 7=Dimanche)
- ✅ **Index GIST daterange** : Requêtes overlap ultra-rapides

**Pourquoi pas une table par type (worker_availability, team_availability) ?**
- Évite duplication logique
- Simplifie queries (UNION moins fréquent)
- Contrainte CHECK garantit exclusivité

**Queries optimisées** :
```sql
-- "Workers disponibles du 1er au 15 mai 2025"
SELECT * FROM availability
WHERE profile_id IS NOT NULL
AND availability_type = 'available'
AND daterange(start_date, end_date, '[]') @> daterange('2025-05-01', '2025-05-15');
-- Index: idx_availability_date_range (GIST)
```

---

### **5. jobs** (Offres d'emploi)
Offres publiées par employers.

**Décisions clés** :
- ✅ **Full-Text Search** : `tsvector` auto-généré par trigger (title + description + category)
- ✅ **Compétences requises** : Array `TEXT[]` (match avec profiles.skills)
- ✅ **Status machine** : ENUM ('draft', 'published', 'closed', 'cancelled')
- ✅ **Dénormalisation counters** : `views_count`, `applications_count`, `workers_matched`
- ✅ **PostGIS location** : Matching géospatial

**Index critiques** :
```sql
-- Recherche textuelle français ("cueillette pommes Strasbourg")
CREATE INDEX idx_jobs_search ON jobs USING gin(search_vector);

-- Tri par date de publication (query fréquente)
CREATE INDEX idx_jobs_published ON jobs(published_at DESC)
WHERE status = 'published';

-- Recherche par compétences (ANY overlap)
CREATE INDEX idx_jobs_skills ON jobs USING gin(required_skills);
```

**Trigger auto-update search_vector** :
```sql
-- Poids : A (title) > B (description) > C (category) > D (city)
setweight(to_tsvector('french', title), 'A') || ...
```

---

### **6. matches** (Matching jobs ↔ workers/teams)
Cœur du système : matching entre offres et candidats.

**Décisions clés** :
- ✅ **Polymorphique** : `worker_profile_id` XOR `team_id`
- ✅ **Score algorithme** : `match_score` (0-100) + détails JSON `match_reasons`
- ✅ **Initiateur** : 'employer', 'worker', 'system' (tracking origin)
- ✅ **Expiration** : Auto-expire après 7 jours si non accepté
- ✅ **Unicité** : `UNIQUE(job_id, worker_profile_id, team_id)` évite doublons

**États du match** :
```
pending → accepted (collaboration)
pending → rejected (refus)
pending → expired (timeout)
```

**Index composites** :
```sql
-- Dashboard employer : "Mes matches par job"
CREATE INDEX idx_matches_job_status ON matches(job_id, status);

-- Dashboard worker : "Mes candidatures"
CREATE INDEX idx_matches_worker_status ON matches(worker_profile_id, status)
WHERE worker_profile_id IS NOT NULL;
```

**Algorithme de matching (pseudo-code)** :
```python
def calculate_match_score(job, worker):
    score = 0
    reasons = {}

    # Compétences (40%)
    skills_match = len(set(job.required_skills) & set(worker.skills))
    score += (skills_match / len(job.required_skills)) * 40
    reasons['skills'] = skills_match

    # Distance (30%)
    distance_km = calculate_distance(job.location, worker.location)
    if distance_km <= 10:
        score += 30
    elif distance_km <= 30:
        score += 20
    elif distance_km <= 50:
        score += 10

    # Expérience (20%)
    if worker.experience_years >= job.min_experience_years:
        score += 20

    # Rating (10%)
    score += worker.rating_avg * 2

    return score, reasons
```

---

### **7. reviews** (Avis)
Système de réputation bidirectionnel.

**Décisions clés** :
- ✅ **Lié au match** : Garantit collaboration réelle (pas de faux avis)
- ✅ **Bidirectionnel** : Employer → Worker ET Worker → Employer
- ✅ **Rating principal + critères** : `rating` (1-5) + `punctuality_rating`, `quality_rating`, `communication_rating`
- ✅ **Modération** : `is_verified` (admin), `reported_count` (signalements)
- ✅ **Trigger auto** : Update `profiles.rating_avg` après INSERT/UPDATE

**Contraintes** :
```sql
-- Un reviewer ne peut laisser qu'un seul avis par match
UNIQUE(match_id, reviewer_profile_id)

-- On ne peut pas se reviewer soi-même
reviewer_profile_id != reviewed_profile_id
```

**Index pour dashboard profil** :
```sql
-- "Afficher les 10 derniers avis publics de Jean (rating > 3)"
CREATE INDEX idx_reviews_reviewed_public
ON reviews(reviewed_profile_id, is_public, rating DESC)
WHERE is_public = true;
```

---

### **8. notifications** (Notifications)
Système de notifications push/email.

**Décisions clés** :
- ✅ **Type ENUM inline** : CHECK constraint (évite table types pour V1)
- ✅ **Polymorphique** : `related_entity_type` + `related_entity_id` (générique)
- ✅ **Canaux multiples** : `sent_via_email`, `sent_via_push`
- ✅ **Index unread** : Partial index `WHERE is_read = false`

**Types supportés** :
- `match_request` : Nouveau match reçu
- `match_accepted` : Match accepté
- `match_rejected` : Match refusé
- `new_review` : Nouvel avis reçu
- `job_expired` : Job expiré
- `team_invite` : Invitation équipe
- `system` : Notifications système

**Query optimisée** :
```sql
-- "Notifications non lues (dashboard)"
SELECT * FROM notifications
WHERE user_id = :user_id
AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
-- Index: idx_notifications_unread (composite partial)
```

---

### **9. analytics_events** (Analytics)
Tracking événements utilisateurs (optionnel V1).

**Décisions clés** :
- ✅ **JSONB flexible** : `event_data` pour métadonnées custom
- ✅ **User optionnel** : Support events anonymes (visiteurs)
- ✅ **INET type** : IP stockée en format natif (queries réseau possibles)
- ✅ **Index GIN JSONB** : Queries sur `event_data->>'key'`

**Exemples events** :
```json
{
  "event_type": "job_view",
  "event_data": {
    "job_id": "uuid",
    "source": "search",
    "search_query": "cueillette pommes"
  }
}

{
  "event_type": "match_created",
  "event_data": {
    "match_id": "uuid",
    "match_score": 87.5,
    "initiated_by": "system"
  }
}
```

---

## 🚀 OPTIMISATIONS PERFORMANCES

### **1. Index composites stratégiques**

```sql
-- Jobs publiés récents (page d'accueil)
CREATE INDEX idx_jobs_published ON jobs(published_at DESC)
WHERE status = 'published';

-- Matches par worker + status (dashboard)
CREATE INDEX idx_matches_worker_status ON matches(worker_profile_id, status)
WHERE worker_profile_id IS NOT NULL;

-- Reviews publiques par profil (page profil)
CREATE INDEX idx_reviews_reviewed_public ON reviews(reviewed_profile_id, is_public, rating DESC)
WHERE is_public = true;
```

**Principe** : Index partiel (`WHERE`) réduit taille et améliore vitesse.

---

### **2. Dénormalisation calculée**

| Table | Champ dénormalisé | Source | Trigger |
|-------|-------------------|--------|---------|
| `profiles` | `rating_avg`, `rating_count` | `reviews` | `update_profile_rating()` |
| `teams` | `current_members_count` | `team_members` | `update_team_members_count()` |
| `jobs` | `workers_matched` | `matches` | `update_job_workers_matched()` |

**Trade-off** :
- ✅ Queries 10-100x plus rapides (évite JOIN + COUNT)
- ❌ Complexité triggers (mais testés unitairement)

---

### **3. Recherche full-text PostgreSQL**

**Avantages vs ElasticSearch** :
- ✅ Pas d'infra additionnelle
- ✅ Support français natif (`french` config)
- ✅ Poids différenciés (title > description)
- ❌ Limite ~100k jobs (suffisant V1)

**Configuration** :
```sql
-- Auto-update via trigger
CREATE TRIGGER jobs_search_vector_update
BEFORE INSERT OR UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION jobs_search_vector_trigger();

-- Query
SELECT * FROM jobs
WHERE search_vector @@ plainto_tsquery('french', 'cueillette pommes')
ORDER BY ts_rank(search_vector, plainto_tsquery('french', 'cueillette pommes')) DESC;
```

---

### **4. PostGIS géospatial**

**Queries distance** :
```sql
-- "Jobs dans un rayon de 30km autour de Strasbourg"
SELECT
    id,
    title,
    ST_Distance(location, ST_MakePoint(7.7521, 48.5734)::geography) / 1000 AS distance_km
FROM jobs
WHERE ST_DWithin(
    location,
    ST_MakePoint(7.7521, 48.5734)::geography,
    30000  -- 30km en mètres
)
ORDER BY distance_km;
-- Index: idx_jobs_location (GIST)
```

**Performance** : GIST index réduit scan de O(n) → O(log n).

---

## 🔒 CONTRAINTES & VALIDATION

### **1. Contraintes métier**

```sql
-- Rating entre 1 et 5
CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5)

-- Dates cohérentes
CONSTRAINT date_range_valid CHECK (end_date >= start_date)

-- Capacité équipe
CONSTRAINT current_count_valid CHECK (
    current_members_count >= 1 AND
    current_members_count <= max_members
)

-- Polymorphisme exclusif (availability)
CONSTRAINT availability_target_check CHECK (
    (profile_id IS NOT NULL AND team_id IS NULL) OR
    (profile_id IS NULL AND team_id IS NOT NULL)
)
```

---

### **2. Contraintes format**

```sql
-- Téléphone français strict
CONSTRAINT phone_format CHECK (phone ~ '^\+33[0-9]{9}$')

-- Email RFC 5322 (simplifié)
CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
```

---

### **3. Unicité logique**

```sql
-- Un user ne peut avoir qu'un seul profil par type
UNIQUE(user_id, profile_type)

-- Un worker ne peut matcher qu'une fois le même job
UNIQUE(job_id, worker_profile_id, team_id)

-- Un reviewer ne peut laisser qu'un avis par match
UNIQUE(match_id, reviewer_profile_id)

-- Un worker ne peut être qu'une fois dans une team
UNIQUE(team_id, worker_profile_id)
```

---

## 📊 VUES MATÉRIALISÉES (Future V2)

**Candidates pour optimisation V2** :

```sql
-- Vue matérialisée : Stats par profil (refresh quotidien)
CREATE MATERIALIZED VIEW profile_stats AS
SELECT
    p.id,
    COUNT(DISTINCT m.id) as total_matches,
    COUNT(DISTINCT CASE WHEN m.status = 'accepted' THEN m.id END) as accepted_matches,
    COUNT(DISTINCT r.id) as total_reviews,
    AVG(r.rating) as avg_rating
FROM profiles p
LEFT JOIN matches m ON m.worker_profile_id = p.id
LEFT JOIN reviews r ON r.reviewed_profile_id = p.id
GROUP BY p.id;

CREATE UNIQUE INDEX idx_profile_stats_id ON profile_stats(id);
```

**Refresh** : Cron quotidien ou après event critique.

---

## 🧪 TESTS PERFORMANCES RECOMMANDÉS

### **Benchmarks à mesurer** :

| Query | Target | Index critique |
|-------|--------|----------------|
| Recherche jobs texte | < 50ms | `idx_jobs_search` |
| Jobs dans rayon 30km | < 100ms | `idx_jobs_location` |
| Dashboard worker (matches) | < 30ms | `idx_matches_worker_status` |
| Profil avec reviews (20 derniers) | < 20ms | `idx_reviews_reviewed_public` |
| Matching algorithme (1 job vs 100 workers) | < 200ms | Composites |

### **Outils** :
```sql
-- Analyser query plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM jobs WHERE search_vector @@ plainto_tsquery('french', 'pomme');

-- Index usage stats
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

---

## 🔄 MIGRATIONS FUTURES (V2)

### **Évolutions prévues** :

1. **Table `skills` séparée**
   - Si >200 compétences
   - Taxonomie hiérarchique (ex: "Tracteur" > "John Deere 6M")

2. **Table `certifications` séparée**
   - Validation fichiers (PDFs)
   - Dates d'expiration

3. **Partitioning `analytics_events`**
   - Par mois (si >10M events)
   - Archivage S3 après 1 an

4. **Table `messages`**
   - Chat interne (si pas WhatsApp externe)

5. **ElasticSearch**
   - Si >100k jobs
   - Recherche facettée avancée

---

## ✅ CHECKLIST DÉPLOIEMENT

**Avant première migration** :

- [ ] Extensions installées (`uuid-ossp`, `pg_trgm`, `postgis`)
- [ ] Rôles DB créés (app_user, readonly_user)
- [ ] Permissions configurées (GRANT SELECT, INSERT, UPDATE, DELETE)
- [ ] Backups automatiques configurés (pg_dump quotidien)
- [ ] Monitoring queries lentes (pg_stat_statements)
- [ ] Connection pooling (PgBouncer si >100 connexions)
- [ ] SSL/TLS obligatoire en production

**Après migration** :

- [ ] VACUUM ANALYZE exécuté
- [ ] Index stats vérifiées (`pg_stat_user_indexes`)
- [ ] Queries lentes identifiées (>100ms)
- [ ] Triggers testés (insert/update/delete)
- [ ] Contraintes validées (tentatives violation)

---

## 📚 RESSOURCES

- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [pg_trgm Fuzzy Search](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Index Types Guide](https://www.postgresql.org/docs/current/indexes-types.html)

---

**Date** : 2025-12-25
**Version schéma** : 1.0
**Auteur** : Claude (CTO Trevor)
