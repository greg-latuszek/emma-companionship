# Authentication Implementation Plan - CLOSED, ADMIN-APPROVAL SYSTEM

## Overview

emaCompanionship uses a **closed, role-based authentication system** with **mandatory admin approval**. This plan reflects the enterprise/community-focused architecture where only verified community members with assigned roles can access the application.

**Key principles:**
- ✅ No open registration or self-service signup
- ✅ ALL users require manual admin approval (no auto-approval)
- ✅ Admin gets verification checks to review, but always makes final decision
- ✅ Admin assigns geographic unit and role for each user
- ✅ Security-first approach suitable for small, trusted community

---

## Registration & Approval Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                 USER REGISTRATION (Simple)                       │
│                                                                  │
│  firstName:  [__________]                                        │
│  lastName:   [__________]                                        │
│  email:      [__________]   OR  [Login with Google/Facebook]    │
│  phone:      [__________]        (OAuth pre-fills if available)  │
│  password:   [__________]   (Form-based only)                    │
│                                                                  │
│              [Register]                                          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────┐
    │ User created in database:                            │
    │ • is_active = FALSE (pending admin approval)         │
    │ • geographic_unit_id = NULL (admin assigns)          │
    │ • role = NULL (admin assigns)                        │
    │ • requested_at = NOW                                 │
    │ • registry_check_result = NULL (until admin reviews) │
    └──────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│            ADMIN APPROVAL WORKFLOW (Manual Only)                 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
        [Admin accesses "Pending Approvals" dashboard]
                              ↓
        System auto-runs verification checks:
        ┌─────────────────────────────────────────────┐
        │ 1. Query community registry                  │
        │ 2. Check: email match? YES/NO               │
        │ 3. Check: phone match? YES/NO               │
        │ 4. Check: name match? YES/NO                │
        │ 5. Store result in registry_check_result    │
        └─────────────────────────────────────────────┘
                              ↓
        [Admin sees verification checks as reference]
        [Admin makes decision - ALWAYS MANUAL]
                              ↓
        Admin can:
        ┌─────────────────────────────────────────────┐
        │ Option 1: APPROVE                           │
        │ • Call user to verify identity (optional)   │
        │ • Assign Geographic Unit (dropdown)         │
        │ • Assign Role (dropdown)                    │
        │ • Add notes                                 │
        │ • [Approve Button]                          │
        │                                             │
        │ Option 2: REJECT                            │
        │ • Provide reason                            │
        │ • [Reject Button]                           │
        └─────────────────────────────────────────────┘
                              ↓
        If APPROVED:
        ┌─────────────────────────────────────────────┐
        │ • Set is_active = TRUE                       │
        │ • Set geographic_unit_id = {selected}        │
        │ • Create RoleAssignment                      │
        │ • Set approved_by = {admin ID}               │
        │ • Set approved_at = NOW                      │
        │ • Send notification to user                  │
        └─────────────────────────────────────────────┘
                              ↓
        If REJECTED:
        ┌─────────────────────────────────────────────┐
        │ • Keep is_active = FALSE                     │
        │ • Mark as rejected with reason               │
        │ • User cannot login                          │
        └─────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────┐
    │ User can now LOGIN to application (if approved)      │
    │ • Form-based: email + password                       │
    │ • OAuth: Google/Facebook (matches registered email)  │
    │ • Redirected to panel (if is_active=TRUE)            │
    │ • Denied access (if is_active=FALSE)                 │
    └──────────────────────────────────────────────────────┘
```

---

## Security: Blacklisting + Duplicate Prevention

### Problem: DoS via Registration Spam

```
Vulnerability:
  Hacker registers with google_id=X
  → System creates record 1 (pending approval)
  
  Hacker registers again with google_id=X
  → System creates record 2 (pending approval)
  
  Hacker registers again with google_id=X
  → System creates record 3 (pending approval)
  
  Result: Admin sees 3 approval requests for same hacker
          (spam DoS attack on approval workflow)
```

### Solution: Prevent Duplicates + Enable Blacklist

```
Registration attempt:
  1. Check: Is email blacklisted? → REJECT
  2. Check: Is oauth_id blacklisted? → REJECT
  3. Check: Does email already exist? → Return existing (no duplicate)
  4. Check: Does oauth_id already exist? → Return existing (no duplicate)
  5. Safe to create → Create new record (pending approval)
```

### Blacklist Table

```sql
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identifier(s) - at least one required
    email VARCHAR(255),
    oauth_provider VARCHAR(50),           -- 'google', 'facebook'
    oauth_id VARCHAR(255),
    
    -- Why blacklisted
    reason TEXT NOT NULL,                 -- Admin notes
    
    -- Who/When blacklisted
    blacklisted_by UUID NOT NULL REFERENCES members(id),
    blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Who/When unblacklisted
    unblacklisted_by UUID REFERENCES members(id),
    unblacklisted_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,       -- FALSE = unblacklisted
    
    -- Constraints
    CONSTRAINT at_least_one_identifier CHECK (
        email IS NOT NULL 
        OR (oauth_id IS NOT NULL AND oauth_provider IS NOT NULL)
    ),
    CONSTRAINT unique_blacklist_email UNIQUE (email) 
        WHERE email IS NOT NULL AND is_active,
    CONSTRAINT unique_blacklist_oauth UNIQUE (oauth_provider, oauth_id) 
        WHERE oauth_id IS NOT NULL AND oauth_provider IS NOT NULL AND is_active
);

