-- Migration 021: Rename category to culture in jobs table
-- Purpose: Match TypeORM entity naming convention (culture = crop type in agricultural context)

ALTER TABLE jobs
RENAME COLUMN category TO culture;

-- Comments
COMMENT ON COLUMN jobs.culture IS 'Type de culture agricole (e.g., tomates, vignes, céréales)';
