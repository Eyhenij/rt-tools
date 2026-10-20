# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — Closing
- **Done:** the component, the tests, the snapshots, the subdomain spec
- **Next step:** take the folder apart
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the fit, the «More» item and its panel.
- [x] 1.2 Write the unit spec, the story and the snapshots.
- [x] 2.1 Write the subdomain spec and bind its rules.
- [>] 2.2 Take the folder apart into the archive.

## Decisions along the way

- **The list keeps `row wrap`.** Without wrapping the list declares the width of all its sections
  and widens a container that sizes itself by the header. The fit moves a section into «More»
  before it could wrap. Affected stage of the plan: 1.
