# Plan

**Task:** RT-2907 · **Branch:** RT-2907-rt-table-sticky-column
**Draft:** `docs/specs/ui-kit-v2/proposed/table-pinned-column/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/table-pinned-column/`, merged at closing into `docs/specs/ui-kit-v2/table-full-port/`                                                                                              |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                                                                             |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/angular-patterns/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/kit-approval/` |
| Code  | `projects/ui-kit-v2/src/lib/components/table/`                                                                                                                                                                    |

## What counts as done

- A pinned cell of `rt-table` is never transparent and takes the background of its row: header,
  body, hover, problem and total rows, light and dark theme.
- The pinned edge carries a shadow exactly while hidden content lies behind it, for a left and a
  right pin.
- The background and the shadow come from `--rt-*` tokens.
- A story shows every frame of the approved mockup, the showcase matches the mockup by numbers, and
  the owner approves the showcase.
- Scenarios SC-UKV-1114 to SC-UKV-1121 are covered by tests.

## Stages

### 1. Background and shadow of the pinned cell

- **Steps:**
    1. Give every table row a background from a token, and make a pinned cell inherit it.
    2. Draw the edge shadow on the CDK border cell of each pin from shadow tokens, hidden by default.
    3. Name the new tokens in the component description next to the code.
- **Readiness sign:** the styles build and the style linter passes.
- **Verified by:** `pnpm exec stylelint "projects/ui-kit-v2/src/lib/components/table/**/*.scss"` — no errors in the output.

### 2. The shadow follows the scroll

- **Steps:**
    1. Write a pure function that says which pinned edge has hidden content, from the scroll position and the sizes.
    2. Make the table watch the nearest ancestor that scrolls sideways and mark the hidden edges by host modifiers.
    3. Cover the function by unit tests with the scenario ids.
- **Readiness sign:** the unit tests of the table pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/table --maxWorkers=2` — every suite passes.

### 3. Showcase, measurement and approval

- **Steps:**
    1. Add a story of the pinned column with the frames of the mockup.
    2. Measure the showcase against the mockup and make the numbers match.
    3. Cover the browser scenarios by a visual snapshot of the story.
    4. Show the showcase to the owner and record the answer.
- **Readiness sign:** the match line is N of N, and the owner's answer is in the approval record.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no divergence in the output.

## What this work does not do

- `rt-data-table` stays as it is: a separate table with its own styles.
- No input for pinning is added: the application pins by the column definition, as before.
