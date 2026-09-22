# The whole table of the first kit in the second kit

**Status:** proposed · **Revision:** 2026-09-22 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table family and the list of records with its own toolbar of the kit; the
checkbox, the icon, the icon button, the tooltip, the copy cell and the menu of the kit; the
material styling preset — it brings the first kit's look
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `lists`
**Procedures:** none

A product agreement written before the code, task RT-2316. It adds to the table family and to the
list of records what the first kit's table can do and the second kit's cannot. Where it merges is
open question `Q-TP-1`; the scenario numbers stay as they are after the merge.

## Why

An application moving from the first kit to the second loses eight things its screens already use:
marking rows for a bulk action, choosing one row, marking all records across pages, a double click
on a row, quick actions next to the row menu, ready cells that draw a value without a template of
their own, the switches of scrollbars in the column settings and a way to keep a row from opening
when a person clicks some part of it. Each of them the consumer would write anew on every screen,
and the move stops being a swap of a library.

The owner's word is "move the whole functionality, leaving out only Material, and keep the look".
The kit's own parts replace Material; the first kit's look arrives through the material styling
preset, not through new styles of the table.

## Terminology

| Term                 | What it is                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| the selection column | the first column of the table with a checkbox or a radio in every row                              |
| the page checkbox    | the checkbox in the header of the selection column; it answers for the rows of the shown page only |
| a mark               | the state of one record being chosen; it is held by the record's key                               |
| the record key       | the property of a record the consumer names to tell records apart; `id` unless named               |
| the preset marks     | the keys of records the consumer asks to be marked when the table first shows rows                 |
| select all           | the checkbox of the list's toolbar that marks every record on every page, loaded or not            |
| the exclusions       | the records a person unmarked while select all is on                                               |
| the actions strip    | the place at the end of a row where the row menu stands                                            |
| an inline action     | a button of the consumer standing in the actions strip next to the menu, outside it                |
| a ready cell         | a cell the kit draws by the column's declaration, without a template of the consumer               |
| an opt-out node      | a part of a row the consumer marks so that a click on it does not activate the row                 |

### What it is called in the interface

| In the agreement    | On the screen                                                                  |
| ------------------- | ------------------------------------------------------------------------------ |
| the page checkbox   | a checkbox without a visible label; its accessible name is from the dictionary |
| select all          | "Select all"                                                                   |
| the counter         | "Selected: N"                                                                  |
| scrollbar switches  | "Vertical scrollbar", "Horizontal scrollbar"                                   |
| an empty ready cell | a dash                                                                         |

The exact words of the dictionary are chosen by the dictionary, in all eight languages of the kit.

## Rules

### The selection column

- **A table draws the selection column only when the consumer asks for selection.** A table
  without it has no empty first column.
- **In multiple selection every row carries a checkbox, and the header carries the page
  checkbox.**
- **The page checkbox is checked when every row of the shown page is marked, indeterminate when
  some are, and empty when none are.** It answers for the shown page: marks on other pages do not
  make it indeterminate.
- **The page checkbox marks or unmarks the rows of the shown page and touches no other mark.**
- **Marks are held by the record key and survive a change of the page.** Coming back to a page
  shows its marked rows marked, and the page checkbox is recounted for the page shown.
- **The consumer reads the marked records themselves, not only their keys.** A record marked on a
  page no longer shown is still handed over whole.
- **The consumer can clear the selection, and clearing leaves no mark and no checkbox state
  behind.**
- **A click, a double click or a key inside the selection cell does not activate the row.**

### One row at a time

- **In single selection every row carries a radio, and the header carries nothing.**
- **Choosing a row takes the mark off the row chosen before.** Choosing the chosen row again
  leaves it chosen.
- **In single selection the list's toolbar shows no select all.**

### Holding the selection

- **The preset marks are applied once, when the first rows arrive.** A later change of the preset
  does not overwrite what the person marked since.
- **A switched-off selection column keeps its marks visible and lets none be changed.** The page
  checkbox and select all are switched off with it.

### All records across pages

- **Select all marks every record of the list, including the pages not loaded yet.** Every page
  that arrives after it comes with its rows marked.
- **Unmarking a row while select all is on puts the record into the exclusions, and select all
  becomes indeterminate.** Unchecking the page checkbox puts all rows of the page there.
