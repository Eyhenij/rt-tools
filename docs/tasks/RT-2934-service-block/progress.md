# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — Closing
- **Done:** grill, plan, the subdomain spec, the component with its entry, spec, stories, overview
  page and context file; the spec, the lint, the package build and the styles linter are green
- **Next step:** take the snapshot references of the four new matrix stories after a look at the
  frames, by `node tools/visual-gate.mjs ui-kit-v2 --update`, with the owner's word
- **Uncommitted:** the task folder, the subdomain spec and the domain indexes, the component folder,
  its entry `projects/ui-kit-v2/service-block/` and the two package barrels
- **Waiting for the owner:** the word on taking the snapshot references
- **PR:** not open yet

## Steps

- [x] 1.1 Write the subdomain spec `docs/specs/ui-kit-v2/service-block/` with numbered scenarios.
- [x] 2.1 Write the component, its template, its styles and its entry.
- [x] 2.2 Write the unit spec, the stories, the overview page and the context file.
- [>] 3.1 Take the snapshot references of the new stories after a look at the frames.
- [ ] 3.2 Take the folder apart into the archive.

## Decisions along the way

- **The part has no model file.** The marks are typed by `IRtServiceLogo.Item`, and the name and
  the description are strings; a second name for the same item type would drift from the first.
  Affected stage of the plan: 2.
- **The block declares the whole width of its place.** In a flex row of the showcase it shrank to
  its text, and the line under it ended with the description. Affected stage of the plan: 2.
- **The story stands among molecules.** The part holds `rt-service-logo`, a part of the kit.
  Affected stage of the plan: 2.
- **The family shows the pair of presets.** Its styles read the text colours and the border
  colour the material preset rewrites. Affected stage of the plan: 2.

## Sessions

### 2026-10-22

- The component «Service Block» `7200:419` was read from the design system file.
- The spec of the part: 4 tests passed. The package lint, the typecheck, the package build, the
  showcase build and the styles linter are green.
- The frames were looked at on the built showcase: the gaps 16 and 2, the bottom padding 20, the
  line 1 in `#e0e0e0`, the name 20/27 semibold, the description 14/21 in `#676767`, the plate 64.
- The first look caught the block shrunk to its text in the showcase row; the block now declares
  the whole width.