CREATE INDEX idx_blacklist_email ON blacklist(email) WHERE is_active;
CREATE INDEX idx_blacklist_oauth ON blacklist(oauth_provider, oauth_id) 
    WHERE is_active;
```

### Security Events Table

```sql
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event type
    event_type VARCHAR(50) NOT NULL,      -- 'blacklist_blocked', 'duplicate_prevented',
                                          -- 'failed_login', 'rate_limit', etc.
    
    -- Identity
    email VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    
    -- Details
    reason TEXT,
    severity VARCHAR(20),                 -- 'info', 'warning', 'critical'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_security_events_severity ON security_events(severity, created_at);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
```

### Registration Flow with Duplicate + Blacklist Check

```typescript
async function registerUser(req: RegistrationRequest): Promise<{
  memberId?: UUID;
  is_active: boolean;
  error?: string;
}> {
  
  // ❌ CHECK 1: Is email blacklisted?
  if (req.email) {
    const blacklisted = await db.blacklist.findUnique({
      where: { email: req.email },
      AND: [{ is_active: true }],
    });
    
    if (blacklisted) {
      await logSecurityEvent({
        event_type: 'blacklist_blocked',
        email: req.email,
        severity: 'warning',
        reason: 'Blacklisted email attempted registration',
      });
      
      return {
        error: 'This email cannot be registered. Please contact support.',
        is_active: false,
      };
    }
  }
  
  // ❌ CHECK 2: Is oauth_id blacklisted?
  if (req.oauth_id && req.oauth_provider) {
    const blacklisted = await db.blacklist.findFirst({
      where: {
        oauth_provider: req.oauth_provider,
        oauth_id: req.oauth_id,
        is_active: true,
      },
    });
    
    if (blacklisted) {
      await logSecurityEvent({
        event_type: 'blacklist_blocked',
        oauth_provider: req.oauth_provider,
        oauth_id: req.oauth_id,
        severity: 'warning',
        reason: 'Blacklisted OAuth account attempted registration',
      });
      
      return {
        error: 'This account cannot be registered. Please contact support.',
        is_active: false,
      };
    }
  }
  
  // ✅ CHECK 3: Does email already exist? (prevent duplicate)
  const existingByEmail = await db.members.findUnique({
    where: { email: req.email },
  });
  
  if (existingByEmail) {
    await logSecurityEvent({
      event_type: 'duplicate_prevented',
      email: req.email,
      severity: 'info',
      reason: 'Duplicate registration attempt',
    });
    
    // Return existing - don't create duplicate
    return {
      memberId: existingByEmail.id,
      is_active: existingByEmail.is_active,
      message: existingByEmail.is_active 
        ? 'Already registered and approved' 
        : 'Already registered, awaiting approval',
    };
  }
  
  // ✅ CHECK 4: Does oauth_id already exist? (prevent duplicate)
  if (req.oauth_id && req.oauth_provider) {
    const existingByOAuth = await db.members.findFirst({
      where: {
        oauth_provider: req.oauth_provider,
        oauth_id: req.oauth_id,
      },
    });
    
    if (existingByOAuth) {
      await logSecurityEvent({
        event_type: 'duplicate_prevented',
        oauth_provider: req.oauth_provider,
        oauth_id: req.oauth_id,
        severity: 'info',
        reason: 'Duplicate OAuth registration attempt',
      });
      
      // Return existing - don't create duplicate
      return {
        memberId: existingByOAuth.id,
        is_active: existingByOAuth.is_active,
        message: 'Already registered via this provider',
      };
    }
  }
  
  // ✅ SAFE: Create new record
  const newMember = await db.members.create({
    data: {
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      phone: req.phone,
      password_hash: req.password,
      oauth_provider: req.oauth_provider,
      oauth_id: req.oauth_id,
      is_active: false,
      requested_at: new Date(),
    },
  });
  
  return {
    memberId: newMember.id,
    is_active: false,
  };
}
```

### Admin Blacklist Management

**Add to Admin Dashboard - New Tab: "Blacklist"**

```typescript
// src/app/admin/blacklist/page.tsx

Display:
┌──────────────────────────────────────────────────────────┐
│ Blacklisted Entries                                      │
├──────────────────────────────────────────────────────────┤
│ Email/OAuth        │ Reason           │ By     │ Action  │
├──────────────────────────────────────────────────────────┤
│ hacker@spam.com    │ DoS attempts     │ You    │ [Unblock]
│ +google:12345      │ Abusive behavior │ Admin1 │ [Unblock]
│ +facebook:67890    │ Spam             │ You    │ [Unblock]
└──────────────────────────────────────────────────────────┘

Admin can:
  1. View all blacklist entries
  2. [Unblock] button → Remove from blacklist
  3. Search by email or oauth_id
  4. Filter by date blacklisted
```

**Update Pending Approvals - Add Blacklist Option**

```typescript
// When admin views pending user:

┌────────────────────────────────────────────┐
│ Name: John Kowalski                         │
│ Email: john@parish.pl                      │
│ Phone: +48 123 456 789                      │
│                                            │
│ [Approve & Assign Role]                   │
│ [Reject]                                   │
│                                            │
│ ─────────────────────────────────────────  │
│ Security Action (if suspicious):           │
│                                            │
│ [⛔ Blacklist This User]                   │
│ Reason: [________________]                 │
│ (Blocks: email + oauth_id if available)    │
│                                            │
│ Why blacklist?                             │
│ • Suspected hacker/spam                    │
│ • DoS attempts detected                    │
│ • Abusive behavior                         │
│ • Invalid information                      │
│                                            │
│ Note: Can be unblocked later if mistake    │
└────────────────────────────────────────────┘
```

### Admin Blacklist API Endpoints

```typescript
// src/app/api/admin/blacklist/add/route.ts
POST /api/admin/blacklist/add

