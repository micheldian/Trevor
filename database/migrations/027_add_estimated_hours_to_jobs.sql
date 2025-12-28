-- Migration 027: Add estimated_hours column to jobs table
-- Purpose: Add estimated hours field to match TypeORM entity

-- Add estimated_hours column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);

-- Comments
COMMENT ON COLUMN jobs.estimated_hours IS 'Nombre d\'heures estimées pour ce job';
