# Marking the rows of the first kit's table in the second kit

**Status:** in force · **Revision:** 8 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the family of the first kit's table in the second kit; the kit's checkbox and radio
button
**Laws:** `frontend-application`, `verifiability`, `reuse-first`, `lists`
**Procedures:** none

A subdomain split out of the spec of the first kit's table as a family of the second kit by task
RT-2701, when that spec outgrew the length limit. The rules and the scenarios moved as they were,
with their numbers; the behaviour did not change.

## Why

A list is worked through by marking its rows: a bulk action is sent over what is marked, and a
person who marks rows on one page and moves to the next expects the marks to stay. The family of the
first kit's table carries the first kit's marking as it is, and its rules are long enough to be read
apart from the rest of the table.

## Terminology

- **Mark** — a record chosen by the person in the selection column.
- **Page checkbox** — the checkbox in the header of the selection column; it speaks of the rows of
  the shown page.
- **Select all** — the checkbox in the list's toolbar; it speaks of every record of the list.
- **Across-pages mode** — the state after select all, in which every page that arrives comes with
  its rows marked.
- **Exclusions** — the records unmarked by the person while the across-pages mode is on.

### What it is called in the interface

The page checkbox and select all take their accessible names from the kit's dictionary. The radio
button of single selection is the circle alone and takes its name from there too.

## Rules

### The selection column

- **The selection column is drawn only when the application asks for it; the list asks for it
  whenever the list's selection is on.**
- **In multiple selection every row carries a checkbox and the header carries the page
  checkbox.**
- **The page checkbox is checked when every row of the shown page is marked.** It is shown
  indeterminate only while it is not checked.
- **After a row is marked or unmarked the page checkbox is indeterminate while any record is
  marked, on the shown page or on another.** With no mark left anywhere it is empty.
- **After the page checkbox is pressed it is indeterminate while some row of the shown page is
  marked.**
- **The list recounts the page checkbox for the shown page when rows arrive; the bare table does
  not, and keeps the state it had on the page before.**
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
- **Only the preset records found among those first rows are marked; the other keys of the preset
  are dropped.**
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
- **Unchecking select all takes every mark off and ends the across-pages mode, and the exclusions
  stay.** They are emptied only by the application's own call; until then a new select all starts
  with the old exclusions.
- **The application reads whether select all is on, whether the across-pages mode is on and which
  records are excluded.** A bulk action over all records is sent as "all but these": the family
  never holds the records it did not load.

## What is out of scope

- **The press on a row and the selection cell's place among the presses.** They are rules of the
  table family itself, next to the rows and the presses.
- **The bulk action.** The family hands over what is marked and what is excluded; the action over
  them belongs to the application.

## Contract

The family takes the selection mode, the preset marks and the switches of select all and of the
across-pages mode as inputs. It reports the marked records, whether select all is on, whether the
across-pages mode is on and the exclusions, and it takes the application's call to clear the
selection.

### Refusal codes

Not applicable: the family is a component of the kit and throws no refusals.

## Data

A mark is held by the record key. The exclusions are a set of record keys. The records themselves
are kept for the marks so that a record marked on a page no longer shown is handed over whole.

## Screens and states

| State                     | What is seen                                                         |
| ------------------------- | -------------------------------------------------------------------- |
| nothing marked            | empty checkboxes, an empty page checkbox and select all              |
| some rows marked          | the marked rows checked, the page checkbox indeterminate             |
| every row of a page       | the page checkbox checked                                            |
| select all on             | every loaded row checked, select all checked                         |
| select all with exclusion | the excluded rows empty, select all indeterminate                    |
| single selection          | a radio button in every row, nothing in the header and no select all |

## Cross-cutting requirements

### Locales

The accessible names of the page checkbox, of select all and of the radio button come from the
kit's dictionary, not glued in the template.

### SEO

Not applicable: the kit draws no public pages.

### Mobile layout

The selection column stands in the table on a narrow screen the same as on a wide one: the table
scrolls sideways instead of drawing cards, and the column scrolls with it.

### Several objects

Not applicable: the family holds no data of a workspace.

## Decisions

- **The marking is the first kit's, copied as it is.** The owner's word on the port of the table
  holds here too: the behaviour is copied, oddities included, and discussed later.

## Open questions

- None.

## History of changes

- 2026-10-08 — the subdomain is split out of the spec of the first kit's table as a family of the
  second kit by RT-2701: that spec outgrew the length limit, and the rules of marking moved here
  with their scenarios and bindings.
