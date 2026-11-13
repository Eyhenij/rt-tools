# The single-column threshold of the workspace

**Status:** in force · **Revision:** 2026-11-12 · **Scenario prefix:** `SC-UKV`
**Depends on:** `docs/specs/ui-kit-v2/workspace-slots/spec.md`
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

The subdomain names when the workspace folds into one column and how the details panel opens while
it has no room as a third column.

## Why

On a tablet 768 wide the workspace showed one column: the list was gone, and the details panel slid
over the conversation without a dimmed background. The threshold was written in the styles, and an
application had no way to move it. A tablet has room for the list and the conversation side by side.

## Terminology

| Term                        | What it is                                                                |
| --------------------------- | ------------------------------------------------------------------------- |
| The single-column threshold | the width of the page place at which the list and the centre stop sharing |
| The panel over the window   | the details panel opened as a side panel with a dimmed background         |

### What it is called in the interface

| In the spec               | On the screen                                  |
| ------------------------- | ---------------------------------------------- |
| The panel over the window | the details of a record and the button «Close» |

## Rules

- **Without the threshold input the workspace keeps the threshold of the styles.** An application that did not ask for the change sees no change.
- **With the threshold input the workspace is one column only at a place not wider than the input.** The width is the width of the page place; without a declared place it is the width of the window.
- **Wider than the threshold the list and the centre stand side by side.** The details panel gets no column until the place is wider than 1080.
- **While the details panel has no column it opens over the window as a side panel of the given width.** The panel has a dimmed background and draws the details template of the application.
- **The panel over the window closes by the button «Close», by a press on the dimmed background and by the key Esc.** After any of the three the workspace reports the panel as closed.
- **At a place not wider than the threshold the details panel opens as before.** The view of a phone does not change.

## What is out of scope

- **The content of the details panel.** It is the template of the application.
- **The threshold of the third column.** It stays 1080 and is not an input.

## Contract

Not applicable: the subdomain describes the surface of a component, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                                  | What is visible                                           |
| -------------------------------------- | --------------------------------------------------------- |
| Wider than 1080                        | three columns, as before                                  |
| Between the threshold and 1080         | the list and the centre; the details open over the window |
| Not wider than the threshold           | one column; the details slide over the centre, as before  |
| No threshold input, not wider than 768 | one column, as before                                     |

## Cross-cutting requirements

### Locales

The button «Close» comes from the label `rtKit.uiClose`. The name of the panel for a screen reader
comes from the label `rtKit.uiDetails`.

### SEO

Not applicable.

### Mobile layout

Named by the rules above: the subdomain is about the narrow layout.

### Several objects

Not applicable.

## Decisions

- **The threshold from the input is counted by the component, not by the styles.** The argument: a number from an input cannot be put into a media query. The price: the component reads the width of the page place.
- **The panel over the window is the side panel of the kit, not a layer inside the workspace.** The argument: the dimmed background covers the whole window, and the focus trap and the key Esc are already there. The price: the workspace depends on the side panel.
- **The panel over the window has no header of its own.** The argument: the approved frame shows the details from the top edge. The price: none.

## Open questions

- None.

## History of changes

- 2026-11-12 — created by the task RT-3180.
