# A panel of choice in the bottom sheet on a phone

**Status:** in force · **Revision:** 23 November 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the popover of the second kit, the bottom sheet of the second kit, the field of the
second kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

A subdomain of the second kit's spec, written by task RT-3399.

## Why

On a phone a select, a multiselect and the other parts of the kit that open a list next to their
trigger draw it small and close to the field. A finger misses the rows, and a long list leaves the
screen. The date fields and the page filters of the kit already open in the bottom sheet there; the
rest did not. An application had to rebuild each panel in a sheet of its own.

## Terminology

- **A panel of choice** — the floating panel a part of the kit opens next to its trigger: the list
  of a select, the hints of an autocomplete, the menu of a button, the filters of a list.
- **The sheet mode** — the panel of choice is drawn inside the kit's bottom sheet instead of next
  to its trigger.

### What it is called in the interface

The person sees a panel that slides up from the bottom of the screen, with a handle, a close button
on the left of the header, a title in its centre and, where the sheet has an action, a filled
button on the right. Lists of choice inside it are drawn as cards.

## Rules

- **On a phone a panel of choice opens in the kit's bottom sheet, not next to its trigger.**
  The phone is the kit's phone threshold, 480 px; the date fields open their sheet by it too. A
  tablet and a narrow window keep the panel next to the trigger.
- **Every part of the kit that opens a panel of choice has the sheet switched on, and one input
  switches it off.** Switched off, the panel opens next to its trigger on a phone too.
- **An application switches the sheet off for every part under it by one setting.** The setting
  covers the parts that carry a select or a menu inside and have no input of their own.
- **Wider than a phone the panel opens next to its trigger, as before.**
- **The sheet is titled by the label of the field, then by the accessible name of the control.**
  With neither, the sheet has no title.
- **A choice of one value closes the sheet together with the panel.**
- **A choice of several values keeps the sheet open until the person closes it.**
- **A choice of several values in the sheet ends with a footer: the count and a reset.**
  The count says how many values are chosen, the reset takes them all off and keeps the sheet
  open. The done button stands on the right of the sheet header and closes the sheet. The choice
  is written on every press, so the done button confirms nothing — it only closes.
- **Every sheet of the kit has a close button on the left of its header.** The title stands in
  the centre of the header whatever stands on its sides; a sheet with no title keeps the close
  button. The close button asks to close the same way the backdrop does, and the focus returns to
  the trigger. The sheets of the date fields and of the page filters have the header too.
- **The action of a sheet stands on the right of its header as a filled button.** A choice of
  several values shows the done button there, the dynamic selector and the page filters show the
  apply button. The footer stays for what an application puts there.
- **A list of choice in the sheet is drawn as cards.** A card holds the label and an optional
  description on the left and the mark on the right: the kit radio button for a choice of one
  value, the kit checkbox for a choice of several, the kit switch in the toggles look. The lists
  are those of the select, the multiselect, the dynamic selector, the hints of the autocomplete
  and the comparison kinds of a table column filter. One input of the part returns the rows the
  panel has next to its trigger. The rows of an actions menu are not cards.
- **An option carries an optional description.** It is the second line of a card in the sheet;
  next to the trigger the row does not show it.
- **A sheet with a search opens by the height of its content and takes the full height while the
  keyboard is open.** The list stays visible above the keyboard. With the keyboard gone the sheet
  returns to the height of its content.
- **The page filters and the filters of a thread list open at full height.** A person types in
  several fields there.
- **A sheet whose choice reaches the application only by a button asks before it closes with a
  choice not applied.** The dynamic selector with marks set and the page filters with any input
  made since they opened ask: apply, do not apply, cancel. The question stands at the bottom of
  the screen. With nothing changed the sheet closes at once. Every other sheet closes without a
  question: its choice is written on every press, and what is typed in a search is not data.
- **Every sheet locks the scroll of the page and closes by Escape.** The sheets of the date fields
  and of the page filters do it the same as a panel of choice.
