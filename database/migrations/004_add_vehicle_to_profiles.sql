-- ====================================
-- MIGRATION: ADD VEHICLE FIELD TO PROFILES
-- ====================================

-- Ajouter colonne has_vehicle
ALTER TABLE profiles
ADD COLUMN has_vehicle BOOLEAN DEFAULT false;

-- Index pour filtrage
CREATE INDEX idx_profiles_has_vehicle ON profiles(has_vehicle) WHERE has_vehicle = true;

-- Commentaire
COMMENT ON COLUMN profiles.has_vehicle IS 'Indique si le worker/team_lead possède un véhicule';

-- Ajouter latitude/longitude au profil (pour position par défaut)
ALTER TABLE profiles
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7);

-- Contraintes
ALTER TABLE profiles
ADD CONSTRAINT profiles_latitude_range CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
ADD CONSTRAINT profiles_longitude_range CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Index géospatial
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude) WHERE latitude IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN profiles.latitude IS 'Position par défaut du profil (latitude)';
COMMENT ON COLUMN profiles.longitude IS 'Position par défaut du profil (longitude)';
