# The first kit's table as a family of the second kit

**Status:** proposed · **Revision:** 2026-09-22 · **Scenario prefix:** `SC-UKV`
**Depends on:** the kit's checkbox, radio button, icon, icon button, menu, tooltip, input, select,
date picker, toggle switch, side panel, spinner, scroll area and toolbar — the family draws with
them instead of Material; the material styling preset — it brings the first kit's colours
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `lists`
**Procedures:** none

A product agreement written before the code, task RT-2316. The first kit's table and its list of
records move into the second kit as a family of their own, next to `rt-table` and
`rt-dynamic-list`. Neither of those is edited and neither is replaced: the application chooses
which one a screen takes. Where the agreement merges is open question `Q-TP-1`; the scenario
numbers stay as they are after the merge.

## Why

An application moving from the first kit to the second draws its record lists with the first
kit's table: a selection column, a double click on a row, quick actions next to the row menu,
ready cells, a filter row, a column settings panel with scrollbar switches, a toolbar with search
and a pagination bar. The second kit's table does part of that and looks different: cards on a
narrow screen, its own column markup, its own toolbar. Moving a screen onto it means rewriting the
screen and changing its look at once.

The owner's words: "move the whole functionality, leaving out only Material, and keep the look",
and "this table must not replace the second kit's table but be an alternative, with stories of its
own". So the family repeats the first kit's behaviour and layout, and replaces only the Material
parts it drew with — by the kit's own components.

## Terminology

| Term                  | What it is                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| the table             | `rt-data-table`: the header, the filter row, the rows and the actions strip                                           |
| the list              | `rt-data-list`: the toolbar, the table, the pagination bar, the placeholder and the loading look                      |
| a column declaration  | what the application says of a column: the value's property, type, header, alignment, width, sort, filter, icon, copy |
| the record key        | the property of a record that tells records apart; `id` unless named                                                  |
| the selection column  | the first column with a checkbox or a radio button in every row                                                       |
| the page checkbox     | the checkbox in the header of the selection column; it answers for the rows of the shown page                         |
| a mark                | one record being chosen; it is held by the record key                                                                 |
| the preset marks      | the keys of records the application asks to be marked when the first rows arrive                                      |
| select all            | the checkbox of the list's toolbar that marks every record on every page                                              |
| the across-pages mode | the list's mode in which select all also marks pages not loaded yet                                                   |
| the exclusions        | the records a person unmarked while the across-pages mode is on                                                       |
| the actions strip     | the block at the end of a row holding the inline actions and the row menu button                                      |
| an inline action      | a button of the application in the actions strip, outside the row menu                                                |
| a ready cell          | a cell the family draws by the column declaration, without a template of the application                              |
| an opt-out node       | a part of a row the application marks so that a press on it does not reach the row                                    |
| the column settings   | the order of columns, their visibility and the two scrollbar switches, saved per table                                |

### What it is called in the interface

The words are the first kit's; the kit's dictionary gives them in all eight languages.

| In the agreement           | On the screen                                                                  |
| -------------------------- | ------------------------------------------------------------------------------ |
| select all                 | "Select all"                                                                   |
| the counter                | "Selected: N"                                                                  |
| the search field           | "Search..."                                                                    |
| the toolbar buttons        | hints "Clear filters", "Refresh", "Table configuration"                        |
| the placeholder            | a large search icon and "No Data Found"                                        |
| the header of the strip    | "Actions"                                                                      |
| the copy button            | hint "Copy", after a press "Copied!"                                           |
| the page size              | "Items per page:"                                                              |
| the settings panel         | "Edit table configuration" and its explanation line                            |
| the scrollbar switches     | "Vertical scrollbar shown", "Horizontal scrollbar shown"                       |
| the visibility of a column | hints "Hidden, click to show", "Shown, click to hide"                          |
| the filter row             | "Type in filter value", "Chose filter", "No options available", "Clear filter" |
| the filter operators       | "Equal", "Not equal", "Contains", "More than", "Less than"                     |
| an empty ready cell        | a dash                                                                         |

## Rules

### The family

- **The family stands next to `rt-table` and `rt-dynamic-list` and changes neither.** A screen
  drawn with the second kit's table looks and behaves the same before and after this work.
