-- COMMIT 2: Two-Factor Authentication Table
-- Migration: 005_two_factor_auth.sql
-- Purpose: Future-proof 2FA support (extensible for TOTP, SMS, WebAuthn)
-- Note: 2FA logic will be implemented in COMMIT 10, table is prepared now

CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
    
    -- Method support (extensible: 'totp' | 'sms' | 'webauthn')
    method VARCHAR(50) NOT NULL DEFAULT 'totp',
    secret VARCHAR(255) NOT NULL,              -- Encrypted TOTP secret (or method-specific data)
    
    -- Status
    enabled BOOLEAN DEFAULT FALSE,
    enabled_at TIMESTAMP WITH TIME ZONE,
    
    -- Verification (when user confirmed initial setup)
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Recovery codes (encrypted, stored as JSON array)
    backup_codes TEXT[] NOT NULL,
    backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Security tracking
    last_used_at TIMESTAMP WITH TIME ZONE,     -- For rate limiting and suspicious activity detection
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_two_factor_auth_member ON two_factor_auth(member_id);
CREATE INDEX idx_two_factor_auth_enabled ON two_factor_auth(enabled);

-- Record this migration
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (5, 'Create two_factor_auth table (future-proofed)', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
