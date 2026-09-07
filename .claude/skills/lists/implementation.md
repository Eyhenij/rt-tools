# lists — what is this tree's own

The names and bindings of this tree, next to the rule `SKILL.md`.

There are four list screens in the tree — incident reviews, proposals, tree summaries and
invitations — and they are assembled by one base: the shared page view and the shared screen
mechanics lie in `common/core`, and a section has exactly three things of its own — the store,
the columns and the order fields. The source of look at that is the kit `@rt-tools/ui-kit-v2`: it
leads the table, the toolbar, the page switcher and the column settings, and there is nothing in
the project rules to break them with.

A section talks to the shared page by slots and by the host token: the filter and its own buttons
it puts into the slots, while the read, the page, its size and the column settings the page asks
of it. The page has not one event.

## What it is called here

- **In the rule** — Here
- **`<prefix>-`** — `rt-` — the prefix of the second kit; the first kit with the prefix `rtui-` does not assemble the admin panel
- **`rt-table`, the input `[dataSource]`** — the same: `rt-table` accepts `dataSource` by a setter over `CdkTable`
- **`<prefix>ToolbarLeft`, `<prefix>ToolbarRight`** — `rtToolbarLeft`, `rtToolbarCenter`, `rtToolbarRight`
- **`<prefix>TableRow`** — `rtTableRow`
- **`[<prefix>TableRowActionsRowType]`** — `[rtTableRowActionsRowType]` on `ng-template[rtTableRowActions]`
- **`<prefix>-page`** — `admin-list-page` in the admin panel's shared layer: the heading, the toolbar, the table's place, the refusal and the pages
- **the slots of the shared page** — `adminListToolbarLeft`, `adminListToolbarRight`, `adminListAboveTable`
- **the host of the list page** — the token `ADMIN_LIST_HOST`, the model `IAdminListHost`, the provider `provideAdminListHost`
- **the section's anchor prefix** — the input `qaPrefix` of `admin-list-page`: `postmortems`, `proposals`, `summaries`, `invites`
- **`IList.Query.State`** — `IListState<T, M>` from `@rt-tools/utils` — `pageModel`, `sortModel`, `filterModel`, `searchTerm`
- **the column settings panel** — `rt-table-settings-aside`; the storage key is assembled by the table itself from `[tableId]`

## Where it lives

- **the table** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts`
- **the row and the row menu** — `.../table/rt-table-row.directive.ts`, `.../table/rt-table-row-actions.directive.ts`
- **the sort header** — `.../table/sort-header/rt-table-sort-header.component.ts`
- **the card on a narrow screen** — `.../table/rt-table-card.directive.ts`
- **the column settings** — `.../table/settings-aside/rt-table-settings-aside.component.ts`, the registry — `.../table/rt-table-settings.registry.ts`
- **the toolbar** — `projects/ui-kit-v2/src/lib/components/toolbar/rt-toolbar.component.ts`
- **the page switcher** — `projects/ui-kit-v2/src/lib/components/pagination/rt-pagination.component.ts`
- **the page heading** — `projects/ui-kit-v2/src/lib/components/page-header/rt-page-header.component.ts`
- **the selection types** — `projects/utils/src/lib/interfaces/list.interface.ts`
- **the notification bus** — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts`
- **the section screens** — `libs/message-bus-admin/postmortems/feature/list/`, `.../proposals/feature/list/`, `.../summaries/feature/list/`, `.../invites/feature/list/`
- **the shared page view** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts`
- **the shared screen mechanics** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`
- **the shared store base** — `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts`
- **the selection in the address** — `libs/message-bus-admin/common/core/util/src/lib/list-query.ts`
- **the page host token** — `libs/message-bus-admin/common/core/util/src/lib/list-host.ts`
- **the filter by tree** — `libs/message-bus-admin/common/core/ui/src/lib/tree-filter/admin-tree-filter.component.ts`
- **the end-to-end list specs** — `apps/message-bus-admin-e2e/src/postmortems-list.spec.ts`, `apps/message-bus-admin-e2e/src/list-states.spec.ts`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section "How the law applies
here" (the bold part of the item). An article without a line and a line without an article are a
divergence: the rule promises what the tree does not have, or the tree holds what the rule is
silent about.

