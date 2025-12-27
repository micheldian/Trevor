-- ====================================
-- Migration 015: Create Reports Table
-- System for user content reporting and admin moderation
-- ====================================

-- Create ENUM types for reports
CREATE TYPE report_target_type AS ENUM ('user', 'review', 'job', 'profile');
CREATE TYPE report_reason AS ENUM ('spam', 'inappropriate', 'harassment', 'fake', 'scam', 'other');
CREATE TYPE report_status AS ENUM ('open', 'in_review', 'closed', 'dismissed');

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Reporter (user who reported)
    reporter_id UUID NOT NULL,

    -- Target entity being reported
    target_type report_target_type NOT NULL,
    target_id UUID NOT NULL,

    -- Report details
    reason report_reason NOT NULL,
    note TEXT,

    -- Status and resolution
    status report_status NOT NULL DEFAULT 'open',
    resolution_note TEXT,

    -- Resolution tracking
    resolved_by UUID,
    resolved_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_reports_resolved_by
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT resolution_consistency CHECK (
        (status IN ('closed', 'dismissed') AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL) OR
        (status IN ('open', 'in_review') AND resolved_by IS NULL AND resolved_at IS NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_resolved_by ON reports(resolved_by) WHERE resolved_by IS NOT NULL;

-- Composite index for admin queries
CREATE INDEX idx_reports_status_created ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target_type_status ON reports(target_type, status);

-- Comments
COMMENT ON TABLE reports IS 'User reports for content moderation';
COMMENT ON COLUMN reports.target_type IS 'Type of entity being reported (user, review, job, profile)';
COMMENT ON COLUMN reports.target_id IS 'UUID of the entity being reported';
COMMENT ON COLUMN reports.reason IS 'Reason for the report (spam, inappropriate, harassment, etc.)';
COMMENT ON COLUMN reports.status IS 'Current status of the report (open, in_review, closed, dismissed)';
COMMENT ON COLUMN reports.resolution_note IS 'Admin note explaining the resolution';
