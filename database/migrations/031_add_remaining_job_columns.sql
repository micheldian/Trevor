-- Migration 031: Add remaining missing columns to jobs table
-- Purpose: Add completed_at, cancelled_at, and cancellation_reason columns

-- Add completed_at column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add cancelled_at column (note: closed_at in schema, but entity expects cancelled_at)
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Add cancellation_reason column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_completed_at ON jobs(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_cancelled_at ON jobs(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN jobs.completed_at IS 'Timestamp de complétion du job';
COMMENT ON COLUMN jobs.cancelled_at IS 'Timestamp d\'annulation du job';
COMMENT ON COLUMN jobs.cancellation_reason IS 'Raison de l\'annulation du job';
