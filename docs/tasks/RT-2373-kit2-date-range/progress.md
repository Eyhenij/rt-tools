# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 6 of 6 — Closing
- **Done:** the spec, the logic, the calendar hover, the panel and the field with specs, the stories, the overview page and 12 references
- **Next step:** the full set of checks, then the archive record and the PR
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
- [x] 5.1 Show the field states, the panel states and the narrow screen in the stories
- [x] 5.2 Write the overview page and the context of the field
- [x] 5.3 Take the snapshots
- [>] 6.1 Run the full set of checks

## Decisions along the way

- **The sheet carries the title «Период» from the kit labels** — the mockup draws it, and the bottom
  sheet has no title input. Affected stage of the plan: 4.
- **The summary in the sheet shows only the number of days** — the phone frame of the mockup does so.
  Affected stage of the plan: 4.

- **The scenario of the date text of the previous task moved from `SC-UKV-430` to `SC-UKV-467`** —
  the number was taken by the side menu branch; the fix went into the previous branch and came here
  by the chain. Affected stage of the plan: none.

- **The range band is solid, and the day under the pointer is light** — the mockup draws both. The
  calendar got two own properties, the column gap and the inner radius of a range; their defaults
  are the former values, so the booking look does not move. Affected stage of the plan: 3.
- **The themes story of the panel shows the sheet layout** — the half of a theme is narrower than
  the wide panel; the colours of both layouts are the same. Affected stage of the plan: 5.

## Sessions

### 2026-09-30

- The mockup read: the panel states, the field states and the phone frame.
- The spec `docs/specs/ui-kit-v2/date-range/` with scenarios `SC-UKV-468`…`SC-UKV-478`; `npm run check:specs` exit 0.
- Specs: the range logic 8, the panel 9, the field 10 — 27 of 27; the calendar 20 of 20; the kit typecheck green.
- The sweep over the showcase: 654 stories and 87 overview pages, no empty showings. The snapshot
  run: 673 of 673, the 12 new references confirmed by a second raising.
