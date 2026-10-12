# Grill

## The owner request

> обнови все пакеты до самых последних

The task is a finding of that work: the push gate of the epic branches kept failing on one
scenario of the bus admin suite.

## What the tree already has

- SC-MB-350 failed in three full runs of the admin suite out of five on 2026-10-12, and passed 9
  of 9 runs alone.
- The baseline frame shows the page scrolled: the first row stood at the bottom edge of the
  window, and the click scrolled it into view. A failed frame shows no scroll: the digest chart
  above the table had not been drawn yet at the click, so the row was in view without scrolling.
- SC-MB-357 waits for the digest by counting its 31 day bars; SC-MB-350 does not wait for it.

## Decisions

- **The scenario waits for the digest bars before the click, and the baseline stays:** the
  baseline already holds the state with the chart drawn. Rejected: retaking the baseline without
  the wait — the frame would still depend on timing.
