# What it is carried out by — delta unit and «growth is worse» on the stat tile

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The unit is set on the delta row, and percent is the default.** — `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.model.ts:unit`, `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts:deltaRow`; scenario `SC-UKV-1125`
- **The two rows of one tile may carry different units.** — `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts:yearDelta`; scenario `SC-UKV-1127`
- **Points are written by a kit label with a value parameter.** — `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts:uiPercentagePoints`, `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts:signedNumber`; scenario `SC-UKV-1126`
- **A row with an unknown base is not drawn in any unit.** — `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts:#visibleDelta`; scenario `SC-UKV-1128`
- **«Growth is worse» is a tile sign, and it paints both rows.** — `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts:growthIsWorse`, `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.scss:growth-worse`; scenarios `SC-UKV-1129`, `SC-UKV-1130`, `SC-UKV-1131`
- **The arrow shows the sign of the number whatever the «growth is worse» sign.** — `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts:directionOf`; scenarios `SC-UKV-1129`, `SC-UKV-1130`
- **A tile without the «growth is worse» sign paints its rows as now.** — `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.scss:direction--up`; scenario `SC-UKV-1132`
