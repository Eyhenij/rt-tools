# The common page of a list — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec. A rule
without a line and a line without a rule is a divergence: the spec promises what is not in the code,
or the code holds what the spec is silent about.

- **The filter is put into the page by the section, the page does not know it itself.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListToolbarLeftDirective`
- **An unoccupied slot takes no place on the screen.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:aboveTpl`
- **The filter stands on the left, and the actions over the list whole on the right.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:leftTpl`
- **The refreshing of the list and the setting of the columns are drawn by the page, they are not brought by the section.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:refreshId`
- **The buttons of the section stand to the left of those the page draws.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:rightTpl`
- **Above the table there is a place for what concerns the whole list at once.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListAboveTableDirective`
- **There are no actions over one record in the toolbar.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListToolbarRightDirective`
- **The host is answered by the common base of the mechanics, and a section only points at itself by one line.** — `libs/message-bus-admin/common/core/util/src/lib/list-host.ts:provideAdminListHost`
- **The panel of the setting of the columns opens by an address of its own at every section.** — `libs/message-bus-admin/common/core/util/src/lib/list-host.ts:COLUMNS_ROUTE`
- **The page shows the state of the reading that the host named.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:host`
- **The heading accepts a hint, and a section without a hint shows the name alone.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:hint`
- **The page grows under the content, and it scrolls whole.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.html:rt-container` — the mode of growing with the window is removed, and the zone of the content is not cut off any more
- **All the records of the page are reachable by scrolling.** — `libs/message-bus-admin/common/container/feature/src/lib/admin-container.component.html:rtContainerContent`
- **The switch of the pages is reachable at any number of rows.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.html:rt-pagination`
- **The name of the section is set in the size and the drawing of the sample.** — `apps/message-bus-admin/src/styles/_page.scss:__title`
- **The header of the section is a row with a wrap: the name with a hint on the left, the place of the actions on the right.** — `apps/message-bus-admin/src/styles/_page.scss:__header`
- **The hint stands under the name, not next to it.** — `apps/message-bus-admin/src/styles/_page.scss:__header-main`
- **The margins of the page and the gaps between its blocks are the same as at the sample.** — `apps/message-bus-admin/src/styles/_page.scss:admin-page`
- **The look of the page is declared once for all the sections.** — `apps/message-bus-admin/src/styles/_index.scss:page` — the layer of the layout is connected by one list, and the sections create no files of the layout of their own
- **The anchors of the elements of the common page are put together from the prefix the section names.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:qaPrefix`
- **The prefix names the section by the same word as its table.** — `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:columnsId`
- **The anchors of the table and of its rows are put together from the same prefix as the anchors of the page.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:qaTable` — the prefix is named by the section by one field, and the anchors of the table and of the row are put together by the base
- **The operation of the reading of a section answers with a page, even where the records are few.** — `libs/message-bus-common/src/lib/page.ts:IPage` — the shape both sides speak by. The receiver assembles it by `libs/message-bus-common/src/lib/page.ts:pageAsked`. The base of the mechanics reads only it: `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:AdminListStoreBase`
- **The page asks the host for the reading, the page, its size, the order and the setting of the columns, it does not give them outward by events.** — `libs/message-bus-admin/common/core/util/src/lib/list-host.ts:IAdminListHost`
