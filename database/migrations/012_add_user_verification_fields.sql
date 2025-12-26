-- Migration: Add user verification fields
-- Description: Add verified_at and verified_by columns to track admin verification of users
-- Date: 2025-12-26

-- Add verification tracking columns to users table
ALTER TABLE users
ADD COLUMN verified_at TIMESTAMP NULL,
ADD COLUMN verified_by UUID NULL;

-- Add foreign key constraint for verified_by
ALTER TABLE users
ADD CONSTRAINT fk_users_verified_by
FOREIGN KEY (verified_by)
REFERENCES users(id)
ON DELETE SET NULL;

-- Add index for verified_by for efficient lookups
CREATE INDEX idx_users_verified_by ON users(verified_by);

-- Add index for verified_at for filtering verified users
CREATE INDEX idx_users_verified_at ON users(verified_at) WHERE verified_at IS NOT NULL;

-- Add composite index for verification status queries
CREATE INDEX idx_users_verification_status ON users(verified_at, verified_by) WHERE verified_at IS NOT NULL;

-- Add comment to explain the fields
COMMENT ON COLUMN users.verified_at IS 'Timestamp when the user was verified by an admin';
COMMENT ON COLUMN users.verified_by IS 'ID of the admin user who verified this user';
