# Plan

**Task:** RT-3706 · **Branch:** RT-3706-sheet-specs-preload
**Behaviour:** unchanged — владелец: «продолжай работу над основным эпиком»; правятся только четыре спеки шторок, код кита после слияния главной не меняется

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** after the merge of the main branch into the epic RT-3530 the code of the popover sheet is
  loaded at the first opening, and four specs of the epic fail one case each: 4 failed, 38 passed of 42.
- **This task reaches:** every spec of the kit is green on the epic branch with the main branch merged
  in, so the epic can go to the main branch.
- **Sign:** `cd projects/ui-kit-v2 && pnpm exec jest --maxWorkers=2 <the four specs>` exits 0, and
  `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2` exits 0.
- **Milestone G of the epic:** all edits of the epic are merged into the main branch and ready for a kit
  release.
- **Metric:** нет: после слияния главной четыре спеки шторок эпика не ждали подгрузки кода шторки

## Decision

Решения нет: правка добавляет в четыре спеки ожидание `rtPreloadPopoverSheet()` и не вводит ни одного символа.

## Task footprint

| What             | Where                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.spec.ts` |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts` |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect-sheet.spec.ts`          |
| Code (правится)  | `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet-templates.spec.ts`        |
| Code             | `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.helper.ts`                |
| Rules            | `.claude/skills/testing/`, `.claude/skills/git-workflow/`                                 |

## What counts as done

- The four specs wait for the sheet code in `beforeAll`, as the specs of the main branch do, and every
  assertion stays as it was.
- The whole kit suite is green.

## Stages

### 1. Specs wait for the sheet code

- **Steps:**
    1. Add `await rtPreloadPopoverSheet()` in `beforeAll` of the four sheet specs
       Check: `cd projects/ui-kit-v2 && pnpm exec jest --maxWorkers=2 src/lib/components/table/filter-header/rt-table-filter-header.component.spec.ts src/lib/components/dynamic-selector/rt-dynamic-selector-sheet.spec.ts src/lib/components/multiselect/rt-multiselect-sheet.spec.ts src/lib/components/popover/rt-popover-sheet-templates.spec.ts` → exit 0
    2. Run the whole kit suite
       Check: `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --skip-nx-cache` → exit 0
- **Readiness sign:** the four specs pass 42 of 42, and the kit suite passes whole.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --skip-nx-cache` — exit 0.

## What this work does not do

- The code of the sheet and of the aside after the merge is not edited: it is merged in the epic branch.
- RT-3605 moved to the epic RT-3705 and is not touched here.