- **No part of the family imports Material.** Every control the first kit took from Material is
  the kit's own component: the checkbox, the radio button, the icon, the icon button, the menu, the
  tooltip, the input, the select, the date picker, the toggle switch and the side panel.
- **Every colour of the family comes from an appointment of the kit.** So the material preset
  draws it in the first kit's colours and the dark theme repaints it without a rule of its own.

### Columns and cells

- **A column of the type "custom" draws the application's template for its property; a column of
  any other type draws the ready cell.** The types date, percent, currency, yes-no, list and text
  change nothing in the drawing: the value is shown as it is, or as the column's shaping function
  returns it.
- **An absent value and an empty string are drawn as a dash.** Zero and `false` are values and
  are drawn.
- **The value keeps one line and is cut with an ellipsis; a hint shows the full value only when it
  was cut.** A column may give its own hint text instead of the value.
- **The column may put an icon before or after the value, and the icon's style is computed per row
  from the value.**
- **A copyable ready cell carries a copy button, revealed while the pointer is over the cell.** It
  stands on the side opposite to the value's alignment unless the column names the side.
- **A copyable ready cell whose value is absent, an empty string, an empty list or an empty object
  has no copy button.**
- **A press on the copy button copies the shown value and the button says "Copied!" for two
  seconds.** A value that is neither text nor a number is copied as its JSON form. The press does not reach the row.
- **A column's width and minimum width, when declared, are the width of its cells.**

### The header

- **The header stays on top while the rows scroll under it.**
- **A press on a sortable header asks for the ascending order, and on the column already sorted
  ascending — for the descending one.** The family never asks to drop the sort.
- **A sort is asked only for a column the table has.** A property name matching no declared
  column is not handed to the application.
- **The header of a sorted column shows which way it is sorted.**
- **A header may carry an icon before or after its label and a hint on the label.**

### The filter row

- **The filter row is drawn under the header only when the application asks for it.** A column
  without a filter keeps its place with an empty cell.
- **A text or number filter commits its value by Enter or by leaving the field.** A date filter
  commits on choosing a date, a select filter on choosing an option.
- **An empty value removes the column's condition, and a value on a column without a condition
  adds one.** The whole set of conditions goes to the application at every change.
- **A column with operators shows the current operator and offers the rest.** Changing the
  operator of a column with neither a condition nor a value asks nothing.
- **The family keeps no conditions of its own and narrows no rows.** The application answers with
  new rows.

### Rows and presses

- **A row made clickable reports a press on it with the row and the event.** A row not made
  clickable reports neither a press nor a double click.
- **A press is reported when the pointer button goes down, not when it goes up.** So a double click
  arrives after two row presses.
- **A double click on a clickable row is reported with the row.**
- **A press or a double click inside an opt-out node, in the selection cell, in the header or on
  the row menu button does not reach the row.**

### The actions strip

- **A table with a row menu or inline actions draws the actions strip over the end of every row and
  an "Actions" header cell as wide as the strip.**
- **Inline actions stand before the row menu button.** A table with inline actions and no menu
  still draws the strip.
- **The strip is revealed while the pointer is over its row and while the row's menu is open.** On
  a device without hover it is always shown.
- **A row whose menu is open is marked as the active row until the menu closes.**

### The selection column

- **The selection column is drawn only when the application asks for it; the list asks for it
  whenever the list's selection is on.**
- **In multiple selection every row carries a checkbox and the header carries the page
  checkbox.**
- **The page checkbox is checked when every row of the shown page is marked, indeterminate when
  some are, and empty when none are.** Marks on other pages do not make it indeterminate.
- **The page checkbox marks or unmarks the rows of the shown page and touches no other mark.**
- **Marks are held by the record key and survive a change of the page.**
- **The application reads the marked records themselves, not only their keys.** A record marked on
  a page no longer shown is still handed over whole.
- **The application can clear the selection; clearing leaves no mark and no checked checkbox.**

### One row at a time

- **In single selection every row carries a radio button, and the header carries nothing.** The
  radio button is the circle alone and takes its accessible name from the dictionary.
- **Choosing a row takes the mark off the row chosen before; choosing the chosen row keeps it.**
- **In single selection the list's toolbar shows neither select all nor the counter.**

