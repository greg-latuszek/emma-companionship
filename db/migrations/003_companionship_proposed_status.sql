-- Migration: 003_companionship_proposed_status.sql
-- Purpose: Allow companionship_relations.status = 'proposed' for Find Companion drafts.
-- Idempotent: safe to re-run via migrate.py.

ALTER TABLE companionship_relations
  DROP CONSTRAINT IF EXISTS companionship_relations_status_check;

ALTER TABLE companionship_relations
  ADD CONSTRAINT companionship_relations_status_check
  CHECK (status IN ('active', 'archived', 'proposed'));

-- Only one proposed relation between the same two members
CREATE UNIQUE INDEX IF NOT EXISTS idx_companionship_relations_proposed_unique
  ON companionship_relations(companion_id, accompanied_id)
  WHERE status = 'proposed';