Request:
{
  email?: string,
  oauth_provider?: string,
  oauth_id?: string,
  reason: string
}

Response:
{
  blacklisted: true,
  entry_id: UUID,
  blocks: { email, oauth_provider, oauth_id }
}

Actions:
1. Create blacklist entry (is_active=TRUE)
2. Set any existing member with this email/oauth_id to inactive (can't login)
3. Log decision: who blacklisted, when, why
4. Log security event
```

```typescript
// src/app/api/admin/blacklist/remove/route.ts
POST /api/admin/blacklist/remove/{blacklist_id}

Response:
{
  unblacklisted: true,
  entry: { email, oauth_provider, oauth_id }
}

Actions:
1. Set is_active = FALSE on blacklist entry
2. Create audit log: who unblacklisted, when, why
3. Member can now register again
4. Log security event
```

### Corner Cases Handled

**Case 1: Legitimate User Changed Email/Phone**
```
Scenario:
  - John approved with email john@old.com
  - John changes email to john@new.com
  - John tries to register with new email
  - Admin rejects due to phone mismatch
  - Admin (by mistake) blacklists

Resolution:
  - John calls: "I'm blocked!"
  - Admin: [Unblock] in Blacklist tab
  - John re-registers with new email
  - Admin approves normally
```

**Case 2: Actual Hacker**
```
Scenario:
  - Same person tries 10 times with different Google accounts
  - Each attempt hits duplicate check (same email)
  - Attempts spam security_events log

Admin response:
  - See pattern in security log
  - Blacklist email + multiple oauth_ids
  - Hacker auto-blocked from further attempts
```

**Case 3: Rate Limiting Future Enhancement**
```
If DoS continues despite blacklist:
  - Add rate limiting on /api/auth/register
  - Limit: 5 registrations per IP per hour
  - Log to security_events table
  - Alert admin if threshold exceeded
```

---

## Member Table Schema

### Complete Fields (from archived design + auth additions)

```sql
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
    geographic_unit_id UUID REFERENCES geographic_units(id),
    
    -- Admin approval tracking
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),  -- When user registered
    approved_by UUID REFERENCES members(id),                        -- Which admin approved them
    approved_at TIMESTAMP WITH TIME ZONE,                           -- When admin approved
    registry_check_result JSONB,                                    -- Verification checks:
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

-- Indexes for common queries
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_members_oauth ON members(oauth_provider, oauth_id);
CREATE INDEX idx_members_requested_at ON members(requested_at);
CREATE INDEX idx_members_approved_by ON members(approved_by);
```

### registry_check_result JSON Structure

```json
{
  "emailMatch": true,
  "phoneMatch": false,
  "nameMatch": true,
  "registryEntry": {
    "firstName": "John",
    "lastName": "Kowalski",
    "email": "john@parish.pl",
    "phone": "+48111222333",
    "role": "Companionship Delegate",
    "geographicUnit": "Kraków Province"
  },
  "mismatches": {
    "phone": "Registry has +48111222333, user registered +48123456789"
  },
  "recommendation": "Phone mismatch - recommend calling to verify identity",
  "checked_at": "2026-09-09T15:42:00Z"
}
```

---

## OAuth Configuration

### Google OAuth

```typescript
// Requests email + phone scope
Google({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      phone: profile.phone_number || null,  // May be null
      image: profile.picture,
    };
  },
})
```

### Facebook OAuth

```typescript
// Requests email + phone scope
Facebook({
  clientId: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  profile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || null,  // May be null
      image: profile.picture,
    };
  },
})
```

**Important:** Phone from OAuth may be:
- NULL (user didn't provide or didn't grant permission)
- Pre-filled in registration form (user can edit)
- Still requires admin verification

---

## Implementation Phases

### COMMIT 1.2: Mocked UI (Already Done ✓)

Basic navigation + mocked panel with placeholder data.

### COMMIT 1.3: Docker + Local Development Database Setup

Set up PostgreSQL container for local development and testing **BEFORE defining schema**.

**Create `docker-compose.yml`:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: emma-postgres-dev
    
    environment:
      POSTGRES_USER: emma_dev
      POSTGRES_PASSWORD: emma_dev_password
      POSTGRES_DB: emma_companionship_dev
    
    ports:
      - "5432:5432"
    
    volumes:
      - emma_postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/001-init.sql:ro
    
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U emma_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  emma_postgres_data:
```

**Create `.env.local` (add to .gitignore):**

```
# Local Development Database
DATABASE_URL=postgresql://emma_dev:emma_dev_password@localhost:5432/emma_companionship_dev
DATABASE_TEST_URL=postgresql://emma_dev:emma_dev_password@localhost:5432/emma_companionship_test

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-hex-32
```

**Create `.gitignore` entry:**

```gitignore
# Environment
.env.local
.env.local.backup
.env.*.local

# Docker
.docker/
postgres-data/
```

**SQL Migrations Structure:**

