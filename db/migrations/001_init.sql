-- COMMIT 1.3: Initial Database Setup
-- Migration: 001_init.sql
-- Purpose: Create extensions and migration tracking table

-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema migrations tracking table
CREATE TABLE IF NOT EXISTS _schema_migrations (
    version INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert this migration record
INSERT INTO _schema_migrations (version, description, executed_at)
VALUES (1, 'Initial setup: extensions and migration tracking', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
