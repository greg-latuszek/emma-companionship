# Organic Growth Refactor - Checklist

**Branch**: `refactor_to_organic_growth`

## Phase 0: Initial Setup
- [ ] Read `docs/refactor_to_organic_growth.md` (context from previous session)
- [ ] Move documentation to archive (see refactor doc for commands)
- [ ] Delete existing Next.js/Nx scaffolding (if any)
- [ ] `npx create-next-app@latest` with TypeScript + Tailwind
- [ ] Create `docker-compose.yml` for PostgreSQL
- [ ] `npm install prisma @prisma/client`
- [ ] `npx prisma init`
- [ ] Configure `.env` with DATABASE_URL
- [ ] Create initial Prisma schema (Member, GeographicUnit, Couple)
- [ ] `npx prisma migrate dev --name init`
- [ ] `docker-compose up -d` (verify DB running)
- [ ] `npm run dev` (verify app starts)

## Phase 1: Structure Simplification
- [ ] Verify folder structure matches `docs/refactor_to_organic_growth.md`
- [ ] Delete any Unified Project Structure remnants
- [ ] Remove Nx config (if present)
- [ ] Confirm clean, flat structure

## Phase 2: Feature #1 - Member Management
- [ ] Create API endpoint: POST /api/members
- [ ] Create API endpoint: GET /api/members (list)
- [ ] Create API endpoint: GET /api/members/[id] (detail)
- [ ] Create API endpoint: PUT /api/members/[id] (update)
- [ ] Create MemberForm component
- [ ] Create MemberList component
- [ ] Create MemberDetail component
- [ ] Create pages/members layout
- [ ] Add constraint validation (gender, status, languages)
- [ ] Add tests for constraints
- [ ] Add tests for API endpoints
- [ ] UI polish and iterate
- [ ] Test Member CRUD end-to-end

## Phase 3: Feature #2 - Relationships (Next)
- [ ] Plan after Phase 2 is solid
- [ ] Expand Prisma schema
- [ ] Build based on what you learned in Phase 2

## Documentation (Ongoing)
- [ ] Extract `CONSTRAINTS_CHECKLIST.md` from application_idea.md
- [ ] Extract `TERMINOLOGY.md` from application_idea.md
- [ ] Extract `WORKFLOWS_QUICK_REF.md` from application_idea.md
- [ ] Create `DATABASE.md` (after schema is finalized)
- [ ] Create `API_ENDPOINTS.md` (as endpoints are built)
- [ ] Create `DEVELOPMENT.md` (local setup guide)
- [ ] Create `README.md` (entry point, quick start)

---

**Current Status**: Documentation complete, ready for Phase 0 setup  
**Last Updated**: Sep 7, 2026
