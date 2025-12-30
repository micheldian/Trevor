-- Migration 033: Make start_date and end_date nullable in jobs table
-- Since we now use date_type and specific_date instead

ALTER TABLE jobs
ALTER COLUMN start_date DROP NOT NULL;

-- end_date is already nullable
