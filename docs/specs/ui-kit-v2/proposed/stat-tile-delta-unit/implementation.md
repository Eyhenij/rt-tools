# Binding — delta unit and «growth is worse» on the stat tile

There is no code yet, so there are no `file:symbol` bindings here: the agreement is written before
the code, and the place of execution appears with it. Here are only the expected places.

## Where execution is expected

| Rule                                | Where expected                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| unit on the row, percent by default | `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.model.ts`       |
| points written by the kit label     | `projects/ui-kit-v2/src/lib/i18n/rt-kit-labels.en.ts`                         |
| dash in any unit; colour and arrow  | `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.ts`   |
| «growth is worse» paints both rows  | `projects/ui-kit-v2/src/lib/components/stat-tile/rt-stat-tile.component.scss` |
