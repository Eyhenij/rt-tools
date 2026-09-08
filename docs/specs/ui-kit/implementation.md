# What it is carried out by — the first kit

The rule of the domain is on the left, the place where it is carried out is on the right. The paths are
given from the root of the tree: the domain describes five subjects from different catalogues of the kit,
and they have no common root to count them from. The bindings of the second level of the side menu lie in
the subdomain — `side-menu/implementation.md`.

- **The button of the copying is not shown at an empty cell.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts:isCellEmpty`
- **Empty counts as the same as what the kit counts empty everywhere.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts:isCellEmpty`
- **The sign of the copyability of a column stays at the column.** — `projects/ui-kit/src/lib/ui-kit/table/util/table-column.interface.ts:copyable`
- **A cell with a value behaves as before.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts:onCopyToClipboard`
- **The spinner waits for the delay and only then becomes visible.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:visible`
- **The default of the delay is zero.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:delay`
- **The delay is counted from the insertion of the spinner, not from the first redrawing.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:visible`
- **A spinner lifted before the term takes its counter away with it.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:visible`
- **The delay lives in the spinner itself.** — `projects/ui-kit/src/lib/ui-kit/spinner/spinner.component.ts:delay`
- **The key Esc does not close the curtain.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:closesOf`
- **The former behaviour stays available by the setting of the opening.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.types.ts:IAsideConfig`
- **A click on the backing and a leaving by a route close the curtain as before.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:closesOf`
- **A forbidden source is not subscribed to at all.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:closesOf`
- **A programmatic closing is not put out by the setting.** — `projects/ui-kit/src/lib/ui-kit/aside/aside.service.ts:open`
- **The table gives the sorting only by the column it draws itself.** — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts:onSortChange`
- **The name is checked against the same set of the columns the table draws.** — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts:sortOfKnownColumn`
- **A name that did not coincide does not go outward at all.** — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts:sortOfKnownColumn`
- **The setting of the table is shown by the last reading, not by what answered last.** — `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.ts:readSource`
- **A write and a lifting of the setting reach the storage in the order of the calls.** — `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.ts:writeSource`
- **The panel of the setting of the columns opens as one.** — `projects/ui-kit/src/lib/ui-kit/table/components/table-container/table-container.component.ts:openConfigAsideSource`

The scenarios of the domain are bound to the tests by the number in the title of a test, not by a table
here: the bond is checked both ways by the checking of the specs.
