# Binding — template slots

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **Every slot under a condition or inside a template of a component is a template slot.** — `projects/ui-kit-v2/src/lib/util/rt-slot-outlet.directive.ts:RtSlotOutletDirective`, `projects/ui-kit-v2/src/lib/util/slot-template.ts:rtSlotTemplate`; scenarios `SC-UKV-1711`, `SC-UKV-1724`
- **The content of a closed branch is not created.** — `projects/ui-kit-v2/src/lib/components/menu/rt-menu.component.html:rtSlotOutlet`, `projects/ui-kit-v2/src/lib/components/skeleton-wrapper/rt-skeleton-wrapper.component.html:rtSlotOutlet`, `projects/ui-kit-v2/src/lib/components/aside/rt-aside.component.html:rtSlotOutlet`; scenarios `SC-UKV-1724`, `SC-UKV-1739`, `SC-UKV-1740`
- **The content of a slot is created when its branch opens and destroyed when it closes.** — `projects/ui-kit-v2/src/lib/util/rt-slot-outlet.directive.ts:createEmbeddedView`, `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.html:lazyRendered`; scenarios `SC-UKV-1725`, `SC-UKV-1726`
- **The body of an expansion panel stands under no condition.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel.component.html:rtExpansionPanelBody`; scenarios `SC-UKV-519`, `SC-UKV-1737`
- **The content of a template slot is bound and injected from the place it is written.** — `projects/ui-kit-v2/src/lib/components/expansion-panel/rt-expansion-panel-actions.directive.ts:owner`, `projects/ui-kit-v2/src/lib/components/side-menu/sub-item/rt-side-menu-sub-item-action.directive.ts:RtSideMenuSubItemActionDirective`; scenarios `SC-UKV-1713`, `SC-UKV-1722`
- **A slot keeps its name; only its form changes.** — `projects/ui-kit-v2/src/lib/components/field/rt-field-hint.directive.ts:rtFieldHint`; scenario `SC-UKV-1711`
- **A former default slot gets a name: the component's name and `Content`.** — `projects/ui-kit-v2/src/lib/components/menu/rt-menu-content.directive.ts:RtMenuContentDirective`, `projects/ui-kit-v2/src/lib/components/aside/rt-aside-content.directive.ts:RtAsideContentDirective`, `projects/ui-kit-v2/src/lib/components/table/sort-header/rt-table-sort-header-content.directive.ts:RtTableSortHeaderContentDirective`; scenarios `SC-UKV-1731`, `SC-UKV-1739`
- **Several templates of one slot are all drawn, in the order they are written.** — `projects/ui-kit-v2/src/lib/util/rt-slot-outlet.directive.ts:createEmbeddedView`; scenario `SC-UKV-1717`
- **A kit component handing its own default slot to the skeleton keeps that content in the page.** — `projects/ui-kit-v2/src/lib/components/field/rt-field.component.html:control-body`, `projects/ui-kit-v2/src/lib/components/detail-list/rt-detail-row.component.html:value-body`; scenario `SC-UKV-1741`
- **A menu item's confirmed action reaches the consumer after the menu closes.** — `projects/ui-kit-v2/src/lib/components/menu/rt-menu-item.component.ts:#announceConfirm`, `projects/ui-kit-v2/src/lib/components/menu/rt-menu.component.ts:confirming`; scenario `SC-UKV-1733`
- **A reordered favourite keeps the focus on its handle.** — `projects/ui-kit-v2/src/lib/components/side-menu/favorites/rt-side-menu-favorites.component.ts:afterNextRender`; scenario `SC-UKV-1734`
- **The former element form of a named slot prints a warning in development mode.** — `projects/ui-kit-v2/src/lib/util/slot-template.ts:console.warn`, `projects/ui-kit-v2/src/lib/components/menu/rt-menu.component.ts:itemNodes`; scenarios `SC-UKV-1745`, `SC-UKV-1746`
- **The look of every screen stays as it was.** — `tools/visual-snapshots-v2.mjs:snapshot`
- **The kit, the CMS client, the showcase and the admin libraries hold no projection under a condition or inside a template.** — `tools/check-ngdoctor.mjs:threshold`
- **Every consumer in the tree is migrated by the same change.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListPageContentDirective`, `projects/cms-angular/admin/src/lib/list/cms-list-page/cms-list-page.component.ts:CmsListToolbarLeftDirective`, `apps/auth-example-admin/src/app/records/records.page.html:rtChatComposerBar`
- **The next release of each changed package is a breaking minor one.** — Not carried out: the release is the owner's decision. The commit of the work carries the `BREAKING CHANGE` footer with every slot in its former and new form, and the notes of the release are built from it.

The rail of the page header keeps its own element slots: `rt-page-rail` is not exported, and the
header hands it the drawn templates. The chat hands the composer tools to the start slot of
`rt-ai-prompt-input` the same way. The table hands its row actions template to the menu inside
`projects/ui-kit-v2/src/lib/components/table/rt-table.component.html`. The dynamic selector list takes its add button as the input
`addButton` from `projects/ui-kit-v2/src/lib/components/dynamic-selector/rt-dynamic-selector.component.html` and
`projects/ui-kit-v2/src/lib/components/dynamic-selector/dynamic-input/rt-dynamic-input.component.html`.
