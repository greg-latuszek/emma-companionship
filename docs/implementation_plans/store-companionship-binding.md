# Working Plan: Store Companionship Binding

This is a throwaway plan for the first vertical that lets a Delegate store a
companionship relation. It will be deleted once the slice is running and
`docs/current-architecture.md` is updated.

## Click path (success definition)

Actor: an approved Province Companionship Delegate.

1. From `/app/companionship-panel`, click the new **Akompaniamenty** card.
2. Land on `/app/companionships`.
3. See the list of stored relations, sorted by the accompanied person's last name
   (so couples appear next to each other even without a Couple table).
4. Click **Dodaj akompaniament**.
5. Select an existing **Accompanied** member, an existing **Companion** member,
   optionally change the start date (defaults to today), optionally add notes,
   and save.
6. Return to the list and see the new relation.

## Scope by exclusion — what this slice does NOT touch

- No candidate-proposal engine and no business-rule validation
  (gender, consecrated rules, power-separation, language, experience).
  The Delegate attests that the relation is correct.
- No `Couple` table logic; relations are stored member-to-member.
- No import endpoint; Excel data will be copied in manually through the same UI.
- No graph visualization.
- No health status / meeting dates / approval workflow.
- No authorization beyond the existing OAuth gate.
- No soft delete of members; `companionship_relations` FKs use `ON DELETE RESTRICT`.

## Locked decisions

- Table: `companionship_relations`.
- Columns: `companion_id`, `accompanied_id`, `status`, `start_date`, `end_date`, `notes`.
- Status values: `active`, `archived`.
- Default status: `active`.
- Default start date: today.
- Sort: by accompanied person's last name, then first name.
- New repository port: `ICompanionshipRelationRepository`.
- UI copy language: Polish.

## Out of product

- Cross-province assignment workflow.
- Supervisor relations and power-separation enforcement.
- Automated approval / consent tracking.
- Health views and rebalancing.

## Chunk list

- [x] **Chunk 1 — Contract**
  - Files:
    - `db/migrations/008_companionship_relations.sql`
    - `src/types/companionship-relation.ts`
    - `src/schemas/companionship-relation.ts`
    - `db/tests/schema.test.ts` (add table to expected list)
    - `db/tests/db-connection.ts` (truncate new table)
    - `db/tests/companionship-relations-constraints.test.ts`
    - `vitest.config.ts` (serial db test files)
  - Verify: `npm run db:migrate:test && npm run test:db`
  - Commit message: `Add companionship_relations contract`

- [x] **Chunk 2 — Read persistence**
  - Files:
    - `src/ports/repositories/ICompanionshipRelationRepository.ts`
    - `src/adapters/db/pg/PgCompanionshipRelationRepository.ts`
    - `src/application/list-companionship-relations.ts` + tests
    - `src/di/RepositoryProvider.ts` and `src/adapters/db/pg/PgRepositoryContainer.ts`
  - Verify: `npm run test:db` + `npm test`

- [x] **Chunk 3 — First clickable screen**
  - Files:
    - `src/app/app/companionships/page.tsx`
    - `src/app/app/companionships/CompanionshipRelationList.tsx`
    - `src/app/app/companionship-panel/companionships-panel-card.ts`
    - `src/app/app/companionship-panel/CompanionshipPanel.tsx`
    - `src/types/companionship-relation.ts` and repository/use-case enriched with participant names
    - `db/tests/db-connection.ts`, `db/tests/schema.test.ts`, `src/app/app/members/MirroredHorizontalScroll.tsx` (pre-existing type/lint fixes needed for build)
  - Verify: `npm run build`, `npm test`, `npm run test:db`

- [x] **Chunk 4 — Create mutation**
  - Files:
    - `src/application/add-companionship-relation.ts` + tests
    - `src/app/app/companionships/actions.ts` + tests
    - `src/app/app/companionships/new/page.tsx`
    - `src/app/app/companionships/CompanionshipRelationForm.tsx`
    - `src/app/app/companionships/companionship-relation-form-state.ts`
    - member-picker component reused from existing patterns
  - Verify: create a relation through the UI, see it in the list.

- [ ] **Chunk 5 — Update mutation**
  - Files:
    - `src/application/update-companionship-relation.ts` + tests
    - `src/app/app/companionships/actions.ts` (add update action) + tests
    - `src/app/app/companionships/[id]/edit/page.tsx`
    - Update `CompanionshipRelationForm.tsx` to support edit mode
    - Add `updateCompanionshipRelation` to repository port and adapter
  - Verify: edit an existing relation through the UI, see changes in the list.

- [ ] **Chunk 6 — Delete mutation**
  - Files:
    - `src/application/delete-companionship-relation.ts` + tests
    - `src/app/app/companionships/actions.ts` (add delete action) + tests
    - Add delete button/confirmation to list or detail view
    - Add `deleteCompanionshipRelation` to repository port and adapter
  - Verify: delete a relation through the UI, see it removed from the list.

- [ ] **Chunk 7 — Architecture docs**
  - Update `docs/current-architecture.md` with the new port and live table.
  - Update `docs/application_idea.md` “built today” section if it would lie.

- [ ] **Chunk 8 — Delete this plan**
  - Remove `docs/implementation_plans/store-companionship-binding.md`.

## Status

Chunks 1–4 completed. Ready for Chunk 5 (update mutation).
