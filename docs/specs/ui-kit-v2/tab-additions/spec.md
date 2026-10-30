# What the tabs give an application moving from Material

**Status:** in force · **Revision:** 2026-10-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the tabs of the kit, the tooltip of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit about what the tabs took over from the Material tabs an application
had: the closable tab and its cross, the tooltip, the header-only strip, manual activation, the
scroll arrows, the panel motion, the preserved body of a visited tab and the panel out of the Tab
order.

## Why

An application that moves from Material onto the second kit used closable tabs, tabs with a
tooltip, a strip without panels and tabs that keep what was typed in them. Without these the
application kept its own tabs next to the kit's. The cross of a closable tab was not reached from
the keyboard at all: a person without a mouse could not close a tab except by Delete, which nothing
on the screen names.

## Terminology

- **A closable tab** — a tab with `closable`; it asks the host to close it, and the host decides.
- **The cross of a tab** — the button that asks to close a closable tab.
- **The header-only mode** — the strip of tabs without the panel under it.
- **The bar** — the line under the selected tab.

### What it is called in the interface

| In the domain      | On the screen                               |
| ------------------ | ------------------------------------------- |
| The cross of a tab | the small cross at the right of a tab title |
| The bar            | the coloured line under the open tab        |
| The scroll arrows  | the arrows at the edges of a long tab strip |

## Rules

- **The cross of a closable tab is a button of its own next to the tab.** Tab from the tab in focus
  reaches its cross, and Enter or Space there closes the tab. The cross is named by its tooltip,
  or by the translated "Close" without one. After a close from the keyboard the focus goes to the
  tab that became active. Delete on the tab still closes it, and the look stays as before.
- **A tab fills its icon when it asks for it.** `rtTab` takes `iconFill`, `false` by default, and
  passes it to the icon as `fill`, for an icon by `icon` and by `glyph` alike. The icon draws filled
  where it has a filled drawing: a Material glyph always, a kit name under the material preset. A
  kit name in the base preset has one drawing and stays as it is. A tab without `iconFill` is drawn
  as before.
- **A tab puts its badge over the icon when it asks for it.** `rtTab` takes `badgePosition`,
  `'inline'` by default, which keeps the badge after the title as before. With `'overlay'` the
  badge is a circle of 16 pixels over the top right corner of the icon and moves nothing in the tab.
  Its top stands 8 pixels above the icon and its right edge 6 pixels past it, so a longer count
  grows over the icon, not over the title. It is filled with the primary action colour. A tab
  without an icon keeps the badge inline. A tab without a title draws no empty title, so an
  icon-only tab keeps its icon in the middle.

## What is out of scope

- Which tab closes and what is shown instead: the host decides by the output.
- Dragging tabs to reorder them.

## Contract

Not applicable: the surface is the inputs and outputs of `rt-tabs` and `rtTab`, the subdomain
serves no procedures. What the application gives and gets: `closable`, `tooltip`, `closeTooltip`,
`closeTooltipPlacement` on a tab; `headerOnly`, `activation`, `scrollStep`, `scrollArrows`, `animationDuration`,
`preserveContent`, `contentTabIndex` on the tabs; the output `tabClose`.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                        | What is visible                                            |
| ---------------------------- | ---------------------------------------------------------- |
| a closable tab               | the title and the cross at its right                       |
| a closable tab in focus      | Tab moves to its cross; the other crosses are out of order |
| a disabled tab               | pale, no cross, its tooltip on hover                       |
| a strip wider than its place | the scroll arrows over the tabs or beside the list         |
| a tab with `iconFill`        | its icon is filled, the other tabs are outlined            |
| a badge with `'overlay'`     | a circle with the count over the icon corner               |

## Cross-cutting requirements

### Locales

The name of the cross without a tooltip is the kit's translated "Close"; the tooltips come from the
consumer.

### SEO

Not applicable.

### Mobile layout

Nothing of its own: a strip wider than the screen scrolls by the arrows and by touch, as before.

### Several objects

Not applicable.

## Decisions

- **`iconFill` rather than `glyphFill`.** The application asked for `glyphFill`; the input stands
  next to `icon`, `glyph` and `iconColor` and reaches both sources of the icon.

## Open questions

None.

## History of changes

- 2026-10-23 — the application's request: the cross of a closable tab is reached from the keyboard.
- 2026-10-23 — merged from the agreement into the subdomain, task RT-2812.
- 2026-10-30 — the application's request: a filled tab icon and a badge over it; merged from the
  agreement into the subdomain, task RT-2995.