- **With reduced motion asked by the system the sheet appears without sliding.**
- **A field that searches as it is typed opens the sheet on a tap, and the typing goes to a search at the top of the sheet.**
  The field under the sheet gives its focus away; a query shorter than the minimum keeps the sheet
  open, since the person types on in it. A choice closes the sheet.
- **A panel that opens on hover opens in the sheet only by a press, and the pointer leaving does
  not close the sheet.** The profile menu, the «more» panel and the submenu of the page header
  open on hover next to their button; in the sheet a mouse passing over the button opens nothing,
  since on its way to the sheet it would close it.
- **A sheet closed by its backdrop, by a drag or by Escape closes the panel the same way a press
  outside it does.** The part of the kit learns of the close as before.
- **The panel inside the sheet takes the full width of the sheet.** The width taken from the
  trigger does not apply there.

## What is out of scope

- Tooltips, the help of a field, confirmations, dialogs and asides do not open in the sheet. The
  help of a field is the kit tooltip, subdomain `field-label-icon-actions`.
- The rows of a list next to its trigger and the rows of an actions menu do not change.
- A focus trap inside the sheet.

## Contract

Not applicable: no procedures.

### Refusal codes

Not applicable.

## Data

Not applicable.

## Screens and states

| Screen               | Loading   | Empty     | Refusal   |
| -------------------- | --------- | --------- | --------- |
| A panel in the sheet | no change | no change | no change |

## Cross-cutting requirements

### Locales

The title is the label the application gives the field. The labels of the field with toggles are
in the subdomain `toggle-choice`.

### SEO

Not applicable.

### Mobile layout

The subject of the subdomain: at width 375 a panel of choice opens in the bottom sheet. The
header is 52 px high with a 40 px close button 12 px from the left edge; a card is 56 px high
without a description, cards stand 8 px apart, and the mark ends 36 px from the edge of the screen.

### Several objects

Not applicable.

## Decisions

- **The sheet lives in the popover directive, not in every part of the kit.** Almost every part
  opens its panel through it, so one mode gives the sheet to all of them, and a part only passes
  its input through.

## Open questions

None.

## History of changes

| Date       | What changed                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-11-19 | The subdomain is written with scenarios 1382…1389 (RT-3399)                                                                                   |
| 2026-11-19 | The multiselect footer in the sheet, scenarios 1436…1438 (RT-3399)                                                                            |
| 2026-11-19 | The sheet in the rest of the set, scenarios 1439…1440 (RT-3399)                                                                               |
| 2026-11-19 | The autocomplete in the sheet, scenarios 1441…1443 (RT-3399)                                                                                  |
| 2026-11-19 | The page header menus in the sheet, scenarios 1444…1445 (RT-3399)                                                                             |
| 2026-11-19 | The actions menu `rt-menu` in the sheet, scenarios 1446…1449 (RT-3399)                                                                        |
| 2026-11-19 | The menu of a tab in the sheet, scenarios 1450…1451 (RT-3399)                                                                                 |
| 2026-11-19 | The folding toggle button group, scenarios 1452…1455 (RT-3399)                                                                                |
| 2026-11-19 | The multiselect with toggles, scenarios 1456…1460 (RT-3399)                                                                                   |
| 2026-11-19 | Tabs switch the sheet off for their menus, scenario 1461 (RT-3399)                                                                            |
| 2026-11-20 | The sheet opens on a phone, ≤480 px, by the owner's word «До 480 px» (RT-3399)                                                                |
| 2026-11-20 | Scenarios renumbered to 1554…1627 after main took 1385…1389 and 1436…1505; the toggle choice left for the subdomain `toggle-choice` (RT-3399) |
| 2026-11-23 | The close button, the action in the header, cards of choice, the description of an option, the height by the keyboard, the question before closing, scenarios 1710…1727 (RT-3531) |
