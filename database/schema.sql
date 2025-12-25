-- ====================================
-- TREVOR V1 - SCHEMA POSTGRESQL
-- Plateforme de matching travailleurs agricoles (Bas-Rhin 67)
-- ====================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Recherche texte fuzzy
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Géolocalisation (optionnel)

-- ====================================
-- ENUMS
-- ====================================

CREATE TYPE profile_type AS ENUM ('worker', 'team_lead', 'employer');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'seasonal', 'temporary');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'cancelled');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE availability_type AS ENUM ('available', 'unavailable', 'maybe');

-- ====================================
-- TABLE: users
-- Compte utilisateur (auth)
-- ====================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Auth
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,  -- Format: +33XXXXXXXXX
    phone_verified BOOLEAN DEFAULT false,

    -- OTP
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP,
    otp_verified_at TIMESTAMP,

    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^\+33[0-9]{9}$'),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created ON users(created_at DESC);

-- Recherche texte sur nom/prénom
CREATE INDEX idx_users_name_search ON users USING gin(
    (first_name || ' ' || last_name) gin_trgm_ops
);

-- ====================================
-- TABLE: profiles
-- Profils utilisateur (multi-roles)
-- ====================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Type de profil
    profile_type profile_type NOT NULL,

    -- Informations professionnelles
    bio TEXT,
    company_name VARCHAR(255),  -- Pour employers
    siret VARCHAR(14),  -- Pour employers

    -- Localisation
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(5) NOT NULL DEFAULT '67000',
    address TEXT,
    location GEOGRAPHY(POINT, 4326),  -- PostGIS

    -- Compétences & expérience (pour workers/team_leads)
    skills TEXT[],  -- Ex: ['cueillette', 'taille', 'conduite tracteur']
    experience_years INTEGER DEFAULT 0,
    certifications TEXT[],  -- Ex: ['CACES', 'Phyto']

    -- Contact
    whatsapp_number VARCHAR(20),  -- Peut être différent du phone principal
    preferred_contact VARCHAR(20) DEFAULT 'whatsapp',  -- whatsapp, phone, email

    -- Rating
    rating_avg DECIMAL(3,2) DEFAULT 0.00,  -- 0.00 à 5.00
    rating_count INTEGER DEFAULT 0,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_complete BOOLEAN DEFAULT false,  -- Profil complété à 100%
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT profiles_user_type_unique UNIQUE(user_id, profile_type),
    CONSTRAINT whatsapp_format CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^\+33[0-9]{9}$'),
    CONSTRAINT rating_range CHECK (rating_avg >= 0 AND rating_avg <= 5),
    CONSTRAINT experience_positive CHECK (experience_years >= 0)
);

-- Index
CREATE INDEX idx_profiles_user ON profiles(user_id);
CREATE INDEX idx_profiles_type ON profiles(profile_type);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_profiles_rating ON profiles(rating_avg DESC);

-- Index géospatial
CREATE INDEX idx_profiles_location ON profiles USING GIST(location) WHERE location IS NOT NULL;

-- Recherche texte sur compétences
CREATE INDEX idx_profiles_skills ON profiles USING gin(skills);

-- Recherche texte sur bio + company
CREATE INDEX idx_profiles_text_search ON profiles USING gin(
    to_tsvector('french', coalesce(bio, '') || ' ' || coalesce(company_name, ''))
);

-- ====================================
-- TABLE: teams
-- Équipes de travailleurs (gérées par team_leads)
-- ====================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Leader
    team_lead_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Info équipe
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Capacité
    max_members INTEGER DEFAULT 10,
    current_members_count INTEGER DEFAULT 1,  -- Inclut le lead

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT max_members_positive CHECK (max_members > 0),
    CONSTRAINT current_count_valid CHECK (current_members_count >= 1 AND current_members_count <= max_members)
);

-- Index
CREATE INDEX idx_teams_lead ON teams(team_lead_profile_id);
CREATE INDEX idx_teams_active ON teams(is_active) WHERE is_active = true;
CREATE INDEX idx_teams_created ON teams(created_at DESC);

