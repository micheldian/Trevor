-- Migration 019: Add email/phone verification columns to match TypeORM entity
-- Purpose: Fix schema mismatch - entity expects is_phone_verified and is_email_verified

-- Rename phone_verified to is_phone_verified for consistency
ALTER TABLE users
RENAME COLUMN phone_verified TO is_phone_verified;

-- Add is_email_verified column (missing from original schema)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Update is_email_verified to true for users who have verified their email via OTP
UPDATE users
SET is_email_verified = true
WHERE otp_verified_at IS NOT NULL AND email IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN users.is_phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN users.is_email_verified IS 'Whether the email has been verified via OTP or email link';
