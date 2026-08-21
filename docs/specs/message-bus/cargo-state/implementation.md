# Правка состояния деревом — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                                                     | Где исполняется                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Состояние правит дерево своим токеном, а не вошедший человек.                                               | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Правка закрыта токеном дерева наравне с приёмом груза.                                                      | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Дерево правит только свои записи.                                                                           | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Запись другого дерева отвечает так же, как ненайденная.                                                     | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Правятся оба рода записей груза — разбор происшествия и предложение.                                        | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Правка состояния других полей записи не трогает.                                                            | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Опознание записи правка не меняет.                                                                          | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:moveProposalStates`       |
| Признак предложения считается одним способом на обе стороны.                                                | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:moveProposalStates`       |
| Состояния приходят перечислением, а не строкой в теле запроса.                                              | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Шаг идёт вперёд на соседний: новое, в работе, готово, выпущено.                                             | `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`                              |
| Назад ходит один возврат — из «в работе» в «новое».                                                         | `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`                              |
| Правка в то же состояние переходом не считается и строку не отбивает.                                       | `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`                              |
| Переход судится по тому, что лежит в хранилище.                                                             | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Правка приезжает пакетом: одна операция на несколько строк.                                                 | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Записи обоих родов едут одним пакетом.                                                                      | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Строка пакета отбивается сама по себе, а не уносит пакет целиком.                                           | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Ответ называет, сколько записей переведено, сколько уже стояло в названном состоянии и какие строки отбиты. | `libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ICargoStateResponse`        |
| Отбитая строка называется местом в пакете, ключом и причиной.                                               | `libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ICargoStateResponse`        |
| Пакет без строк отбивается по форме.                                                                        | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Отбитая строка пишется в журнал приёмника наравне с отказом операции.                                       | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Строка журнала несёт род записи, признак дерева и причину.                                                  | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Текст починки приезжает полем строки правки состояния, а не своей операцией.                                | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:ICargoStateLine`               |
| Переход в «починено и не выпущено» без текста починки отбивается построчно.                                 | `libs/message-bus-common/src/lib/cargo-fix-note.ts:cargoFixNoteFault`                             |
| Текст починки принимается только со строкой, переводящей в «починено и не выпущено».                        | `libs/message-bus-common/src/lib/cargo-fix-note.ts:cargoFixNoteFault`                             |
| Строка с текстом ложится и тогда, когда состояние ею не меняется.                                           | `libs/message-bus-common/src/lib/cargo-fix-note.ts:cargoStateWrites`                              |
| Пустой текст текстом не считается.                                                                          | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Приём починки заводится обоим родам записей груза.                                                          | `prisma/schema.prisma:Postmortem`                                                                 |
| Отбитая строка не пишет ни состояния, ни текста.                                                            | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Второй приезд текста починки затирает прежний.                                                              | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Своего предела длины у текста починки нет.                                                                  | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Отбой по недостающему тексту ложится строкой журнала наравне с прежними причинами.                          | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |

Операция живёт своим домом на оба рода — `libs/message-bus-api/cargo-state/`: пакет везёт оба рода
разом, а домену одного из них не видно либ другого. Порядок переходов стоит рядом с перечислением
состояний, в `libs/message-bus-common/src/lib/`. Отказ по форме собирает
`libs/message-bus-common/src/lib/cargo-fault.ts`, метку доступа несёт
`libs/message-bus-api/access/util/src/lib/operation-access.ts`, дерево из токена достаёт
`libs/message-bus-api/trees/util`, строку журнала пишет `libs/message-bus-api/observability`.
Команда строки запуска, которой дерево зовёт правку, лежит в `projects/agent-kit`: она часть слоя
правил, а не приёмника, и договорённость о ней — в спеке того домена.

Приём починки лежит там же: четвёртое поле строки разбирает разбор пакета, а годность текста при
переходе судит своё решение — `libs/message-bus-common/src/lib/cargo-fix-note.ts`, — стоящее
рядом с решением о переходе и зовомое до похода в хранилище. Девять его сценариев — с
`SC-MB-181` по `SC-MB-188` и `SC-MB-192` — закрыты спекой операции, спекой разбора пакета и
спекой самого решения: `libs/message-bus-common/src/lib/cargo-fix-note.spec.ts`. Десятый,
`SC-MB-191`, живёт в пакете правил рядом с командой отметки:
`projects/agent-kit/src/lib/cargo-state.spec.ts`.

Семь сценариев из девяти прежних закрывает спека операции —
`libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.spec.ts`, — и спека
разбора пакета рядом: `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.spec.ts`.

Два закрыты частично. `SC-MB-174`: возврат из «в работе» в «новое» проверен вызовом решения о
переходе в `libs/message-bus-common/src/lib/cargo-state-move.spec.ts`, а путём запроса он не
проходит. `SC-MB-178`: проверено объявление операции — она закрыта токеном дерева, — а саму
отбивку без токена проходит спека стража входа.
