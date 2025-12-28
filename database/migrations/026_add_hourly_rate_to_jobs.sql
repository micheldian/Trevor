-- Migration 026: Add hourly_rate column to jobs table
-- Purpose: Add single hourly_rate column to match TypeORM entity (in addition to min/max)

-- Add hourly_rate column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(6,2);

-- Comments
COMMENT ON COLUMN jobs.hourly_rate IS 'Taux horaire pour ce job (EUR)';
