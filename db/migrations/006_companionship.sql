-- COMMIT 2: Companionship Relationships (from archived schema)
-- Migration: 006_companionship.sql
-- Purpose: Support companionship pairings and tracking
-- Status: Placeholder - actual schema from ADR-009 will be integrated in future COMMIT

-- TODO: Define companionship tables based on _archived_docs/architecture/database-schema.md
-- This migration will include:
-- - companionship table (pairs members)
-- - companionship_status (active, paused, completed, etc.)
-- - companionship_notes (progress tracking)

INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (6, 'Companionship relationships (placeholder)', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
