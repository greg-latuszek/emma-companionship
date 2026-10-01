# Working Plan: Who Needs Companionship

Throwaway plan for the "missing companionship view". Delete it once the slice
runs and `docs/current-architecture.md` describes it.

## Click path (success definition)

Actor: an approved Province Companionship Delegate.

1. On `/app/companionship-panel` the **Akompaniamenty** card shows
   `Brakujące akompaniamenty: N` — a quick glimpse of the remaining job.
2. Click the card → land on `/app/companionships` (tab **Utworzone Akompaniamenty**,
   same content as today: every stored relation, any status).
3. Switch to tab **Brakujące Akompaniamenty** (URL `/app/companionships?tab=missing`).
4. See every person who needs a companion, sorted by last name, first name:
   - fixed first column **Osoba** — `<last_name> <first_name>`, yellow bold like
     the sticky columns of the relations list;
   - toggleable columns **Stan cywilny**, **Typ osoby konsekrowanej**,
     **Zaangażowanie we wspólnocie** (empty engagement shown as `status nieznany`).
5. Click **Przypisz akompaniatora** on a row → `/app/companionships/new?accompanied=<id>`
   with **Akompaniowany** preselected.
6. Pick a companion, save → back on `/app/companionships?tab=missing`; that person
   is gone from the list and the panel count dropped by one.

## Scope by exclusion — what this slice does NOT touch

- No new table, no migration. `companionship_relations` and `members` stay as they are.
- `ICommunityMemberRepository` and `CommunityMember` do not grow.
- `CompanionshipRelationListItem` and the relations list behave as today (only moved into a tab).
- No candidate proposal or rule validation (gender, consecrated rules, power
  separation, language). The form still lists every member as possible companion.
- No couples, geography/province scope, supervision, health data.
- No sort controls on the missing list (fixed order).

## Locked decisions

| Topic | Decision |
|---|---|
| Who needs a companion | Member whose `community_engagement_status` is not `Looker-On` (empty **included**) **and** who appears in **no** `companionship_relations` row as `accompanied_id` — any status. An `archived` relation still counts as "has companion"; the Delegate deletes or edits it to reopen the need. |
| Which members | Every `members` row, same scope as the registry list (login rows included). |
| Port | New method `listPeopleWithoutCompanion()` on `ICompanionshipRelationRepository`. |
| Type | `PersonWithoutCompanion` in `src/types/companionship-relation.ts`: `id`, `first_name`, `last_name`, `marital_status`, `consecrated_status`, `community_engagement_status`. |
| Use case | `listPeopleWithoutCompanion` in `src/application/list-people-without-companion.ts`. |
| Panel count | Panel page calls the same use case and shows `.length`. No separate count query (~200 rows). Card links to the default tab. |
| Tabs | URL query `tab`: absent / unknown → `created` (**Utworzone Akompaniamenty**), `missing` → **Brakujące Akompaniamenty**. Tab links are plain `<Link>`s; server page loads only the data the tab needs. |
| **Dodaj akompaniament** button | Stays, on the Utworzone tab only. |
| Shown columns | All three toggleable columns visible by default; choice stored in `localStorage` under its own key (pattern from `companionship-relation-list-state.ts`). |
| Layout | Cards below `lg`, table from `lg`, same panel width as the relations list. |
| Empty missing list | `Każda osoba ma akompaniatora.` |
| Preselect | `?accompanied=<id>` sets the form's initial `accompanied_id` if the id is a known member; unknown id is ignored. |
| Return after save / cancel | When started from the shortcut, a hidden `return_tab=missing` field makes save redirect, and Anuluj link to `/app/companionships?tab=missing`. Otherwise unchanged (`/app/companionships`). |
| Copy | Polish labels; stored enum values unchanged. Reuse existing Polish label maps for marital / consecrated / engagement. |
| Tests | Vitest, sentence titles, Given / When / Then bodies. SQL rule covered by a db test. |

## Out of product

Candidate proposal and constraints, cross-province search, couples, Zone-level
statistics, health and overwhelmed views.

## Chunk list

