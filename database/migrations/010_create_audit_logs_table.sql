-- Migration 010: Create audit_logs table
-- This migration creates the audit_logs table for tracking important actions

-- =========================================
-- 1. Create audit_logs table
-- =========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor (user who performed the action)
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Action details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,

  -- Data snapshots (JSON)
  before_json JSONB,
  after_json JSONB,

  -- Request metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url TEXT,

  -- Additional context
  metadata JSONB,
  status VARCHAR(20) DEFAULT 'success',
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- 2. Create indexes for performance
-- =========================================

-- Index on actor for "who did what"
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);

-- Index on entity for "what happened to this entity"
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Index on action for filtering by action type
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Index on created_at for time-based queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_actor_action ON audit_logs(actor_user_id, action);

-- GIN index for JSON searches
CREATE INDEX idx_audit_logs_metadata ON audit_logs USING GIN (metadata);
CREATE INDEX idx_audit_logs_before ON audit_logs USING GIN (before_json);
CREATE INDEX idx_audit_logs_after ON audit_logs USING GIN (after_json);

-- =========================================
-- 3. Add comments
-- =========================================

COMMENT ON TABLE audit_logs IS 'Audit trail for tracking important actions in the system';
COMMENT ON COLUMN audit_logs.actor_user_id IS 'User who performed the action (null if system action)';
COMMENT ON COLUMN audit_logs.action IS 'Action type (e.g., user.verified, job.cancelled, match.confirmed)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (e.g., user, job, match, review)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.before_json IS 'Entity state before the action (JSON)';
COMMENT ON COLUMN audit_logs.after_json IS 'Entity state after the action (JSON)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data (JSON)';
COMMENT ON COLUMN audit_logs.status IS 'Action status: success, failed, partial';