-- ====================================
-- TABLE: team_members
-- Membres d'une équipe
-- ====================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    worker_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Status
    role VARCHAR(50) DEFAULT 'member',  -- member, assistant_lead
    is_active BOOLEAN DEFAULT true,

    -- Dates
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,

    -- Constraints
    CONSTRAINT team_members_unique UNIQUE(team_id, worker_profile_id)
);

-- Index
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_worker ON team_members(worker_profile_id);
CREATE INDEX idx_team_members_active ON team_members(is_active) WHERE is_active = true;

-- ====================================
-- TABLE: availability
-- Disponibilités des workers/teams
-- ====================================

CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Lié à un profil OU une équipe (exclusif)
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

    -- Période
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Détails
    availability_type availability_type DEFAULT 'available',
    days_of_week INTEGER[],  -- [1,2,3,4,5] = Lundi à Vendredi (1=Lundi, 7=Dimanche)
    hours_per_day DECIMAL(4,2),  -- Ex: 8.00, 4.50

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT availability_target_check CHECK (
        (profile_id IS NOT NULL AND team_id IS NULL) OR
        (profile_id IS NULL AND team_id IS NOT NULL)
    ),
    CONSTRAINT date_range_valid CHECK (end_date >= start_date),
    CONSTRAINT hours_valid CHECK (hours_per_day IS NULL OR (hours_per_day > 0 AND hours_per_day <= 24))
);

-- Index
CREATE INDEX idx_availability_profile ON availability(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX idx_availability_team ON availability(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_availability_dates ON availability(start_date, end_date);
CREATE INDEX idx_availability_type ON availability(availability_type);

-- Index pour recherche par date
CREATE INDEX idx_availability_date_range ON availability USING gist(
    daterange(start_date, end_date, '[]')
);

-- ====================================
-- TABLE: jobs
-- Offres d'emploi publiées par employers
-- ====================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Détails job
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- Type & catégorie
    job_type job_type NOT NULL,
    category VARCHAR(100),  -- 'récolte', 'taille', 'entretien', 'conduite', etc.

    -- Requis
    required_skills TEXT[],
    required_certifications TEXT[],
    min_experience_years INTEGER DEFAULT 0,

    -- Capacité
    workers_needed INTEGER DEFAULT 1,
    workers_matched INTEGER DEFAULT 0,

    -- Localisation
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),

    -- Période
    start_date DATE NOT NULL,
    end_date DATE,

    -- Rémunération (indicative)
    hourly_rate_min DECIMAL(6,2),
    hourly_rate_max DECIMAL(6,2),
    currency VARCHAR(3) DEFAULT 'EUR',

    -- Contact
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),

    -- Status
    status job_status DEFAULT 'draft',

    -- Metadata
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    expires_at TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,

    -- Recherche textuelle (tsvector)
    search_vector tsvector,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT workers_needed_positive CHECK (workers_needed > 0),
    CONSTRAINT workers_matched_valid CHECK (workers_matched >= 0 AND workers_matched <= workers_needed),
    CONSTRAINT date_range_valid CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT hourly_rate_valid CHECK (
        hourly_rate_max IS NULL OR
        hourly_rate_min IS NULL OR
        hourly_rate_max >= hourly_rate_min
    )
);

-- Index principaux
CREATE INDEX idx_jobs_employer ON jobs(employer_profile_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_city ON jobs(city);
CREATE INDEX idx_jobs_dates ON jobs(start_date, end_date);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC) WHERE status = 'published';

-- Index géospatial
CREATE INDEX idx_jobs_location ON jobs USING GIST(location) WHERE location IS NOT NULL;

-- Index recherche texte
CREATE INDEX idx_jobs_search ON jobs USING gin(search_vector);

-- Index compétences
CREATE INDEX idx_jobs_skills ON jobs USING gin(required_skills);

-- ====================================
-- TABLE: matches
-- Matching entre jobs et workers/teams
-- ====================================

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

    -- Match avec profil OU équipe (exclusif)
    worker_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,

    -- Match initié par qui ?
    initiated_by VARCHAR(20) NOT NULL,  -- 'employer', 'worker', 'system' (algo)

    -- Status
    status match_status DEFAULT 'pending',

    -- Score de matching (si algo)
    match_score DECIMAL(5,2),  -- 0.00 à 100.00
    match_reasons JSONB,  -- Détails du scoring

    -- Réponse
    employer_message TEXT,
    worker_message TEXT,

    -- Dates importantes
    responded_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT match_target_check CHECK (
        (worker_profile_id IS NOT NULL AND team_id IS NULL) OR
        (worker_profile_id IS NULL AND team_id IS NOT NULL)
    ),
    CONSTRAINT match_unique UNIQUE(job_id, worker_profile_id, team_id),
    CONSTRAINT match_score_valid CHECK (match_score IS NULL OR (match_score >= 0 AND match_score <= 100))
);

