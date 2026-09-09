-- COMMIT 2: Geographic Units and Members Tables
-- Migration: 002_members_table.sql
-- Purpose: Create geographic hierarchy and main members table with authentication

-- ========== Geographic Units (Organization Hierarchy) ==========
CREATE TABLE geographic_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sector', 'province', 'country', 'zone', 'community')),
    parent_id UUID REFERENCES geographic_units(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for geographic hierarchy queries
CREATE INDEX idx_geographic_units_parent_id ON geographic_units(parent_id);
CREATE INDEX idx_geographic_units_type ON geographic_units(type);
CREATE INDEX idx_geographic_units_name ON geographic_units(name);

-- ========== Members Table ==========
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ========== Core Identity Fields ==========
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'widowed', 'consecrated')),
    date_of_birth DATE,
    consecrated_status VARCHAR(20) CHECK (consecrated_status IN ('priest', 'deacon', 'seminarian', 'sister', 'brother')),
    languages TEXT[] DEFAULT '{}',  -- Languages spoken (for companionship communication matching)
    
    -- ========== Contact Information ==========
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- ========== Images & Notes ==========
    image_url TEXT,          -- Base64-encoded real photo for recognition across provinces (max 100KB)
    profile_picture TEXT,    -- Photo from OAuth provider (may be inappropriate, stored separately)
    notes TEXT,              -- CD notes about person (e.g., widowed, disabled, etc.)
    
    -- ========== Organization & Status ==========
    geographic_unit_id UUID REFERENCES geographic_units(id),
    community_engagement_status VARCHAR(50) CHECK (community_engagement_status IN ('Looker-On', 'In-Probation', 'Commited', 'In-Fraternity-Probation', 'Fraternity')),
    accompanying_readiness VARCHAR(30) CHECK (accompanying_readiness IN ('Not Candidate', 'Candidate', 'Ready', 'Active', 'Overwhelmed', 'Deactivated')),
    couple_id UUID,  -- Will be FK to couples table after couples is created
    
    -- ========== Authentication (app_users only) ==========
    -- At least ONE of these must be set for app_users:
    --   - password_hash (for form-based login)
    --   - oauth_provider + oauth_id (for social login)
    password_hash VARCHAR(255),      -- Argon2 hash (optional for OAuth-only users)
    oauth_provider VARCHAR(50),      -- 'google', 'facebook', NULL for form-based
    oauth_id VARCHAR(255),           -- External provider ID from OAuth service
    CONSTRAINT unique_oauth UNIQUE(oauth_provider, oauth_id),
    
    -- ========== Member Classification ==========
    member_type VARCHAR(20) DEFAULT 'companion' CHECK (member_type IN ('app_user', 'companion')),
    
    -- ========== Admin Approval Workflow ==========
    is_active BOOLEAN DEFAULT FALSE,           -- Admin approval gate (blocks login if FALSE)
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_by UUID,  -- Will be FK to members after members table is created
    approved_at TIMESTAMP WITH TIME ZONE,
    registry_check_result JSONB,               -- Verification checks
                                               -- {
                                               --   emailMatch: boolean,
                                               --   phoneMatch: boolean,
                                               --   nameMatch: boolean,
                                               --   recommendation: string,
                                               --   checked_at: timestamp
                                               -- }
    
    -- ========== Audit ==========
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-referencing FKs for members after table is created
ALTER TABLE members ADD CONSTRAINT fk_members_approved_by 
    FOREIGN KEY (approved_by) REFERENCES members(id) ON DELETE SET NULL;

-- ========== Partial Unique Indexes (Enforce Business Rules) ==========
-- Email unique only for app_users (companions can have NULL or duplicate emails)
CREATE UNIQUE INDEX idx_members_email_app_users 
    ON members(email) WHERE (member_type='app_user' AND email IS NOT NULL);

-- OAuth unique only for app_users (companions don't use OAuth)
CREATE UNIQUE INDEX idx_members_oauth_app_users 
    ON members(oauth_provider, oauth_id) 
    WHERE (member_type='app_user' AND oauth_provider IS NOT NULL);

-- ========== Performance Indexes ==========
-- CRITICAL: Filter all people in a geographic unit (province-level queries)
CREATE INDEX idx_members_geographic_unit_id 
    ON members(geographic_unit_id);

-- Active members lookup (for login, approval queries)
CREATE INDEX idx_members_is_active 
    ON members(is_active);

-- Additional useful indexes
CREATE INDEX idx_members_couple_id ON members(couple_id);
CREATE INDEX idx_members_member_type ON members(member_type);

-- ========== Couples Table ==========
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    member1_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    member2_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    
    wedding_date DATE,                 -- Optional (may not be known at creation)
    number_of_children INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure couple members are unique and different
    CONSTRAINT unique_couple_members UNIQUE(member1_id, member2_id),
    CONSTRAINT no_self_couple CHECK (member1_id != member2_id)
);

-- Add FK for couple_id in members now that couples table exists
ALTER TABLE members ADD CONSTRAINT fk_members_couple_id 
    FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE SET NULL;

-- Indexes for couple queries
CREATE INDEX idx_couples_member1_id ON couples(member1_id);
CREATE INDEX idx_couples_member2_id ON couples(member2_id);

-- ========== Record this migration ==========
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (2, 'Create geographic_units, members, and couples tables', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
