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
- **The sheet of the page filters has a reset in its footer.** The reset reports to the
  application, which clears the filters; the sheet stays open and no longer counts an input as not
  applied. With no filter set and nothing typed the reset is off.
- **A list of choice in the sheet is drawn as cards.** A card holds the label and an optional
  description on the left and the mark on the right: the kit radio button for a choice of one
  value, the kit checkbox for a choice of several, the kit switch in the toggles look. The lists
  are those of the select, the multiselect, the dynamic selector, the hints of the autocomplete
  and the comparison kinds of a table column filter. One input of the part returns the rows the
  panel has next to its trigger. A card under the pointer takes a denser fill; the keyboard
  position of a list takes it only where a pointer exists. Two handles override the fills:
  `--rt-sheet-card-bg` and `--rt-sheet-card-bg-hover`.
- **An option carries an optional description.** It is the second line of a card in the sheet;
  next to the trigger the row does not show it.
- **A sheet opens by the height of its content and takes the full height while a person types in
  it on a touch screen.** The sheet itself notices the focus in a text field, a search or an
  editable node of its panel. The sign is the pointer, not the width of the window: on a touch
  screen that focus opens the keyboard, and the list or the fields stay visible above it; with a
  mouse the height stays by the content. With the focus gone from the field the sheet returns to
  the height of its content. It holds alike for the search of a list, the page filters, the
  filters of a thread list and the dynamic selector. The full-height input of a sheet stays as a
  switch of the application; no part of the kit sets it.
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
- **An application replaces the header and the footer of a sheet by its own templates.** The header
  template stands in place of the close button, the title and the action; the handle stays. The
  footer template stands in the footer. Both get the request to close, and a sheet with a choice
  not applied asks on it as on its own close button. A panel of choice takes the two templates by
  its own inputs, and a list of choice of the kit hands them over from its inputs. Without a
  template the sheet draws its own header.

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
| 2026-11-23 | The templates of the header and the footer of a sheet, scenarios 1750…1754 (RT-3531)                  |
| 2026-11-23 | The reset in the footer of the page filters sheet, scenario 1755 (RT-3531)                            |
| 2026-11-23 | One height rule, by typing on a touch screen; the fill of a card under the pointer (RT-3531)          |
