# Authentication Implementation Plan - UPDATED FOR CLOSED, ADMIN-APPROVAL SYSTEM

## Overview

emmaCompanionship uses a **closed, role-based authentication system** with **admin approval workflow**. This plan reflects the enterprise/community-focused architecture where only approved community members with assigned roles can access the application.

**Key principle:** No open registration. Only community members verified and approved by admins can authenticate.

---

## Closed-System Auth Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│           NEW USER (First-Time Registration Request)             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    FORM-BASED SIGNUP
                    ─────────────────
          User fills form: Name, Email, Password
                 (optional: Phone, Notes)
                              ↓
          ┌────────────────────┴────────────────────┐
          │ OPTION 1: Email + Password              │ OPTION 2: OAuth
          │ • Argon2 hash password                  │ • Google/Facebook
          │ • Store in DB                           │ • OAuth provider 
          │                                          │   verifies email
          └────────────────────┬────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────┐
    │    User Created with is_active = FALSE           │
    │    role = NULL (pending approval)                │
    └──────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────┐
    │         ADMIN APPROVAL WORKFLOW                  │
    │  (Manual verification - no email confirmation)   │
    └──────────────────────────────────────────────────┘
                              ↓
    [Admin sees "New Join Requests" in admin panel]
                              ↓
    Admin verification process:
    ┌─────────────────────────────────────────────────┐
    │ 1. Check: Is email in known community members?   │
    │ 2. Verify: Phone call or email with person       │
    │ 3. Review: Community records for role match      │
    │ 4. Assign: Correct role (e.g., Delegate_L1)      │
    │ 5. Activate: is_active = TRUE                    │
    └─────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────┐
    │       User now can LOGIN to application          │
    │  • OAuth: Automatic redirect to panel            │
    │  • Email: Enter email + password                 │
    └──────────────────────────────────────────────────┘
```

---

## Database Requirements (from Archived Analysis)

The existing DB design (`_archived_docs/architecture/database-schema.md`) already includes:

### ✅ Already Included

```sql
-- Members table (simplified for auth focus)
CREATE TABLE members (
    id UUID PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Argon2 for form-based
    
    -- CRITICAL for closed system
    is_active BOOLEAN DEFAULT FALSE,      -- ← Admin approval gate
    
    geographic_unit_id UUID NOT NULL,     -- ← Member's location
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Role assignments (hierarchical access control)
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY,
    member_id UUID REFERENCES members(id),
    role_id UUID REFERENCES roles(id),
    scope_id UUID REFERENCES geographic_units(id),  -- ← Where role applies
    assigned_at TIMESTAMP
);

-- Roles available
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE,             -- 'Companionship Delegate', 'Supervisor', 'Admin'
    level VARCHAR(20)                     -- 'sector', 'province', 'zone', etc.
);
```

### ⚠️ Needs for Auth (Add to `docs/architecture/` - NOT modify `_archived_docs`)

```sql
-- OAuth Identity Tracking (new, specific to auth)
CREATE TABLE oauth_identities (
    id UUID PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,        -- 'google', 'facebook'
    provider_id VARCHAR(255) NOT NULL,    -- External ID from provider
    email_verified BOOLEAN DEFAULT FALSE, -- From provider
    created_at TIMESTAMP,
    
    CONSTRAINT unique_oauth_identity UNIQUE(provider, provider_id)
);

-- Admin Approval Audit Trail (new, for tracking approvals)
CREATE TABLE approval_audit (
    id UUID PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id),
    admin_id UUID REFERENCES members(id), -- Who approved
    status_change VARCHAR(50),            -- 'pending' → 'approved' OR 'rejected'
    reason TEXT,                          -- Admin notes
    approved_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Login/Auth Events (new, for security logging)
CREATE TABLE auth_events (
    id UUID PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id),
    event_type VARCHAR(50),               -- 'login', 'logout', 'failed_login', 'password_changed'
    provider VARCHAR(50),                 -- 'form', 'google', 'facebook'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN,
    reason TEXT,                          -- 'inactive_account', 'wrong_password', etc.
    created_at TIMESTAMP
);
```

---

## Implementation Plan

### COMMIT 1.2: Mocked UI (Already Done ✓)

Basic navigation + mocked panel with placeholder data.

### COMMIT 2: Database Schema

**Add auth-specific tables:**

```sql
-- oauth_identities table (for OAuth provider tracking)
-- approval_audit table (for admin approval tracking)
-- auth_events table (for security logging)
```

**Also create:**
- Indexes for common queries
- Functions to update is_active status
- Triggers for audit trail

### COMMIT 3: Auth.js Setup

Initialize Auth.js with:
- NextAuth v5 configuration
- Adapter (Postgres)
- Google OAuth provider
- Facebook OAuth provider
- Credentials provider (form-based email + password)

**Output:**
- `lib/auth.ts` - Auth configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API route

### COMMIT 4: Domain Layer - AuthService

Create business logic layer:

```typescript
// src/domain/auth/AuthService.ts
export class AuthService {
  
  // Form-based registration
  async registerWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    geographicUnitId: UUID
  ): Promise<{ member: Member; requiresApproval: true }>;
  
  // Form-based login
  async loginWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; member?: Member; reason?: string }>;
  
  // OAuth registration/login (unified)
  async authenticateWithOAuth(
    provider: 'google' | 'facebook',
    oauthData: OAuthProfile
  ): Promise<{ member: Member; isNewUser: boolean; isActive: boolean }>;
  
  // 2FA setup
  async setupTOTP(memberId: UUID): Promise<{ secret: string; qrCode: string }>;
  
  // 2FA verification
  async verifyTOTP(memberId: UUID, token: string): Promise<boolean>;
  
  // Logout
  async logout(memberId: UUID): Promise<void>;
}
```

### COMMIT 5: Auth Port & Adapter

Create abstraction layer:

```typescript
// src/domain/auth/IAuthProvider.ts (PORT)
export interface IAuthProvider {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateTOTPSecret(): { secret: string; qrCode: string };
  verifyTOTPToken(secret: string, token: string): boolean;
}