- **The page is assembled by the shared list-page component, not by markup of its own.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListPageComponent` — the heading with a hint, the toolbar with slots, the place for the table, the refusal with a retry and the page switcher; what stays the section's own is the table and what it puts into the slots.
- **The screen mechanics come from the shared list-screen base, not written anew.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:AdminListScreenBase` — the selection from the address, the read, the order, the filter, the move into the panel and the opening of the column settings; the section store inherits `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:AdminListStoreBase`.
- **The screen declares the table itself and puts it inside the template.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:columnDefs` — `contentChildren(CdkColumnDef)`: the table gathers the columns by a content query, and through an intermediary they never reach it.
- **The list is assembled by `<prefix>-table`, not by markup of its own.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:RtTableComponent` — the skeletons, the empty state, the cards and the column settings are its inputs: `[loading]`, `[emptyMessage]`, `[cards]`, `[columnsConfig]`.
- **Rows are declared on `rowsTable.displayedColumns()`, not on a list of their own.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:displayedColumns` — the menu column the table appends itself by `[showRowActions]`.
- **The header of a sortable column names the server field, not the column key.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-sort.logic.ts:nextSort` — the header carries the field name, and that same name leaves for the server in `ISortModel.propertyName`; there is no second translation map.
- **A column is sortable when its header cell carries a sort header.** — `projects/ui-kit-v2/src/lib/components/table/sort-header/rt-table-sort-header.component.ts:RtTableSortHeaderComponent` — there is no separate list of sortable fields next to the columns, and nothing to diverge.
- **A row click opens the record, and the menu is for actions on it.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-row.directive.ts:RtTableRowDirective` — activation by mouse and from the keyboard; the look of a clickable row is given by the table's input `[clickable]`.
- **Action availability lies in a row field, not in a call of a component method.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-row-actions.logic.ts:rowHasAvailableActions` — the kit judges by the row rather than calling a screen method. Not one admin panel section shows a row menu: cargo is read and not edited, and there are no actions over a row at all.
- **An action unavailable right now is not drawn in the row menu at all.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-row-actions.directive.ts:RtTableRowActionsDirective` — the items are projected by the screen with its own template, and the `@if` on the row field stands there too.
- **An irreversible action asks for confirmation by the ready-made technique, not by a dialog of its own.** — **Not applicable.** This tree holds no list screens at all: the kits carry the components, while the confirmation dialog is taken from the bundle where the screen is assembled. The fields of a menu item are named in the pattern `admin-lists-screen`.
- **The menu button is not shown when the row has no available actions left.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts:rowHasActions` — a predicate over the row; by the content of the projected template this is not counted.
- **A loading refusal is served as a toast, not as a line above the table.** — A divergence from the tree, declared by a decision along the way: the refusal takes the list's place — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.html`. The agreement demands the state "a read refusal with a retry", while a toast leaves by itself, and whoever came back to the screen has nothing to retry with. The kit's bus is in place at that — `projects/ui-kit-v2/src/lib/platform/notification-bus.service.ts:NotificationBus`.
- **The screen takes the sort and the filter conditions from the response, not from its own query.** — A divergence from the tree: the selection lives in the section's address and is read from there — `libs/message-bus-admin/common/core/util/src/lib/list-query.ts:listQueryOf`. The receiver's answer does not carry it at all: `libs/message-bus-common/src/lib/page.ts:IPage` gives the rows and the total number. A reload on the second page of a filtered list would otherwise lose both the page and the filter.
- **A list row receives the short model of the entity, not the full one.** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.model.ts:IPostmortem` — the levels `Short` and `Full`: the review text is not in the list row at all, it arrives at the panel by a separate operation.

## What else is worth knowing when reading the code

- The kit here is written by the same tree as the admin panel. An edit the list lacks more often
  goes into the kit than into the screen: a screen that bypassed the table with markup of its own
  is not straightened a second time.
- The column settings are kept by the key `[tableId]`, and stored by the kit's storage port
  (`ERtStorageKeys.TableColumnsPrefix`). The screen starts no key of its own.
- The selection types lie in `@rt-tools/utils` and are published outward: `rt-pagination` reads
  those same ones. There is no second set of these types in the tree, and starting one in the
  admin panel is not allowed.
- The articles of the section "How a screen talks to the shared list page" were appended by the
  tree to the rule as an override, and the binding audit does not see them: it reads the items of
  one rule section, while the override section is a second one. So the bindings of those articles
  are here, as lines:
    - the slots and their directives, the hint, the anchors from the prefix —
      `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts`;
      the nodes of the slot, of the hint and of the place above the table stand under `@if` in
      the template next to it;
    - the host token, the model of what is asked and the provider —
      `libs/message-bus-admin/common/core/util/src/lib/list-host.ts`; what is asked is answered by
      `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`;
    - the filter in the left slot — the screen templates in `libs/message-bus-admin/*/feature/list/`;
    - the page anchors in the end-to-end suite — `apps/message-bus-admin-e2e/src/support/admin.ts`,
      the helper `pageQa`;
    - the anchors of the table and of the row from the prefix —
      `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts`, the fields
      `qaTable` and `qaRow`: the section names one `qaPrefix`, the rest is assembled by the base;
    - the kit tag instead of an attribute on `<table>` — the templates of the four screens there
      too, while the table role the kit sets itself:
      `projects/ui-kit-v2/src/lib/components/table/rt-table.component.ts`, the field `hostRole` —
      a native `<table>` has it from the tag, an own element has none;
    - the emptiness view and its two lines — that same kit file, the fields `isEmpty`,
      `emptyText`, `emptyDescription` and `emptyIcon`; the second line the section names by the
      base's field `emptyDescription` and overrides with its own — as
      `libs/message-bus-admin/invites/feature/list/src/lib/admin-invites-list.component.ts` does.

## What this is checked by

- `pnpm exec nx test @rt-tools/ui-kit-v2` — the specs of the table, its row, the row menu and the
  sorting hold what the rule calls ready-made.
- The second kit's showcase: the table stories show the loading, the empty state and the cards —
  that is, exactly the branches a screen is tempted to rewrite with markup of its own.
- `pnpm exec nx run message-bus-admin-e2e:e2e` — the end-to-end suite: the pages, the order, the
  filter, the panel, the emptiness, the refusal and the cards on a narrow screen are checked by
  clicks in the browser.
- The rule gate demands this rule on the files `libs/message-bus-admin/*/feature/list/**` — a
  branch in `.claude/rt-kit/gate-map.sh`.
