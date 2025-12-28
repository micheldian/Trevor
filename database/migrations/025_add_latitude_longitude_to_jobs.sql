-- Migration 025: Add latitude and longitude columns to jobs table
-- Purpose: Add separate lat/lng columns to match TypeORM entity (in addition to PostGIS location)

-- Add latitude column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Add longitude column
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create indexes for lat/lng queries
CREATE INDEX IF NOT EXISTS idx_jobs_latitude ON jobs(latitude);
CREATE INDEX IF NOT EXISTS idx_jobs_longitude ON jobs(longitude);

-- Create a composite index for efficient location queries
CREATE INDEX IF NOT EXISTS idx_jobs_lat_lng ON jobs(latitude, longitude);

-- Add check constraints for valid coordinates
ALTER TABLE jobs
ADD CONSTRAINT IF NOT EXISTS jobs_latitude_range CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE jobs
ADD CONSTRAINT IF NOT EXISTS jobs_longitude_range CHECK (longitude >= -180 AND longitude <= 180);

-- Comments
COMMENT ON COLUMN jobs.latitude IS 'Latitude du lieu de travail';
COMMENT ON COLUMN jobs.longitude IS 'Longitude du lieu de travail';
