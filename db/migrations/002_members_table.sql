-- COMMIT 2: Members Table with Authentication Fields
-- Migration: 002_members_table.sql
-- Purpose: Create the main members table with support for form-based and OAuth authentication

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core identity
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    
    -- Authentication methods (flexible - support multiple)
    password_hash VARCHAR(255),                -- NULL if OAuth-only
    oauth_provider VARCHAR(50),                -- 'google', 'facebook', NULL if form-based
    oauth_id VARCHAR(255),                     -- External provider ID from OAuth service
    CONSTRAINT unique_oauth UNIQUE(oauth_provider, oauth_id),
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,           -- Admin approval gate (blocks login if FALSE)
    
    -- Geographic & Role (admin assigns)
    geographic_unit_id UUID,
    
    -- Admin approval tracking
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_by UUID,                          -- Which admin approved them (FK to members)
    approved_at TIMESTAMP WITH TIME ZONE,      -- When admin approved
    registry_check_result JSONB,               -- Verification checks
                                               -- {
                                               --   emailMatch: boolean,
                                               --   phoneMatch: boolean,
                                               --   nameMatch: boolean,
                                               --   recommendation: string,
                                               --   checked_at: timestamp
                                               -- }
    
    -- Profile (from OAuth or user-provided)
    profile_picture TEXT,                      -- URL or data
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_members_oauth_provider ON members(oauth_provider);
CREATE INDEX idx_members_requested_at ON members(requested_at);
CREATE INDEX idx_members_created_at ON members(created_at);

-- Record this migration
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (2, 'Create members table with auth fields', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
