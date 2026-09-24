# What it is carried out by — the list and the table under a Material theme

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The table header in the material preset is filled with the colour of the Material fill field.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-color-table-head-bg` — scenario `SC-UKV-358`
- **The table header is 44 px high, as the first kit's.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:rt-data-table-head-height` — scenario `SC-UKV-358`
- **The checkbox and the radio of the selection column stand in the middle of their cell.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:selectable` — scenario `SC-UKV-357`
- **The list search in the material preset is 52 px high in both looks.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-list-search-height` — scenario `SC-UKV-356`
- **The list and the table of the first kit draw the first kit's look by default.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.model.ts:RT_PRESET_MATERIAL_CLASS` — scenario `SC-UKV-360`
- **Another look of the family is set by the kit settings.** — `projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts:DataTable` — scenario `SC-UKV-360`
- **The default look of the list search and the filter fields is set by the kit settings.** — `projects/ui-kit-v2/src/lib/config/rt-kit-config.model.ts:DataList` — scenario `SC-UKV-361`
- **The list search in the material preset has the first kit's measures.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-list-search-width` — scenario `SC-UKV-356`
- **The list search is drawn fill when the look is not given.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:appearance` — scenario `SC-UKV-359`
- **The underline of a fill field has a colour name of its own.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-color-field-fill-underline` — scenario `SC-UKV-358`
- **The column settings panel of the list draws the first kit's panel in the material preset.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:backdropClass` — scenario `SC-UKV-362`
- **A node carrying the preset declares the light base under the set.** — `tools/build-tokens-v2.mjs:presetNode` — no scenario: the look of a resolved colour is held by the showcase frames
- **An icon of a column is filled unless its declaration says outlined.** — `projects/ui-kit-v2/src/lib/components/data-table/header-cell/rt-data-table-header-cell.component.html:fill` — scenario `SC-UKV-363`
- **The action buttons above the table are the first kit's small raised buttons in the material preset.** — `projects/ui-kit-v2/src/styles/tokens.material.mjs:rt-list-action-shadow` — no scenario: the look of the raised buttons is held by the showcase frames of the first kit's list
