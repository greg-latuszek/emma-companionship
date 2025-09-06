-- Database initialization script for Emma Companionship
-- This script runs when the PostgreSQL container is first created

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create additional schemas if needed (for future use)
-- CREATE SCHEMA IF NOT EXISTS analytics;
-- CREATE SCHEMA IF NOT EXISTS reporting;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE emma_companionship TO emma_user;

-- Create indexes for performance (these will be created by Prisma migrations)
-- Additional setup can be added here as needed
