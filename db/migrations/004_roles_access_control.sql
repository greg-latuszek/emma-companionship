-- COMMIT 2: Roles, Access Control, and Audit Tables
-- Migration: 004_roles_access_control.sql
-- Purpose: Support hierarchical role assignments, approval tracking, and login audit trail

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,         -- 'admin', 'delegat_ds_akompaniamentow', 'viewer', etc.
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predefined roles (optional - can be managed in code)
INSERT INTO roles (name, description) VALUES
    ('admin', 'Full system access, user management, approvals'),
    ('delegat_ds_akompaniamentow', 'Delegation representative for companionship'),
    ('viewer', 'Read-only access to assigned resources')
ON CONFLICT DO NOTHING;

CREATE TABLE geographic_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES geographic_units(id) ON DELETE CASCADE,  -- Hierarchical
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_geographic_units_parent ON geographic_units(parent_id);

-- Role assignments with scope (who has what role where)
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    geographic_unit_id UUID REFERENCES geographic_units(id) ON DELETE CASCADE,  -- Scoped to unit (NULL = global)
    
    -- Admin tracking
    assigned_by UUID NOT NULL,                 -- Which admin made the assignment
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    revoked_by UUID,                           -- Admin who revoked it
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partial unique index (only for active assignments)
CREATE UNIQUE INDEX idx_role_assignments_active_unique 
    ON role_assignments(member_id, role_id, geographic_unit_id) WHERE is_active;

CREATE INDEX idx_role_assignments_member ON role_assignments(member_id);
CREATE INDEX idx_role_assignments_role ON role_assignments(role_id);
CREATE INDEX idx_role_assignments_unit ON role_assignments(geographic_unit_id);

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