### Holding the selection

- **The preset marks are applied once, when the first non-empty rows and a non-empty preset have
  both arrived.** A later change of the preset does not overwrite what the person marked since.
- **A switched-off selection column keeps its marks visible and lets none be changed.** Select all
  is switched off with it.

### All records across pages

- **The list's toolbar shows select all, or, when the application hides it, the counter of marked
  records.**
- **Select all marks every loaded row; in the across-pages mode every page that arrives after it
  comes with its rows marked.** The across-pages mode is on unless the application switches it
  off.
- **Select all is indeterminate while some records are marked and not every record is.**
- **Unmarking a row in the across-pages mode puts the record into the exclusions.** Unchecking the
  page checkbox puts all rows of the page there.
- **Marking an excluded record again takes it out of the exclusions; with none left select all is
  checked again.**
- **An excluded record arrives unmarked every time its page is loaded again.**
- **Unchecking select all takes every mark off and ends the across-pages mode.**
- **The application reads whether select all is on, whether the across-pages mode is on and which
  records are excluded.** A bulk action over all records is sent as "all but these": the family
  never holds the records it did not load.

### The column settings

- **The toolbar's "Table configuration" button opens the settings panel on the right side.** A
  second press while it is open opens nothing.
- **The panel reorders columns by dragging and hides or shows each by its eye button.**
- **The panel carries two switches — the vertical and the horizontal scrollbar.**
- **The panel's save is unavailable until something in it changed; cancel closes it and changes
  nothing.**
- **Saved settings are kept in the browser's database under the table's storage key and come back
  when the table is opened again.**
- **Saved settings whose set of columns differs from the declared one are dropped, and the table
  is drawn by the declaration.**
- **A table with no saved settings shows the horizontal scrollbar and hides the vertical one.**
- **A hidden scrollbar hides the bar, not the scrolling.**
- **The scrollbar choice applies to its own table and to no other on the page.**
- **A hidden column draws neither its cell nor its filter cell.**

### The toolbar and the list

- **The search asks the application for the trimmed text half a second after the person stopped
  typing, and never twice for the same text.** Clearing the field asks for an empty text at once.
- **The search field is shown while there are rows, and on the placeholder only when the search
  holds text or was touched.**
- **The clear-filters button is shown while the filter row is, and is unavailable while no
  condition is set.**
- **Refresh asks the application to reload.**
- **The application's toolbar selectors and actions stand in the toolbar next to the kit's
  controls.**
- **The placeholder replaces the table when there are no rows and no conditions.** With
  conditions and no rows the table stays with its filter row, so the person can change them.
- **The first loading replaces the list with a spinner; a later fetching keeps the rows under a
  spinner with a backdrop.**

### The pagination bar

- **The bar is hidden while all records fit into the smallest offered page size.**
- **The page sizes offered are 10, 20, 40 and 50, each only while half of it does not exceed the
  number of records, and the current size always.**
- **Up to six pages are all shown; beyond that the first, the last and the neighbours of the
  current one are shown with dividers between them.**
- **The arrows and the numbers ask for a page only when there is one to go to.**
- **A change of the page size asks for the page that keeps the person at the same distance from
  the end of the list.**

### The narrow screen

- **Below the kit's threshold the table keeps its columns and scrolls sideways; it never turns into
  cards.**
- **Below the threshold no hint of the family is shown, the pagination bar shows only the current
  number, and the toolbar puts the search on a line of its own.**

## What is out of scope

- `rt-table`, `rt-dynamic-list`, `rt-pagination` and the second kit's settings panel: they are not
  edited, and the family does not replace them.
- The first kit: it keeps its own table until it is removed.
- Cards on a narrow screen: the first kit has none, and the owner said so.
- Formatting a value by the type of its column: the first kit never did it.
- Fetching records: the family reports what a person did, the application answers.

## Contract

Not applicable: the surface is the inputs and outputs of the family's components, and it serves
no procedures. The inputs repeat the first kit's: the rows, the record key, the columns with their
storage key, the current sort, the conditions, whether filters are shown, whether rows are
clickable, the page model, the search text, the loading and fetching flags, the switches of the
toolbar buttons and of the pagination bar, the selection switches and the preset marks. The
outputs repeat the first kit's too: the row press, the double click, the sort, the conditions, the
page, the search, the refresh and the clear-filters request.

