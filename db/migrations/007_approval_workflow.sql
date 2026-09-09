-- COMMIT 2: Approval Workflow (from archived schema)
-- Migration: 007_approval_workflow.sql
-- Purpose: Support request/approval workflow for companionships
-- Status: Placeholder - actual schema from ADR-009 will be integrated in future COMMIT

-- TODO: Define approval workflow tables based on _archived_docs/architecture/database-schema.md
-- This migration will include:
-- - companionship_requests (pending requests)
-- - companionship_approvals (approval decisions)
-- - companionship_requirements (criteria for matching)

INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (7, 'Approval workflow (placeholder)', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