```
db/
├── migrations/
│   ├── 001_init.sql                    # Initial database setup
│   ├── 002_members_table.sql           # Members table
│   ├── 003_oauth_tables.sql            # OAuth support
│   ├── 004_blacklist_security.sql      # Security tables
│   ├── 005_roles_access_control.sql    # Role system
│   ├── 006_companionship.sql           # Companionship relationships
│   └── 007_approval_workflow.sql       # Approval system
└── schema.md                            # Schema documentation (readable)
```

**Create `scripts/init-db.sql`:**

```sql
-- Initial database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migration tracking table (language-agnostic)
CREATE TABLE IF NOT EXISTS _schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500),
    executed_at TIMESTAMP DEFAULT NOW()
);

-- Log all migrations
INSERT INTO _schema_migrations (version, description) 
VALUES ('0', 'Initial setup') 
ON CONFLICT DO NOTHING;
```

**Create `scripts/migrate-dev.sh`:**

```bash
#!/bin/bash

# Run migrations on development database
set -e

echo "Running migrations on development database..."

DATABASE_URL=${1:-$DATABASE_URL}

if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not set"
    exit 1
fi

# Find and run all migration files in order
for migration in db/migrations/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "Running: $filename"
        
        # Run migration
        psql "$DATABASE_URL" -f "$migration"
        
        if [ $? -eq 0 ]; then
            echo "✓ $filename completed"
        else
            echo "✗ $filename failed"
            exit 1
        fi
    fi
done

echo "All migrations completed!"
```

**Create `scripts/migrate-test.sh`:**

```bash
#!/bin/bash

# Create test database and run migrations
set -e

echo "Setting up test database..."

# Extract connection info from DATABASE_URL
MAIN_DB_URL=$DATABASE_URL
TEST_DB_URL=$DATABASE_TEST_URL

# Create test database if not exists
psql "$MAIN_DB_URL" -tc "SELECT 1 FROM pg_database WHERE datname = 'emma_companionship_test'" | grep -q 1 || \
    createdb -U emma_dev emma_companionship_test

echo "Running migrations on test database..."

# Run migrations on test database
for migration in db/migrations/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "Running: $filename"
        psql "$TEST_DB_URL" -f "$migration"
    fi
done

echo "Test database ready!"
```

**Create `scripts/postgres-start.sh`:**

```bash
#!/bin/bash

echo "Starting PostgreSQL container..."
docker-compose up -d postgres

echo "Waiting for PostgreSQL to be ready..."
docker-compose exec -T postgres pg_isready -U emma_dev

echo "✓ PostgreSQL is ready!"
echo ""
echo "Development database:"
echo "  URL: postgresql://emma_dev:emma_dev_password@localhost:5432/emma_companionship_dev"
echo ""
echo "Next steps:"
echo "  1. npm run db:migrate:dev    # Run migrations"
echo "  2. npm run db:migrate:test   # Set up test DB"
echo "  3. npm test                  # Run tests"
```

**Create `scripts/postgres-stop.sh`:**

```bash
#!/bin/bash
echo "Stopping PostgreSQL container..."
docker-compose down
```

**Create `scripts/postgres-reset.sh`:**

```bash
#!/bin/bash

echo "WARNING: This will delete ALL data in the development database!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    docker-compose up -d postgres
    docker-compose exec -T postgres pg_isready -U emma_dev
    echo "✓ Database reset complete"
else
    echo "Cancelled"
fi
```

**Add to `package.json`:**

```json
{
  "scripts": {
    "db:start": "bash scripts/postgres-start.sh",
    "db:stop": "bash scripts/postgres-stop.sh",
    "db:reset": "bash scripts/postgres-reset.sh",
    "db:migrate:dev": "bash scripts/migrate-dev.sh $DATABASE_URL",
    "db:migrate:test": "bash scripts/migrate-test.sh",
    "db:psql": "psql $DATABASE_URL",
    "db:psql:test": "psql $DATABASE_TEST_URL"
  }
}
```

**Development Workflow:**

```bash
# 1. Start PostgreSQL container
npm run db:start

# 2. Set up development database with migrations
npm run db:migrate:dev

# 3. Set up test database
npm run db:migrate:test

# 4. Run tests (tests connect to test DB)
npm test

# 5. Direct SQL access if needed
npm run db:psql

# 6. Reset everything (destructive!)
npm run db:reset

# 7. Stop when done
npm run db:stop
```

**Test Database Connection (in tests):**

```typescript
// tests/db.setup.ts
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;

// Tests connect to emma_companionship_test database automatically
// Not mocked - real PostgreSQL queries
```

**Why Raw SQL:**

✅ Language-agnostic (future Python backend reads same SQL)
✅ Version controlled migrations (like git for DB)
✅ Explicit, clear (no ORM hiding DB details)
✅ Hexagonal architecture (DB as separate concern)
✅ No build step needed (SQL is source)
✅ Easy auditing (see exactly what changed)
✅ No library lock-in (SQL works everywhere)

**Why Same Container, Different DB:**

✅ Lightweight (no second container)
✅ Same configuration (identical schema)
✅ Tests isolated (separate DB name)
✅ Quick reset between test runs
✅ Easy cleanup (drop test DB, keep dev data)

**Key Files Created:**

```
/
├── docker-compose.yml                    ← Docker infrastructure
├── .env.local                            ← Local dev environment (in .gitignore)
├── .gitignore                            ← Protects secrets
├── db/
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_members_table.sql
│   │   ├── 003_oauth_tables.sql
│   │   ├── 004_blacklist_security.sql
│   │   ├── 005_roles_access_control.sql
│   │   ├── 006_companionship.sql
│   │   └── 007_approval_workflow.sql
│   └── schema.md                         ← Documentation
└── scripts/
    ├── init-db.sql                       ← Initial setup
    ├── migrate-dev.sh                    ← Run migrations
    ├── migrate-test.sh                   ← Test DB setup
    ├── postgres-start.sh                 ← Start Docker
    ├── postgres-stop.sh                  ← Stop Docker
    └── postgres-reset.sh                 ← Reset (destructive)
```

