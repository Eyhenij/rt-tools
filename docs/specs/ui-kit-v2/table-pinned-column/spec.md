# A pinned column of the second kit's table

**Status:** in force · **Revision:** 4 November 2026 · **Scenario prefix:** `SC-UKV`
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
- **A shadow that is not shown takes no room.** An invisible shadow standing past the last pinned
  column used to widen the scroll area by its own width and gave a table that fits a sideways scroll.
- **In right-to-left writing the shadow follows the logical edge.** The column pinned at the start
  carries its shadow while content is hidden behind the start, whichever physical side that is.

### Tokens and themes

- **The background and the shadow of a pinned cell come from `--rt-*` tokens.** The application
  changes them by a token value, not by a rule of its own.
- **A column pinned left and a column pinned right behave alike, each with its shadow on its own
  pinned edge.**
- **Both themes give a solid background and a visible shadow.**
- **The table takes its background from the nearest theme around it.** A light piece inside a dark
  page draws the table light: the background is a theme token, not a rule that reads the dark sign
  on any ancestor.

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

### Refusal codes

Not applicable: the edit is visual and refuses nothing.

### Locales

The kit adds no text: the shadow and the background carry no words, and the dictionary of the kit
gets nothing.

### SEO

Not applicable: the shadow is switched in the browser by the scroll, and a page drawn on the server
gives the table without it.

### Mobile layout

The case the task came from: a phone with a pinned first column. Both themes give the tokens a
light and a dark value.

### Several objects

Several tables on one page each watch their own scroll container and switch their own shadow.

### Performance

The shadow is switched by a scroll listener outside change detection, with no layout read per frame
beyond the scroll position.

## Decisions

- **The pinned cell inherits the row background, over the surface colour.** Then every row state
  works with no rule per state. Rejected: a rule per state, which misses the next state added.
- **The shadow follows the consumer's scroll container.** The table does not scroll by itself, so it
  watches the nearest ancestor that scrolls sideways. Rejected: a permanent shadow, because the task
  asks for none without scroll.

- **The shadow lies past the edge of the pinned cell, so that cell clips nothing.** An application
  that cuts a long value with an ellipsis puts the cut on an element inside the cell: the cell's own
  `overflow: hidden` cuts the shadow off with the text. Rejected: a shadow inside the cell, which
  would cover the cell's own content instead of the scrolled columns.
- **The shadow is 16% black in the light theme and 64% in the dark one.** The owner approved 12% and
  48% with the mockup, then found the shadow weak on the grey total row and chose to strengthen it.
- **A table row is 50 high together with its padding and line, as in the mockup.** The kit cell
  counted its 50 without them, and every row came out 67, the dense row 45 instead of 36. The owner
  chose to fix it in this task, so every `rt-table` changes height with it.

## Open questions

None left: the look of the shadow is set by the approved mockup and the decisions above.

## History of changes

- 2 November 2026 — proposed by task RT-2907.
- 2 November 2026 — in force with RT-2907: the shadow is 16% and 64%, the table row is 50 high.
