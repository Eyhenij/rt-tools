# Grill

## The owner request

> задача добавить раздел Избранное в сабменю навигации вверх над контентом + кнопки фав с иконкой звездочкой закрашенной или нет и тултиплй добавить в изюранное/ убрать из избранного + драг дроп порядок избранного + севис который это вс обрабатывает и хранить в локал сторадж и а пке должен быть дотуп к этому сервису для чтения записи и прочего функционала, нужно придумать лучшее решение, использовать директиву для проекции или в апке где использовать меню все это как-то реализовать

## What the tree already has

- The top navigation with a submenu is `rt-page-header` of `@rt-tools/ui-kit-v2`
  (`projects/ui-kit-v2/src/lib/components/page-header/`): an item with `columns` opens a panel
  "column → group → item" in a CDK overlay on hover and click; the narrow layout (burger) and the
  compact sticky strip draw the same sections separately. The panel layout is prepared by the
  consumer; the component does not compute it.
- Nothing on favourites exists in the tree: a search for `favorit|избранн` over `projects`,
  `libs`, `apps`, `docs` finds nothing.
- Browser storage: `StorageService` and `provideRtStorage()` in `@rt-tools/core`
  (`projects/core/src/lib/storage/`); outside the browser they fall back to memory by themselves
  (companion of the rule `platform-access`).
- Drag-and-drop reorder sample: `rt-table-settings-panel` in the kit (CDK `cdkDropList`,
  `cdkDragHandle`, `moveItemInArray`).
- Tooltip: `rtTooltip` directive of the kit; labels live in the `rtKit` namespace in eight languages.
- The admin panel (`libs/message-bus-admin/common/container/`) uses `rt-page-header` with a flat
  menu of four items and no panel (companion of the rule `navigation`).

- A second candidate, and the more likely one: the second level of the side menu of the first kit,
  `rtui-side-menu` (`projects/ui-kit/src/lib/ui-kit/side-menu/`, spec
  `docs/specs/ui-kit/side-menu/`). It is the submenu under active work (epic RT-1657, plan
  `docs/plans/nav-menu-second-level.md`): pinning, width, a search field above the list, keyboard
  walk. "Above the content" reads as "at the top of the submenu, above its list".
- The side-menu spec says the preference is kept by the consumer, and the kit keeps no state of its
  own and does not touch browser storage. The owner request (a service keeping favourites in
  localStorage) diverges from that rule of the spec; the owner decides.
- The same epic decided: labels of the first kit are sewn in in English (no dictionary); the pinned
  state is shown by the icon colour, not by a glyph fill, because a variable font axis is not read
  by every icon set. This bears on "a filled or an empty star".

## What the rules already say

- Law `navigation`: labels come from the dictionary and follow the language without a reload;
  nested items unfold on hover and on click; they are split into named groups; the narrow layout
  keeps the same items and groups; a tooltip only on an item that cannot be clicked — the star is a
  separate button, not an item, so its tooltip is not bound by this article.
- Rule `platform-access`: storage only through the core services, never `localStorage` directly.
- Law `reuse-first`: reorder is taken from the table settings panel sample, storage from core.

## Questions and answers

**Which component gets the favourites — `rtui-side-menu` of the first kit or `rt-page-header` of
the second?**
Asked in the chat as text: the question menu was refused three times by the grill gate, which
matches words against the request and does not see that the request names neither kit.

**сайд меню ты еще не переносил вов второй кит?**
Answered from the tree: no. The port is task RT-1883 (open), row 12 of
`docs/plans/ui-kit-v2-material-preset.md`, marked "only on an application's demand" and standing
after RT-1882. The second kit has only `rt-section-nav` (tiles, no submenu) and `rt-page-header`.
Three ways put to the owner: favourites in `rtui-side-menu` of the first kit; in `rt-page-header`
of the second; or the port RT-1883 first, then favourites in it — the port needs the owner's
separate consent, as every folder of the first kit does.

**Which way?**
эти изменения в 1 кит делаем

Taken: favourites go into `rtui-side-menu` of `@rt-tools/ui-kit`, a block at the top of the
second level, under the search field and above the list. The epic of that submenu, RT-1657, is
closed, so the work needs either a new epic or the owner's word for work outside one.

**A separate task outside the epic, or a new epic?** (the copy is assigned epic 2177, the chat
service)
1

Taken: one task outside the epic, by the owner's word "1" for the option "Отдельная задача вне
эпика"; the branch goes from `origin/main`, the chat branch is not touched.

## Decisions

- **The kit ships the favourites service; the application reads and writes through it** — the
  request asks for a service kept in localStorage and reachable from the application, and leaves
  the technique to the executor ("нужно придумать лучшее решение"). Question closed by assumption:
  a provider function with a storage key, a signal of ids, and methods has / add / remove / toggle /
  move / set / clear; storage through `StorageService` of `@rt-tools/core`. Rejected: a projection
  directive — every application would repeat the markup, the reorder and the narrow layout.
- **Only ids are stored; the menu builds favourite items from its own items** — labels follow the
  language, and a removed section drops out of favourites by itself.
- **The menu shows stars only when the service is provided** — a consumer who did not opt in sees
  the menu as today.
- **The reorder takes the CDK drag-and-drop of the table settings panel** — law `reuse-first`.
- **The star state is filled against outlined, with the colour as a second sign** — the request
  names a filled star; the colour keeps the state readable on an icon set without a fill axis
  (the RT-1657 decision about the pin).
- **The task is behaviour-changing and needs a product agreement** — it adds a visible block and a
  public service.
- **Not part of the task: the admin application** — its menu is flat, with no submenu to hold stars.
  Question closed by assumption.
- **Done when**: on the showcase a person stars an item, sees it in the favourites block, drags it to
  a new place, reloads and finds the same order; the tooltip says add / remove; the kit tests are
  green. Question closed by assumption.
- **No law or rule edit** — the only text that diverges is the domain spec article about the kit
  touching no browser storage; it is edited by this task. Question closed by assumption.

## What is left unclear
