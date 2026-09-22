# What it will be carried out by — the whole table of the first kit in the second kit

There is no code yet, so there is not one `file:symbol` binding here: the agreement is written
before the code, and the place of execution appears with it. Here are only the foreseen places, so
that at the merge it is seen where to look. The first column names the group of rules of the spec
next to it; the rules themselves get their bindings verbatim when the agreement merges.

## Where execution is foreseen

| Group of rules                          | Where it is foreseen                                                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the selection column, one row at a time | the table family `projects/ui-kit-v2/src/lib/components/table/` — the column is registered by the table the way the row actions column already is          |
| the checkbox of a row and of the page   | the kit's checkbox `projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.ts` — it already has the indeterminate state                      |
| the radio of a row                      | nothing yet: the second kit has no radio — `Q-TP-9`                                                                                                        |
| holding the selection                   | a pure selection logic next to the table's other logic files, so that the marks are tested without drawing a table                                         |
| all records across pages, the counter   | the list family `projects/ui-kit-v2/src/lib/components/dynamic-list/` — it already carries the view inputs of select all and the counter                   |
| a double click, opt-out of a row click  | the row directive `projects/ui-kit-v2/src/lib/components/table/rt-table-row.directive.ts` — it already skips interactive elements                          |
| inline actions                          | the actions strip of `projects/ui-kit-v2/src/lib/components/table/rt-table.component.html` and a directive next to the row actions directive               |
| ready cells                             | a new part of the table family; the copy button is the kit's copy cell `projects/ui-kit-v2/src/lib/components/table/copy-cell/`                            |
| the hint of a cut value                 | the kit's tooltip `projects/ui-kit-v2/src/lib/components/tooltip/`                                                                                         |
| the icon of a ready cell                | the kit's icon `projects/ui-kit-v2/src/lib/components/icon/` — its named colours                                                                           |
| scrollbars                              | the settings panel `projects/ui-kit-v2/src/lib/components/table/settings-panel/` and the saved settings — the persistence file next to the table component |
| the labels                              | the kit's dictionary, namespace `rtKit`, all eight languages                                                                                               |
| the look                                | the material styling preset — the agreement `docs/specs/ui-kit-v2/proposed/material-preset/`                                                               |
| the stories and their preset pairs      | the matrix pages of the table, the list and the settings panel; the pairs are held by `tools/check-preset-stories.mjs`                                     |

## The first kit's sources

Read, not edited — the behaviour was taken from them:

- the table and its selection column — `projects/ui-kit/src/lib/ui-kit/table/components/table/rtui-table.component.ts`
- the selection on a bare table — `projects/ui-kit/src/lib/ui-kit/table/util/table-selectors.directive.ts`
- the selection across pages — `projects/ui-kit/src/lib/ui-kit/table/util/dynamic-list-selectors.directive.ts`
- the ready cell — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/table-base-cell.component.ts`
- the scrollbar switches — `projects/ui-kit/src/lib/ui-kit/table/components/table-config-aside/rt-table-config-aside.component.html`
- the row click and the opt-out — `projects/ui-kit/src/lib/ui-kit/table/directives/`

## What is not decided yet

Nine open questions of the spec stand without a place of execution until the owner answers them.
The radio (`Q-TP-9`) blocks the single selection entirely: without it the rule of one row at a
time has nothing to be drawn with.

## Scenarios

- **Scenario** — Test
- **`SC-UKV-236`** … **`SC-UKV-275`** — no test yet; every scenario carries the `Not covered:` mark
