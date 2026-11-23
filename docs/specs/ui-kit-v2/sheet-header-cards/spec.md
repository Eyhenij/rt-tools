# The header of a bottom sheet and the cards of choice

**Status:** in force · **Revision:** 23 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the bottom sheet of the second kit, the panel of choice in the bottom sheet, the
select, the multiselect, the autocomplete and the dynamic selector of the second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3531. Its rules were written into the
subdomain of the panel of choice in the bottom sheet and left it when that one outgrew the length
limit.

## Why

On a phone the bottom sheets of the kit looked each in its own way. A sheet had no button to close
it, the button that ends the work stood at the bottom under the list, and the list kept the small
rows it has next to a field. A sheet with several fields closed by one stray touch of its backdrop
and dropped what the person had typed.

## Terminology

- **The header of a sheet** — the line at the top of a bottom sheet: the close button, the title
  and the action.
- **The action of a sheet** — the one button that ends the work in the sheet: done or apply.
- **A card of choice** — an option of a list drawn as a box of its own, with the label on the left
  and the mark on the right.
- **A choice not applied** — what the person marked or typed in a sheet whose result reaches the
  application only by its apply button.

### What it is called in the interface

The person sees a close button on the left of the header, the title in its centre and a filled
button «Done» or «Apply» on the right. The options of a list are cards with a radio button, a
checkbox or a switch on the right. The question before closing offers «Apply», «Do not apply» and
«Cancel».

## Rules

- **Every sheet of the kit has a close button on the left of its header.** The title stands in
  the centre of the header whatever stands on its sides; a sheet with no title keeps the close
  button. The close button asks to close the same way the backdrop does, and the focus returns to
  the trigger. The sheets of the date fields and of the page filters have the header too, and the
  sheet of a date field is titled by the label of the field, then by its accessible name.
- **The action of a sheet stands on the right of its header as a filled button.** A choice of
  several values shows the done button there in both of its looks, the list and the toggles. The
  dynamic selector and the page filters show the apply button there. In the sheet the dynamic
  selector draws no buttons of its own: the apply button of the header is off while nothing is
  marked, and the close button of the sheet cancels. The footer stays for what an application
  puts there.
- **A list of choice in the sheet is drawn as cards.** A card holds the label and an optional
  description on the left and the mark on the right: the kit radio button for a choice of one
  value, the kit checkbox for a choice of several, the kit switch in the toggles look. The lists
  are those of the select, the multiselect, the dynamic selector, the hints of the autocomplete
  and the comparison kinds of a table column filter. One input of the part returns the rows the
  panel has next to its trigger.
- **An option carries an optional description.** It is the second line of a card in the sheet;
  next to the trigger the row does not show it.
- **A sheet with a search opens by the height of its content and takes the full height while the
  focus is in its search.** The lists with a search are those of the select, of the multiselect
  with its filter and of the autocomplete. The list stays visible above the keyboard. With the
  focus gone from the search the sheet returns to the height of its content.
- **The dynamic selector, the page filters and the filters of a thread list open at full height.**
  A person searches a long list or types in several fields there.
- **A sheet whose choice reaches the application only by a button asks before it closes with a
  choice not applied.** The dynamic selector asks with marks set. The page filters ask after any
  input made in the fields of the sheet since it opened, and when the application says the filters
  are changed: a kit list inside the sheet reports its change to the application, not to the
  sheet. The question offers three answers: apply, do not apply, cancel. It stands at the bottom
  of the screen. With nothing changed the sheet closes at once. Every other sheet closes without a
  question: its choice is written on every press, and what is typed in a search is not data.
- **Every sheet locks the scroll of the page and closes by Escape.** The sheets of the date fields
  and of the page filters do it the same as a panel of choice.
- **With reduced motion asked by the system the sheet appears without sliding.**

## What is out of scope

- The rows of a list next to its trigger do not change.
- The rows of an actions menu are not cards.
- When a panel of choice opens in the sheet and what switches the sheet off: subdomain
  `popover-sheet`.
- A sheet opened from a sheet: subdomain `sheet-stack`.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen                      | Loading   | Empty     | Refusal   |
| --------------------------- | --------- | --------- | --------- |
| A list of cards in a sheet  | no change | no change | no change |
| The question before closing | none      | none      | none      |

## Cross-cutting requirements

### Locales

The labels of the close button, of the done and apply buttons and of the three answers of the
question are the kit's own, in its eight languages. The title and the description of an option are
what the application gives.

### SEO

Not applicable.

### Mobile layout

The subject of the subdomain is a phone, width 375. The header is 52 px high with a 40 px close
button 12 px from the left edge; a card is 56 px high without a description, cards stand 8 px
apart, and the mark ends 36 px from the edge of the screen.

### Several objects

Not applicable.

## Decisions

None.

## Open questions

None.

## History of changes

| Date       | What changed                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 2026-11-23 | The subdomain is written with scenarios 1710…1727, moved from the subdomain `popover-sheet` (RT-3531) |
