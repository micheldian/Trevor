-- Migration: Add review moderation fields
-- Description: Add moderation capabilities for reviews (hide, flag, soft delete)
-- Date: 2025-12-26

-- Add moderation fields to reviews table
ALTER TABLE reviews
ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN hidden_reason TEXT NULL,
ADD COLUMN hidden_at TIMESTAMP NULL,
ADD COLUMN hidden_by UUID NULL,
ADD COLUMN is_flagged BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN flag_reason TEXT NULL,
ADD COLUMN flagged_at TIMESTAMP NULL,
ADD COLUMN flagged_by UUID NULL,
ADD COLUMN deleted_at TIMESTAMP NULL,
ADD COLUMN moderated_by UUID NULL,
ADD COLUMN moderated_at TIMESTAMP NULL;

-- Add foreign key constraints for admin tracking
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_hidden_by
FOREIGN KEY (hidden_by)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_flagged_by
FOREIGN KEY (flagged_by)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_moderated_by
FOREIGN KEY (moderated_by)
REFERENCES users(id)
ON DELETE SET NULL;

-- Add indexes for moderation queries
CREATE INDEX idx_reviews_is_hidden ON reviews(is_hidden);
CREATE INDEX idx_reviews_is_flagged ON reviews(is_flagged);
CREATE INDEX idx_reviews_deleted_at ON reviews(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_reviews_rating_low ON reviews(rating) WHERE rating <= 2;

-- Composite index for admin moderation queries
CREATE INDEX idx_reviews_moderation_status ON reviews(is_hidden, is_flagged, deleted_at, created_at DESC);

-- Index for flagged reviews
CREATE INDEX idx_reviews_flagged_recent ON reviews(flagged_at DESC) WHERE is_flagged = true;

-- Add comments
COMMENT ON COLUMN reviews.is_hidden IS 'Review hidden by admin (not displayed to users)';
COMMENT ON COLUMN reviews.hidden_reason IS 'Reason why review was hidden';
COMMENT ON COLUMN reviews.hidden_at IS 'Timestamp when review was hidden';
COMMENT ON COLUMN reviews.hidden_by IS 'Admin who hid the review';
COMMENT ON COLUMN reviews.is_flagged IS 'Review flagged for moderation';
COMMENT ON COLUMN reviews.flag_reason IS 'Reason why review was flagged';
COMMENT ON COLUMN reviews.flagged_at IS 'Timestamp when review was flagged';
COMMENT ON COLUMN reviews.flagged_by IS 'User who flagged the review';
COMMENT ON COLUMN reviews.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN reviews.moderated_by IS 'Admin who last moderated this review';
COMMENT ON COLUMN reviews.moderated_at IS 'Timestamp of last moderation action';

-- Add constraint: hidden_reason required when hidden
ALTER TABLE reviews
ADD CONSTRAINT chk_hidden_reason_required
CHECK (
  (is_hidden = false) OR
  (is_hidden = true AND hidden_reason IS NOT NULL AND LENGTH(TRIM(hidden_reason)) > 0)
);

-- Add constraint: flag_reason required when flagged
ALTER TABLE reviews
ADD CONSTRAINT chk_flag_reason_required
CHECK (
  (is_flagged = false) OR
  (is_flagged = true AND flag_reason IS NOT NULL AND LENGTH(TRIM(flag_reason)) > 0)
);
