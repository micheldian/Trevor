-- Migration 028: Add is_urgent column to jobs table
-- Purpose: Add urgent flag to match TypeORM entity

-- Add is_urgent column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;

-- Create index for urgent jobs queries
CREATE INDEX IF NOT EXISTS idx_jobs_is_urgent ON jobs(is_urgent) WHERE is_urgent = true;

-- Comments
COMMENT ON COLUMN jobs.is_urgent IS 'Indique si le job est urgent';