-- Index
CREATE INDEX idx_matches_job ON matches(job_id);
CREATE INDEX idx_matches_worker ON matches(worker_profile_id) WHERE worker_profile_id IS NOT NULL;
CREATE INDEX idx_matches_team ON matches(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_initiated ON matches(initiated_by);
CREATE INDEX idx_matches_score ON matches(match_score DESC) WHERE match_score IS NOT NULL;
CREATE INDEX idx_matches_created ON matches(created_at DESC);

-- Index composite pour queries fréquentes
CREATE INDEX idx_matches_job_status ON matches(job_id, status);
CREATE INDEX idx_matches_worker_status ON matches(worker_profile_id, status) WHERE worker_profile_id IS NOT NULL;

-- ====================================
-- TABLE: reviews
-- Avis après collaboration
-- ====================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Lié à un match complété
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,

    -- Reviewer (qui laisse l'avis)
    reviewer_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Reviewé (qui reçoit l'avis)
    reviewed_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Rating
    rating INTEGER NOT NULL,  -- 1 à 5 étoiles

    -- Commentaire
    title VARCHAR(255),
    comment TEXT,

    -- Critères spécifiques (optionnel)
    punctuality_rating INTEGER,  -- 1-5
    quality_rating INTEGER,  -- 1-5
    communication_rating INTEGER,  -- 1-5

    -- Metadata
    is_public BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,  -- Vérifié par admin
    reported_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT review_unique UNIQUE(match_id, reviewer_profile_id),
    CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT punctuality_range CHECK (punctuality_rating IS NULL OR (punctuality_rating >= 1 AND punctuality_rating <= 5)),
    CONSTRAINT quality_range CHECK (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)),
    CONSTRAINT communication_range CHECK (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)),
    CONSTRAINT reviewer_not_reviewed CHECK (reviewer_profile_id != reviewed_profile_id)
);

-- Index
CREATE INDEX idx_reviews_match ON reviews(match_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_profile_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_profile_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_reviews_public ON reviews(is_public) WHERE is_public = true;

-- Index composite pour queries fréquentes
CREATE INDEX idx_reviews_reviewed_public ON reviews(reviewed_profile_id, is_public, rating DESC)
    WHERE is_public = true;

-- ====================================
-- TABLE: notifications
-- Notifications utilisateurs
-- ====================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Type & contenu
    type VARCHAR(50) NOT NULL,  -- 'match_request', 'match_accepted', 'new_review', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,

    -- Données liées
    related_entity_type VARCHAR(50),  -- 'match', 'job', 'review', etc.
    related_entity_id UUID,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Canaux
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_push BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),

    -- Index inline (partiel)
    CONSTRAINT notification_type_valid CHECK (type IN (
        'match_request', 'match_accepted', 'match_rejected',
        'new_review', 'job_expired', 'team_invite', 'system'
    ))
);

-- Index
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC)
    WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ====================================
-- TABLE: analytics_events
-- Tracking événements (optionnel)
-- ====================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- User (optionnel, peut être anonyme)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Événement
    event_type VARCHAR(100) NOT NULL,  -- 'job_view', 'profile_view', 'match_created', etc.
    event_data JSONB,

    -- Context
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- Index JSONB pour queries sur event_data
CREATE INDEX idx_analytics_data ON analytics_events USING gin(event_data);

-- ====================================
-- TRIGGERS
-- ====================================

