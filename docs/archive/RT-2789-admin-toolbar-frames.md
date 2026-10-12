# Grill

## The owner request

> обнови все пакеты до самых последних

The task is a finding of that work: after RT-2786 reached `main`, no branch of the epic passed the
push gate.

## What the tree already has

- RT-2786 gave a field in the left bar of `rt-toolbar` the width `--rt-toolbar-field-width`, 400px
  by default, with `max-width: 100%`. Its run was cancelled before the admin suite, and the change
  reached `main` with the admin frames taken before it.
- The admin suite on the epic branch with that `main`: 17 of 146 failed — 15 frames of list
  screens, the shell and the panels, plus SC-MB-235 and SC-MB-253.
- SC-MB-235 and SC-MB-253 are a defect, not a frame: on a 412px screen a filter ends at 416px. The
  left bar stacks in a column and is stretched, but its least width is taken from the 400px field —
  a percentage `max-width` takes no part in that count — so the bar and every field leave the
  window by 4px.

## Questions and answers

**Где переснять кадры?**
Коммитом в ветку эпика

## Decisions

- **The left bar gets `min-width: 0`:** the field then fits the bar, and the bar fits the window.
  Rejected: retaking the narrow frames as they are — they would hold fields cut by the window edge.
- **A frame is retaken only after it is looked at:** the wide frames change only by the width of
  the toolbar fields, chosen by the owner in RT-2786.
