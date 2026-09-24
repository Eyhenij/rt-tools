# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — the showcase and the checks
- **Done:** the spec, the disabled star, the collapsible block, the width reserve; 201 side-menu tests pass
- **Next step:** stories for the collapsed block, the reserve and the disabled star
- **Uncommitted:** nothing
- **Waiting for the owner:** no; the owner's word: «доделай до остановки нужно срочно взять другую задачу»
- **PR:** not open yet

## Steps

- [x] 1.1 Rules for the disabled star, the collapsible block and the width reserve written into the spec
- [x] 1.2 Scenarios SC-UK-125 and further written into the scenarios
- [x] 1.3 Bindings written into the implementation list
- [x] 2.1 The flag `favoriteDisabled` added to the item type
- [x] 2.2 The candidate check and the block lookup skip the flagged item
- [x] 2.3 The row template draws no star for the flagged item
- [x] 2.4 Tests for the logic and the row
- [x] 3.1 The settings field `favoritesCollapsed` read and kept by the settings logic
- [x] 3.2 The service gives the collapsed ids and writes the state of one section
- [x] 3.3 The block title becomes a toggle with a chevron, labels and the count
- [x] 3.4 Styles of the toggle and the chevron column
- [x] 3.5 Tests for the logic, the service and the block
- [x] 4.1 The menu input `favoriteActionsReserve` and its host mark
- [x] 4.2 Styles of the star, the remove button and the handle without the reserve
- [x] 4.3 Tests for the mark
- [>] 5.1 Stories for the collapsed block, the reserve and the disabled star
- [ ] 5.2 Showcase frames taken and read by eye
- [ ] 5.3 The push gate set run

## Decisions along the way

- **The service does not refuse a flagged id** — it keeps ids only and cannot see the item; the rule now says the person cannot add such an item, the application may. Affected stage of the plan: 2.
- **Scenarios start at SC-UK-134, not 125** — `npm run spec:next-id SC-UK` names 125…133 taken elsewhere. Affected stage of the plan: 1.

## Sessions

### 2026-09-24

- Task #2327 extended with points 1 and 2, branch from `origin/main`, folder written.
- Stage 1: `npm run check:specs` names the six new bindings without code and SC-UK-134…SC-UK-140
  without tests — what stages 2–4 bring; no other divergence of the subdomain.
- Stages 2–4: `pnpm exec nx test @rt-tools/ui-kit --testFile=side-menu` — 201 passed in 10 suites;
  lint, typecheck and build of `@rt-tools/ui-kit` green.
