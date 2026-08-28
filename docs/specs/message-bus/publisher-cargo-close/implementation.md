# Закрытие записи груза издателем — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

- **Закрытие записи закрыто входом человека, а не токеном дерева.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-close.controller.ts:CargoCloseController` — метка `@SessionOperation()`; выбор способа представиться держит `libs/message-bus-api/access/feature/src/lib/access.guard.ts:AccessGuard`
- **Издатель закрывает запись любого дерева, включая своё.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:closeProposals` — отбора по дереву в запросе нет; у разборов то же в `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:closePostmortems`
- **Закрытие ходит только вперёд и только по двум последним шагам.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoCloseMove`
- **Приём починки обязателен при переходе в «починено и не выпущено», версия — при переходе в «выпущено».** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts:cargoLinesValueDenials` — решение общее с правкой деревом
- **Закрытие называет, кто его сделал.** — `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoCloseData` — признак ложится в запись; колонка объявлена в `prisma/schema.prisma:closedByPublisher`
- **Своё право дерева закрытие не отменяет.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.module.ts:CargoStateModule` — обе операции объявлены рядом; правка деревом не тронута
- **Закрытие приезжает пакетом.** — `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody` — разбор списка строк общий с правкой деревом
- **Строка закрытия называет запись признаком из чтения, а не ключом отправителя.** — `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:closeProposals` — запись ищется полем `id`; печатает признак `tools/cargo-pull.mjs:listLine`
- **Строка пакета отбивается сама по себе.** — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts:cargoLinesTally`
- **Ответ называет число переведённых, число уже стоявших и отбитые строки.** — `libs/message-bus-api/cargo-state/api/src/lib/cargo-close.response.ts:ICargoCloseResponse`

## Что ещё стоит знать при чтении кода

- Разбор пакета, решение о приложенных значениях и счёт по строкам у закрытия и у правки деревом
  общие — `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.lines.ts`. Различаются
  ровно три вещи: чем закрыта операция, каким порядком судится переход и по какому признаку
  ищется запись.
- Команда строки запуска — `tools/cargo-close.mjs`, зовётся `npm run cargo:close`. Вход берёт
  той же парой учётной записи службы, что и чтение груза: читает и закрывает один человек.
- Экран списка показывает признак припиской к состоянию, а не своим столбцом:
  `libs/message-bus-admin/proposals/feature/list/src/lib/admin-proposals-list.component.html`.