- **Marking an excluded record again takes it out of the exclusions; with no exclusions left
  select all is checked again.**
- **An excluded record arrives unmarked every time its page is loaded again.**
- **Unchecking select all takes every mark off and empties the exclusions.**
- **The consumer reads whether select all is on and which records are excluded.** A bulk action
  over all records is sent as "all but these", because the kit never holds the records it did not
  load.
- **The consumer can switch the across-pages mode off; then select all marks the loaded rows only
  and keeps no exclusions.**

### A double click on a row

- **A double click on an activatable row is reported with the row.** A row not made activatable
  reports no double click.
- **A double click that starts on an interactive element, on an opt-out node, in the selection
  cell or in the actions strip is not reported.**

### Inline actions

- **Inline actions stand in the actions strip before the row menu and are revealed together with
  it.** Revealed on hover, on focus inside the row and while the menu is open; always visible where
  the device has no hover.
- **A table with inline actions and no menu still draws the actions strip.**
- **A click on an inline action does not activate the row.**

### Ready cells

- **A column declared without a template of its own draws its value by a ready cell.** A column
  with a template draws the template, and the ready cell stays out of it.
- **An empty value is drawn as a dash.**
- **The value keeps one line and is cut with an ellipsis; the full value is shown in a hint only
  when it was cut.** A column may give its own hint text instead of the value.
- **On a narrow screen the ready cell shows no hint.**
- **The column may shape the shown value from the raw one.** The copied value is the shown one.
- **The column may put an icon before or after the value, and its colour is chosen per row from
  the value.**
- **A copyable ready cell with an empty value has no copy button.**
- **A ready cell draws in a card the same as in a row.**

### Scrollbars

- **The column settings carry two switches — the vertical and the horizontal scrollbar.**
- **A hidden scrollbar hides the bar, not the scrolling.**
- **A table with no saved choice shows the horizontal scrollbar and hides the vertical one.**
- **The choice is saved with the column settings of the table and comes back with them.** Saved
  settings written before the switches existed read as the default choice, not as a refusal.
- **The choice applies to its own table and to no other on the page.**

### Opt-out of a row click

- **A click inside an opt-out node does not activate the row.** An interactive element needs no
  mark: the second kit already skips it. The mark is for a non-interactive part — a label with a
  hint, a picture, a block of text the person selects.

### The look

- **Every new part takes its colours from the kit's assignments, so the material preset repaints
  it into the first kit's look.** A colour written into a part directly stays the second kit's
  colour under the preset.
- **No part of this work imports Material.**

## What is out of scope

- The header cell of the first kit — its icon, hint and class. In the second kit the header is the
  consumer's own markup and already takes all three.
- The width fields of a column and the look of Material fields (`appearance`): the width lives in
  the consumer's column markup, and the look of fields comes with the preset.
- Formatting a value by the type of its column — see `Q-TP-2`.
- The filter row — it has a subdomain of its own, `docs/specs/ui-kit-v2/table-filter/`.
- Fetching records: the table and the list report what a person did, the consumer answers.

## Contract

The table and the list make no calls to the server and declare no procedures.

### Refusal codes

Not applicable: nothing here makes a call.

## Data

Nothing is stored except the column settings, which already live in the browser's storage under
the table's identifier. They gain two flags — the vertical and the horizontal scrollbar. The
selection lives only while the screen is open and is not saved.

The consumer gets outward: the marked records and their keys; in the list, besides, whether select
all is on and the excluded records; the row of a double click.

## Screens and states

| State                             | What the person sees                                          |
| --------------------------------- | ------------------------------------------------------------- |
| nothing marked                    | empty checkboxes, an empty page checkbox                      |
| some rows of the page marked      | the page checkbox indeterminate                               |
| every row of the page marked      | the page checkbox checked                                     |
| selection column switched off     | marks visible, every control switched off                     |
| single selection                  | radios, no page checkbox, no select all                       |
| select all on, no exclusions      | select all checked, every row marked                          |
| select all on, some excluded      | select all indeterminate, excluded rows unmarked              |
| a row hovered with inline actions | the inline actions and the menu revealed in the actions strip |
| a value cut in a ready cell       | an ellipsis; a hint with the full value on hover              |
| scrollbars hidden                 | no bars, the content still scrolls                            |

