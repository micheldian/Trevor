-- Migration 005: Create jobs table
-- Description: Table pour gérer les missions créées par les employeurs

-- Create ENUMs for job
CREATE TYPE job_status AS ENUM (
  'draft',
  'published',
  'in_contact',
  'confirmed',
  'completed',
  'cancelled'
);

CREATE TYPE job_date_type AS ENUM (
  'today',
  'tomorrow',
  'this_week',
  'next_week',
  'specific_date'
);

CREATE TYPE job_time_slot AS ENUM (
  'morning',
  'afternoon',
  'day'
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Job details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  culture VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',

  -- Date and time
  date_type job_date_type NOT NULL,
  specific_date DATE,
  time_slot job_time_slot NOT NULL,

  -- Capacity
  nb_people INTEGER NOT NULL CHECK (nb_people >= 1 AND nb_people <= 100),

  -- Location (required)
  latitude DECIMAL(10, 7) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DECIMAL(10, 7) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  address VARCHAR(200),
  city VARCHAR(100),
  postal_code VARCHAR(10),

  -- Status
  status job_status DEFAULT 'draft' NOT NULL,

  -- Compensation
  hourly_rate DECIMAL(10, 2) CHECK (hourly_rate >= 0),
  estimated_hours INTEGER CHECK (estimated_hours >= 1 AND estimated_hours <= 200),

  -- Flags
  is_urgent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  -- Cancellation
  cancellation_reason TEXT,

  -- Constraints
  CONSTRAINT check_specific_date_when_required
    CHECK (
      date_type != 'specific_date' OR specific_date IS NOT NULL
    ),
  CONSTRAINT check_cancellation_reason_when_cancelled
    CHECK (
      status != 'cancelled' OR cancellation_reason IS NOT NULL
    )
);

-- Indexes for performance
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status) WHERE is_active = true;
CREATE INDEX idx_jobs_culture ON jobs(culture);
CREATE INDEX idx_jobs_date_type ON jobs(date_type);
CREATE INDEX idx_jobs_time_slot ON jobs(time_slot);
CREATE INDEX idx_jobs_is_urgent ON jobs(is_urgent) WHERE is_urgent = true AND is_active = true;
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_published_at ON jobs(published_at DESC) WHERE status = 'published';

-- GiST index for geospatial queries
CREATE INDEX idx_jobs_location ON jobs USING GIST (
  ll_to_earth(latitude, longitude)
);

-- GIN index for array columns (tags, required_skills)
CREATE INDEX idx_jobs_tags ON jobs USING GIN (tags);
CREATE INDEX idx_jobs_required_skills ON jobs USING GIN (required_skills);

-- Full-text search index (culture, title, description)
CREATE INDEX idx_jobs_search ON jobs USING GIN (
  to_tsvector('french',
    coalesce(title, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(culture, '')
  )
);

-- Composite index for common queries
CREATE INDEX idx_jobs_status_employer ON jobs(status, employer_id) WHERE is_active = true;
CREATE INDEX idx_jobs_published_urgent ON jobs(status, is_urgent, created_at DESC)
  WHERE status = 'published' AND is_active = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();

-- Comments
COMMENT ON TABLE jobs IS 'Missions créées par les employeurs';
COMMENT ON COLUMN jobs.employer_id IS 'Référence vers le profil employeur';
COMMENT ON COLUMN jobs.status IS 'Statut de la mission (draft, published, in_contact, confirmed, completed, cancelled)';
COMMENT ON COLUMN jobs.date_type IS 'Type de date (today, tomorrow, this_week, next_week, specific_date)';
COMMENT ON COLUMN jobs.specific_date IS 'Date spécifique (requis si date_type = specific_date)';
COMMENT ON COLUMN jobs.nb_people IS 'Nombre de personnes recherchées (1-100)';
COMMENT ON COLUMN jobs.is_urgent IS 'Mission urgente nécessitant une attention immédiate';
COMMENT ON COLUMN jobs.cancellation_reason IS 'Raison de l\'annulation (requis si status = cancelled)';