-- Fonction: updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger à toutes les tables avec updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Auto-update search_vector pour jobs
CREATE OR REPLACE FUNCTION jobs_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('french', coalesce(NEW.category, '')), 'C') ||
        setweight(to_tsvector('french', coalesce(NEW.city, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_search_vector_update
    BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION jobs_search_vector_trigger();

-- Fonction: Update rating_avg sur profiles après review
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer la moyenne et le count
    UPDATE profiles
    SET
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE reviewed_profile_id = NEW.reviewed_profile_id
            AND is_public = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE reviewed_profile_id = NEW.reviewed_profile_id
            AND is_public = true
        )
    WHERE id = NEW.reviewed_profile_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_rating_after_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_profile_rating();

-- Fonction: Update team current_members_count
CREATE OR REPLACE FUNCTION update_team_members_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE teams
        SET current_members_count = current_members_count + 1
        WHERE id = NEW.team_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE teams
        SET current_members_count = current_members_count - 1
        WHERE id = OLD.team_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_count_after_member_change
    AFTER INSERT OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_members_count();

-- Fonction: Update jobs workers_matched count
CREATE OR REPLACE FUNCTION update_job_workers_matched()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE jobs
        SET workers_matched = workers_matched + 1
        WHERE id = NEW.job_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        UPDATE jobs
        SET workers_matched = workers_matched + 1
        WHERE id = NEW.job_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
        UPDATE jobs
        SET workers_matched = workers_matched - 1
        WHERE id = NEW.job_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_workers_matched_after_match
    AFTER INSERT OR UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_job_workers_matched();

-- ====================================
-- VUES UTILES
-- ====================================

-- Vue: Profils complets (user + profile)
CREATE OR REPLACE VIEW profiles_full AS
SELECT
    p.*,
    u.email,
    u.phone,
    u.first_name,
    u.last_name,
    u.avatar_url,
    u.is_verified as user_verified,
    u.last_login_at
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE p.is_active = true AND u.is_active = true;

-- Vue: Jobs actifs avec employer info
CREATE OR REPLACE VIEW jobs_active AS
SELECT
    j.*,
    p.company_name as employer_company,
    p.rating_avg as employer_rating,
    u.first_name || ' ' || u.last_name as employer_name
FROM jobs j
JOIN profiles p ON p.id = j.employer_profile_id
JOIN users u ON u.id = p.user_id
WHERE j.status = 'published'
AND (j.expires_at IS NULL OR j.expires_at > NOW());

-- Vue: Matches en attente avec détails
CREATE OR REPLACE VIEW matches_pending AS
SELECT
    m.*,
    j.title as job_title,
    j.start_date as job_start_date,
    wp.user_id as worker_user_id,
    wu.first_name || ' ' || wu.last_name as worker_name,
    ep.user_id as employer_user_id,
    eu.first_name || ' ' || eu.last_name as employer_name
FROM matches m
JOIN jobs j ON j.id = m.job_id
JOIN profiles ep ON ep.id = j.employer_profile_id
JOIN users eu ON eu.id = ep.user_id
LEFT JOIN profiles wp ON wp.id = m.worker_profile_id
LEFT JOIN users wu ON wu.id = wp.user_id
WHERE m.status = 'pending'
AND (m.expires_at IS NULL OR m.expires_at > NOW());

-- ====================================
-- COMMENTAIRES
-- ====================================

COMMENT ON TABLE users IS 'Comptes utilisateurs (authentification)';
COMMENT ON TABLE profiles IS 'Profils multi-rôles (worker, team_lead, employer)';
COMMENT ON TABLE teams IS 'Équipes de travailleurs gérées par team_leads';
COMMENT ON TABLE team_members IS 'Membres appartenant à une équipe';
COMMENT ON TABLE availability IS 'Disponibilités des workers/teams';
COMMENT ON TABLE jobs IS 'Offres d''emploi publiées par employers';
COMMENT ON TABLE matches IS 'Matching entre jobs et workers/teams';
COMMENT ON TABLE reviews IS 'Avis après collaboration';
COMMENT ON TABLE notifications IS 'Notifications push/email';
COMMENT ON TABLE analytics_events IS 'Tracking événements utilisateurs';

COMMENT ON COLUMN profiles.search_vector IS 'Index recherche full-text (auto-généré)';
COMMENT ON COLUMN jobs.search_vector IS 'Index recherche full-text (auto-généré)';
COMMENT ON COLUMN matches.match_score IS 'Score algorithme matching (0-100)';
COMMENT ON COLUMN reviews.is_verified IS 'Avis vérifié par modération admin';
