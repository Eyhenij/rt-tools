# Plan

**Task:** RT-3706 · **Branch:** RT-3706-sheet-specs-preload
**Behaviour:** unchanged — владелец: «продолжай работу над основным эпиком»; правятся спеки, номера сценариев, имя обёртки витрины и порог проверки веса, вид и поведение кита после слияния главной не меняются

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** after the merge of the main branch into the epic RT-3530 (`f64fa65e7`) the push set is red on
  four steps: the kit specs (4 failed, 38 passed of 42 in four files), `check-specs` (7 scenario numbers
  taken twice), `check:ngdoctor` (filename-class-mismatch 527 → 528, missing-spec-file 539 → 540, both
  `test-date-sheet.component.ts`) and `check:kit-weight` (the set 185800 → 218731 bytes by the epic's own
  sheet parts; the lazy sheet of the popover stays in its own chunk).
- **This task reaches:** the epic branch with the main branch merged in passes the push set, so the epic
  can go to the main branch.
- **Sign:** the four check lines of the stages exit 0, and the push set run ahead prints «the set is green».
- **Milestone G of the epic:** all edits of the epic are merged into the main branch and ready for a kit
  release.
- **Metric:** нет: слияние главной в эпик сломало спеки шторок, номера сценариев, имя обёртки витрины и вес кита

## Decision

Решения нет: работа переименовывает номера сценариев и один файл обёртки витрины, добавляет ожидание в спеки и записывает порог веса; новых символов нет.

## Task footprint

| What             | Where                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Specs (правится) | `docs/specs/ui-kit-v2/sheet-header-cards/`, `docs/specs/auth/theme/`, `docs/specs/message-bus/admin-shell/` |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.spec.ts` |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts`     |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts`               |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-templates.spec.ts`             |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/date-picker/stories/`                                   |
| Code (правится)  | `tools/kit-weight-threshold.json`                                                              |
| Code             | `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts`, `tools/check-kit-weight.mjs` |
| Rules            | `.claude/skills/testing/`, `.claude/skills/git-workflow/`, `.claude/skills/spec-driven/`        |

## What counts as done

- The four sheet specs wait for the sheet code in `beforeAll`, every assertion as it was.
- The epic's scenarios that collided with the main branch have numbers of their own: SC-UKV-1780…1784 of
  `sheet-header-cards` become SC-UKV-1914…1918, SC-AUTH-121 of `auth/theme` becomes SC-AUTH-123, SC-MB-458
  of the narrow section list becomes SC-MB-460, with their test titles.
- The showcase wrapper of the date sheet is named by its class and has its spec.
- The kit weight check agrees with its threshold, by the way the owner names.
- The push set run ahead is green.

## Stages

### 1. Specs wait for the sheet code

- **Steps:**
    1. Add `await rtPreloadPopoverSheet()` in `beforeAll` of the four sheet specs
       Check: `cd projects/ui-kit-v2 && pnpm exec jest --maxWorkers=2 src/lib/components/table/filter-header/rt-table-filter-header.component.spec.ts src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts src/lib/components/multiselect/rt-multiselect-sheet.spec.ts src/lib/components/popover/rt-popover-sheet-templates.spec.ts` → exit 0
- **Readiness sign:** the four specs pass 42 of 42.
- **Verified by:** the check of step 1.1 — exit 0.

### 2. Scenario numbers of their own

- **Steps:**
    1. Renumber the epic's colliding scenarios and their test titles
       Check: `node tools/check-specs.mjs` → exit 0
- **Readiness sign:** `check-specs` names no number taken twice.
- **Verified by:** the check of step 2.1 — exit 0.

### 3. Showcase wrapper named by its class

- **Steps:**
    1. Rename the date sheet wrapper by its class and give it a spec
       Check: `pnpm run check:ngdoctor` → exit 0
- **Readiness sign:** Angular Doctor prints no new finding.
- **Verified by:** the check of step 3.1 — exit 0.

### 4. Kit weight agrees with the threshold

- **Steps:**
    1. Bring the kit weight and its threshold together by the way the owner names
       Check: `pnpm run check:kit-weight` → exit 0
    2. Run the whole kit suite
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --skip-nx-cache` → exit 0
- **Readiness sign:** the weight check and the kit suite are green.
- **Verified by:** the checks of steps 4.1 and 4.2 — exit 0 each.

## What this work does not do

- The code of the sheet and of the aside after the merge is not edited: it is merged in the epic branch.
- The showcase snapshots and the end-to-end suites run in the push set ahead before the push, not as steps
  here; a red one is a finding of this task.
- RT-3605 moved to the epic RT-3705 and is not touched here.
