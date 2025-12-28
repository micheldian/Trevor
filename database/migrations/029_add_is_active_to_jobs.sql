-- Migration 029: Add is_active column to jobs table
-- Purpose: Add active flag to match TypeORM entity

-- Add is_active column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for active jobs queries
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active) WHERE is_active = true;

-- Comments
COMMENT ON COLUMN jobs.is_active IS 'Indique si le job est actif (non supprimé)';
