# Plan

**Task:** RT-3294 · **Branch:** RT-3294-table-lists-error-state
**Draft:** `docs/specs/ui-kit-v2/proposed/error-states-lists/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** a table or a list whose load failed shows the empty placeholder or nothing, and the reader
  cannot repeat the load; only the table lets the consumer replace its empty view.
- **This task reaches:** `rt-table`, `rt-data-list`, `rt-dynamic-list` and `rt-bar-list` show a
  load error with a «Повторить» button and take their own empty and error views by templates.
- **Sign:** the showcase stories of every state of the four components match the frames 7910:2186,
  7911:1755, 7912:1028 and 7912:1214; the owner approves the showcase.
- **Milestone G of the epic:** every component of the list holds one contract — input `error`,
  output `retry`, the empty and error slots.
- **Metric:** нет: a repair — the error of a load was shown as an empty list or not at all.

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/proposed/error-states-lists/`, `docs/specs/ui-kit-v2/error-states/` |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/` — `table`, `data-list`, `dynamic-list`, `bar-list` |

## What counts as done

- Each of the four components has `error`, `errorDescription`, `retry` and its two template
  directives; the default error view is `rt-empty-state` built by `rtLoadErrorView`.
- `#rtTableEmpty` still replaces the table empty view.
- Every scenario SC-UKV-1279…1286 is covered by a spec.
- The showcase has a story of the error and both own views per component, measured against the
  frames, and the owner approved it.

## Stages

### 1. The table and the data list

- **Steps:**
    1. Add `error`, `errorDescription`, `retry`, `rtTableEmptyState` and `rtTableError` to `rt-table`
    2. Add `error`, `errorDescription`, `retry`, `rtDataListEmpty` and `rtDataListError` to `rt-data-list`
    3. Cover SC-UKV-1279…1282 and SC-UKV-1285 by the specs
- **Readiness sign:** the specs of both components pass with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-table --output-style=static` — «Tests: N passed» with no failed

### 2. The dynamic list and the bar list

- **Steps:**
    1. Add `error`, `errorDescription`, `retry`, `rtDynamicListEmpty` and `rtDynamicListError` to `rt-dynamic-list`
    2. Add `error`, `errorDescription`, `retry`, `rtBarListEmpty` and `rtBarListError` to `rt-bar-list`
    3. Cover SC-UKV-1283, SC-UKV-1284 and SC-UKV-1286 by the specs
- **Readiness sign:** the specs of both components pass with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-bar-list.component.spec --output-style=static` — «Tests: N passed» with no failed

### 3. The showcase

- **Steps:**
    1. Add a story of the error and both own views for each of the four components
    2. Compare the stories with the frames by measurement and show them to the owner
- **Readiness sign:** the match line is N of N, and the owner's word on the showcase is written.
- **Verified by:** `node tools/check-kit-approval.mjs` — «no visible kit edit without approvals»

## What this work does not do

- Selectors, local placeholders and the PDF viewer — task RT-3295.
- A load more error row — none of the four frames draws one.