**What this enables:**

✅ Local PostgreSQL without manual installation
✅ SQL migrations version controlled
✅ Language-agnostic (Python backend later, same .sql files)
✅ Test database isolated but same setup
✅ Repeatable, disposable environments
✅ Easy reset for testing
✅ .env.local protects secrets (in .gitignore)
✅ Compatible with CI/CD (same Docker config)
✅ Path to Vercel Postgres (just change DATABASE_URL)

**Why COMMIT 1.3 before COMMIT 2:**

- Infrastructure ready when schema defined (COMMIT 2)
- COMMIT 2 schema can be tested immediately
- Tests verify actual DB (not mocks)
- Migrations created as SQL files (language-agnostic)
- .sql files committed to git (full history)

---

### COMMIT 2: Database Schema

Create SQL migration files in `db/migrations/` directory using raw SQL (language-agnostic):

```
Migration Files (executed in order):

001_init.sql
  - CREATE EXTENSION "uuid-ossp", "pgcrypto"
  - CREATE TABLE _schema_migrations (version, description, executed_at)

002_members_table.sql
  - CREATE TABLE members (
      id UUID PRIMARY KEY,
      first_name, last_name, email (UNIQUE), phone,
      password_hash (form-based, nullable),
      oauth_provider, oauth_id (OAuth, nullable),
      UNIQUE(oauth_provider, oauth_id),
      is_active BOOLEAN DEFAULT FALSE,
      geographic_unit_id UUID REFERENCES geographic_units(id),
      requested_at, approved_by UUID REFERENCES members(id),
      approved_at, registry_check_result JSONB,
      profile_picture TEXT,
      created_at, updated_at
    )

003_oauth_identities.sql
  - (Optional - if using separate oauth_identities table)

004_blacklist_security.sql
  - CREATE TABLE blacklist (
      id UUID PRIMARY KEY,
      email VARCHAR(255),
      oauth_provider, oauth_id,
      reason TEXT NOT NULL,
      blacklisted_by UUID NOT NULL REFERENCES members(id),
      blacklisted_at TIMESTAMP,
      unblacklisted_by UUID REFERENCES members(id),
      unblacklisted_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      UNIQUE(email) WHERE is_active,
      UNIQUE(oauth_provider, oauth_id) WHERE is_active
    )
  
  - CREATE TABLE security_events (
      id UUID PRIMARY KEY,
      event_type VARCHAR(50),
      email, oauth_provider, oauth_id,
      ip_address INET, user_agent TEXT,
      reason TEXT, severity VARCHAR(20),
      created_at TIMESTAMP
    )

005_roles_access_control.sql
  - CREATE TABLE role_assignments (
      id UUID PRIMARY KEY,
      member_id UUID REFERENCES members(id),
      role_id UUID REFERENCES roles(id),
      scope_id UUID REFERENCES geographic_units(id),
      assigned_at TIMESTAMP,
      assigned_by UUID REFERENCES members(id)
    )
  
  - CREATE TABLE approval_audit (
      id UUID PRIMARY KEY,
      member_id UUID REFERENCES members(id),
      admin_id UUID REFERENCES members(id),
      status_change VARCHAR(50),
      reason TEXT,
      approved_at TIMESTAMP,
      created_at TIMESTAMP
    )
  
  - CREATE TABLE auth_events (
      id UUID PRIMARY KEY,
      member_id UUID REFERENCES members(id),
      event_type VARCHAR(50),
      provider VARCHAR(50),
      ip_address INET,
      user_agent TEXT,
      success BOOLEAN,
      reason TEXT,
      created_at TIMESTAMP
    )

006_companionship.sql
  - (From archived schema - companionship relationships)

007_approval_workflow.sql
  - (From archived schema - approval process workflow)

008_two_factor_auth.sql (NEW - Future-proofed for 2FA feature)
  - CREATE TABLE two_factor_auth (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
      
      method VARCHAR(50) NOT NULL DEFAULT 'totp',
      secret VARCHAR(255) NOT NULL,
      
      enabled BOOLEAN DEFAULT FALSE,
      enabled_at TIMESTAMP WITH TIME ZONE,
      verified_at TIMESTAMP WITH TIME ZONE,
      
      backup_codes TEXT[] NOT NULL,
      backup_codes_generated_at TIMESTAMP WITH TIME ZONE,
      
      last_used_at TIMESTAMP WITH TIME ZONE,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  
  CREATE INDEX idx_two_factor_auth_member_id ON two_factor_auth(member_id);
  CREATE INDEX idx_two_factor_auth_enabled ON two_factor_auth(enabled);
```

**Why Include 2FA Table Now?**
- ✅ Extensible for future methods (SMS, security keys, WebAuthn)
- ✅ No migration needed when feature launches (COMMIT 10)
- ✅ Language-agnostic (Python backend uses same .sql files)
- ✅ Optional per user (only populated if 2FA enabled)
- ✅ Audit trail of 2FA changes ready

**Run Migrations:**

