-- Migration 022: Add tags column to jobs table
-- Purpose: Add tags array for job categorization and search

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create GIN index for efficient array search
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING gin(tags);

-- Comments
COMMENT ON COLUMN jobs.tags IS 'Tags pour catégorisation et recherche (e.g., bio, urgent, expérience-requise)';
