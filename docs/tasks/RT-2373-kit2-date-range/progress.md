# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 5 of 6 — Showcase and docs
- **Done:** the spec of the subdomain, the range logic, the calendar hover, the panel and the field with their specs
- **Next step:** the stories of the field and the panel
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the date-range subdomain spec
- [x] 1.2 Write its scenarios and binding lines
- [x] 2.1 Write the pure module for the range: the order of two days, the month states, the presets, the summary and the text
- [x] 2.2 Cover it by its spec
- [x] 3.1 Give `rt-calendar` a hover output for the range preview
- [x] 3.2 Cover it by its spec
- [x] 4.1 Write the range panel with the presets, two months and the footer
- [x] 4.2 Write the range field with the popover and the bottom sheet
- [x] 4.3 Cover the panel and the field by their specs
- [>] 5.1 Show the field states, the panel states and the narrow screen in the stories
- [ ] 5.2 Write the overview page and the context of the field
- [ ] 5.3 Take the snapshots
- [ ] 6.1 Run the full set of checks

## Decisions along the way

- **The sheet carries the title «Период» from the kit labels** — the mockup draws it, and the bottom
  sheet has no title input. Affected stage of the plan: 4.
- **The summary in the sheet shows only the number of days** — the phone frame of the mockup does so.
  Affected stage of the plan: 4.

- **The scenario of the date text of the previous task moved from `SC-UKV-430` to `SC-UKV-467`** —
  the number was taken by the side menu branch; the fix went into the previous branch and came here
  by the chain. Affected stage of the plan: none.

## Sessions

### 2026-09-30

- The mockup read: the panel states, the field states and the phone frame.
- The spec `docs/specs/ui-kit-v2/date-range/` with scenarios `SC-UKV-468`…`SC-UKV-478`; `npm run check:specs` exit 0.
- Specs: the range logic 8, the panel 9, the field 10 — 27 of 27; the calendar 20 of 20; the kit typecheck green.
