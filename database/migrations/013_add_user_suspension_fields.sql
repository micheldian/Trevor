-- Migration: Add user suspension and ban fields
-- Description: Add status, suspend_reason, and suspend_until columns for user moderation
-- Date: 2025-12-26

-- Create user status enum type
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned');

-- Add suspension-related columns to users table
ALTER TABLE users
ADD COLUMN status user_status NOT NULL DEFAULT 'active',
ADD COLUMN suspend_reason TEXT NULL,
ADD COLUMN suspend_until TIMESTAMP NULL,
ADD COLUMN suspended_at TIMESTAMP NULL,
ADD COLUMN suspended_by UUID NULL,
ADD COLUMN banned_at TIMESTAMP NULL,
ADD COLUMN banned_by UUID NULL;

-- Add foreign key constraints for admin tracking
ALTER TABLE users
ADD CONSTRAINT fk_users_suspended_by
FOREIGN KEY (suspended_by)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE users
ADD CONSTRAINT fk_users_banned_by
FOREIGN KEY (banned_by)
REFERENCES users(id)
ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_suspend_until ON users(suspend_until) WHERE suspend_until IS NOT NULL;
CREATE INDEX idx_users_suspended_by ON users(suspended_by);
CREATE INDEX idx_users_banned_by ON users(banned_by);

-- Add composite index for suspended users
CREATE INDEX idx_users_suspended_active ON users(status, suspend_until) WHERE status = 'suspended';

-- Add comments for documentation
COMMENT ON COLUMN users.status IS 'User account status: active, suspended, or banned';
COMMENT ON COLUMN users.suspend_reason IS 'Reason for suspension or ban';
COMMENT ON COLUMN users.suspend_until IS 'Timestamp when temporary suspension expires (NULL for indefinite)';
COMMENT ON COLUMN users.suspended_at IS 'Timestamp when user was suspended';
COMMENT ON COLUMN users.suspended_by IS 'ID of admin who suspended the user';
COMMENT ON COLUMN users.banned_at IS 'Timestamp when user was banned';
COMMENT ON COLUMN users.banned_by IS 'ID of admin who banned the user';

-- Add constraint: suspend_reason required when suspended or banned
ALTER TABLE users
ADD CONSTRAINT chk_suspend_reason_required
CHECK (
  (status = 'active') OR
  (status IN ('suspended', 'banned') AND suspend_reason IS NOT NULL AND LENGTH(TRIM(suspend_reason)) > 0)
);

-- Add constraint: suspended fields only set when suspended
ALTER TABLE users
ADD CONSTRAINT chk_suspended_fields_consistency
CHECK (
  (status != 'suspended') OR
  (status = 'suspended' AND suspended_at IS NOT NULL AND suspended_by IS NOT NULL)
);

-- Add constraint: banned fields only set when banned
ALTER TABLE users
ADD CONSTRAINT chk_banned_fields_consistency
CHECK (
  (status != 'banned') OR
  (status = 'banned' AND banned_at IS NOT NULL AND banned_by IS NOT NULL)
);
