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

### COMMIT 2: Database Schema

Add auth-specific tables and fields:

```sql
-- Update members table with:
-- • password_hash (for form-based)
-- • oauth_provider, oauth_id (for OAuth)
-- • is_active (admin approval gate)
-- • geographic_unit_id (admin assigns)
-- • requested_at, approved_by, approved_at (tracking)
-- • registry_check_result (verification checks)
-- • profile_picture (from OAuth or user)

-- Create supporting tables:
-- • role_assignments (member → role → scope)
-- • approval_audit (log all approval decisions)
-- • auth_events (login/logout/failed attempts)
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

Implement registration endpoints:

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
  authMethod: 'form' | 'google' | 'facebook'
}

Response:
{
  memberId: UUID,
  is_active: false,
  requiresAdminReview: true,
  message: "Registration successful. Awaiting admin approval."
}

Actions:
1. Create member with is_active=FALSE
2. Hash password (if form-based)
3. Store OAuth data (if OAuth)
4. Log requested_at timestamp
5. Queue verification checks for admin
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

### COMMIT 6: Admin Dashboard - Pending Approvals

Create admin UI:

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

Click user → Shows verification checks + approval form
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

## Security Considerations

### Authentication (Who are you?)

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

✅ **Role-Based Access:**
- Middleware checks user.role
- Backend validates role for each endpoint

✅ **Audit Trail:**
- All approvals logged (who, when, decision)
- All logins logged (user, provider, timestamp)
- Phone used for manual verification

---

## Next Steps

1. Review and approve this plan
2. Create database schema migration
3. Begin COMMIT 2 (database)
4. Does the manual-only approval approach work for your team?
5. Any questions about verification checks JSON structure?
