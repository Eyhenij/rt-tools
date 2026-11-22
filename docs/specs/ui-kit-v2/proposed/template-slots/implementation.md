# Binding — template slots

There is no code yet, so there is no `file:symbol` binding here: the agreement is written before the
code, and the place of execution comes with it. Here are only the foreseen places, so that at the
merge it is visible where to look.

## Where execution is foreseen

| Rule                                                    | Where it is foreseen                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| every slot under a condition is a template slot         | the templates named in "Contract" and their slot directives                                     |
| the content of a closed branch is not created           | the same templates: the outlet of the slot stands inside the branch                             |
| created on opening, destroyed on closing                | the same templates; the lazy body in `rt-expansion-panel.component.ts`                          |
| the panel body stands under no condition                | `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.html`       |
| bound and injected from the place written               | the slot directives, declared by the consumer inside the component's host                       |
| a slot keeps its name                                   | the selectors of the slot directives: `ng-template[<name>]`                                     |
| a former default slot is named `<component>Content`     | the new directives next to each family named in "Contract"                                      |
| several templates of one slot drawn in order            | the content queries read as lists; the panel's actions lookup and the field's hint query change |
| the field and the detail row keep it under the skeleton | `rt-field.component.html`, `rt-detail-row.component.html`                                       |
| a confirmed menu action reaches the consumer            | `projects/ui-kit-v2/src/lib/components/menu/rt-menu-item.component.ts`                          |
| the focus follows the moved favourite's handle          | `projects/ui-kit-v2/src/lib/components/side-menu/favorites/rt-side-menu-favorites.component.ts` |
| the former element form warns in development mode       | a directive per named slot on the element form; the menu item, for the menu                     |
| the look stays as it was                                | `tools/visual-snapshots-v2.mjs` over the showcase                                               |
| no projection under a condition or inside a template    | `tools/check-ngdoctor.mjs`; the else branches — the families' unit tests                        |
| every consumer in the tree migrated by the same change  | the run of the tree: builds, unit tests and the showcase snapshots                              |
| a breaking minor release with the migration in notes    | `projects/ui-kit-v2/CHANGELOG.md`, built from the commit footers                                |

The rail of the page header keeps its own element slots: `rt-page-rail` is not exported, and the
header hands it the drawn templates. The chat hands the composer tools to the start slot of
`rt-ai-prompt-input` the same way. The table hands its row actions template to the menu inside
`projects/ui-kit-v2/src/lib/components/table/rt-table.component.html`. The dynamic selector list
takes its add button as an input from
`projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.html` and
`projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input.component.html`.

The two parts of other domains are bound in their own specs at the merge:
`projects/cms-angular/admin/src/lib/list/cms-list-page/cms-list-page.component.html` and
`libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.html`.

## Scenarios

The former default slots that warn are only the named ones and the menu: other default slots give
the component nothing to find the former content by, and nothing is checked for them.

- **Scenario** — Test
- **`SC-UKV-1711`** — `projects/ui-kit-v2/src/lib/components/field/rt-field.component.spec.ts`
- **`SC-UKV-1712`** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`
- **`SC-UKV-1713`** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`
- **`SC-UKV-1714`** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.slots.spec.ts`
- **`SC-UKV-1715`** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.slots.spec.ts`
- **`SC-UKV-1716`** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.slots.spec.ts`
- **`SC-UKV-1717`** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.slots.spec.ts`
- **`SC-UKV-1718`** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`
- **`SC-UKV-1719`** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`
- **`SC-UKV-1720`** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`
- **`SC-UKV-1721`** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`
- **`SC-UKV-1722`** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.spec.ts`
- **`SC-UKV-1723`** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.spec.ts`
- **`SC-UKV-1724`** — no test
- **`SC-UKV-1725`** — no test
- **`SC-UKV-1726`** — no test
- **`SC-UKV-1727`** — no test
- **`SC-UKV-1728`** — no test
- **`SC-UKV-1729`** — no test
- **`SC-UKV-1730`** — no test
- **`SC-UKV-1731`** — no test
- **`SC-UKV-1732`** — no test
- **`SC-UKV-1733`** — no test
- **`SC-UKV-1734`** — `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.spec.ts`
- **`SC-UKV-1735`** — `projects/ui-kit-v2/src/rich-editor/lib/components/chat/rt-chat.slots.spec.ts`
- **`SC-UKV-1736`** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.slots.spec.ts`
- **`SC-UKV-1737`** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`
- **`SC-UKV-1738`** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-additions.spec.ts`
- **`SC-UKV-1739`** — no test
- **`SC-UKV-1740`** — no test
- **`SC-UKV-1741`** — no test
- **`SC-UKV-1742`** — no test
- **`SC-UKV-1743`** — no test
- **`SC-UKV-1744`** — no test
- **`SC-UKV-1745`** — `projects/ui-kit-v2/src/lib/components/field/rt-field.component.spec.ts`
- **`SC-UKV-1746`** — no test
