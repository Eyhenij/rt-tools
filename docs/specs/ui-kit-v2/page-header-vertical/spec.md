# The vertical menu and the tabs «More» mode

**Status:** in force · **Revision:** 9 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the page header, the tabs, the kit menu, the bottom sheet
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `mockups`
**Procedures:** none

A subdomain of the second kit, written by task RT-3181. It extends two parts by one change, as the
owner asked: `rt-page-header` gains a vertical layout and `rt-tabs` gains a «More» mode. The
approved frames are the node `7626:734` of the sheet Page Header and the node `7658:534` of the
sheet Tabs.

## Why

The horizontal header spends its height on one row of captions and holds few sections. Applications
with many sections need a menu down the side of the window. Their pages also keep many open tabs,
and a strip that only scrolls hides which tabs exist. The page header and the table footer take
height from the table, so the vertical layout comes with a compact page header.

## Terminology

- **The rail** — the column 50 wide on the window's left edge with the section items.
- **The section panel** — the column 220 wide beside the rail with the items of one section.
- **The rail foot** — the assistant, notifications and profile items at the bottom of the rail.
- **The action cluster** — the same three controls standing together outside the rail.
- **The compact page header** — the bar above a page with its title, filters and actions.
- **The «More» trigger** — the item at the end of a tab row that opens the tabs that did not fit.

### What it is called in the interface

| In the domain       | On the screen                                  |
| ------------------- | ---------------------------------------------- |
| The «More» trigger  | the caption «More» with a chevron              |
| A hidden filter set | the button «More filters» with the count       |
| The burger          | the three-line button at the header's left end |

## Rules

### The tabs «More» mode

- **Tabs that do not fit leave the row for a menu at its end, and the strip does not scroll.**
- **The «More» trigger shows only when at least one tab does not fit.**
- **Tabs leave the row from its end, and the order of the rest does not change.**
- **The selected tab always stands whole in the row.** Chosen in the menu, it stands last in the
  row and pushes its neighbour into the menu.
- **A pinned tab stands first and never leaves the row.**
- **The menu row shows what the tab shows: icon, badge, error mark, disabled state and cross.**
- **An error inside the menu puts a dot on the «More» trigger.**
- **Closing a row tab brings the first menu tab into the row.**
- **The menu opens under the trigger with its right edge on the trigger's right edge.**
- **A menu of more than eight rows scrolls inside, and its height stays 282.**
- **The trigger is never drawn as selected.** The selected tab is always in the row.
- **The open trigger carries its open look.** The chevron turns up while the menu is open.
- **The scroll mode stays the default, and a strip that names no mode behaves as before.**
- **A right click on a tab opens the menu the application declares for it.** The application holds
  the tab set, so it declares the pin and close items and acts on them.
- **A strip may show the close cross on the selected tab only.** Every closable tab keeps its
  cross by default.
- **The row holds at most ten tabs, pinned ones included, even when there is room.** The strip may
  name another limit. A tab picked in the menu or opened anew takes the place of the last row tab,
  and that tab goes to the menu.
- **A menu row shows its close cross only under the pointer or keyboard focus.**
- **The scroll arrows are compact buttons that lie over the tab edge or beside the tabs.** The
  application sets their rounding, background, colour and shadow. The compact look is chosen by an
  input; the vertical header takes it.
- **A strip that does not choose the compact look keeps the full-height square arrow.**
- **A pinned tab without an icon of its own draws a pin, and it may still carry a close cross.**

### The rail and the section panel

- **The vertical layout is chosen by one input, and the horizontal layout stays the default.**
- **The rail takes the sections as the horizontal header takes them.** One list of items serves
  both layouts.
- **The rail is 50 wide, its items are 50 by 50, and the logo slot of 24 stands 20 from the top.**
- **Sections that do not fit the rail's height scroll inside the rail, and the foot stays in place.**
- **A section caption shows as a tooltip to the right of its item.**
- **A section with a panel opens the section panel over the page and over the tabs.** The page and
  the tabs do not move.
- **The section panel is 220 wide and takes the window's whole height.**
- **The profile menu opens above the avatar, 8 from the rail.**
- **A switched-on foot button carries the look of the selected item and says it is pressed.** The
  open assistant is such a button.

### The tab view

- **With a tab strip the rail loses its foot, and the action cluster stands at the right of the tab
  row.**
