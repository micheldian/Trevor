-- Migration 006: Create matches table
-- Description: Table pour gérer les matches entre jobs et candidats (click WhatsApp)

-- Create ENUM for match status
CREATE TYPE match_status AS ENUM (
  'discussed',
  'interested',
  'rejected',
  'confirmed',
  'completed'
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Status
  status match_status DEFAULT 'discussed' NOT NULL,

  -- Notes
  employer_notes TEXT,
  candidate_notes TEXT,

  -- WhatsApp tracking
  whatsapp_contacted BOOLEAN DEFAULT false,
  whatsapp_contacted_at TIMESTAMP,

  -- Flags
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  interested_at TIMESTAMP,
  rejected_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- ANTI-DUPLICATION: Un seul match par (job_id, candidate_id)
  CONSTRAINT unique_job_candidate UNIQUE (job_id, candidate_id)
);

-- Indexes for performance
CREATE INDEX idx_matches_job_id ON matches(job_id) WHERE is_active = true;
CREATE INDEX idx_matches_candidate_id ON matches(candidate_id) WHERE is_active = true;
CREATE INDEX idx_matches_status ON matches(status) WHERE is_active = true;
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_matches_job_status ON matches(job_id, status) WHERE is_active = true;
CREATE INDEX idx_matches_candidate_status ON matches(candidate_id, status) WHERE is_active = true;

-- Index for WhatsApp tracking
CREATE INDEX idx_matches_whatsapp_contacted ON matches(whatsapp_contacted_at DESC)
  WHERE whatsapp_contacted = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- Comments
COMMENT ON TABLE matches IS 'Matches entre jobs et candidats (clicks WhatsApp)';
COMMENT ON COLUMN matches.job_id IS 'Référence vers la mission';
COMMENT ON COLUMN matches.candidate_id IS 'Référence vers le profil candidat (worker ou team_lead)';
COMMENT ON COLUMN matches.status IS 'Statut du match (discussed, interested, rejected, confirmed, completed)';
COMMENT ON COLUMN matches.whatsapp_contacted IS 'Indique si l\'employeur a cliqué sur le lien WhatsApp';
COMMENT ON COLUMN matches.whatsapp_contacted_at IS 'Date du premier click WhatsApp';
COMMENT ON CONSTRAINT unique_job_candidate ON matches IS 'Anti-duplication: un seul match par (job_id, candidate_id)';
