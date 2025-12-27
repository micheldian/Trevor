-- Migration 019 (Fixed): Add email/phone verification columns to match TypeORM entity
-- Purpose: Fix schema mismatch - entity expects is_phone_verified and is_email_verified

-- Add is_phone_verified column if it doesn't exist (don't try to rename)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT false;

-- is_email_verified already exists (from previous run), but ensure it's there
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;

-- Update is_phone_verified to true for users who have verified their phone via OTP
UPDATE users
SET is_phone_verified = true
WHERE otp_verified_at IS NOT NULL AND phone IS NOT NULL;

-- Update is_email_verified to true for users who have verified their email via OTP
UPDATE users
SET is_email_verified = true
WHERE otp_verified_at IS NOT NULL AND email IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN users.is_phone_verified IS 'Whether the phone number has been verified via OTP';
COMMENT ON COLUMN users.is_email_verified IS 'Whether the email has been verified via OTP or email link';
