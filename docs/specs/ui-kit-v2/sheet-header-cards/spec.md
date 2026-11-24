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
  the node the sheet was opened from: a panel of choice returns it to its trigger, a sheet that
  stands in the template of a part returns it itself, and a focus already moved elsewhere is left
  alone. The sheets of the date fields and of the page filters have the header too, and the
  sheet of a date field is titled by the label of the field, then by its accessible name. A
  sheet whose header is replaced by a template is named by the title as a string.
- **The action of a sheet stands on the right of its header as a filled button.** A choice of
  several values shows the done button there in both of its looks, the list and the toggles. The
  dynamic selector and the page filters show the apply button there. In the sheet the dynamic
  selector draws no buttons of its own: the apply button of the header is off while nothing is
  marked or the list is loading, and the close button of the sheet cancels. The sheets of a time,
  of a date with time and of a period show there the done or the apply button, and the panel
  below keeps no such button: its footer holds the now button, the chosen value, the length of
  the period and the reset. The panel of a period draws no title of its own there: the header of
  the sheet carries it. The sheet of a date without time has no action: a day is chosen by a
  touch. The footer stays for what an application puts there.
- **The time in a sheet is chosen by a wheel.** The hours and the minutes scroll under a band
  that stands in the centre, and the value that stopped under the band is the chosen one; a value
  pressed is scrolled under the band. A value outside the bounds is not taken, and the wheel
  returns to the chosen one. The wheel turns without an end: the first value follows the last
  one. A field without a time starts the wheel at the current time rounded down to the step of
  minutes; one input of the field starts it at midnight instead, and a start time outside the
  bounds gives way to the first allowed one, counted anew by the bounds of a day once it is
  picked. A minute off the step, typed in the field or given by the form, has a row of its own
  in the wheel. The Tab key stands on the chosen value alone, and the arrows step the choice by
  one around the circle; a finger resting on the wheel chooses nothing until it lifts. The start
  time is not a choice: the sheet closes
  without a question, and the done button writes it. Next to a field on a wide screen the
  columns stay lists with no time until one is pressed.
- **The sheet of the page filters has a reset in its footer.** The reset reports to the
  application, which clears the filters; the sheet stays open and no longer counts an input as not
  applied. With no filter set and nothing typed the reset is off.
- **A list of choice in the sheet is drawn as cards.** A card holds the label and an optional
  description on the left and the mark on the right: the kit radio button for a choice of one
  value, the kit checkbox for a choice of several, the kit switch in the toggles look. The lists
  are those of the select, the multiselect, the dynamic selector, the hints of the autocomplete
  and the comparison kinds of a table column filter. A hint carries the radio button too, and the
  hint equal to the value of the field is the marked one. The look holds while the closed sheet
  slides away. One input of the part returns the rows the
  panel has next to its trigger. A card under the pointer takes a denser fill; the keyboard
  position of a list takes it only where a pointer exists. Two handles override the fills:
  `--rt-sheet-card-bg` and `--rt-sheet-card-bg-hover`.
- **An option carries an optional description.** It is the second line of a card in the sheet;
  next to the trigger the row does not show it.
- **A sheet opens by the height of its content and takes the full height while the screen
  keyboard is shown.** The sheet itself notices the focus in a text field, a search or an
  editable node of its panel and from then on watches the part of the window the browser shows.
  The full height comes with the keyboard, not with the tap: the owner saw on a phone a sheet
  that rose before the keyboard appeared. The keyboard lies over the window and does not resize
  it, so the sign is the visible part lower than the window by a keyboard's height; with a mouse
  that never happens and the height stays by the content. While the keyboard is shown the sheet
  stands in the visible part above it, so the last rows of a list are reachable; once it is
  hidden the sheet returns to the height of its content. It holds alike for the search of a list, the page filters, the
  filters of a thread list and the dynamic selector. The full-height input of a sheet stays as a
  switch of the application; no part of the kit sets it.
- **Long content raises a sheet to the full height of its box.** The panel grows with its content
  up to the height of the sheet less the strip of 12px on top, the same as a full-height sheet;
  past it the body scrolls. The owner asked for it: «ну или если полей много то на всю высоту».
  The box is the screen, or a box of a page lower than the window: the panel never leaves it, and
  the header with «×» stays seen. An application sets a lower limit by its own property.
- **The presets of the period sheet are one row that scrolls round.** The row is as wide as the
  sheet, its edges fade, and the chosen preset stands in the centre. Picking another rolls the row
  the short way round; the month arrows of the period sheet stand in the row of its title.
- **The month of a sheet keeps the height of six weeks.** A month of five or four weeks stands in
  the middle of that height, so paging never moves the footer of the sheet. Outside the sheet the
  month keeps its own height.
- **The tabs «Date | Time» keep the height of the sheet.** The date part and the time part stand
  in one cell; the part of the other tab stays in the layout, unseen and untouchable, whether it is
  the month, the month grid or the year grid. The time columns stand in the middle of its height.
- **A sheet whose choice reaches the application only by a button asks before it closes with a
  choice not applied.** The dynamic selector asks with marks set. The page filters ask after any
  input made in the fields of the sheet since it opened, and when the application says the filters
  are changed: a kit list inside the sheet reports its change to the application, not to the
  sheet. The sheets of a time, of a date with time and of a period ask with a value chosen and
  not applied. The question offers three answers: apply, do not apply, cancel. It stands at the
  bottom of the screen and takes the focus on its first answer; the sheet under it is out of
  reach, and the cancel answer returns the focus to where the close was asked from. The answer
  "do not apply" is reported apart from the closing: the page filters pass it to the application,
  which owns the fields and returns them to the applied values. With nothing changed the sheet
  closes at once. Every other sheet closes without a question: its choice is written on every
  press, and what is typed in a search is not data.
- **Every sheet locks the scroll of the page and closes by Escape.** The sheets of the date fields
  and of the page filters do it the same as a panel of choice. Escape pressed inside a sheet goes
  no further: a side panel or a dialog around the sheet does not close by it. Escape already
  taken by a layer above the sheet does not close the sheet. Escape pressed inside the panel of
  a date sheet goes the same way as its close button: in the grid of months or years it steps a
  view back and closes nothing. A sheet that stands in the template of a page loads the styles
  of the scroll lock itself: no other layer may have been opened before it.
- **With reduced motion asked by the system the sheet appears without sliding.**
- **An application replaces the header and the footer of a sheet by its own templates.** The header
  template stands in place of the close button, the title and the action; the handle stays. The
  footer template stands in the footer. Both get the request to close, and a sheet with a choice
  not applied asks on it as on its own close button. Both get the request to apply as well: it
  reports the same as the apply answer of the question and leaves the closing to the owner. A panel of choice takes the two templates by
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
question are the kit's own: the kit carries them in English, and the label set of an application
translates them. The title and the description of an option are
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
| 2026-11-23 | The focus of the question and of a closed sheet, Escape inside a layer, the dropped input, the action |
|            | and the question of the date sheets, the time wheel, the place above the keyboard, the mark of a      |
|            | hint, the apply request of a template, scenarios 1756…1767 (RT-3531)                                  |
| 2026-11-23 | The wheel turns without an end and starts at the current time, scenarios 1768, 1769 (RT-3531)         |
| 2026-11-23 | A minute off the step, the keys of the wheel, Escape inside a date panel, scenarios 1770, 1771        |
|            | (RT-3531)                                                                                             |
