-- Migration 009: Add role column to users table
-- This migration adds the role column for RBAC (Role-Based Access Control)

-- Create role enum type
CREATE TYPE user_role AS ENUM ('worker', 'team_lead', 'employer', 'admin');

-- Add role column to users table
ALTER TABLE users
ADD COLUMN role user_role NOT NULL DEFAULT 'worker';

-- Create index on role for faster queries
CREATE INDEX idx_users_role ON users(role);

-- Update existing users based on their profiles
-- Workers and team leads get their role from profile type
UPDATE users u
SET role = CASE
  WHEN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = u.id AND p.profile_type = 'team_lead'
  ) THEN 'team_lead'::user_role
  WHEN EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = u.id AND p.profile_type = 'employer'
  ) THEN 'employer'::user_role
  ELSE 'worker'::user_role
END;

-- Comments
COMMENT ON COLUMN users.role IS 'User role for RBAC: worker, team_lead, employer, or admin';
COMMENT ON TYPE user_role IS 'Enum for user roles in the Trevor platform';
