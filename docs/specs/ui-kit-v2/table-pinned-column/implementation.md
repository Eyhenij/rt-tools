# What it is carried out by — a pinned column of the second kit's table

The rule of the subdomain is on the left, the place where it is carried out is on the right. The
paths are given from the root of the tree.

- **A pinned cell is never transparent.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:rt-table-pinned-bg` — an opaque surface under the row colour. Scenario `SC-UKV-1122`
- **A pinned cell takes the background of its own row.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:rt-table-row-bg` — hover and the problem row reassign it. Scenarios `SC-UKV-1123`, `SC-UKV-1124`
- **Without a row colour, a pinned cell takes the table surface colour.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:rt-table-pinned-bg`; scenario `SC-UKV-1122`
- **A pinned edge carries a shadow while hidden content lies behind it.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-pinned-edges.ts:hiddenEdges`; scenarios `SC-UKV-1117`, `SC-UKV-1118`
- **A pinned edge carries no shadow when nothing is hidden behind it.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-pinned-edges.ts:hiddenEdges`; scenario `SC-UKV-1119`
- **The shadow follows the scroll at once, with no wait for another event.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-pinned-edges.ts:RtTablePinnedEdges`; scenario `SC-UKV-1117`
- **The background and the shadow of a pinned cell come from `--rt-*` tokens.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:rt-table-pinned-shadow-color`; scenario `SC-UKV-1120`
- **A column pinned left and a column pinned right behave alike, each with its shadow on its own pinned edge.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:cdk-table-sticky-border-elem-right`; scenarios `SC-UKV-1117`, `SC-UKV-1118`
- **Both themes give a solid background and a visible shadow.** — `projects/ui-kit-v2/src/styles/tokens.light-parts.mjs:rt-color-table-pinned-shadow`; scenario `SC-UKV-1121`
- **A shadow that is not shown takes no room.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:cdk-table-sticky-border-elem-left` — the pseudo-element gets its content only under a hidden edge. Measured on 4 November 2026: the scroll area widened by 12 px before the edit and by 0 after it
- **In right-to-left writing the shadow follows the logical edge.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.scss:dir` — the CDK class names the physical side, the host modifier the logical edge, and the rule maps them by direction
- **The table takes its background from the nearest theme around it.** — `projects/ui-kit-v2/src/styles/tokens.light-parts.mjs:rt-color-table-bg` — the dark theme answers the name with the page background, and a light piece answers it again

The scenarios of the subdomain are bound to the tests by the number in the title of a test, not by a
table here: the bond is checked both ways by the checking of the specs.