```bash
# Start database
npm run db:start

# Run all migrations
npm run db:migrate:dev

# Set up test database
npm run db:migrate:test

# Verify schema
npm run db:psql -c "\dt"  # List tables
npm run db:psql -c "\d members"  # Describe members table
```

### COMMIT 3: Auth.js Setup

Initialize Next-Auth v5 with providers:

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  
  providers: [
    Google({ /* config */ }),
    Facebook({ /* config */ }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Verify form-based login
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.is_active = user.is_active;
        token.role = user.role;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.is_active = token.is_active;
        session.user.role = token.role;
      }
      return session;
    },
  },
});
```

### COMMIT 4: Registration (Form + OAuth)

Implement registration endpoints with blacklist + duplicate prevention:

```typescript
// src/app/api/auth/register/route.ts
POST /api/auth/register

Request:
{
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  password?: string,  // Form-based only
  authMethod: 'form' | 'google' | 'facebook',
  oauth_provider?: 'google' | 'facebook',
  oauth_id?: string
}

Response:
{
  memberId: UUID,
  is_active: false,
  requiresAdminReview: true,
  message: "Registration successful. Awaiting admin approval."
}
OR
{
  error: "This email cannot be registered. Please contact support.",
  is_active: false
}

Actions:
1. Check blacklist (email) → REJECT if blacklisted
2. Check blacklist (oauth_id) → REJECT if blacklisted
3. Check duplicate (email) → Return existing if found
4. Check duplicate (oauth_id) → Return existing if found
5. If safe: Create member with is_active=FALSE
6. Hash password (if form-based)
7. Store OAuth data (if OAuth)
8. Log requested_at timestamp
9. Run verification checks (for admin review)
10. Log security event
```

### COMMIT 5: Verification Checks Service

Run checks for admin review:

```typescript
// src/domain/auth/VerificationService.ts
export class VerificationService {
  
