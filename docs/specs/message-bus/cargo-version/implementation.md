# Столбец, отбор и порядок по версии — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

- **Версия выпуска видна столбцом у разборов и у предложений.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:IPostmortemListRow`
- **Столбец версии стоит за столбцом состояния и входит в набор по умолчанию.** — `libs/message-bus-admin/postmortems/util/src/lib/postmortem.columns.ts:POSTMORTEMS_COLUMNS`
- **У записи без версии ячейка пуста.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:IProposalListRow`
- **Столбец версии остаётся в настройке столбцов наравне с прочими.** — `libs/message-bus-admin/proposals/util/src/lib/proposal.columns.ts:PROPOSALS_COLUMNS`
- **Отбор по версии кладёт в страницу раздел, а не страница знает его сама.** — `libs/message-bus-admin/postmortems/feature/list/src/lib/admin-postmortems-list.component.ts:AdminPostmortemsListComponent`
- **Отбор по версии стоит третьим в полосе, правее отбора по состоянию.** — `libs/message-bus-admin/proposals/feature/list/src/lib/admin-proposals-list.component.ts:AdminProposalsListComponent`
- **Отбор по версии есть у разделов разборов и предложений и только у них.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:AdminListScreenBase`
- **Отбор перечисляет встретившиеся версии, а не все возможные.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-versions.controller.ts:CargoVersionsController`
- **Первым пунктом отбора стоят «все версии», вторым — «без версии».** — `libs/message-bus-common/src/lib/cargo-page.ts:CARGO_VERSION_NONE`
- **Отбор по версии живёт в адресе раздела наравне со страницей, размером, порядком и прочими отборами.** — `libs/message-bus-admin/common/core/util/src/lib/list-query.ts:listQueryParams`
- **Отбор по версии складывается с отбором по дереву и с отбором по состоянию.** — `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:whereOf`
- **Выбранная версия сбрасывает список на первую страницу.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:changeVersion`
- **Версия, которой в списке версий нет, приёмнику посылается как есть и отдаёт пустой список.** — `libs/message-bus-common/src/lib/cargo-page.ts:cargoVersionFault`
- **Список, пустой по отбору версии, объясняет это отбором.** — `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:narrowed`
- **Версия выпуска — сортируемое поле у разборов и у предложений.** — `libs/message-bus-common/src/lib/sortable.ts:POSTMORTEM_SORTABLE`
- **Порядок по версии идёт номерами частей, а не буквами строки.** — `libs/message-bus-common/src/lib/release-version-order.ts:compareReleaseVersions`
- **Версия, не разобравшаяся номерами, встаёт в конец порядка, а между собой такие идут по алфавиту.** — `libs/message-bus-common/src/lib/release-version-order.ts:releaseVersionKey`
- **Записи без версии в порядке по версии идут последними при возрастании и первыми при убывании.** — `libs/message-bus-common/src/lib/release-version-order.ts:releaseVersionPageIds`
- **Второй ключ порядка остаётся прежним — идентификатор записи.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:byColumn`
