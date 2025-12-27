-- Migration: Create conflict detection function
-- Description: Detects scheduling conflicts when a candidate is confirmed on multiple jobs with overlapping time slots

-- Function to check if two jobs have conflicting time slots
CREATE OR REPLACE FUNCTION jobs_have_time_conflict(
  job1_date_type job_date_type,
  job1_specific_date DATE,
  job1_time_slot job_time_slot,
  job2_date_type job_date_type,
  job2_specific_date DATE,
  job2_time_slot job_time_slot
) RETURNS BOOLEAN AS $$
DECLARE
  job1_start DATE;
  job1_end DATE;
  job2_start DATE;
  job2_end DATE;
BEGIN
  -- Calculate date ranges for job1
  CASE job1_date_type
    WHEN 'today' THEN
      job1_start := CURRENT_DATE;
      job1_end := CURRENT_DATE;
    WHEN 'tomorrow' THEN
      job1_start := CURRENT_DATE + INTERVAL '1 day';
      job1_end := CURRENT_DATE + INTERVAL '1 day';
    WHEN 'this_week' THEN
      job1_start := CURRENT_DATE;
      job1_end := CURRENT_DATE + INTERVAL '7 days';
    WHEN 'next_week' THEN
      job1_start := CURRENT_DATE + INTERVAL '7 days';
      job1_end := CURRENT_DATE + INTERVAL '14 days';
    WHEN 'specific_date' THEN
      job1_start := job1_specific_date;
      job1_end := job1_specific_date;
    ELSE
      RETURN FALSE;
  END CASE;

  -- Calculate date ranges for job2
  CASE job2_date_type
    WHEN 'today' THEN
      job2_start := CURRENT_DATE;
      job2_end := CURRENT_DATE;
    WHEN 'tomorrow' THEN
      job2_start := CURRENT_DATE + INTERVAL '1 day';
      job2_end := CURRENT_DATE + INTERVAL '1 day';
    WHEN 'this_week' THEN
      job2_start := CURRENT_DATE;
      job2_end := CURRENT_DATE + INTERVAL '7 days';
    WHEN 'next_week' THEN
      job2_start := CURRENT_DATE + INTERVAL '7 days';
      job2_end := CURRENT_DATE + INTERVAL '14 days';
    WHEN 'specific_date' THEN
      job2_start := job2_specific_date;
      job2_end := job2_specific_date;
    ELSE
      RETURN FALSE;
  END CASE;

  -- Check if date ranges overlap
  IF job1_end < job2_start OR job2_end < job1_start THEN
    RETURN FALSE; -- No date overlap
  END IF;

  -- Check if time slots conflict
  -- 'day' conflicts with everything
  -- 'morning' conflicts with 'morning' and 'day'
  -- 'afternoon' conflicts with 'afternoon' and 'day'
  IF job1_time_slot = 'day' OR job2_time_slot = 'day' THEN
    RETURN TRUE; -- Full day always conflicts
  END IF;

  IF job1_time_slot = job2_time_slot THEN
    RETURN TRUE; -- Same time slot conflicts
  END IF;

  RETURN FALSE; -- Different time slots (morning vs afternoon)
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add index on matches for conflict detection queries
CREATE INDEX IF NOT EXISTS idx_matches_confirmed ON matches(status, candidate_id)
  WHERE status = 'confirmed' AND is_active = true;

-- Add composite index for efficient job lookups
CREATE INDEX IF NOT EXISTS idx_jobs_date_time ON jobs(date_type, specific_date, time_slot)
  WHERE is_active = true;

-- Comments for documentation
COMMENT ON FUNCTION jobs_have_time_conflict IS
  'Checks if two jobs have conflicting time slots considering date ranges and time slots. ' ||
  'Returns TRUE if jobs overlap in time.';

COMMENT ON INDEX idx_matches_confirmed IS
  'Optimizes queries for finding confirmed matches by candidate';

COMMENT ON INDEX idx_jobs_date_time IS
  'Optimizes queries for job time slot comparisons in conflict detection';
