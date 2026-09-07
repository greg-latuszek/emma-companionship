# Refactor to Organic Growth - Session Notes

**Date**: Sep 7, 2026  
**Branch**: `refactor_to_organic_growth`  
**Status**: Planning phase complete, ready for implementation

---

## 🎯 Problem Diagnosis

### What Went Wrong
The previous approach was **overengineered**:
- Spent enormous time researching technologies, deployment, architecture
- Built "production-grade" planning with comprehensive documentation
- Created rigid structure: Unified Project Structure + Nx scaffolding simultaneously
- Result: Even project scaffolding failed due to complexity overhead
- **Root cause**: Tried to enforce perfect architecture from day 1, before understanding actual development flow

### The Trap
This is the classic **"Planning Trap"**:
- ✅ Planning and research were good and thorough
- ❌ But implementation assumptions didn't match reality
- ❌ All the abstraction became a blocker instead of enabler
- ❌ Designed for a team of 5+, not solo development

---

## 💡 Key Insights (Validated)

1. **Domain knowledge is valuable** - Constraints, rules, workflows, DB model all solid
   - Keep the deep understanding of the problem
   - Discard the prescriptive structure

2. **Organic growth > Top-down planning** - For solo development
   - Start small, build one feature end-to-end
   - Let folder structure emerge from actual needs
   - Patterns emerge faster than planned

3. **Quick feedback loop is critical** - Need visual effects
   - Build feature by feature, full-stack (not backend-first)
   - See it work in UI immediately
   - Adjust rapidly based on what feels right

4. **Tests matter, TDD doesn't** - For POC phase
   - Write tests for confidence, not for mandate
   - Focus on critical business logic validation
   - Avoid premature test infrastructure

---

## 🚀 Chosen Path: Option B - Evolutionary Refactor

### Why This Path
- Keep existing repo (no wasted work feeling)
- Each feature builds organically into structure
- Incrementally delete/simplify as patterns emerge
- Transform documentation into practical references

### What Changes From "Production-Grade" Approach
```
BEFORE (Planned):                AFTER (Organic):
- Nx + Next.js combo             - Plain Next.js locally
- Unified Project Structure      - Natural folder emergence
- Vercel Postgres immediately    - Docker local PostgreSQL
- Module boundaries pre-defined   - Boundaries emerge from code
- Deployment planned from start  - Deploy after 2-3 features work
- TDD enforced                    - POC pace, tests for confidence
```

---

## 📚 Documentation Strategy

### Keep in `docs/` (Active Reference)
These stay at root for AI agent prompting without archive burden:

```
docs/
├── README.md                      (Entry point, 2min overview)
├── application_idea.md            ✅ INTACT (source of truth, all domain rules)
├── adr.md                         (kept for reference)
├── CONSTRAINTS_CHECKLIST.md       (extract from idea: 8 rules as table)
├── TERMINOLOGY.md                 (extract from idea: glossary of 20+ terms)
├── WORKFLOWS_QUICK_REF.md         (extract from idea: 8 workflows as flowchart)
├── DATA_MODEL.md                  (TypeScript interfaces, from data-models.md)
├── DATABASE.md                    (Create when Prisma schema done)
├── API_ENDPOINTS.md               (Create as endpoints are built)
├── DEVELOPMENT.md                 (Local setup, Docker, testing approach)
└── CODING_STANDARDS.md            (Style guide, conventions)
```

**Principle**: Each doc is <2KB, scannable, extractive (never competing with application_idea.md)

### Archive to `_archived_docs/` (Reference Only)
Keep parallel, don't nest:

```
_archived_docs/
├── prd/                           (Original PRD planning - reference only)
├── architecture/                  (Original architecture planning - reference only)
├── research/                       (Tech exploration docs)
├── qa/                             (Old QA assessments)
├── stories/                        (Original story format)
├── project-brief.md               (Original brief - superseded by idea)
├── risks.md                        (Original risks - keep for reference)
└── changes_to_make.md             (Implementation notes)
```

**Usage**: Point future sessions to this when context is needed, but default workflow is from `docs/`

---

## 🏗️ Tech Stack (FINAL DECISION)

### Stack
- **Frontend**: Next.js 14+ (keep TypeScript, server-side security)
- **Backend**: Next.js API routes (serverless, simple, type-safe)
- **Database**: PostgreSQL 16 (local Docker for development)
- **ORM**: Prisma (for type safety + migrations)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Testing**: Jest + React Testing Library + Supertest (when needed, not TDD mandate)
- **Build**: Plain Next.js (NO Nx for now - too complex)

### Local Dev Setup
```bash
# Database in Docker
docker-compose up -d

# Then standard Next.js dev
npm run dev
```

---

## 🎯 Implementation Path (4 Phases)

### **Phase 0: Setup (1-2 hours)**
```bash
# 1. Minimal Next.js scaffolding (clean slate)
npx create-next-app@latest --typescript --tailwind

# 2. Docker Compose for PostgreSQL
# file: docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: emma_dev
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: emma_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:

# 3. Initialize Prisma
npm install prisma @prisma/client
npx prisma init

# 4. Configure .env
DATABASE_URL="postgresql://emma_dev:dev_password@localhost:5432/emma_db"

# 5. Create initial schema (Member, GeographicUnit, Couple)
# file: prisma/schema.prisma
(See INITIAL_SCHEMA section below)

# 6. Run migration
npx prisma migrate dev --name init
```

