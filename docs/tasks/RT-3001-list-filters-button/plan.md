# Plan

**Task:** RT-3001 · **Branch:** RT-3001-list-filters-button
**Draft:** `docs/specs/ui-kit-v2/proposed/toolbar-filters/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/toolbar-filters/`                                                                                                              |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/reuse-first.md`, `docs/constitution/lists.md`, `docs/constitution/verifiability.md`                        |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/styling-bem/`                     |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/`, `projects/ui-kit-v2/src/lib/components/aside/header/`, `projects/ui-kit-v2/src/lib/components/icon-button/` |

## What counts as done

- At 375 a list toolbar shows the filters as one `rt-icon-button` with the filter icon; with a
  filter on, the indicator dot sits in the icon corner and no border of the toolbar cuts it.
- The button opens `rt-aside`: title «Фильтры» on one line with the back arrow, no overline, no
  actions; the select fields in the body; the footer «Сбросить» and «Применить» at both ends.
- The second showcase has a story per state — filter off, filter on with the dot, panel open — and
  `node tools/kit-match.mjs numbers` prints N of N against frames 7349-5090 and 7349-4846.
- The approval record holds the mockup and the showcase quotes of the owner.
- A version of `@rt-tools/ui-kit-v2` with the button and the panel is released, by the owner's word.

## Stages

### 1. The agreement

- **Steps:**
    1. Read the kit parts the button and the panel are assembled from
    2. Write the agreement and its scenarios
- **Readiness sign:** the agreement names the public surface, every state and a scenario id each.
- **Verified by:** `pnpm run check:specs` — no refusal

### 2. The kit edit and its tests

- **Steps:**
    1. Put the title of the aside header on one line with the back arrow
    2. Hide the toolbar filters behind the filter button on a narrow screen
    3. Open the filters panel from the button
    4. Keep the indicator dot uncut by the toolbar
    5. Write the tests of the scenarios
- **Readiness sign:** the toolbar, aside header and icon button specs pass, the new tests among
  them.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.spec.ts` — every test passed

### 3. The showcase, the match and the approvals

- **Steps:**
    1. Write the stories of the three states
    2. Measure the stories against the frames and print the match line
    3. Draw the overlay of the whole block
    4. Show the owner the showcase and ask about it
    5. Write the approval record
- **Readiness sign:** the match prints N of N; the record holds both quotes.
- **Verified by:** `node tools/check-kit-approval.mjs` — no refusal for the branch

### 4. Closing and delivery

- **Steps:**
    1. Merge the agreement into the kit spec
    2. Run the specs check, the types, the linters and the tests of the kit
    3. Take the task folder apart into the archive record
    4. Push and open the PR by the owner's word
    5. Release the kit by the owner's word and send the version to the consumer
- **Readiness sign:** the checks are green, the PR is open, the released version is named back.
- **Verified by:** `pnpm run check:specs` — no refusal

## What this work does not do

- It does not edit the consumer's screens: the consumer raises the kit by tasks of its own.
- It does not merge or release without the owner's word about each.
- It does not touch RT-3000 and its branch.
