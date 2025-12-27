-- Migration: Add indexes for admin jobs queries
-- Description: Optimizes filtering and searching jobs in admin panel

-- Index on status for filtering by job status
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE is_active = true;

-- Index on employer_id for filtering by employer
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id) WHERE is_active = true;

-- Composite index on status and employer_id (common filter combination)
CREATE INDEX IF NOT EXISTS idx_jobs_status_employer ON jobs(status, employer_id) WHERE is_active = true;

-- Index on created_at for date range filtering and sorting
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC) WHERE is_active = true;

-- Index on specific_date for job date filtering
CREATE INDEX IF NOT EXISTS idx_jobs_specific_date ON jobs(specific_date) WHERE specific_date IS NOT NULL;

-- Composite index on date_type and specific_date for date-based filtering
CREATE INDEX IF NOT EXISTS idx_jobs_date_type_specific ON jobs(date_type, specific_date);

-- GIN index on tags array for fast tag searching
CREATE INDEX IF NOT EXISTS idx_jobs_tags ON jobs USING GIN(tags);

-- GIN index on required_skills array
CREATE INDEX IF NOT EXISTS idx_jobs_required_skills ON jobs USING GIN(required_skills);

-- Index on culture for filtering
CREATE INDEX IF NOT EXISTS idx_jobs_culture ON jobs(culture) WHERE is_active = true;

-- Spatial index on location for distance queries (PostGIS)
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs USING GIST(location) WHERE location IS NOT NULL;

-- Index on cancelled_at for cancelled jobs
CREATE INDEX IF NOT EXISTS idx_jobs_cancelled_at ON jobs(cancelled_at) WHERE cancelled_at IS NOT NULL;

-- Composite index on status and created_at (for admin list sorting)
CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON jobs(status, created_at DESC) WHERE is_active = true;

-- Comments for documentation
COMMENT ON INDEX idx_jobs_status IS 'Optimizes filtering jobs by status';
COMMENT ON INDEX idx_jobs_employer_id IS 'Optimizes filtering jobs by employer';
COMMENT ON INDEX idx_jobs_status_employer IS 'Optimizes combined status and employer filtering';
COMMENT ON INDEX idx_jobs_created_at IS 'Optimizes created_at range queries and sorting';
COMMENT ON INDEX idx_jobs_specific_date IS 'Optimizes filtering by specific job date';
COMMENT ON INDEX idx_jobs_date_type_specific IS 'Optimizes date type and date filtering';
COMMENT ON INDEX idx_jobs_tags IS 'Optimizes tag-based searches using GIN index';
COMMENT ON INDEX idx_jobs_required_skills IS 'Optimizes skill-based searches';
COMMENT ON INDEX idx_jobs_culture IS 'Optimizes filtering by culture type';
COMMENT ON INDEX idx_jobs_location IS 'Optimizes spatial distance queries';
COMMENT ON INDEX idx_jobs_cancelled_at IS 'Optimizes queries on cancelled jobs';
COMMENT ON INDEX idx_jobs_status_created IS 'Optimizes admin list with status filter and date sorting';