// src/infrastructure/auth/NextAuthAdapter.ts (ADAPTER)
export class NextAuthAdapter implements IAuthProvider {
  // Implementation using bcrypt/Argon2, speakeasy for TOTP
}
```

### COMMIT 6: Admin Dashboard - New Joins List

Create admin panel to see pending users:

```typescript
// src/app/admin/pending-users/page.tsx
// Shows list of is_active=FALSE users
// Buttons: [View] [Approve & Assign Role] [Reject]
```

**Features:**
- List pending users with timestamp
- Search/filter by name or email
- Approve with role assignment
- Reject with reason

### COMMIT 7: Admin Dashboard - Activate User

Implement approval logic:

```typescript
// src/app/api/admin/users/[id]/activate/route.ts
POST /api/admin/users/{memberId}/activate
  Body: {
    role: 'Companionship Delegate' | 'Supervisor' | 'Admin',
    scope: UUID (geographic unit),
    approvedBy: UUID (admin ID),
    notes: string
  }
  
  Result:
  - Set is_active = TRUE
  - Create RoleAssignment
  - Log to approval_audit
```

### COMMIT 8: Protected Routes

Add auth middleware:

```typescript
// src/middleware.ts
Verify:
  1. User authenticated (session/JWT valid)
  2. User is_active = TRUE (approved by admin)
  3. User has required role for route
  
Deny: 401 or 403
```

### COMMIT 9: Login/Logout UI

Update from mocked to real auth:

```typescript
// src/app/app/companionship-panel/page.tsx
  
Before: Static mocked user
After:  
  - Get real user from session
  - Show real name + email
  - Logout button actually logs out
  - Redirect to login if not authenticated
```

### COMMIT 10: Integration Testing

```typescript
// tests/auth.integration.spec.ts
Test flows:
  1. User registers with email + password
  2. User is not active (is_active=FALSE)
  3. Admin sees user in pending list
  4. Admin approves + assigns role
  5. User can now login
  6. User cannot access restricted routes without proper role
```

---

## Technology Stack

```
Frontend:
  - Next.js 14+
  - React Components
  - TailwindCSS (existing)
  - motion/react for animations

Backend Auth:
  - Auth.js v5 (NextAuth successor)
  - Argon2 password hashing
  - speakeasy for TOTP/2FA
  - jsonwebtoken for JWT

Database:
  - PostgreSQL (via Vercel Postgres or local Docker)
  - Prisma ORM (for type-safe queries)

External (Post-POC):
  - Google OAuth
  - Facebook OAuth
  - (Email service - deferred until Phase 2)
```

---

## Key Differences from Open Services

| Aspect | Open Service | emmaCompanionship |
|--------|---|---|
| **Registration** | Self-service | Form + Admin approval |
| **Email verification** | Automatic (email sent) | Manual (phone/email check) |
| **Activation** | Immediate | Requires admin action |
| **Roles** | Default or self-selected | Admin assigns from roles table |
| **Access control** | Role checked in UI | Role checked at backend + middleware |
| **Admin panel** | Not needed | Required for approvals |
| **User flow** | Register → Verify email → Login | Register → Admin review → Login |

---

## Security Considerations

### Authentication (Who are you?)

✅ **Form-based:**
- Argon2 password hashing (industry standard)
- No passwords in logs
- Password never sent over non-HTTPS

✅ **OAuth:**
- Email verified by provider (no phishing)
- No passwords stored
- Tokens refreshed automatically

### Authorization (What can you do?)

✅ **Role-Based Access Control:**
- Member must have role for feature
- Role scope checked (e.g., Province Delegate can only see their province)
- Middleware validates before API call

✅ **Admin Approval:**
- is_active gate prevents unauthorized access
- All approvals logged in approval_audit
- Phone verification prevents account takeover

✅ **2FA Optional:**
- TOTP compatible with Google Authenticator
- Backup codes for account recovery
- Post-POC feature (not in COMMIT 2-10)

---

## Database Relationships for Auth

```
Member
├─ is_active (admin approval gate)
├─ password_hash (Argon2)
├─ geographicUnitId (where they belong)
│
├─ RoleAssignments (many)
│  ├─ Role (Delegate, Supervisor, Admin)
│  └─ GeographicUnit (scope - where role applies)
│
├─ OAuthIdentities (0 or more)
│  ├─ provider (google, facebook)
│  └─ provider_id (external ID)
│
└─ AuthEvents (many - for security logging)
   ├─ event_type (login, logout, failed_login)
   └─ ip_address, user_agent
```

---

## Implementation Order

**Why this order:**

1. **Schema first** - Everything depends on database
2. **Auth.js setup** - Third-party integration
3. **Domain layer** - Business logic (clean, testable)
4. **Port/Adapter** - Abstraction (enables flexibility)
5. **Admin panel** - Cannot proceed without approving users
6. **Protected routes** - Enforce authorization
7. **UI integration** - Use real auth instead of mocks
8. **Tests** - Verify all flows work

---

## Next Steps

1. Create auth schema migration in `docs/architecture/database-auth.md`
2. Review DB additions needed (oauth_identities, approval_audit, auth_events)
3. Decide: Start with COMMIT 2 (DB schema)?
4. Confirm: Should both form-based AND OAuth be in COMMIT 3, or separate?

Does this align with your vision for the closed system? Should we start with database schema?
