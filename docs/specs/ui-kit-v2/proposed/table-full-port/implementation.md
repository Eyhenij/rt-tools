# What it will be carried out by — the first kit's table as a family of the second kit

There is no code yet, so there is not one `file:symbol` binding here: the agreement is written
before the code, and the place of execution appears with it. Here are only the foreseen places, so
that at the merge it is seen where to look. The first column names the group of rules of the spec
next to it; the rules themselves get their bindings verbatim when the agreement merges.

## Where execution is foreseen

| Group of rules                      | Where it is foreseen                                                                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| the family                          | a new component directory of the second kit next to `projects/ui-kit-v2/src/lib/components/table/`, exported by the kit's barrel `projects/ui-kit-v2/src/lib/components/index.ts`                        |
| columns and ready cells             | a ready-cell component of the family; a pure logic file for the dash, the shaping and the copied text, so they are tested without drawing a table                                                        |
| the header and the sort             | a header-cell component of the family; the next-order choice as a pure function                                                                                                                          |
| the filter row                      | a filter-cell component of the family on the kit's input, select, date picker and menu; the edit of the set of conditions as a pure function                                                             |
| rows and presses, the opt-out node  | a row directive and an opt-out directive of the family                                                                                                                                                   |
| the actions strip                   | the family's table template; the menu is the kit's `projects/ui-kit-v2/src/lib/components/menu/`                                                                                                         |
| the selection column                | the kit's checkbox `projects/ui-kit-v2/src/lib/components/checkbox/` and radio button `projects/ui-kit-v2/src/lib/components/radio-button/`                                                              |
| holding the selection, across pages | a pure selection logic of the family — marks, exclusions, the page checkbox and select all — so they are tested without drawing                                                                          |
| the column settings                 | a settings service and a settings panel of the family; storage through the browser database service the second kit's table already uses, under the application's key and in the first kit's record shape |
| the toolbar and the list            | the family's list component on the kit's toolbar, scroll area, spinner, icon button and input                                                                                                            |
| the pagination bar                  | a pagination component of the family; the page numbers and the size correction as pure functions                                                                                                         |
| no Material of any kind             | the kit's lint ban on importing `@angular/material` in `eslint.config.mjs`, which covers every file of the second kit                                                                                    |
| icons of the column declarations    | the kit's icon `projects/ui-kit-v2/src/lib/components/icon/` and its map of first-kit names in the same directory; the family's icon template directive `rtDataTableIcon`, asked before the map          |
| the narrow screen                   | the kit's breakpoint service and the family's styles                                                                                                                                                     |
| the labels                          | the kit's dictionary `projects/ui-kit-v2/src/lib/i18n/`, namespace `rtKit`, all eight languages                                                                                                          |
| the look                            | the kit's first-kit styling preset `projects/ui-kit-v2/src/styles/_preset-material.scss` and the agreement `docs/specs/ui-kit-v2/proposed/material-preset/`                                              |
| the stories and their preset pairs  | the family's own showcase pages; the pairs are held by `tools/check-preset-stories.mjs`                                                                                                                  |

## The first kit's sources

Read, not edited — the behaviour and the layout are taken from them:

- the table, the actions strip and the selection column — `projects/ui-kit/src/lib/ui-kit/table/components/table/`
- the look of rows, header and strip — `projects/ui-kit/src/styles/components/_table.scss`
- the ready cell — `projects/ui-kit/src/lib/ui-kit/table/components/table-base-cell/`
- the header and the filter cell — `projects/ui-kit/src/lib/ui-kit/table/components/table-header-cell/`, `projects/ui-kit/src/lib/ui-kit/table/components/table-header-filter-cell/`
- the toolbar, the placeholder and the scrollbars — `projects/ui-kit/src/lib/ui-kit/table/components/table-container/`
- the settings panel and the saved settings — `projects/ui-kit/src/lib/ui-kit/table/components/table-config-aside/`, `projects/ui-kit/src/lib/ui-kit/table/util/table-config.service.ts`
- the pagination bar — `projects/ui-kit/src/lib/ui-kit/table/components/pagination-view/`
- the selection — `projects/ui-kit/src/lib/ui-kit/table/util/table-selectors.directive.ts`, `projects/ui-kit/src/lib/ui-kit/table/util/dynamic-list-selectors.directive.ts`
- the row press and the opt-out — `projects/ui-kit/src/lib/ui-kit/table/directives/`

## What is not decided yet

Two open questions of the spec stand without a place of execution: `Q-TP-1` — where the
agreement merges; `Q-TP-17` — the selection of `rt-dynamic-list`, outside this family. The first
kit's oddities are ported as they are, and the spec lists them for a later discussion.

## Scenarios

- **Scenario** — Test
- **`SC-UKV-236`** … **`SC-UKV-275`**, **`SC-UKV-300`** … **`SC-UKV-322`** — no test yet; every
  scenario carries the `Not covered:` mark
