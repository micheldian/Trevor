-- Migration 020: Rename employer_profile_id to employer_id in jobs table
-- Purpose: Match TypeORM entity naming convention

ALTER TABLE jobs
RENAME COLUMN employer_profile_id TO employer_id;

-- Update any views or indexes that reference the old column name
DROP INDEX IF EXISTS idx_jobs_employer_profile_id;
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);

-- Comments
COMMENT ON COLUMN jobs.employer_id IS 'ID of the employer profile who created this job';
