-- Migration 008: Create reviews table and add review stats to profiles
-- This migration creates the reviews table for post-mission reviews
-- and adds mission/reliability statistics to the profiles table

-- =========================================
-- 1. Create reviews table
-- =========================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale)
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  professionalism DECIMAL(2, 1) CHECK (professionalism >= 1 AND professionalism <= 5),
  punctuality DECIMAL(2, 1) CHECK (punctuality >= 1 AND punctuality <= 5),
  communication DECIMAL(2, 1) CHECK (communication >= 1 AND communication <= 5),
  quality DECIMAL(2, 1) CHECK (quality >= 1 AND quality <= 5),

  -- Feedback
  comment TEXT,

  -- Reliability flags
  was_no_show BOOLEAN DEFAULT FALSE,
  was_cancelled BOOLEAN DEFAULT FALSE,
  cancellation_reason VARCHAR(500),
  would_work_again BOOLEAN,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_match_reviewer UNIQUE (match_id, reviewer_id),
  CONSTRAINT check_not_self_review CHECK (reviewer_id != reviewed_id)
);

-- Indexes for reviews
CREATE INDEX idx_reviews_match_id ON reviews(match_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_active_reviewed ON reviews(is_active, reviewed_id) WHERE is_active = TRUE;

-- =========================================
-- 2. Add review statistics to profiles
-- =========================================

-- Add missions count columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS missions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_missions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_show_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancelled_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reliability_score DECIMAL(5, 2) DEFAULT 100.00;

-- Add constraints
ALTER TABLE profiles
ADD CONSTRAINT check_missions_count_positive CHECK (missions_count >= 0),
ADD CONSTRAINT check_completed_missions_positive CHECK (completed_missions_count >= 0),
ADD CONSTRAINT check_no_show_positive CHECK (no_show_count >= 0),
ADD CONSTRAINT check_cancelled_positive CHECK (cancelled_count >= 0),
ADD CONSTRAINT check_reliability_score_range CHECK (reliability_score >= 0 AND reliability_score <= 100);

-- Index for filtering by reliability
CREATE INDEX idx_profiles_reliability_score ON profiles(reliability_score DESC);

-- =========================================
-- 3. Comments
-- =========================================

COMMENT ON TABLE reviews IS 'Reviews created after completed missions, with ratings and reliability tracking';
COMMENT ON COLUMN reviews.match_id IS 'Match this review is about (must be completed)';
COMMENT ON COLUMN reviews.reviewer_id IS 'Profile who created the review';
COMMENT ON COLUMN reviews.reviewed_id IS 'Profile being reviewed';
COMMENT ON COLUMN reviews.rating IS 'Overall rating (1-5)';
COMMENT ON COLUMN reviews.was_no_show IS 'Whether the reviewed person did not show up';
COMMENT ON COLUMN reviews.was_cancelled IS 'Whether the mission was cancelled';
COMMENT ON COLUMN reviews.would_work_again IS 'Whether the reviewer would work with them again';

COMMENT ON COLUMN profiles.missions_count IS 'Total number of reviews received (= missions completed)';
COMMENT ON COLUMN profiles.completed_missions_count IS 'Missions completed without no-show or cancellation';
COMMENT ON COLUMN profiles.no_show_count IS 'Number of times marked as no-show';
COMMENT ON COLUMN profiles.cancelled_count IS 'Number of times marked as cancelled';
COMMENT ON COLUMN profiles.reliability_score IS 'Reliability score: 100 - (no_show * 20 + cancelled * 10), min 0';