- [ ] **Chunk 1 — Read people without a companion**
  - Files:
    - `src/types/companionship-relation.ts` (`PersonWithoutCompanion`)
    - `src/ports/repositories/ICompanionshipRelationRepository.ts`
    - `src/adapters/db/pg/PgCompanionshipRelationRepository.ts`
    - `src/application/list-people-without-companion.ts` + `.test.ts`
    - `db/tests/people-without-companion.test.ts`
    - fake repositories in existing `src/application/*companionship-relation*.test.ts` (new port method stub)
  - Sentence tests (db):
    - `listPeopleWithoutCompanion includes a committed member who is accompanied by nobody`
    - `listPeopleWithoutCompanion includes a member whose engagement status is not filled in`
    - `listPeopleWithoutCompanion leaves out a Looker-On because they are not eligible`
    - `listPeopleWithoutCompanion leaves out a member with an archived relation as accompanied`
    - `listPeopleWithoutCompanion includes a member who is only someone else's companion`
  - Verify: `npm run db:migrate:test && npm run test:db && npm test && npm run type-check`
  - Commit: `Read who is eligible for companionship and has no companion`

- [ ] **Chunk 2 — Tabs on /app/companionships with the missing list**
  - Files:
    - `src/app/app/companionships/companionships-tab.ts` + `.test.ts` (`companionshipsTabFrom(searchParams)`)
    - `src/app/app/companionships/page.tsx` (tab links, load per tab)
    - `src/app/app/companionships/PeopleWithoutCompanionList.tsx` (Osoba column only, cards + table, empty state)
  - Sentence tests:
    - `companionshipsTabFrom opens Utworzone Akompaniamenty when no tab is given`
    - `companionshipsTabFrom opens Brakujące Akompaniamenty when tab is missing`
    - `companionshipsTabFrom falls back to Utworzone Akompaniamenty for an unknown tab`
  - Verify: `npm test`, `npm run build`, browser: both tabs at phone and laptop width.
  - Commit: `Show who needs a companion on its own Akompaniamenty tab`

- [ ] **Chunk 3 — Toggleable columns on the missing list**
  - Files:
    - `src/app/app/companionships/people-without-companion-list-state.ts` + `.test.ts`
    - `src/app/app/companionships/PeopleWithoutCompanionList.tsx`
  - Sentence tests:
    - `peopleWithoutCompanionShownColumns shows every column when nothing was stored`
    - `peopleWithoutCompanionShownColumns restores the columns the Delegate hid`
    - `engagementLabel says status nieznany when the engagement status is empty`
  - Verify: `npm test`, browser: hide a column, leave, come back.
  - Commit: `Let the Delegate choose which details show for people without a companion`

- [ ] **Chunk 4 — Remaining job on the panel card**
  - Files:
    - `src/app/app/companionship-panel/companionships-panel-card.ts` + new `.test.ts`
    - `src/app/app/companionship-panel/page.tsx`
    - `src/app/app/companionship-panel/CompanionshipPanel.tsx`
  - Sentence tests:
    - `companionshipsPanelCard tells how many people still miss a companion`
  - Verify: `npm test`, browser: count matches the Brakujące tab.
  - Commit: `Show the Delegate how many people still wait for a companion`

- [ ] **Chunk 5 — Przypisz akompaniatora shortcut**
  - Files:
    - `src/app/app/companionships/PeopleWithoutCompanionList.tsx` (row link)
    - `src/app/app/companionships/new/page.tsx` (read `accompanied`, pass initial values + return tab)
    - `src/app/app/companionships/CompanionshipRelationForm.tsx` (hidden `return_tab`, Anuluj target)
    - `src/app/app/companionships/companionship-relation-form-state.ts` + test (initial values with preselected accompanied)
    - `src/app/app/companionships/actions.ts` + `actions.test.ts` (redirect by `return_tab`)
  - Sentence tests:
    - `submitNewCompanionshipRelation returns to Brakujące Akompaniamenty when the relation was started there`
    - `submitNewCompanionshipRelation returns to Utworzone Akompaniamenty when started from the add button`
    - `newCompanionshipRelationFormValues preselects the accompanied member who is known`
    - `newCompanionshipRelationFormValues ignores an accompanied id that is not a member`
  - Verify: `npm test`, browser: assign from the missing tab, land back there, row gone.
  - Commit: `Start assigning a companion straight from the person who needs one`

- [ ] **Chunk 6 — Architecture docs**
  - `docs/current-architecture.md` (route table, port table, companionship section)
  - `docs/application_idea.md` "Built today" line
  - `docs/README.md` if it lists screens

- [ ] **Chunk 7 — Delete this plan**

## Status

Plan drafted. Nothing implemented.
