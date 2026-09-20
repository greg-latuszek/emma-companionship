# Database Schema - COMMIT 2

This document summarizes the database schema implemented in COMMIT 2.

## Tables Overview

### 1. `_schema_migrations`
Tracks which migrations have been executed.
- `version` INT PRIMARY KEY
- `description` VARCHAR
- `executed_at` TIMESTAMP

### 2. `members` 
Core user/member table supporting multiple authentication methods.

**Columns:**
- `id` UUID (PK)
- `first_name`, `last_name`, `email` (UNIQUE), `phone`
- `password_hash` (NULL if OAuth-only)
- `oauth_provider`, `oauth_id` (google, facebook)
- `is_active` BOOLEAN (DEFAULT FALSE) — Admin approval gate
- `geographic_unit_id` UUID — Assigned by admin after approval
- `requested_at` TIMESTAMP — When user registered
- `approved_by` UUID — Which admin approved
- `approved_at` TIMESTAMP — When approved
- `registry_check_result` JSONB — Verification checks
- `profile_picture` TEXT — From OAuth or user
- `created_at`, `updated_at` TIMESTAMP

**Indexes:**
- email, is_active, oauth_provider, requested_at, created_at

**Constraints:**
- UNIQUE(email)
- UNIQUE(oauth_provider, oauth_id)

### 3. `roles`
Role definitions (admin, delegat_ds_akompaniamentow, viewer).

**Columns:**
- `id` UUID (PK)
- `name` VARCHAR (UNIQUE)
- `description` TEXT
- `is_active` BOOLEAN
- `created_at`, `updated_at` TIMESTAMP

**Predefined Roles:**
- `admin` — Full system access
- `delegat_ds_akompaniamentow` — Companionship delegation
- `viewer` — Read-only access

### 4. `geographic_units`
Hierarchical organization units (diocese, deanery, parish, etc.).

**Columns:**
- `id` UUID (PK)
- `name` VARCHAR
- `description` TEXT
- `parent_id` UUID (self-referencing, hierarchical)
- `is_active` BOOLEAN
- `created_at`, `updated_at` TIMESTAMP

**Indexes:**
- parent_id

### 5. `role_assignments`
Maps members to roles within geographic units (with admin tracking).

**Columns:**
- `id` UUID (PK)
- `member_id` UUID FK → members
- `role_id` UUID FK → roles
- `geographic_unit_id` UUID FK → geographic_units (NULL = global)
- `assigned_by` UUID — Admin who made assignment
- `assigned_at` TIMESTAMP
- `revoked_by` UUID — Admin who revoked
- `revoked_at` TIMESTAMP
- `is_active` BOOLEAN
- `created_at`, `updated_at` TIMESTAMP

**Indexes:**
- member_id, role_id, geographic_unit_id
- Partial unique index on (member_id, role_id, geographic_unit_id) WHERE is_active

### 6. `blacklist`
Prevents DoS attacks by blocking problematic email/OAuth IDs.

**Columns:**
- `id` UUID (PK)
- `email` VARCHAR
- `oauth_provider` VARCHAR
- `oauth_id` VARCHAR
- `reason` TEXT — Why blocked
- `blacklisted_by` UUID — Admin who blocked
- `blacklisted_at` TIMESTAMP
- `unblacklisted_by` UUID — Admin who unblocked
- `unblacklisted_at` TIMESTAMP
- `is_active` BOOLEAN

**Indexes:**
- Partial unique indexes on email and oauth (only for is_active=TRUE)
- Regular indexes for queries

### 7. `security_events`
Audit trail for security events (blocked registrations, suspicious activity).

**Columns:**
- `id` UUID (PK)
- `event_type` VARCHAR — 'blacklist_blocked', 'duplicate_prevented', etc.
- `email`, `oauth_provider`, `oauth_id` VARCHAR
- `ip_address` INET
- `user_agent` TEXT
- `reason` TEXT
- `severity` VARCHAR — 'info', 'warning', 'critical'
- `created_at` TIMESTAMP

**Indexes:**
- event_type, email, severity, created_at DESC

### 8. `approval_audit`
History of admin decisions (approvals, rejections, etc.).

**Columns:**
- `id` UUID (PK)
- `member_id` UUID FK → members
- `admin_id` UUID FK → members
- `status_change` VARCHAR — 'approved', 'rejected', 'revoked'
- `reason` TEXT — Admin notes
- `assigned_geographic_unit_id` UUID FK → geographic_units
- `created_at` TIMESTAMP

**Indexes:**
- member_id, admin_id, created_at DESC

### 9. `auth_events`
Login/logout history for security auditing.

**Columns:**
- `id` UUID (PK)
- `member_id` UUID FK → members (NULL if unknown user)
- `event_type` VARCHAR — 'login', 'logout', 'login_failed', 'mfa_verified'
- `provider` VARCHAR — 'form', 'google', 'facebook'
- `ip_address` INET
- `user_agent` TEXT
- `success` BOOLEAN
- `reason` TEXT — 'incorrect_password', 'user_not_found', etc.
- `created_at` TIMESTAMP

**Indexes:**
- member_id, event_type, created_at DESC

### 10. `two_factor_auth`
2FA configuration (future-proofed for COMMIT 10).

**Columns:**
- `id` UUID (PK)
- `member_id` UUID FK → members (UNIQUE)
- `method` VARCHAR — 'totp', 'sms', 'webauthn'
- `secret` VARCHAR — Encrypted TOTP secret
- `enabled` BOOLEAN
- `enabled_at` TIMESTAMP
- `verified_at` TIMESTAMP — When user confirmed
- `backup_codes` TEXT[] — Encrypted backup codes
- `backup_codes_generated_at` TIMESTAMP
- `last_used_at` TIMESTAMP — For rate limiting
- `created_at`, `updated_at` TIMESTAMP

**Indexes:**
- member_id, enabled

## Architecture Principles

### 1. Security-First Design
- Blacklist prevents DoS attacks (duplicate registrations)
- All admin actions audited
- Auth events logged for forensics
- Partial unique indexes enforce business rules at DB level

### 2. Flexibility
- Multiple auth methods (form + OAuth)
- Hierarchical geographic units
- Scoped role assignments
- Extensible 2FA table

### 3. Extensibility
- 2FA table ready for COMMIT 10 (no migration needed)
- Companionship tables (006, 007) are placeholders for future schema

### 4. Admin Control
- All users require admin approval (`is_active=FALSE` by default)
- Admin assigns geographic unit and roles
- Admin can blacklist and unblacklist
- Complete audit trail of decisions

## Migration Files

```
001_init.sql              — Extensions, migration tracking
002_members_table.sql     — Core users + auth fields
003_blacklist_security.sql — Blacklist + security events
004_roles_access_control.sql — Roles, geographic units, audit
005_two_factor_auth.sql   — 2FA (future-proofed)
006_companionship.sql     — Placeholder (from archived schema)
007_approval_workflow.sql — Placeholder (from archived schema)
```

## Running Migrations

```bash
npm run db:start         # Start container
npm run db:migrate:dev   # Apply to dev database
npm run db:migrate:test  # Apply to test database
```

## Next Steps

- **COMMIT 2 (same):** Write database integration tests
- **COMMIT 3:** Auth.js setup with providers
- **COMMIT 4:** Registration form implementation
- **...COMMIT 10:** Wire 2FA logic (table already exists)
