# A pinned column of the second kit's table

**Status:** proposed · **Revision:** 2 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the second kit's table `rt-table`; the kit's styling tokens and the dark theme
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

## Why

A wide table on a narrow screen is read by scrolling sideways, and the column that names the row is
pinned so that the person still sees whose numbers they read. Today a pinned cell of `rt-table` is
transparent: the columns scrolling under it show through and mix with its text. Nothing marks the
edge either, so the person does not see that the table goes on beyond it. An application closes
both with a rule of its own over the kit, and every application has to write that rule again.

## Terminology

- **Pinned column** — a column the application declares as staying at the left or right edge while
  the table scrolls sideways.
- **Pinned edge** — the side of the pinned column that faces the scrolling columns.
- **Hidden content** — columns scrolled out of view behind the pinned edge.

### What it is called in the interface

The person sees no label: only the background of the cells and the shadow at the edge.

## Rules

### The background

- **A pinned cell is never transparent.** Under any row state it covers what scrolls beneath it.
- **A pinned cell takes the background of its own row.** The header, a body row, a hovered row, a
  row marked as a problem and a total row each keep their own colour in the pinned cell.
- **Without a row colour, a pinned cell takes the table surface colour.**

### The shadow

- **A pinned edge carries a shadow while hidden content lies behind it.**
- **A pinned edge carries no shadow when nothing is hidden behind it.** At the start of the scroll
  the left pin has no shadow, at the end the right pin has none, and a table that fits has none.
- **The shadow follows the scroll at once, with no wait for another event.**

### Tokens and themes

- **The background and the shadow of a pinned cell come from `--rt-*` tokens.** The application
  changes them by a token value, not by a rule of its own.
- **A column pinned left and a column pinned right behave alike, each with its shadow on its own
  pinned edge.**
- **Both themes give a solid background and a visible shadow.**

## What is out of scope

- `rt-data-table` is a separate table with its own styles and stays outside.
- `rt-table` has no striped and no selected rows. A pinned cell follows the row background, so such
  states, once added, need no rule here.
- Pinning itself is declared by the application through the table column definition; the kit adds
  no input for it.

## Contract

No new input or output. The application pins a column by the `sticky` or `stickyEnd` attribute of
its column definition, as before. New tokens set the background and the shadow of a pinned cell;
their names are fixed by the mockup the owner approves.

## Data

Not applicable: the edit is visual and stores nothing.

## Screens and states

| State                | Pinned left | Pinned right |
| -------------------- | ----------- | ------------ |
| scroll at the start  | no shadow   | shadow       |
| scroll in the middle | shadow      | shadow       |
| scroll at the end    | shadow      | no shadow    |
| the table fits       | no shadow   | no shadow    |

## Cross-cutting requirements

- **Both themes.** The tokens have a light and a dark value.
- **Narrow screen.** The case the task came from: a phone with a pinned first column.
- **Performance.** The shadow is switched by a scroll listener outside change detection, with no
  layout read per frame beyond the scroll position.

## Decisions

- **The pinned cell inherits the row background, over the surface colour.** Then every row state
  works with no rule per state. Rejected: a rule per state, which misses the next state added.
- **The shadow follows the consumer's scroll container.** The table does not scroll by itself, so it
  watches the nearest ancestor that scrolls sideways. Rejected: a permanent shadow, because the task
  asks for none without scroll.

## Open questions

- The look of the shadow (depth, colour in the dark theme) is decided by the mockup the owner
  approves.

## History of changes

- 2 November 2026 — proposed by task RT-2907.
