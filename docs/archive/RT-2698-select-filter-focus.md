# Grill

## The owner request

> В эпике RT-2649

The answer to the question on the next task: three kit defects found by the browser pass of the
application on ui-kit-v2 0.19.0, all present since 0.15.

## What the tree already has

- `rt-select` sets the active option to -1 on open; the keyboard open moves to the first option.
  Spec `docs/specs/ui-kit-v2/select/`.
- `rt-data-table-filter-cell` clears by a cross that switches off with no value; the switched-off
  button drops the focus to `body`. Spec `docs/specs/ui-kit-v2/table-full-port/`.
- The English label `dataTableFilterSelectPlaceholder` reads «Chose filter».

## Questions and answers

**Under which epic is the task taken?**
Under RT-2649.

## Decisions

- **The branch forks from `main`, the PR targets `main`.** — the epic branch is merged by #2692.
- **The focus goes into the field next to the cross.** — the cross is switched off right after the
  clearing. Rejected: keeping the cross enabled — it would clear nothing.
