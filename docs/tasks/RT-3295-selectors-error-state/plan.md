# Plan

**Task:** RT-3295 · **Branch:** RT-3295-selectors-error-state
**Draft:** `docs/specs/ui-kit-v2/proposed/error-states-selectors/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** a server selector whose options failed to load shows «ничего не найдено», and the person
  cannot repeat the load; the local lists and the PDF viewer draw their own placeholder, and the
  consumer cannot replace it.
- **This task reaches:** the two server selectors show the load error with «Повторить» and take
  both own views; the six local lists take an own empty view; the PDF viewer takes an own error
  view.
- **Sign:** the showcase stories match the nine frames 7916:1591, 7916:896, 7917:5371, 7917:5407,
  7917:5443, 7917:5456, 7917:5472, 7917:5561 and 7917:583; the owner approves the showcase.
- **Milestone G of the epic:** every component of the list holds one contract — input `error`,
  output `retry`, the empty and error slots.
- **Metric:** нет: a repair — the load error of a selector was shown as an empty result.

## Task footprint

| What  | Where                                                                    |
| ----- | ------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/proposed/error-states-selectors/`, `docs/specs/ui-kit-v2/error-states/` |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/` — `dynamic-selector`, `autocomplete`, `select`, `multiselect`, `tree`, `draggable-tree`, `tree-selector`, `side-menu`, `pdf-viewer` |

## What counts as done

- Both server selectors have `error`, `errorDescription`, `retry` and their two template
  directives; the default error view is `rt-empty-state` built by `rtLoadErrorView`.
- The `emptyTemplate` input of `rt-autocomplete` still works, and the directive wins over it.
- The six local lists have their empty template directive; without it the old line stays.
- The PDF viewer has `rtPdfViewerError` with the error text and `download`.
- Every scenario SC-UKV-1287…1292 is covered by a spec.
- The showcase has a story per component, measured against the frames, and the owner approved it.

## Stages

### 1. The server selectors

- **Steps:**
    1. Add `error`, `errorDescription`, `retry`, `rtAutocompleteEmpty` and `rtAutocompleteError` to `rt-autocomplete`
    2. Add `error`, `errorDescription`, `retry`, `rtDynamicSelectorEmpty` and `rtDynamicSelectorError` to `rt-dynamic-selector`
    3. Cover SC-UKV-1287…1290 by the specs
- **Readiness sign:** the specs of both components pass with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile='(rt-autocomplete|rt-dynamic-selector)' --output-style=static` — «Tests: N passed» with no failed, and the suites of both components are in the report

### 2. The local lists and the PDF viewer

- **Steps:**
    1. Add the empty template directive to `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`, `rt-tree-selector` and `rt-side-menu`
    2. Add `rtPdfViewerError` to `rt-pdf-viewer`
    3. Cover SC-UKV-1291 and SC-UKV-1292 by the specs
- **Readiness sign:** the specs of the seven components pass with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile='(rt-select|rt-multiselect|rt-tree|rt-draggable-tree|rt-tree-selector|rt-side-menu|rt-pdf-viewer)\.states\.spec' --output-style=static` — «Tests: N passed» with no failed, and seven suites in the report

### 3. The showcase

- **Steps:**
    1. Add a story of the error and the own views for each of the nine components
    2. Compare the stories with the frames by measurement and show them to the owner
- **Readiness sign:** the match line is N of N, and the owner's word on the showcase is written.
- **Verified by:** `node tools/check-kit-approval.mjs` — «no visible kit edit without approvals»

## The approval record

`approvals.md` in the task folder carries the nine mockup lines with the owner's «Одобряю» of
13.11.2026 from the first stage on; the match and the showcase lines are added in stage 3.

## What this work does not do

- A load error of the local lists: their items are in memory.
- A retry of the PDF viewer: the frame draws download only.
