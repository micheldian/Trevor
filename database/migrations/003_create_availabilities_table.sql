-- ====================================
-- MIGRATION: CREATE AVAILABILITIES TABLE
-- ====================================

CREATE TYPE availability_status AS ENUM ('on', 'off');
CREATE TYPE date_type AS ENUM ('today', 'tomorrow');
CREATE TYPE time_slot AS ENUM ('morning', 'afternoon', 'day');

CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Status
    status availability_status DEFAULT 'on',
    date_type date_type NOT NULL,
    time_slot time_slot NOT NULL,

    -- Géolocalisation
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    radius_km INTEGER DEFAULT 50,

    -- Métadonnées
    notes TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT latitude_range CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT longitude_range CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT radius_range CHECK (radius_km >= 1 AND radius_km <= 200)
);

-- Index
CREATE INDEX idx_availabilities_profile ON availabilities(profile_id);
CREATE INDEX idx_availabilities_status ON availabilities(status) WHERE status = 'on';
CREATE INDEX idx_availabilities_date_type ON availabilities(date_type);
CREATE INDEX idx_availabilities_time_slot ON availabilities(time_slot);
CREATE INDEX idx_availabilities_active ON availabilities(is_active) WHERE is_active = true;
CREATE INDEX idx_availabilities_created ON availabilities(created_at DESC);

-- Index géospatial (pour requêtes proximity)
CREATE INDEX idx_availabilities_location ON availabilities(latitude, longitude);

-- Trigger updated_at
CREATE TRIGGER update_availabilities_updated_at
    BEFORE UPDATE ON availabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commentaires
COMMENT ON TABLE availabilities IS 'Disponibilités des workers/team_leads avec géolocalisation';
COMMENT ON COLUMN availabilities.status IS 'ON = disponible, OFF = indisponible';
COMMENT ON COLUMN availabilities.date_type IS 'Aujourd''hui ou demain';
COMMENT ON COLUMN availabilities.time_slot IS 'Matin (8-12h), Après-midi (14-18h), Journée (8-18h)';
COMMENT ON COLUMN availabilities.radius_km IS 'Rayon de recherche en kilomètres (1-200)';
