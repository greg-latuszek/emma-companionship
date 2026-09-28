-- Create companionship_relations table
-- Purpose: Store accompanying/accompanied relations between community members.
-- This slice keeps relations member-to-member. Couple-to-couple display is a UI concern.

CREATE TABLE companionship_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    accompanied_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT no_self_companionship CHECK (companion_id != accompanied_id),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_companionship_relations_companion_id
    ON companionship_relations(companion_id);

CREATE INDEX idx_companionship_relations_accompanied_id
    ON companionship_relations(accompanied_id);

CREATE INDEX idx_companionship_relations_status
    ON companionship_relations(status);

-- Prevent duplicate active relations between the same two members.
CREATE UNIQUE INDEX idx_companionship_relations_active_unique
    ON companionship_relations(companion_id, accompanied_id)
    WHERE status = 'active';

INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (8, 'Create companionship_relations table', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
