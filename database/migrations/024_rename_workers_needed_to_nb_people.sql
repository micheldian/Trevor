-- Migration 024: Rename workers_needed to nb_people in jobs table
-- Purpose: Match TypeORM entity naming convention

ALTER TABLE jobs
RENAME COLUMN workers_needed TO nb_people;

-- Comments
COMMENT ON COLUMN jobs.nb_people IS 'Nombre de personnes nécessaires pour ce job';