- **The tab strip is 33 high and stands above the page, to the right of the rail.**
- **A single open page shows its tab without a cross.**

### The assistant

- **The compact page header follows the width of the page, not of the window.** Narrowed by the
  assistant, it moves its filters and actions into buttons as a phone does.

### The compact page header

- **One row makes the bar 56 high, and two rows make it 104.**
- **A title and buttons that leave no room for the filters stand on the first row, and search and
  filters on the second.**
- **There is no third row: filters that do not fit go under the button «More filters» with their
  count.**
- **The bar is a separate part, and a page without it keeps its own heading.**

### The phone

- **On a phone the header is one row 50 high.** It holds the burger, the page title, the filters
  button, the actions button, and the assistant, notifications and profile buttons.
- **The page title takes the width left over and truncates, and the buttons never leave the
  screen.** Measured at 375.
- **The burger opens the sections as a menu of the vertical layout, a column 240 wide with rows 48
  high and no logo.** A section with a panel opens its items in place, and «Back» returns to the
  sections. The kit's side menu stays as it is and is not used here.
- **The phone menu takes the theme colours of the wide layout.** The list of sections is painted as
  the rail, and an opened section as the section panel.
- **The filters button opens the bottom sheet with search and all filters.** A dot on the button
  says filters are applied.
- **The actions button opens the kit menu with the page's actions.**
- **The tab strip stands under the header in the «More» mode.** It shows the selected tab and
  «More»; header and strip together are 83.

## What is out of scope

- The third vertical mode with an expanded column and a collapse button: the owner removed it.
- The kit default of the pagination height: the compact footer of the frames is set by the custom
  properties the pagination already has.
- Dragging tabs to reorder them: no approved frame draws it.
- The chat itself and its place: the application puts `rt-ai-chat` 420 wide to the right of the
  page, or over the whole screen at 768 and narrower. The showcase shows that layout; the kit only
  follows the narrowed page width.

## Contract

None: the parts are controls and serve no procedure.

### Refusal codes

Not applicable.

## Data

None of its own: sections, tabs, filters and actions come from the application.

## Screens and states

| state               | what is drawn                                   | frame        |
| ------------------- | ----------------------------------------------- | ------------ |
| panel closed        | rail 50, page on the remaining width            | `7628:740`   |
| panel open          | panel 220 over the page, the page does not move | `7628:817`   |
| header on two rows  | bar 104, search and filters on the second row   | `7671:21538` |
| hidden filters      | «More filters» with the count, no third row     | `7671:22354` |
| sections do not fit | the rail scrolls, the foot stays                | `7631:1036`  |
| tab view            | strip 33, cluster on the right, no rail foot    | `7646:4907`  |
| «More» open         | kit menu under the trigger, rows with a cross   | `7660:11556` |
| assistant open      | rail 50, page narrowed, chat 420                | `7639:3902`  |
| phone               | row 50 and strip 33                             | `7688:18843` |
| phone filters       | bottom sheet with a footer button               | `7688:19367` |

## Cross-cutting requirements

### Locales

The captions are kit labels with an English default and the consumer's translation. The «More»
trigger of the tabs reuses `uiNavMore`.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

Described by the phone rules above: the phone is the same parts in one row, with the filters in a
bottom sheet and the actions in a menu.

### Several objects

Not applicable: one window has one rail.

## Decisions

- **Where the sheet's kit copy differs from the showcase, the code follows the showcase.** The menu
  row is 34, the sheet handle is 2 and the sheet header is 35. A sheet copy drifts, and the owner
  approved the layout rather than a change of those parts.
- **The fit of the tab row is a pure function of the widths.** The component measures and the
  function decides, as `fitRow` does for the header. Rejected: reusing `fitRow` as it is, because it
  knows no selected and no pinned tab.

## Open questions

- `Q-1` — does a section panel open by hover or by click. The work goes with the horizontal header's
  behaviour: hover opens it and a click opens it on touch.
- `Q-2` — is the compact footer the kit default or only of these frames. The work goes with the
  frames only.
- `Q-3` — where does the page's create button go on a phone. The work goes with the actions menu.

## History of changes

- 9 November 2026 — written by task RT-3181 after the owner approved the frames; merged into the
  kit spec by the same task, with the rules the work added: the cross on the selected tab only, the
  pin of a pinned tab, the open trigger look and the switched-on foot button.
