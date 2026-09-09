-- COMMIT 2: Blacklist and Security Events Tables
-- Migration: 003_blacklist_security.sql
-- Purpose: Prevent DoS attacks, duplicate registrations, and manage security incidents

CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What to blacklist (at least one should be set)
    email VARCHAR(255),
    oauth_provider VARCHAR(50),                -- 'google', 'facebook', etc.
    oauth_id VARCHAR(255),
    
    -- Why and by whom
    reason TEXT NOT NULL,                      -- 'suspected_hacker', 'abuse', 'mistaken_block', etc.
    blacklisted_by UUID NOT NULL,              -- Admin who created blacklist entry
    blacklisted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Unblacklisting (for mistakes)
    unblacklisted_by UUID,                     -- Admin who reversed the blacklist
    unblacklisted_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE             -- TRUE = currently blocked, FALSE = unblocked
);

-- Partial unique indexes (only for active entries to prevent duplicates)
CREATE UNIQUE INDEX idx_blacklist_active_email 
    ON blacklist(email) WHERE (is_active AND email IS NOT NULL);
    
CREATE UNIQUE INDEX idx_blacklist_active_oauth 
    ON blacklist(oauth_provider, oauth_id) WHERE (is_active AND oauth_provider IS NOT NULL);

-- Regular indexes for lookups
CREATE INDEX idx_blacklist_email ON blacklist(email);
CREATE INDEX idx_blacklist_oauth ON blacklist(oauth_provider, oauth_id);
CREATE INDEX idx_blacklist_is_active ON blacklist(is_active);

-- Security events table for audit trail
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event classification
    event_type VARCHAR(50) NOT NULL,           -- 'blacklist_blocked', 'duplicate_prevented', 'login_failed', etc.
    
    -- Who/what triggered the event
    email VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    
    -- Event details
    reason TEXT,                               -- Why this event was recorded
    severity VARCHAR(20) NOT NULL,             -- 'info', 'warning', 'critical'
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_email ON security_events(email);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);

-- Record this migration
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (3, 'Create blacklist and security_events tables', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
