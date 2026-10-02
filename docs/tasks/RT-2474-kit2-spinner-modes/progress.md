# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the spec
- **Next step:** the overview table and the spinner stories for the new modes
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The overlay, the plate and the backdrop
- [x] 1.2 The arc look
- [x] 2.1 The spec of the subdomain, its bindings and scenarios
- [>] 2.2 The overview table and the spinner stories for the new modes
- [ ] 2.3 Snapshots for the new stories

## Decisions along the way

- The ring rules are shared by the host and the inner `__ring` through one selector list: the
  check of cascade layers allows nothing but imports before the layer wrapper, so a mixin there
  was refused.
- The overlay layer is the block's own property `--rt-spinner-overlay-z` with the sticky step as
  its default, so it is declared and the token graph sees it; the plate rounding is a property of
  its own for the same rule about direct steps.
- The plate size follows the diameter: the diameter plus a step on each side. At the default
  diameter of 32 that is the 48 pixels the consumer named.
- The host bindings moved from getters to computed values while the file was edited: the kit has
  no getters in components.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
