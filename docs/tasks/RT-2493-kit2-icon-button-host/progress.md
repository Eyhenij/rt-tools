# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the private steps, the sizes xs and 2xs, the header without its override
- **Next step:** the spec bindings and scenarios
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Private steps for size and background, read under the public properties
- [x] 1.2 The sizes xs and 2xs
- [x] 1.3 The header without its dead override
- [>] 2.1 The spec of the subdomain, its bindings and scenarios
- [ ] 2.2 The overview tables and the stories for the new sizes and the host rule
- [ ] 2.3 Snapshots for the new stories

## Decisions along the way

- The private steps are `--rt-icon-button-size-step` and `--rt-icon-button-bg-variant`, not the
  requested `--_rt-…`: the styles linter refuses a name that is not kebab-case.
- Five kit components (pagination, the data table, its cell and filter cell, the list settings
  panel) set the button size on the inner button; they now write the step. The token graph counted
  their declaration as the kit declaring the public property and refused its fallback; with the step
  the application's property keeps the last word over them too.
- The header's test of its 35 px override became a test that it sets no size on the tag.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
