# Plan

**Task:** RT-2927 · **Branch:** RT-2927-rt-stat-tile-delta-unit
**Draft:** `docs/specs/ui-kit-v2/proposed/stat-tile-delta-unit/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/stat-tile-delta-unit/`                                           |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/frontend-application.md`               |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/lib/components/stat-tile/`, `projects/ui-kit-v2/src/lib/i18n/`          |

## What counts as done

- The delta row takes a unit, percent by default, and points read «+10 п.п.» through a kit label.
- The tile takes a «growth is worse» input that swaps the colours of both rows and keeps the arrow.
- Scenarios SC-UKV-1125…1132 are covered by unit tests.
- The showcase shows both units and both colour senses, and the owner approved it.

## Stages

### 1. Code and tests

Every rule of the agreement maps to this stage: the unit field and the points label (rules 1–3),
the hidden unknown base (rule 4), the colour sense and the arrow (rules 5–7).

- **Steps:**
    1. Add the unit field to the delta model
    2. Add the points label to the kit labels
    3. Write the delta text by its unit
    4. Add the «growth is worse» input and the colour sense
    5. Cover SC-UKV-1125…1132 by unit tests
- **Readiness sign:** the spec file of the tile passes, and every scenario number stands in a test title.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-stat-tile.component.spec.ts --maxWorkers=2` — the line `Tests:` with no failed tests.

### 2. Showcase

- **Steps:**
    1. Add the unit and the colour sense to the stories
    2. Check the stories by eye against the mockup
    3. Get the owner's word on the showcase
- **Readiness sign:** the approvals file holds the owner's showcase line.
- **Verified by:** `node tools/check-kit-approval.mjs` — no missing line named.

### 3. Hand-in

- **Steps:**
    1. Merge the agreement into the kit spec
    2. Run the push gate set
    3. Take the task folder apart and open the PR
- **Readiness sign:** the PR is open on the RT-3041 branch as its base.
- **Verified by:** `gh pr view --json number,baseRefName` — the base is `RT-3041-branch-signature-human`.

## What this work does not do

- The application's third unit, an amount written as a ready string: the PR names the difference.
- The icon before a zero delta and the year chip hidden on an unknown base stay as they are.
