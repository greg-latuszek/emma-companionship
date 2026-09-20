-- COMMIT 2: Roles, Access Control, and Audit Tables
-- Migration: 004_roles_access_control.sql
-- Purpose: Support hierarchical role assignments, approval tracking, and login audit trail
-- Note: geographic_units table is now created in 002_members_table.sql

-- ========== Roles Table ==========
-- Matrix-based: name (what) × level (where) = semantic role
-- E.g., ('Supervisor', 'country') vs ('Supervisor', 'province')
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL,                -- 'Supervisor', 'Delegate', 'Admin', etc.
    level VARCHAR(20) NOT NULL CHECK (level IN ('country', 'province', 'sector', 'zone', 'international')),
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Semantic role is unique combination of name + level
    CONSTRAINT unique_role_matrix UNIQUE(name, level)
);

-- Role matrix from statute documents
INSERT INTO roles (name, level, description) VALUES
    ('Admin', 'country', 'Full system access and user management at country level'),
    ('Supervisor', 'province', 'Supervisory authority at province level'),
    ('Supervisor', 'country', 'Supervisory authority at country level'),
    ('Companionship Delegate', 'province', 'Companionship delegation at province level'),
    ('Companionship Delegate', 'zone', 'Companionship delegation at zone level')
ON CONFLICT DO NOTHING;

-- ========== Role Assignments Table ==========
-- Immutable: created or revoked (never modified)
-- Active state: revoked_at IS NULL (no separate is_active flag needed)
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    scope_id UUID REFERENCES geographic_units(id) ON DELETE SET NULL,  -- Scope of responsibility (nullable for later assignment)
    
    -- Assignment tracking
    assigned_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Revocation tracking (terminal action)
    revoked_by UUID REFERENCES members(id) ON DELETE SET NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Unique active assignment constraint: only one active per member/role/scope combination
CREATE UNIQUE INDEX idx_role_assignments_active_unique 
    ON role_assignments(member_id, role_id, scope_id) WHERE revoked_at IS NULL;

-- Performance indexes
CREATE INDEX idx_role_assignments_member ON role_assignments(member_id);
CREATE INDEX idx_role_assignments_active_member ON role_assignments(member_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_role_assignments_role ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_scope ON role_assignments(scope_id);

-- Approval audit trail (history of admin decisions)
CREATE TABLE approval_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who was approved/rejected
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- Who made the decision
    admin_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    -- What changed
    status_change VARCHAR(50) NOT NULL,        -- 'approved', 'rejected', 'revoked', 'blocked'
    reason TEXT,                               -- Admin notes
    
    -- When
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Geographic unit assignment (if approved)
    assigned_geographic_unit_id UUID REFERENCES geographic_units(id)
);

CREATE INDEX idx_approval_audit_member ON approval_audit(member_id);
CREATE INDEX idx_approval_audit_admin ON approval_audit(admin_id);
CREATE INDEX idx_approval_audit_created_at ON approval_audit(created_at DESC);

-- Authentication events (login/logout history for security)
CREATE TABLE auth_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,  -- NULL if failed auth for unknown user
    
    -- What
    event_type VARCHAR(50) NOT NULL,           -- 'login', 'logout', 'login_failed', 'mfa_verified'
    provider VARCHAR(50),                      -- 'form', 'google', 'facebook'
    
    -- Where/When
    ip_address INET,
    user_agent TEXT,
    
    -- Result
    success BOOLEAN,
    reason TEXT,                               -- 'incorrect_password', 'user_not_found', 'user_inactive', etc.
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_events_member ON auth_events(member_id);
CREATE INDEX idx_auth_events_type ON auth_events(event_type);
CREATE INDEX idx_auth_events_created_at ON auth_events(created_at DESC);

-- Record this migration
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (4, 'Create roles, access control, and audit tables', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