Every state is shown on the second kit's showcase, and every story carries both halves of the
styling preset pair — the base look and the material one:

| Feature                    | Stories                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| the selection column       | table `Selection` — none, some, all of the page; `SelectionDisabled`            |
| one row at a time          | table `SingleSelection`                                                         |
| holding the selection      | table `PresetSelection`; list `SelectAcrossPages` — select all, exclusions      |
| a double click and opt-out | table `RowEvents` — click, double click and an opt-out node, with an event line |
| inline actions             | table `InlineActions` — with the menu and without it                            |
| ready cells                | table `ReadyCells` — dash, cut value, icon both sides, copy; `CopyInTable`      |
| scrollbars                 | settings panel `Scrollbars`; table `Scrollbars` — both bars shown and hidden    |
| the settings side panel    | table `SettingsAside` — the panel the first kit showed on no story at all       |

The stories are parts of the families' existing matrix pages, next to `Density`, `Sort` and
`Clickable`; `Playground` of the table gains a control for each new input.

## Cross-cutting requirements

### Locales

Every new label — the accessible names of the row checkbox, the row radio and the page checkbox,
the two scrollbar switches and the dash's accessible name if it gets one — comes from the kit's
dictionary in all eight languages, not from the markup.

### SEO

Not applicable: the kit's showcase is closed from indexing.

### Mobile layout

Below the kit's threshold the table draws cards. A ready cell draws in a card the same as in a row
and shows no hint there. How the selection and the inline actions look in a card is open question
`Q-TP-3`.

### Several objects

Several tables on one page do not meet: each holds its own marks, and each keeps its own scrollbar
choice under its own identifier.

## Decisions

- **The selection lives in the kit.** Closes `Q-DL-1` of the list of records: the owner asked for
  the whole functionality, and the first kit held the selection in its own directives, not in the
  consumer.
- **The page checkbox answers for the shown page only.** The first kit, after a row is unmarked,
  leaves the page checkbox indeterminate while marks remain on other pages, although its own
  recount on a page change looks at the shown page only; the agreement takes the recount.
- **The scrollbar choice belongs to one table.** The first kit writes it on the page root, and the
  last table to save it repaints every other table on the page.
- **The icon colour of a ready cell is one of the kit's named colours.** The first kit takes a free
  line of style from the column; a free colour stays unchanged under the material preset and under
  the dark theme. Open to the owner as `Q-TP-4`.

## Open questions

- **`Q-TP-1` — where the agreement merges.** The table family has no subdomain of its own yet.
  Proposed: a new subdomain named table takes every rule but "All records across pages", which merges
  into the list of records next to the counter. The boundary is the owner's.
- **`Q-TP-2` — whether a column type formats the value.** The first kit declares the types date,
  percent, currency, yes-no and list, and draws every one of them as plain text: only "custom"
  changes anything. Porting as is means the same; formatting means a behaviour the first kit never
  had — a date format, a currency, the words for yes and no in eight languages.
- **`Q-TP-3` — the selection and the inline actions in a card.** The first kit had no cards.
  Whether a card carries a checkbox or a radio, and whether the inline actions stand next to the
  card's menu.
- **`Q-TP-4` — the icon colour of a ready cell.** Named colours of the kit, as the decision above
  says, or a free style as in the first kit.
- **`Q-TP-5` — the clicks inside a double click.** The first kit reports a row click on the press
  of the button, so a double click also arrives as two row clicks first. A screen where a click
  opens a side panel and a double click does something else gets both. Whether the second kit keeps
  that or holds the click back until it is clear no second one follows.
- **`Q-TP-6` — a double click from the keyboard.** A row activates by Enter and Space; the double
  click has no key. Whether it gets one, or stays a pointer shortcut for what the row menu already
  offers.
- **`Q-TP-7` — the preset marks of records not on the first page.** The first kit marks only the
  preset records it finds among the first rows and drops the rest of the keys silently.
- **`Q-TP-8` — the counter while select all is on.** The first kit counts the marked records it
  loaded, which is less than what a bulk action will touch. Whether the counter shows the total
  less the exclusions.
- **`Q-TP-9` — the radio.** The second kit has no radio. Whether it becomes a family of the kit
  of its own, with a showcase and a spec, or a part of the table only.

## History of changes

- 2026-09-22 — the agreement is written before the code, task RT-2316.
