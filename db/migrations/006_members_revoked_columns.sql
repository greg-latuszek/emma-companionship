-- Existing local members tables were created before revoked_* existed.
-- Login SELECTs revoked_at, so add the columns if they are missing.

ALTER TABLE members ADD COLUMN IF NOT EXISTS revoked_by UUID;
ALTER TABLE members ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE members DROP CONSTRAINT IF EXISTS fk_members_revoked_by;
ALTER TABLE members ADD CONSTRAINT fk_members_revoked_by
    FOREIGN KEY (revoked_by) REFERENCES members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_members_active_status
    ON members(is_active, revoked_at)
    WHERE is_active = true AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_members_revoked_by
    ON members(revoked_by)
    WHERE revoked_at IS NOT NULL;
