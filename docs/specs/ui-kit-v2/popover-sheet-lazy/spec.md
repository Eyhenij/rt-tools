# The code of the bottom sheet arrives at the first opening

**Status:** in force · **Revision:** 25 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the subdomain `popover-sheet`, the popover of the second kit
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3645 of the epic RT-3641.

## Why

The sheet opens only on a phone, yet its code lay in the start bundle of every application that
used the popover. The weight of the start bundle is under control in the kit, and the code of a
screen that most people never see does not belong there.

## Terminology

- **The code of the sheet** — the component that draws the sheet, kept in a separate chunk of the
  built kit.
- **The first opening** — the first time a panel opens in the sheet mode on a page.

### What it is called in the interface

Nothing changes for the person: the sheet looks and behaves as before. Only the first opening
may wait for the chunk.

## Rules

- **The code of the sheet is loaded lazily, at the first opening on a phone, not at the start of the
  application.** The first opening waits for the code once, later openings take it at once. A
  panel closed, or a directive removed, before the code arrives leaves no sheet and the code that
  arrives does not create one; a code that fails to load closes the panel and goes to the error
  handler of the application. An application that does not want the first wait calls
  `rtPreloadPopoverSheet` in an idle moment. While the code of the first opening is on its way nothing of the sheet is
  drawn, and Escape pressed in that short time does not close the panel: the keyboard watcher of the overlay starts
  with the sheet. The trigger already reports the panel as open in that time, and pressing it again closes it.

## What is out of scope

- The look and the behaviour of the sheet: the subdomain `popover-sheet`.
- The weight check of the kit parts: it lives in the tools, not in this spec.

## Contract

Not applicable: no procedures. The public entry `popover` no longer exports the class of the sheet;
the handle of an opened sheet carries the overlay and a stream of closings, no component reference.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen                         | Loading                        | Empty     | Refusal                               |
| ------------------------------ | ------------------------------ | --------- | ------------------------------------- |
| A panel in the sheet, first time | nothing drawn until the code arrives | no change | the panel closes, the handler is told |

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

The subject of the subdomain is the phone: at width 375 the first opening loads the chunk.

### Several objects

Not applicable.

## Decisions

- **The class of the sheet leaves the public entry.** A static export keeps it in the start bundle;
  the owner approved the breaking change with the plan of the task.

## Open questions

None.

## History of changes

| Date       | What changed                                                              |
| ---------- | ------------------------------------------------------------------------- |
| 2026-11-25 | The subdomain is written with scenarios 1782…1784 (RT-3645)               |
