-- Migration 030: Add confirmed_at column to jobs table
-- Purpose: Add timestamp for when job was confirmed

-- Add confirmed_at column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

-- Create index for confirmed jobs queries
CREATE INDEX IF NOT EXISTS idx_jobs_confirmed_at ON jobs(confirmed_at) WHERE confirmed_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN jobs.confirmed_at IS 'Timestamp de confirmation du job';