### **Phase 1: Simplify Structure (1 hour)**
Leverage built-in Next.js structure (no artificial layers):
```
app/
├── page.tsx
├── layout.tsx
└── api/
    └── members/        (grows organically)

components/
├── member/            (emerges as needed)

lib/
├── db.ts              (Prisma client)
├── constraints.ts     (validation rules)
└── types.ts           (TypeScript interfaces)

prisma/
└── schema.prisma
```

### **Phase 2: Feature #1 - Member Management (2-4 hours)**

**Feature Scope**: "Add and View Community Members"

**Visual Flow**:
1. Dashboard with "Add Member" button
2. Form to create member (name, gender, status, province, languages)
3. Submit → confirmation → back to list
4. List view shows all members with key fields
5. Click member → detail view with edit capability

**Build Order**:
1. Prisma schema (Member, GeographicUnit) - finalize data model
2. API endpoint: POST /api/members (create)
3. API endpoint: GET /api/members (list)
4. Frontend: Member form component
5. Frontend: Member list component
6. Frontend: Routing (pages)
7. Tests: Constraint validation, API happy path
8. Iterate based on what feels right

**Constraints to Validate** (from application_idea.md):
- Gender: male | female (required)
- Community engagement status: one of 5 values
- Accompanying readiness: one of 6 values (default: "Not Candidate")
- Languages: at least one (required)
- Geographic unit: required (member must belong to province/sector)

### **Phase 3: Feature #2 - Relationships (4-6 hours)**

Build after Feature #1 feedback. At this point:
- Prisma schema expands (Couple, RoleAssignment, CompanionshipRelation, SupervisionRelation)
- You understand actual folder needs
- Pattern emerges: what components repeat?
- Structure organically solidifies

---

## 📊 Emerging Folder Structure (Let It Grow)

**Don't force this upfront.** After Feature #1, you'll see:

```
app/
├── page.tsx                       (dashboard)
├── layout.tsx
├── api/
│   └── members/
│       ├── route.ts              (POST create, GET list)
│       └── [id]/
│           └── route.ts          (GET detail, PUT edit, DELETE)
├── members/
│   ├── page.tsx                  (list view)
│   ├── add/
│   │   └── page.tsx              (form page)
│   └── [id]/
│       ├── page.tsx              (detail view)
│       └── edit/
│           └── page.tsx          (edit form)

components/
├── MemberForm.tsx                (create/edit form)
├── MemberList.tsx                (table component)
└── MemberDetail.tsx              (read-only profile)

lib/
├── db.ts                         (Prisma client singleton)
├── constraints.ts                (validation: gender, status, etc)
├── types.ts                      (TypeScript interfaces from Data Model)

prisma/
└── schema.prisma

tests/
├── lib/
│   └── constraints.test.ts       (validate business rules)
└── api/
    └── members.test.ts           (endpoint tests)
```

**This structure emerges naturally.** Don't create it upfront.

---

## ✅ Success Criteria for This Refactor

After **1 week of work**, you should have:

- ✅ Local PostgreSQL in Docker running
- ✅ Member CRUD working end-to-end
- ✅ Can create a member, see it in list
- ✅ Basic validation (gender, status, languages)
- ✅ Quick tests for critical rules (not comprehensive, but confidence)
- ✅ **Momentum feeling** - not blocked by structure, making visible progress
- ✅ Clear understanding of what "natural next feature" is

---

## 📝 Decision Framework (Reference)

When in doubt during development:

```
Q: "Should I create /libs/ui for shared components?"
A: Only when you've written the SAME component 3 times.

Q: "Should I set up Storybook / E2E tests?"
A: Build the app first. Add when iteration slows.

Q: "Should I deploy to Vercel now?"
A: No. Build 2-3 features locally first. See what works.

Q: "Should I write tests for everything?"
A: Write tests for:
   - Constraint validation (business logic)
   - Data transformations
   - Edge cases you find bugs in
   - NOT for 100% coverage mandate

Q: "Should I use Nx / monorepo structure?"
A: Not yet. Plain Next.js is cleaner for now.
   Add only when you have multiple independent projects.

Q: "What if my folder structure looks 'wrong'?"
A: If it works and you can find things, it's right.
```

---

## 🔄 Next Steps (When Resuming)

1. **Create this in branch**: `refactor_to_organic_growth` ✅ (already done)

2. **Move documentation** (5 min):
   ```bash
   mkdir -p _archived_docs
   mv docs/prd _archived_docs/
   mv docs/architecture _archived_docs/
   mv docs/research _archived_docs/
   mv docs/qa _archived_docs/
   mv docs/stories _archived_docs/
   mv docs/project-brief.md _archived_docs/
   mv docs/risks.md _archived_docs/
   mv docs/changes_to_make.md _archived_docs/
   ```

3. **Phase 0 Setup** (1-2 hours):
   - Fresh Next.js scaffolding
   - Docker Compose PostgreSQL
   - Prisma init + initial schema

4. **Phase 2 Development** (2-4 hours):
   - Build Member CRUD end-to-end
   - See it in UI
   - Get momentum

---

## 📌 Key Principle to Remember

> **"Start small, build organically, let structure emerge from actual needs, not from planning."**

The domain knowledge (application_idea.md) is solid and complete. The problem was imposing rigid structure before understanding the flow. This refactor uses the good domain knowledge but drops the architectural prescription.

---

## 🔗 Related Documents

- `application_idea.md` - Source of truth for domain (keep reading this)
- `_archived_docs/architecture/` - Original thinking (reference only, don't force)
- `_archived_docs/prd/` - Original requirements (reference for Phase 2+)

---

**Session Completed**: Sep 7, 2026, 22:08 UTC+2  
**Next Session**: Resume from Phase 0 Setup
