-- Migration 011: Add user statistics columns and performance indexes
-- Purpose: Support admin users endpoint with filtering and sorting

-- Add last_login_at column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Add last_seen_at column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;

-- Create function to update last_seen_at
CREATE OR REPLACE FUNCTION update_user_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_seen_at on user updates
DROP TRIGGER IF EXISTS trigger_update_user_last_seen ON users;
CREATE TRIGGER trigger_update_user_last_seen
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_seen();

-- ============================================
-- INDEXES for performance
-- ============================================

-- Index for role filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE is_active = true;

-- Index for active status
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(is_email_verified, is_phone_verified);

-- Composite index for status filtering
CREATE INDEX IF NOT EXISTS idx_users_status_composite ON users(is_active, role, created_at DESC);

-- Index for last_seen_at filtering and sorting
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at DESC NULLS LAST) WHERE is_active = true;

-- Index for last_login_at
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC NULLS LAST) WHERE is_active = true;

-- Index for created_at (already exists, but ensure DESC for sorting)
CREATE INDEX IF NOT EXISTS idx_users_created_at_desc ON users(created_at DESC);

-- Partial index for suspended users (assuming is_active = false means suspended)
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(id, created_at) WHERE is_active = false;

-- GIN index for text search on email and phone
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_users_email_trgm ON users USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_phone_trgm ON users USING gin(phone gin_trgm_ops);

-- ============================================
-- INDEXES for joins with profiles
-- ============================================

-- Index for profiles user_id (for efficient joins)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Index for profile type filtering
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);

-- Composite index for vehicle filtering
CREATE INDEX IF NOT EXISTS idx_profiles_vehicle ON profiles(user_id, has_vehicle) WHERE has_vehicle = true;

-- GIN index for skills array search
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON profiles USING gin(skills);

-- GIN index for cultures array search
CREATE INDEX IF NOT EXISTS idx_profiles_cultures_gin ON profiles USING gin(cultures);

-- Composite index for name search (individual profiles)
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON profiles(first_name, last_name) WHERE type = 'individual';

-- Index for team name search
CREATE INDEX IF NOT EXISTS idx_profiles_team_name_trgm ON profiles USING gin(team_name gin_trgm_ops) WHERE type = 'team';

-- ============================================
-- STATISTICS / AGGREGATIONS
-- ============================================

-- Create materialized view for user statistics (optional, for better performance)
-- This can be refreshed periodically or on-demand

CREATE MATERIALIZED VIEW IF NOT EXISTS user_statistics AS
SELECT
  u.id AS user_id,
  u.email,
  u.phone,
  u.role,
  u.is_active,
  u.created_at,
  u.last_seen_at,
  u.last_login_at,

  -- Count completed matches (missions)
  COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) AS missions_count,

  -- Average rating from reviews received
  COALESCE(AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating END), 0) AS rating_avg,

  -- Last activity timestamp (most recent of: match, review, or last_seen)
  GREATEST(
    COALESCE(MAX(m.updated_at), u.created_at),
    COALESCE(MAX(r.created_at), u.created_at),
    COALESCE(u.last_seen_at, u.created_at)
  ) AS last_activity_at

FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
LEFT JOIN matches m ON m.candidate_id = p.id
LEFT JOIN reviews r ON r.reviewee_id = u.id

GROUP BY u.id, u.email, u.phone, u.role, u.is_active, u.created_at, u.last_seen_at, u.last_login_at;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Create indexes on materialized view for filtering
CREATE INDEX IF NOT EXISTS idx_user_statistics_rating ON user_statistics(rating_avg DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_statistics_missions ON user_statistics(missions_count DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_statistics_activity ON user_statistics(last_activity_at DESC) WHERE is_active = true;

-- Function to refresh user statistics
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger to refresh stats after matches/reviews change
-- (Note: This might be too frequent, better to refresh periodically via cron)

-- Grant permissions
GRANT SELECT ON user_statistics TO PUBLIC;

-- ============================================
-- COMMENTS for documentation
-- ============================================

COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.last_seen_at IS 'Timestamp of last activity (auto-updated on user updates)';
COMMENT ON MATERIALIZED VIEW user_statistics IS 'Aggregated user statistics for admin dashboard - refresh periodically';
COMMENT ON INDEX idx_users_role IS 'Index for filtering users by role (active users only)';
COMMENT ON INDEX idx_users_status_composite IS 'Composite index for status, role, and date filtering';
COMMENT ON INDEX idx_profiles_vehicle IS 'Partial index for users with vehicles';
