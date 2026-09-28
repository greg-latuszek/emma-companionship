---
name: feature-recipe
description: Plan and ship a product slice in reviewable chunks, then delete the working plan. Use when starting a feature, implementation plan, next vertical, CRUD slice, or when the user asks to chunk work, lock decisions, or grow the app organically.
---

# Feature recipe

How this repo ships a slice: a short **working plan** (chat or a throwaway file), **one chunk = one commit = one human review**, then **docs in `current-architecture.md`**. Delete the plan after that. Code + live docs are the product; plans are not backlog.

Read `docs/current-architecture.md` and `docs/organic-growth.md` first. Do not restore archived plans.

## Plan only what a person can click

1. **Click path** — the success definition. Actor, trigger, screens, what “done” looks like in the browser.
2. **Scope by exclusion** — list fields/ports/layers that stay untouched; everything else in the slice is in. Name the existing type/port that must not grow “while we are here”.
3. **Locked decisions** — ports, defaults, delete vs soft, copy language, test style. Change the plan first if one must move; do not re-open them mid-chunk.
4. **Out of product** — domain that exists in the idea doc but is not this slice. One line, not a future architecture.
5. **Chunk list** — dependency order, allowed files per chunk, sentence tests, verify command, proposed commit message.

Stop. Do not plan the next feature. Do not scaffold unused tables, vendors, or hexagon layers.

If the follow-up after a working screen is small, **agree commit count in chat** — do not write a second plan file.

## Ask the human (do not guess)

**Boundary**

- Which live port/type stays login/auth-only vs which new noun this slice owns?
- Empty / omit / DB default — what does the application send?
- Neighboring columns: display-only vs write? Unused columns: omit from SELECT and UI; do not invent helper columns.

**UI**

- Which existing surface should this match (do not invent a third look)?
- Copy language? Stored enum values stay as the DB named them; translate labels only.
- Empty, error, and “this row is special” (e.g. cannot delete) states?
- Layout: **viewport width**, not user-agent. Always-visible fields vs optional? Load-all vs paginate — how many rows?

**Preference / session** (only if something must be remembered)

- Whose: login identity, registry entity, or this browser?
- Empty column = default? Apply without sign-out? Survive Edit/back in this browser only, or every device?

**Process**

- How many commits for this extra? Halt after each, or continue until told to wait?

## Chunk order (generic)

Keep each chunk reviewable without reading later ones. If you need files outside the list, the chunk is too big — split.

1. **Contract** — types, write schema, defaults, CHECKs. No SQL UI.
2. **Read persistence** — port + adapter + list/find. No widgets.
3. **First clickable screen** — navigation + list/empty. No writes yet.
4. **Each mutation** — persistence chunk, then UI chunk (add, then edit, then destroy). Policy and confirm live with the destroy UI.
5. **Architecture docs** — `docs/current-architecture.md` + `docs/README.md` (and idea-doc “built today” if it would lie). Honest unused schema. Do not paste the plan into architecture.
6. **Delete the working plan.** Truth is code + those docs.

After every chunk: app still builds, tests you care about pass, the previous vertical still works. Halt for review unless the human said to continue.

## After the first clickable screen

Expect a **feedback loop larger than the original UI chunk**. That is success, not scope failure. Probe; do not dump extras into leftover plan chunks.

| After seeing it, ask | Typical miss |
|---|---|
| Does chrome match the rest of `/app`? | New pages in a different visual language |
| Can they reach every control at laptop and phone width? | Narrow max-width, hidden overflow, global scrollbar CSS |
| Must sort / shown fields / filters survive leaving the page? | In-memory only until remount |
| Must a setting apply now? | Persist + full reload / re-login |
| Sticky or overlay on a decorative background? | Opaque “fix” that fights the look; ask before inventing contrast tricks |
| Conditional field from another field? | Always-on control that is invalid in domain |
| Display of an auth-owned field (photo, email)? | Write path accidentally growing |

Browser-check after UI chunks. A screenshot is not the click path.

## Review bar (human can answer yes)

1. One job, named in the chunk title?
2. Names are nouns/verbs from the locked table?
3. Tests are sentences; bodies Given / When / Then?
4. Earlier verticals intact?
5. New copy in the product language?
6. Out-of-scope columns/ports untouched?

## Finish

- Live docs describe **what runs**, including extras that landed from feedback.
- Working plan **removed** (not archived as backlog).
- Do not commit `.cursor/` unless the human asked to save a recipe/rule change.
