# The width of the page place

**Status:** in force · **Revision:** 21 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the page container and the breakpoint service
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about the width the kit's thresholds count from, written by task
RT-2913.

## Why

The kit chose its look by the window width. An application that opens a side panel next to the
page narrows the page and leaves the window as it was. The page header, the filters and the
tables inside then kept the wide look in a narrow place and broke the row.

## Terminology

- **The page place** — the `rt-container` node; its width is what the page has.
- **The root place** — the document root; its width is the window width.
- **An overlay** — a window, a list, a sheet or a panel opened above the page.

### What it is called in the interface

| In the domain  | On the screen                                  |
| -------------- | ---------------------------------------------- |
| The page place | the page frame with its header and its content |
| An overlay     | a dialog, a drop-down list, a sheet, a panel   |

## Rules

- **A kit component inside the page place counts its thresholds from the place width.**
- **Without the page place the thresholds count from the window.**
- **The page container declares itself the page place and releases it when it leaves.**
- **The narrow sign of the breakpoint service answers by the page place, and by the window without one.**
- **An overlay counts its thresholds from the window.**

## What is out of scope

- The application's own styles and code that read the window: the application moves them itself.
- Two page places on one screen at once: the last declared answers the breakpoint service.

## Contract

None: the part is a layout rule and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: the width is measured in the browser.

## Screens and states

| state                       | what is drawn                                    |
| --------------------------- | ------------------------------------------------ |
| wide window, wide place     | the wide look                                    |
| wide window, narrow place   | the narrow look inside the place                 |
| narrow window               | the narrow look, inside the place and outside it |
| overlay over a narrow place | the look of the window width                     |

## Cross-cutting requirements

### Locales

Not applicable: the part has no captions.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The thresholds are the same numbers as before: 480, 768, 1080 and 1380.

### Several objects

Not applicable: a screen has one page place.

## Decisions

- **The place is a named container `rt-place`, declared on the page container and on the root.**
  A named query finds the nearest place and skips the containers of the pagination and the file
  drop.
- **The root counts its width without the window scrollbar.** On a window with a classic
  scrollbar a threshold moves by its width; the look on both sides stays the same.
- **The page container takes its width from its parent.** A container of width declares no width by
  its content: in a parent that sizes itself by content it collapses. An application frame puts
  it in a grid column or a block of its own width.
- **The form vocabulary of the panel stays on the window.** The panel is an overlay, and the
  vocabulary threshold is the panel's own.

## Open questions

None.

## History of changes

- 21 October 2026 — written by the task RT-2913 straight into the kit spec.