  async runRegistryChecks(member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<RegistryCheckResult> {
    
    // 1. Query community registry
    const registryEntry = await this.communityRegistry.findByNameAndEmail({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    });
    
    if (!registryEntry) {
      return {
        emailMatch: false,
        phoneMatch: false,
        nameMatch: false,
        recommendation: "Not found in registry - manual verification required",
        checked_at: new Date(),
      };
    }
    
    // 2. Compare fields
    const emailMatch = member.email === registryEntry.email;
    const phoneMatch = member.phone === registryEntry.phone;
    const nameMatch = true; // Already matched in query
    
    // 3. Generate recommendation
    let recommendation = "Matched registry entry";
    if (!phoneMatch) {
      recommendation = "Email and name match but phone differs - recommend calling to verify";
    }
    
    return {
      emailMatch,
      phoneMatch,
      nameMatch,
      registryEntry,
      mismatches: phoneMatch ? undefined : {
        phone: `Registry: ${registryEntry.phone}, User: ${member.phone}`,
      },
      recommendation,
      checked_at: new Date(),
    };
  }
}
```

### COMMIT 6: Admin Dashboard - Pending Approvals + Blacklist

Create admin UI with two tabs:

**Tab 1: Pending Approvals (is_active = FALSE)**

```typescript
// src/app/admin/pending-approvals/page.tsx
GET /admin/pending-approvals

Display:
┌─────────────────────────────────────────────────────────┐
│ Pending Approvals (is_active = FALSE)                   │
├─────────────────────────────────────────────────────────┤
│ Name            │ Email           │ Phone    │ Requested │
├─────────────────────────────────────────────────────────┤
│ John Kowalski   │ john@parish.pl  │ +48 123  │ 1h ago   │
│ Maria Nowak     │ maria@church.pl │ +48 456  │ 4h ago   │
└─────────────────────────────────────────────────────────┘

Click user → Shows verification checks + approve/reject + blacklist option
```

**Tab 2: Blacklist Management**

```typescript
// src/app/admin/blacklist/page.tsx
GET /admin/blacklist

Display:
┌──────────────────────────────────────────────────────────┐
│ Blacklisted Entries (is_active = TRUE)                   │
├──────────────────────────────────────────────────────────┤
│ Email/OAuth        │ Reason           │ By     │ Action  │
├──────────────────────────────────────────────────────────┤
│ hacker@spam.com    │ DoS attempts     │ You    │ [Unblock]
│ +google:12345      │ Abusive behavior │ Admin1 │ [Unblock]
└──────────────────────────────────────────────────────────┘

Features:
  - Search by email or oauth_id
  - Filter by date blacklisted
  - [Unblock] removes from blacklist (is_active=FALSE)
```

**Pending User Detail View:**

```
┌────────────────────────────────────────────┐
│ User Details                                │
├────────────────────────────────────────────┤
│ Name:  John Kowalski                        │
│ Email: john@parish.pl                      │
│ Phone: +48 123 456 789                      │
│                                            │
│ Verification Checks:                       │
│ ✓ Email matches registry                   │
│ ✗ Phone doesn't match (registry: +48 111) │
│ ✓ Name matches registry                    │
│ Recommendation: Call to verify phone       │
│                                            │
│ Actions:                                   │
│ Geographic Unit: [Kraków Province ▼]      │
│ Role: [Companionship Delegate ▼]          │
│ [Approve] [Reject]                        │
│                                            │
│ ─────────────────────────────────────────  │
│ Security:                                  │
│ [⛔ Blacklist User]                        │
│ Reason: [________________]                 │
│ (Why: Spam, DoS, Abusive, Invalid Info)   │
│                                            │
│ Note: Can unblock later if mistake         │
└────────────────────────────────────────────┘
```

### COMMIT 7: Admin Approval Logic

Implement approve/reject:

```typescript
// src/app/api/admin/users/[id]/approve/route.ts
POST /api/admin/users/{memberId}/approve

Request:
{
  approved: boolean,
  geographicUnitId?: UUID,
  roleId?: UUID,
  notes?: string
}

If approved:
1. Set is_active = TRUE
2. Set geographic_unit_id
3. Create RoleAssignment
4. Set approved_by = current admin ID
5. Set approved_at = NOW
6. Log to approval_audit
7. Send notification to user

If rejected:
1. Keep is_active = FALSE
2. Log rejection reason
3. Send notification to user
```

### COMMIT 8: Login Middleware

Protect routes with auth checks:

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const session = auth();
  
  // Check 1: User authenticated?
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Check 2: User approved?
  if (!session.user.is_active) {
    return NextResponse.redirect(new URL('/auth/pending', request.url));
  }
  
  // Check 3: User has required role?
  if (request.nextUrl.pathname.startsWith('/admin') && session.user.role !== 'Admin') {
    return NextResponse.redirect(new URL('/forbidden', request.url));
  }
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*'],
};
```

### COMMIT 9: Login/Logout Pages

Update UI:

```typescript
// src/app/auth/login/page.tsx - Login form with OAuth buttons

// src/app/auth/pending/page.tsx - "Awaiting approval" message

// src/app/auth/logout/route.ts - Logout handler

// Update companionship panel to use real session
export default function CompanionshipPanelPage() {
  const session = useSession();
  
  if (!session?.user?.is_active) {
    redirect('/auth/login');
  }
  
  return (
    <Navbar
      rightContent={
        <LogoutButton
          userName={session.user.name}
          userEmail={session.user.email}
          href="/auth/logout"
        />
      }
    />
  );
}
```

### COMMIT 10: Security Logging

Add auth event tracking:

```typescript
// src/infrastructure/auth/AuthEventLogger.ts
export class AuthEventLogger {
  
  async logLogin(memberId: UUID, provider: string, ipAddress: string): Promise<void> {
    await db.auth_events.create({
      member_id: memberId,
      event_type: 'login',
      provider,
      ip_address: ipAddress,
      success: true,
      created_at: new Date(),
    });
  }
  
  async logFailedLogin(email: string, reason: string): Promise<void> {
    await db.auth_events.create({
      event_type: 'failed_login',
      email,
      reason,
      success: false,
      created_at: new Date(),
    });
  }
}
```

---

## Technology Stack

```
Frontend:
  - Next.js 14+ (App Router)
  - React Components
  - TailwindCSS (existing)
  - motion/react (existing)

Backend Auth:
  - Auth.js v5 (NextAuth successor)
  - Argon2 password hashing
  - Prisma ORM (type-safe DB)
  - jsonwebtoken (JWT tokens)

Database:
  - PostgreSQL (Vercel Postgres or local Docker)
  - Custom auth-specific tables
  - Indexes for performance

Form Validation:
  - Zod for schemas
```

---

## Key Design Decisions

### ✅ NO Auto-Approval
- **Why:** Security-first for small community
- **Alternative:** Could add later if volume grows
- **Benefit:** Admin always makes informed decision

### ✅ Verification Checks as Admin Reference
- **Why:** Admin needs decision-supporting info, but makes final call
- **Checks:** Email match, phone match, name match
- **Stored:** JSON in registry_check_result for audit trail

### ✅ No Geographic Unit or Role in Registration
- **Why:** User doesn't know community hierarchy
- **Who assigns:** Admin selects from dropdown after approval
- **Benefit:** Reduces user confusion, gives admin full control

### ✅ Support Multiple Auth Methods
- **Form-based:** Email + password (Argon2)
- **OAuth:** Google + Facebook
- **Unified:** Both paths go through same approval gate

### ✅ Phone is Mandatory
- **Why:** Best tool for identity verification
- **Source:** OAuth (pre-fill) or user-entered
- **Community use:** Already in their registry

---

## Database Relationships

```
Member (is_active = FALSE initially)
├─ requested_at (when registered)
├─ registry_check_result (verification checks)
│
├─ (Admin reviews and decides)
│
└─ If APPROVED:
   ├─ Set is_active = TRUE
   ├─ Set geographic_unit_id
   ├─ Set approved_by (admin ID)
   ├─ Set approved_at
   │
   └─ RoleAssignment created:
      ├─ member_id → Member
      ├─ role_id → Role
      └─ scope_id → GeographicUnit
```

---

---

## Security Considerations - Blacklist + DoS Prevention

### How Blacklist Prevents DoS

```
Attack Vector:
  Hacker tries 10 registrations with same email/oauth_id
  
Without blacklist:
  → System creates 10 records
  → Admin sees 10 approval requests
  → Admin spam (DoS)

With blacklist + duplicate prevention:
  → First registration creates record
  → Attempts 2-10 hit duplicate check
  → Returns existing record (no new DB write)
  → No admin spam (DoS prevented ✓)
  
If hacker changes email:
  → New registrations with different emails
  → Admin sees new pending users
  → Admin can blacklist email pattern
  → Hacker auto-blocked (is_active=FALSE if approved)
```

### Blacklist Decision Matrix

**When to blacklist:**
- Obvious spam (email patterns like test@spam.com)
- DoS attempts (multiple registrations detected)
- Abusive behavior reported
- Invalid information provided
- Suspicious OAuth patterns

**When NOT to blacklist:**
- Email typo (can unblock)
- Phone changed (legitimate - can unblock)
- Not sure (reject first, observe patterns)

**Recovery from mistake:**
- If legitimate user blacklisted by accident
- User calls: "I can't register!"
- Admin: Click [Unblock] in Blacklist tab
- User re-registers normally
- Simple, transparent process

---

## Security Audit Trail

### What Gets Logged

```sql
-- All sensitive operations
security_events table tracks:
  1. Blacklist attempts blocked (who, when, why)
  2. Duplicate registrations prevented (which email/oauth_id)
  3. Failed logins (email, provider, ip_address)
  4. Rate limit exceeded (ip_address, attempt_count)
  5. Blacklist additions (admin_id, timestamp, reason)
  6. Blacklist removals (admin_id, timestamp, reason)

-- Admin can view
/admin/security-log page shows:
  - All events chronologically
  - Filter by event_type
  - Filter by severity (info, warning, critical)
  - Filter by date range
  - Search by email or IP
  - Export for compliance/investigation
```

### Admin Responsibilities

```
Admin must:
  1. Review pending approvals regularly
  2. Verify phone numbers match registry
  3. Call if phone doesn't match
  4. Blacklist suspicious accounts
  5. Monitor security log for patterns
  6. Unblock mistakes within 24h (SLA)
```

---

## Key Design Decisions

### ✅ NO Auto-Approval (Manual Only)
- **Why:** Security-first for small community
- **Alternative:** Could add later if volume grows
- **Benefit:** Admin always makes informed decision

### ✅ Duplicate Prevention (No DB Spam)
- **Why:** Prevent DoS via registration spam
- **How:** Check email + oauth_id before creating
- **Benefit:** Admin sees no duplicate requests

### ✅ Blacklist + Permanent Block
- **Why:** Admin can immediately block hackers
- **How:** Check blacklist before registration
- **Benefit:** Hacker blocked across all auth methods
- **Reversible:** [Unblock] if mistake made

### ✅ Verification Checks as Admin Reference
- **Why:** Admin needs decision-supporting info, but makes final call
- **Checks:** Email match, phone match, name match
- **Stored:** JSON in registry_check_result for audit trail

### ✅ Phone is Mandatory
- **Why:** Best tool for identity verification + blacklisting
- **Source:** OAuth (pre-fill) or user-entered
- **Community use:** Already in their registry

### ✅ Support Multiple Auth Methods
- **Form-based:** Email + password (Argon2)
- **OAuth:** Google + Facebook
- **Unified:** Both paths go through same approval gate + blacklist

---

## Authentication (Who are you?)

✅ **Form-based:**
- Argon2 password hashing (OWASP standard)
- No passwords in logs
- HTTPS only

✅ **OAuth:**
- Provider verifies identity
- Email verified by Google/Facebook
- Tokens managed by Auth.js

### Authorization (What can you do?)

✅ **Admin Approval Gate:**
- is_active check blocks all unapproved users
- Cannot bypass with technical knowledge

✅ **Blacklist Gate:**
- Email/oauth_id checked before registration
- Blocks hacker immediately across all auth methods

✅ **Role-Based Access:**
- Middleware checks user.role
- Backend validates role for each endpoint

✅ **Audit Trail:**
- All approvals logged (who, when, decision)
- All logins logged (user, provider, timestamp)
- All blacklist actions logged (admin, reason, timestamp)
- All security events logged for investigation

---

## Next Steps

1. **COMMIT 1.3 (First):** Set up Docker infrastructure
   - Create `docker-compose.yml` for PostgreSQL
   - Create `.env.local` for local development (add to .gitignore)
   - Add npm scripts for `db:start`, `db:migrate:dev`, `db:migrate:test`, `db:psql`
   - Validate: `npm run db:start` works and DB is accessible

2. **COMMIT 2 (Second):** Define database schema using raw SQL
   - Create 8 migration files in `db/migrations/`:
     - 001_init.sql (extensions + migration tracking)
     - 002_members_table.sql (auth fields: password_hash, oauth_provider, oauth_id, is_active, etc.)
     - 003_oauth_identities.sql (optional - if separate table)
     - 004_blacklist_security.sql (blacklist + security_events tables)
     - 005_roles_access_control.sql (role_assignments + approval_audit + auth_events)
     - 006_companionship.sql (from archived schema)
     - 007_approval_workflow.sql (from archived schema)
     - 008_two_factor_auth.sql (future-proofed for COMMIT 10, includes TOTP secret + backup codes)
   - Run `npm run db:migrate:dev` to apply migrations
   - Run `npm run db:migrate:test` to set up test database

3. **COMMIT 2 (Same):** Write database integration tests
   - Test: Schema created correctly (all 8 tables)
   - Test: Constraints enforced (UNIQUE, FK, CHECK constraints)
   - Test: Indexes created for performance
   - Test: Relationships work (FKs resolve correctly)
   - Tests connect to real PostgreSQL (via DATABASE_TEST_URL in separate DB)

4. **2FA Future-Proofing:**
   - `two_factor_auth` table included in COMMIT 2
   - No schema migration needed when 2FA feature launches (COMMIT 10)
   - Just populate table and add login verification logic

5. All questions answered:
   - ✅ Raw SQL for language-agnostic migrations (Python backend later)
   - ✅ .env.local in .gitignore (secrets safe)
   - ✅ Test DB uses same container with different name (isolated, lightweight)
