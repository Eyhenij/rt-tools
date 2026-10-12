# Grill

Former address: docs/tasks/RT-2791-kit2-toolbar-select-width/grill.md

Only `rt-input` in the left bar of `rt-toolbar` takes `--rt-toolbar-field-width` now; an `rt-select`
there sizes by its content again. RT-2786 had given both the 400px width, and the admin's three
filters stretched across the row and left a 412px screen by 4px. The toolbar description and the
kit spec history say so. Checks: the admin end-to-end suite 146 of 146, the showcase frames 838 of 838.

## The owner request

> открывай все

Opening the PRs of epic RT-2542 stopped at the gate before sending: the admin end-to-end suite
failed 17 of 146. Asked how to fix it — the kit, accepting the 400px filters, or waiting — the
owner answered:

> Чинить кит (Recommended)

## What the tree already had

- RT-2786 (in main) gave `rt-input` and `rt-select` in the left bar of `rt-toolbar` the width
  `--rt-toolbar-field-width`, 400px, with `max-width: 100%`.
- The admin puts three `rt-select` filters into the left bar: each became 400px, and on a 412px
  screen a filter ended at 416px — SC-MB-235 and SC-MB-253 failed, and 15 screen frames diverged.
- RT-2786 aimed at the list search, an `rt-input` that shrank to its placeholder.

## Decisions

- **Only `rt-input` takes the field width; `rt-select` sizes by its content again.** — The
  request behind RT-2786 was the search field; the filters fitted before it. Rejected: accepting
  400px filters — the owner chose to fix the kit.
- **The PRs of the epic go as a chain on this branch.** — The epic branch alone cannot reach the
  host: its tree carries RT-2786 from main and fails the admin suite until this fix is in it.
