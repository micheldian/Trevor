-- Migration 023: Add date_type and related columns to jobs table
-- Purpose: Add job date type fields to match TypeORM entity

-- Create enum type for job date types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE job_date_type AS ENUM ('today', 'tomorrow', 'this_week', 'next_week', 'specific_date');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create enum type for time slots if it doesn't exist
DO $$ BEGIN
    CREATE TYPE job_time_slot AS ENUM ('morning', 'afternoon', 'day');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add date_type column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS date_type job_date_type;

-- Add time_slot column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS time_slot job_time_slot;

-- Add specific_date column for when date_type is 'specific_date'
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS specific_date DATE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_date_type ON jobs(date_type);
CREATE INDEX IF NOT EXISTS idx_jobs_time_slot ON jobs(time_slot);
CREATE INDEX IF NOT EXISTS idx_jobs_specific_date ON jobs(specific_date) WHERE specific_date IS NOT NULL;

-- Comments
COMMENT ON COLUMN jobs.date_type IS 'Type de date (today, tomorrow, this_week, etc.)';
COMMENT ON COLUMN jobs.time_slot IS 'Créneau horaire (morning, afternoon, day)';
COMMENT ON COLUMN jobs.specific_date IS 'Date spécifique si date_type = specific_date';