### Refusal codes

Not applicable: nothing here makes a call.

## Data

The column settings are kept in the browser's database under the storage key the application
gives: per column its property, shown name, width, order and visibility, and the two scrollbar
flags. The selection lives while the screen is open and is not saved.

## Screens and states

| State                                   | What the person sees                                               |
| --------------------------------------- | ------------------------------------------------------------------ |
| the first loading                       | a spinner in place of the list                                     |
| fetching                                | the rows under a spinner with a backdrop                           |
| no rows, no conditions                  | the placeholder: a large search icon and "No Data Found"           |
| no rows, conditions set                 | the header, the filter row and an empty body                       |
| rows                                    | a sticky header, rows with a bottom border, the pagination bar     |
| a row hovered                           | its bottom border in the accent colour and the actions strip       |
| a row's menu open                       | the row active, the strip shown, the menu before the button        |
| nothing marked / some / all of the page | the page checkbox empty / indeterminate / checked                  |
| selection column switched off           | marks visible, every selection control unavailable                 |
| single selection                        | radio buttons, no page checkbox, no select all                     |
| select all on, some excluded            | select all indeterminate, excluded rows unmarked                   |
| a value cut in a ready cell             | an ellipsis; a hint with the full value on hover                   |
| a copy pressed                          | the check icon and "Copied!" for two seconds                       |
| the settings panel open                 | the panel on the right: two switches and the draggable column list |
| scrollbars hidden                       | no bars, the content still scrolls                                 |
| a narrow screen                         | the table scrolls sideways; no hints; the compact pagination bar   |

The showcase gets stories of its own, apart from the stories of `rt-table` and `rt-dynamic-list`:
the table under "Organisms/Table/DataTable", the list under "Organisms/Data/DataList". Each has
`Overview`, `Playground`, then one story per axis — `Columns` (every column type, the dash, a cut
value, icons on both sides, copy), `Sort`, `Filters` (every filter type, operators), `Selection`
(none, some and all of the page; switched off), `SingleSelection`, `RowEvents` (press, double
click, an opt-out node, with an event line), `RowActions` (menu, inline actions, both) and
`Settings` (the panel and both scrollbar switches); the list adds `SelectAcrossPages`, `Toolbar`,
`Pagination` and `Placeholder`; then `States`, `Narrow`, `Themes` and `Presets`. Every story
carries both halves of the styling preset pair — the base look and the material one. The first
kit's stories `ManyItems`, `FewItems`, `NoItems` and `CopyButtonOnHover` are covered by `Overview`,
`Placeholder` and `Columns`.

## Cross-cutting requirements

### Locales

Every word of the family comes from the kit's dictionary in all eight languages; the first kit's
English words are its English entries. The data of the rows and the header labels arrive from the
application in its language.

### SEO

Not applicable: the kit's showcase is closed from indexing.

### Mobile layout

No cards: the table scrolls sideways inside the list, as in the first kit. Hints are off, the
pagination bar is compact, the toolbar folds into two lines.

### Several objects

Several tables on one page do not meet: each holds its own marks and its own settings under its
own storage key, and each applies its own scrollbar choice.

## Decisions

- **The family is named `rt-data-table` for the table and `rt-data-list` for the list.** The
  second kit's `rt-` prefix; the first kit's names `rt-table` and `rt-dynamic-list` are taken by
  the second kit's own families. Rejected: `rt-legacy-table` — it reads as a deprecated part,
  while the owner asked for an alternative.
- **The family is separate, not additions to `rt-table`.** The owner's word of 22 September 2026.
  Rejected: the first draft of this agreement, which added eight features to `rt-table`.
- **The single choice of a row is drawn by `rt-radio-button`**, given by its `checked` input and
  heard by its `checkedChange` output, with `ariaLabel` for the circle alone; the multiple choice
  by `rt-checkbox` with its indeterminate state.
- **The composite parts are ported, not borrowed from the second kit.** The pagination bar, the
  filter cell and the settings panel repeat the first kit's layout on the kit's primitives: the
  second kit's own versions of them look different. Whether some can be shared is `Q-TP-16`.
