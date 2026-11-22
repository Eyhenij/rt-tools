# A panel of choice in the bottom sheet on a phone

**Status:** in force · **Revision:** 20 November 2026 · **Scenario prefix:** `SC-UKV`
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

The person sees a panel that slides up from the bottom of the screen, with a handle, a title and
the same rows as before.

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
- **A choice of several values in the sheet ends with a footer: the count, a reset and a done button.**
  The count says how many values are chosen, the reset takes them all off and keeps the sheet
  open, the done button closes the sheet. The choice is written on every press, so the done
  button confirms nothing — it only closes.
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
- The look of the rows inside the panel does not change.

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

The subject of the subdomain: at width 375 a panel of choice opens in the bottom sheet.

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
