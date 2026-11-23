# The filters of a toolbar behind a button

**Status:** in force · **Revision:** 2026-11-23 · **Scenario prefix:** `SC-UKV`
**Depends on:** the toolbar, the icon button and the aside of the second kit
**Laws:** `frontend-application`, `mockups`, `lists`
**Procedures:** none

Task RT-3001. Mockups: the panel
https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/RT-Tools-DS?node-id=7349-4846, the toolbar
https://www.figma.com/design/vyV42sJXccfKNG8yFSCpSL/RT-Tools-DS?node-id=7349-5090.

## Why

On a phone the filters of a list stand in the left part of the toolbar, and the toolbar folds into a
column: two or three selects take half of the screen above the table. Every application would hide
them behind a button by itself, each in its own way. The kit gives the one way: the filters are
declared once, and the toolbar decides by the width of the place whether to show them in a row or
behind a button that opens a panel.

## Terminology

| Term          | What it is                                                                             |
| ------------- | -------------------------------------------------------------------------------------- |
| Filters slot  | the content declared by `rtToolbarFilters`: the filter fields of a list                |
| Filter button | `rt-icon-button` with the `filter` icon that stands for the filters on a narrow screen |
| Indicator     | the dot in the corner of the filter button icon: some filter is on                     |
| Filters panel | `rt-aside` opened by the filter button, with the filters slot in its body              |
| Narrow screen | the place under 1080 points — `BreakpointsService.belowNarrow`                         |
| App panel     | `rt-toolbar-filters-panel` drawn by the application in its own route                   |

### What it is called in the interface

| In the spec   | On the screen                                       |
| ------------- | --------------------------------------------------- |
| Filter button | the button with the funnel, label «Фильтры»         |
| Filters panel | the panel «Фильтры» with «Сбросить» and «Применить» |

## Rules

- **On a narrow screen the toolbar shows the filters slot as one filter button.** The button stands
  first in one row with the buttons of the right part; the fields themselves are not drawn in the
  toolbar.
- **On a wide screen the filters slot stands in the left part of the toolbar, after its content.**
  No filter button is drawn.
- **A filter on is shown by the indicator, and no border of the toolbar cuts it.** The consumer says
  it by the input `filtersActive`.
- **The filter button opens the filters panel.** Its header has the title «Фильтры» and the back
  arrow, no overline and no actions; its body holds the filters slot; its footer holds «Сбросить»
  and «Применить» at both ends.
- **«Применить» reports `filtersApply` and closes the panel; «Сбросить» reports `filtersReset` and
  leaves it open; the back arrow closes it and reports nothing.**
- **The title of an aside header without an overline stands on one line with the back arrow.** The
  heading block is at least as high as the back button and centres its content.
- **The footer of an aside keeps the label of its dismiss button on a phone when told so.** By
  default a phone reads that button as «Закрыть»; the input `phoneCloseLabel` set to `false` keeps
  the consumer's label — «Сбросить» in the filters panel.
- **The filters panel lives no longer than its toolbar and its narrow screen.** It closes when the
  toolbar is destroyed and when the screen widens, so the filter fields never stand in two places
  at once. A second press on the filter button before the first panel is ready opens nothing.
- **The filters panel holds the keyboard focus while it is open.** Tab moves inside the panel, and
  on closing the focus returns where it stood. When the panel closes because the screen widened,
  the filter button is gone, and the focus goes to the left part of the toolbar where the fields
  returned.
- **The filters panel is announced as a modal dialog.** The panel blocks the page, so its frame is
  `role="dialog"` with `aria-modal` — the input `modal` of the aside.
- **A filter on is named to a screen reader in words.** The dot is invisible to it, so the button
  name changes from «Фильтры» to «Фильтры, отбор включён».
- **The filters stand in the row from 1080 points and behind the button from 1079 down.** The
  toolbar reads `BreakpointsService.belowNarrow`; the shared `narrow` stays at 1080 and below for
  the other components.
- **With `filtersPanel` set to `app` the filter button opens no panel of its own and reports
  `filtersOpen`.** By default (`kit`) the toolbar opens its own panel as before.
- **The application panel draws the filters of the toolbar.** `rt-toolbar-filters-panel` in a
  component of the application route draws the same header, the filters slot with the context
  `panel` and the footer; «Сбросить» reaches `filtersReset` of the toolbar, «Применить» reaches
  `filtersApply`.
- **The application panel asks to be closed by `dismiss`.** It reports it on the back arrow, after
  «Применить», when the filters return to the row and when the toolbar leaves the page; «Сбросить»
  reports nothing. A panel that stood before its toolbar appeared stays open and takes its filters.

## What is out of scope

- **The values of the filters.** The fields and their state belong to the consumer; the kit draws
  the slot and reports the two presses.
- **A bottom sheet instead of the panel.** The approved mockup draws an aside at full width.

## Contract

Not applicable: the subdomain describes components, not an exchange with the server.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| State              | What is visible                                                                      |
| ------------------ | ------------------------------------------------------------------------------------ |
| Wide screen        | the filter fields in the left part of the toolbar, as before                         |
| Narrow, filter off | the filter button first in the row of buttons, no dot                                |
| Narrow, filter on  | the same button with the dot in the icon corner, the dot whole                       |
| Panel open         | the aside at full width: header, the fields one under another, footer of two buttons |

## Cross-cutting requirements

### Locales

The title, the button label and the footer labels are kit labels: `uiFilters`, `uiReset`, `uiApply`.
The field labels arrive from the consumer.

### SEO

Not applicable.

### Mobile layout

This is the case the subdomain is about.

### Several objects

Not applicable.

## Decisions

- **The narrow sign comes from `BreakpointsService.narrow`, not from a media query.** The argument:
  the narrow state is a different DOM branch — a button instead of fields — and the kit takes the
  narrow sign from the service only. The price: between 768 and 1080 points the filters already
  stand behind the button, as `rt-filter-control` already turns into a select there.
- **The filters threshold excludes 1080, and the shared `narrow` keeps it.** The argument: the
  acceptance of a list says «1080 and wider — in the row»; the shared sign drives the table, the
  page header, the side menu and the styles of the kit, which nobody asked to move. The price: at
  exactly 1080 the table already shows cards while the filters stand in the row.
- **The application panel takes the filters through a root hub, not through an input.** The
  argument: the panel stands in a route outlet and does not see the toolbar of the list; the
  toolbar hands its template and its two presses to the hub while it lives. The price: with two
  toolbars in `app` mode on one page the panel draws the filters of the last one.
- **The slot template gets the place it is drawn in as its context: `bar` or `panel`.** The argument:
  a field in the panel needs a label above it, a field in a row does not.

## Open questions

- None.

## History of changes

- 2026-10-30 — proposed by RT-3001.
- 2026-11-23 — RT-3528: the filters threshold at 1079, the panel opened by an application route.
