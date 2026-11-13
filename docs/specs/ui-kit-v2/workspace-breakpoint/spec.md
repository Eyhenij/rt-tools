# The single-column threshold of the workspace

**Status:** in force · **Revision:** 2026-11-13 · **Scenario prefix:** `SC-UKV`
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
| The title of the panel      | the name of the record whose details are open, given by the application   |

### What it is called in the interface

| In the spec               | On the screen                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| The panel over the window | the arrow back, «Details» above the title, the details of a record and the button «Close» |

## Rules

- **Without the threshold input the workspace keeps the threshold of the styles.** An application that did not ask for the change sees no change.
- **With the threshold input the workspace is one column only at a place not wider than the input.** The width is the width of the page place; without a declared place it is the width of the window.
- **Wider than the threshold the list and the centre stand side by side.** The details panel gets no column until the place is wider than 1080.
- **While the details panel has no column it opens over the window as a side panel of the given width.** The panel has a dimmed background and draws the details template of the application.
- **The panel over the window is the ordinary side panel of the kit.** It has the header of a side panel: the arrow back, the label «Details» above the title and the title of the panel. Under the header stand the details template and the footer with the button «Close».
- **The title of the panel comes from an input of the workspace.** A new value redraws the header of an open panel. Without the input the header stays with the arrow and the label, and the line of the title takes no place.
- **A details template of tabs is laid out as tabs of a side panel.** The strip of tabs stands right under the header and keeps the inset of the panel; the content of a tab scrolls.
- **The panel over the window closes by the arrow back, by the button «Close», by a press on the dimmed background and by the key Esc.** After any of them the workspace reports the panel as closed.
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

The button «Close» comes from the label `rtKit.uiClose`. The label above the title comes from
`rtKit.uiAsideDetails`. The name of the panel for a screen reader comes from the label
`rtKit.uiDetails`.

### SEO

Not applicable.

### Mobile layout

Named by the rules above: the subdomain is about the narrow layout.

### Several objects

Not applicable.

## Decisions

- **The threshold from the input is counted by the component, not by the styles.** The argument: a number from an input cannot be put into a media query. The price: the component reads the width of the page place.
- **The panel over the window is the side panel of the kit, not a layer inside the workspace.** The argument: the dimmed background covers the whole window, and the focus trap and the key Esc are already there. The price: the workspace depends on the side panel.
- **The panel over the window has the header of a side panel.** The argument: the approved frame of the application shows the arrow, «Details» and the name of the guest, and the owner asked for the ordinary side panel of the kit. The price: the content of the panel gets the inset of the side panel, and a template written for a column without insets has to drop its own. The header had been left out on 2026-11-12 by the frame of that day.
- **«Details» above the title is a label of its own, not `uiDetails`.** The argument: `uiDetails` already names a tab and the button of a notification, and in Russian it reads «Детали». The price: an application adds one key to its dictionaries.

## Open questions

- None.

## History of changes

- 2026-11-12 — created by the task RT-3180.
- 2026-11-13 — the header of the panel over the window, the inputs of the title and of the content layout, by the task RT-3267.
