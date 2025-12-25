-- Migration 007: Add booking fields to availabilities
-- Description: Ajoute les champs pour bloquer les disponibilités (anti double-booking)

-- Ajouter les colonnes de booking
ALTER TABLE availabilities
ADD COLUMN booked_by_match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
ADD COLUMN booked_at TIMESTAMP;

-- Index pour trouver rapidement les availabilities bookées
CREATE INDEX idx_availabilities_booked_by_match
  ON availabilities(booked_by_match_id)
  WHERE booked_by_match_id IS NOT NULL;

-- Index pour rechercher les availabilities non bookées par créneau
CREATE INDEX idx_availabilities_not_booked
  ON availabilities(profile_id, date_type, time_slot)
  WHERE booked_by_match_id IS NULL AND is_active = true;

-- Comments
COMMENT ON COLUMN availabilities.booked_by_match_id IS 'Match qui a réservé cette disponibilité (anti double-booking)';
COMMENT ON COLUMN availabilities.booked_at IS 'Date de réservation de la disponibilité';