- **The page checkbox answers for the shown page only.** The first kit, after a row is unmarked,
  keeps the page checkbox indeterminate while marks stay on other pages, and the bare table never
  recounts it on a page change; the agreement takes the recount. Open to the owner as `Q-TP-10`.
- **The scrollbar choice belongs to one table.** The first kit writes it on the page root, and the
  last table to save it repaints every other table on the page. Open to the owner as `Q-TP-11`.
- **Closed:** `Q-TP-2` — the types format nothing, as in the first kit; `Q-TP-3` — no cards;
  `Q-TP-5` — the press is reported on the button going down, as in the first kit; `Q-TP-8` — the
  counter is shown only when select all is hidden, so it never meets the across-pages mode;
  `Q-TP-9` — the radio button is the kit's family `rt-radio-button`.

## Open questions

- **`Q-TP-1` — where the agreement merges.** Proposed: a new subdomain of the second kit for the
  family. The boundary is the owner's.
- **`Q-TP-4` — the icon style of a ready cell.** The first kit takes a free line of style from the
  column per row; a free colour stays unchanged under the material preset and the dark theme.
  Named colours of the kit's icon, or the free style as in the first kit.
- **`Q-TP-6` — the keyboard.** The first kit's rows take no focus and no key, and a page number
  turns the page on any key, Tab included. Whether the port keeps that or activates a row and a
  page by Enter and Space.
- **`Q-TP-7` — the preset marks of records not on the first page.** The first kit marks only the
  preset records found among the first rows and drops the rest of the keys silently.
- **`Q-TP-10` — the page checkbox as in the first kit or by the shown page.** See the decisions.
- **`Q-TP-11` — the scrollbar choice per page or per table.** See the decisions.
- **`Q-TP-12` — the field look.** The first kit takes `appearance` and `filterAppearance` — the
  Material field looks "fill" and "outline"; the kit's input has one look. Whether the inputs stay
  and draw one look, or leave.
- **`Q-TP-13` — icon names in the column declaration.** The application names header and cell
  icons by Material Symbols names; the kit's icon set is named differently, and its map of first-kit
  names covers only the names seen in the first kit's templates.
- **`Q-TP-14` — a press on an inline action.** In the first kit it reaches the row unless the
  application stops it itself; only the row menu button is stopped by the table.
- **`Q-TP-15` — which pointer button activates a row.** The first kit reports a press of any
  button, the right one included.
- **`Q-TP-16` — sharing parts with the second kit.** Whether the pagination bar, the settings
  panel and the copy button of the family should be the second kit's own parts with a look added,
  as the reuse-first law asks, or stay the family's own.
- **`Q-TP-17` — `Q-DL-1` of the list of records.** The grill closed it by "selection in the kit";
  now the selection lives in the new family, and `rt-dynamic-list` still holds none.
- **`Q-TP-18` — declared but never drawn column fields.** The first kit declares a link, a class
  name, two filtering flags, a fixed flag and the icon's hint, visibility and colour, and draws none
  of them. Whether the declaration keeps them so that the application's columns compile unchanged.
- **`Q-TP-19` — settings saved by the first kit.** Whether the family reads the settings the
  application saved under the same key while it ran on the first kit, or starts from the
  declaration.
- **`Q-TP-20` — the exclusions after select all is unchecked.** The first kit empties the marks but
  keeps the exclusions until the application clears them, and checking select all again starts with
  the old exclusions.
- **`Q-TP-21` — the list's switch of the pagination bar.** The first kit's list takes it and passes
  it nowhere: the bar is always drawn, and the container's rule "refresh without pagination also
  clears the search" never fires. Whether the port wires the switch, and with it that rule.
- **`Q-TP-22` — an empty list or object in a ready cell.** The first kit draws a dash only for an
  absent value and an empty string; an empty list shows nothing and an empty object shows its
  default text, while the copy button already counts both as empty.

## History of changes

- 2026-09-22 — the agreement is written before the code, task RT-2316.
- 2026-09-22 — rewritten by the owner's word: a separate family with the first kit's look, not
  additions to `rt-table`; no cards; the column types and the double click as in the first kit.
