# What it is carried out by — the list and the table under a Material theme

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The table header in the material preset is filled with the colour of the Material fill field.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-color-table-head-bg` — scenario `SC-UKV-358`
- **The table header is 44 px high, as the first kit's.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:rt-data-table-head-height` — scenario `SC-UKV-358`
- **The checkbox and the radio of the selection column stand in the middle of their cell.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:selectable` — scenario `SC-UKV-357`
- **The list search in the material preset is 52 px high in both looks.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-list-search-height` — scenario `SC-UKV-356`
- **The list search is drawn fill when the look is not given.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:appearance` — scenario `SC-UKV-359`
- **The underline of a fill field has a colour name of its own.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-color-field-fill-underline` — scenario `SC-UKV-358`
