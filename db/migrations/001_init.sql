-- Migration: 001_init.sql
-- Purpose: Full initial schema (squashed from development migrations 001–008)
-- Applied to: first production deployment (empty database)

-- ========== Extensions ==========
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========== Migration Tracking ==========
CREATE TABLE IF NOT EXISTS _schema_migrations (
    version     INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========== Geographic Units (Organisation Hierarchy) ==========
CREATE TABLE IF NOT EXISTS geographic_units (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR(255) NOT NULL,
    type      VARCHAR(50)  NOT NULL CHECK (type IN ('sector', 'province', 'country', 'zone', 'community')),
    parent_id UUID REFERENCES geographic_units(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geographic_units_parent_id ON geographic_units(parent_id);
CREATE INDEX IF NOT EXISTS idx_geographic_units_type      ON geographic_units(type);
CREATE INDEX IF NOT EXISTS idx_geographic_units_name      ON geographic_units(name);

-- ========== Members ==========
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Identity
    first_name          VARCHAR(255) NOT NULL,
    last_name           VARCHAR(255) NOT NULL,
    gender              VARCHAR(10)  CHECK (gender IN ('male', 'female')),
    marital_status      VARCHAR(20)  CHECK (marital_status IN ('single', 'married', 'widowed', 'consecrated')),
    date_of_birth       DATE,
    consecrated_status  VARCHAR(20)  CHECK (consecrated_status IN ('priest', 'deacon', 'seminarian', 'sister', 'brother')),
    languages           TEXT[] DEFAULT '{}',  -- languages spoken (companionship matching)

    -- Contact
    email VARCHAR(255),
    phone VARCHAR(50),

    -- Images & Notes
    image_url       TEXT,   -- base64-encoded real photo for cross-province recognition (max 100 KB)
    profile_picture TEXT,   -- photo from OAuth provider (may be inappropriate, stored separately)
    notes           TEXT,   -- CD notes about the person

    -- Organisation & Status
    geographic_unit_id          UUID REFERENCES geographic_units(id),
    community_engagement_status VARCHAR(50) CHECK (community_engagement_status IN (
        'Looker-On', 'In-Probation', 'Commited', 'In-Fraternity-Probation', 'Fraternity'
    )),
    accompanying_readiness VARCHAR(30) CHECK (accompanying_readiness IN (
        'Not Candidate', 'Candidate', 'Ready', 'Active', 'Overwhelmed', 'Deactivated'
    )),
    couple_id UUID,  -- FK added below after couples table exists

    -- Authentication (app_users only)
    password_hash  VARCHAR(255),  -- Argon2 hash; NULL for OAuth-only users
    oauth_provider VARCHAR(50),   -- 'google', 'facebook', NULL for form-based
    oauth_id       VARCHAR(255),  -- external provider ID
    CONSTRAINT unique_oauth UNIQUE(oauth_provider, oauth_id),

    -- Member Classification
    member_type VARCHAR(20) DEFAULT 'companion' CHECK (member_type IN ('app_user', 'companion')),

    -- Admin Approval Workflow
    is_active            BOOLEAN DEFAULT FALSE,
    requested_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_by          UUID,   -- FK to members (self-ref, added below)
    approved_at          TIMESTAMP WITH TIME ZONE,
    revoked_by           UUID,   -- FK to members (self-ref, added below)
    revoked_at           TIMESTAMP WITH TIME ZONE,
    registry_check_result JSONB, -- { emailMatch, phoneMatch, nameMatch, recommendation, checked_at }

    -- Visual Preference (NULL = application default)
    visual_style VARCHAR(32) CHECK (visual_style IN ('semi-transparent', 'high-contrast')),

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self-referencing FKs (added after table creation)
ALTER TABLE members ADD CONSTRAINT fk_members_approved_by
    FOREIGN KEY (approved_by) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE members ADD CONSTRAINT fk_members_revoked_by
    FOREIGN KEY (revoked_by) REFERENCES members(id) ON DELETE SET NULL;

-- Partial unique indexes (business rules)
-- Email is unique only for app_users
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_app_users
    ON members(email) WHERE (member_type = 'app_user' AND email IS NOT NULL);

-- OAuth unique only for app_users
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_oauth_app_users
    ON members(oauth_provider, oauth_id)
    WHERE (member_type = 'app_user' AND oauth_provider IS NOT NULL);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_members_geographic_unit_id ON members(geographic_unit_id);

CREATE INDEX IF NOT EXISTS idx_members_active_status
    ON members(is_active, revoked_at)
    WHERE is_active = true AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_members_revoked_by
    ON members(revoked_by)
    WHERE revoked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_members_couple_id  ON members(couple_id);
CREATE INDEX IF NOT EXISTS idx_members_member_type ON members(member_type);

-- ========== Couples ==========
CREATE TABLE IF NOT EXISTS couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    member1_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    wedding_date       DATE,
    number_of_children INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_couple_members UNIQUE(member1_id, member2_id),
    CONSTRAINT no_self_couple        CHECK (member1_id != member2_id)
);

-- FK for couple_id now that couples exists
ALTER TABLE members ADD CONSTRAINT fk_members_couple_id
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_couples_member1_id ON couples(member1_id);
CREATE INDEX IF NOT EXISTS idx_couples_member2_id ON couples(member2_id);

-- ========== Blacklist ==========
CREATE TABLE IF NOT EXISTS blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email          VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id       VARCHAR(255),

    reason          TEXT    NOT NULL,
    blacklisted_by  UUID    NOT NULL,
    blacklisted_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    unblacklisted_by UUID,
    unblacklisted_at TIMESTAMP WITH TIME ZONE,

    is_active BOOLEAN DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blacklist_active_email
    ON blacklist(email) WHERE (is_active AND email IS NOT NULL);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blacklist_active_oauth
    ON blacklist(oauth_provider, oauth_id) WHERE (is_active AND oauth_provider IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_blacklist_email     ON blacklist(email);
CREATE INDEX IF NOT EXISTS idx_blacklist_oauth     ON blacklist(oauth_provider, oauth_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_is_active ON blacklist(is_active);

-- ========== Security Events ==========
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_type     VARCHAR(50) NOT NULL,
    email          VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id       VARCHAR(255),
    ip_address     INET,
    user_agent     TEXT,
    reason         TEXT,
    severity       VARCHAR(20) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type       ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_email      ON security_events(email);
CREATE INDEX IF NOT EXISTS idx_security_events_severity   ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- ========== Roles ==========
-- Matrix: name (what) × level (where) = semantic role
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    level       VARCHAR(20)  NOT NULL CHECK (level IN ('country', 'province', 'sector', 'zone', 'international')),
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_role_matrix UNIQUE(name, level)
);

INSERT INTO roles (name, level, description) VALUES
    ('Admin',                   'country',  'Full system access and user management at country level'),
    ('Supervisor',              'province', 'Supervisory authority at province level'),
    ('Supervisor',              'country',  'Supervisory authority at country level'),
    ('Companionship Delegate',  'province', 'Companionship delegation at province level'),
    ('Companionship Delegate',  'zone',     'Companionship delegation at zone level')
ON CONFLICT DO NOTHING;

-- ========== Role Assignments ==========
-- Immutable rows: created or revoked (never updated).
-- Active state: revoked_at IS NULL.
CREATE TABLE IF NOT EXISTS role_assignments (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    member_id UUID NOT NULL REFERENCES members(id)         ON DELETE CASCADE,
    role_id   UUID NOT NULL REFERENCES roles(id)           ON DELETE CASCADE,
    scope_id  UUID          REFERENCES geographic_units(id) ON DELETE SET NULL,

    assigned_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    revoked_by  UUID REFERENCES members(id) ON DELETE SET NULL,
    revoked_at  TIMESTAMP WITH TIME ZONE
);

-- Only one active assignment per member/role/scope combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_role_assignments_active_unique
    ON role_assignments(member_id, role_id, scope_id) WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_role_assignments_member        ON role_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_active_member ON role_assignments(member_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_role_assignments_role          ON role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_scope         ON role_assignments(scope_id);

-- ========== Approval Audit ==========
CREATE TABLE IF NOT EXISTS approval_audit (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    admin_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    status_change VARCHAR(50) NOT NULL,  -- 'approved', 'rejected', 'revoked', 'blocked'
    reason        TEXT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    assigned_geographic_unit_id UUID REFERENCES geographic_units(id)
);

CREATE INDEX IF NOT EXISTS idx_approval_audit_member     ON approval_audit(member_id);
CREATE INDEX IF NOT EXISTS idx_approval_audit_admin      ON approval_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_approval_audit_created_at ON approval_audit(created_at DESC);

-- ========== Auth Events ==========
CREATE TABLE IF NOT EXISTS auth_events (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,  -- NULL for unknown-user failures

    event_type VARCHAR(50) NOT NULL,   -- 'login', 'logout', 'login_failed', 'mfa_verified'
    provider   VARCHAR(50),            -- 'form', 'google', 'facebook'
    ip_address INET,
    user_agent TEXT,
    success    BOOLEAN,
    reason     TEXT,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_events_member     ON auth_events(member_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_type       ON auth_events(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at DESC);

-- ========== Two-Factor Authentication ==========
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,

    method VARCHAR(50) NOT NULL DEFAULT 'totp',  -- 'totp' | 'sms' | 'webauthn'
    secret VARCHAR(255) NOT NULL,                -- encrypted TOTP secret (or method-specific data)

    enabled    BOOLEAN DEFAULT FALSE,
    enabled_at TIMESTAMP WITH TIME ZONE,

    verified_at TIMESTAMP WITH TIME ZONE,        -- when user confirmed initial setup

    backup_codes              TEXT[] NOT NULL,    -- encrypted recovery codes
    backup_codes_generated_at TIMESTAMP WITH TIME ZONE,

    last_used_at TIMESTAMP WITH TIME ZONE,       -- rate-limiting and suspicious-activity detection

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_two_factor_auth_member  ON two_factor_auth(member_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_enabled ON two_factor_auth(enabled);

-- ========== Companionship Relations ==========
-- Member-to-member accompanying relations.
-- Couple-to-couple display is a UI concern.
CREATE TABLE IF NOT EXISTS companionship_relations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id  UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    accompanied_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,

    status     VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    start_date DATE,
    end_date   DATE,
    notes      TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT no_self_companionship CHECK (companion_id != accompanied_id),
    CONSTRAINT valid_date_range      CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_companionship_relations_companion_id
    ON companionship_relations(companion_id);

CREATE INDEX IF NOT EXISTS idx_companionship_relations_accompanied_id
    ON companionship_relations(accompanied_id);

CREATE INDEX IF NOT EXISTS idx_companionship_relations_status
    ON companionship_relations(status);

-- Only one active relation between the same two members
CREATE UNIQUE INDEX IF NOT EXISTS idx_companionship_relations_active_unique
    ON companionship_relations(companion_id, accompanied_id)
    WHERE status = 'active';

-- ========== Record this migration ==========
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (1, 'Full initial schema', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
