# What it is carried out by — a panel of choice in the bottom sheet on a phone

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **On a phone a panel of choice opens in the kit's bottom sheet, not next to its trigger.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:sheet`
- **Every part of the kit that opens a panel of choice has the sheet switched on, and one input switches it off.** — `projects/ui-kit-v2/src/lib/components/select/rt-select.component.ts:sheet`
- **An application switches the sheet off for every part under it by one setting.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.token.ts:RT_POPOVER_SHEET`
- **Wider than a phone the panel opens next to its trigger, as before.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:inSheet`
- **The sheet is titled by the label of the field, then by the accessible name of the control.** — `projects/ui-kit-v2/src/lib/components/form-control/rt-form-control.base.ts:sheetTitle`
- **A choice of one value closes the sheet together with the panel.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:close`
- **A choice of several values keeps the sheet open until the person closes it.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.ts:sheet`
- **A choice of several values in the sheet ends with a footer: the count, a reset and a done button.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.ts:resetChoice`
- **A choice of several values with a search keeps the search at the top of its list.** — `projects/ui-kit-v2/src/lib/components/multiselect/rt-multiselect.component.ts:setFilter`
- **A field that searches as it is typed opens the sheet on a tap, and the typing goes to a search at the top of the sheet.** — `projects/ui-kit-v2/src/lib/components/autocomplete/rt-autocomplete.component.ts:onSheetQuery`
- **A panel that opens on hover opens in the sheet only by a press, and the pointer leaving does not close the sheet.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover.directive.ts:#isMouseHover`
- **A sheet closed by its backdrop, by a drag or by Escape closes the panel the same way a press outside it does.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.component.ts:openChange`
- **The panel inside the sheet takes the full width of the sheet.** — `projects/ui-kit-v2/src/lib/components/popover/rt-popover-sheet.component.ts:RtPopoverSheetComponent`

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
