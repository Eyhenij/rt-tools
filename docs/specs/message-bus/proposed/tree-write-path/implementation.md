# Привязка — путь записи для дерева

Привязки проставляются по мере того, как символы появляются; те, что ещё не исполняются,
называют этап, которым они лягут. Строка журнала — четвёртый этап.

| Утверждение                                                          | Где исполняется                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Состояние правит дерево своим токеном, а не вошедший человек         | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Правка закрыта токеном дерева наравне с приёмом груза                | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Дерево правит только свои записи                                     | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Запись другого дерева отвечает так же, как ненайденная               | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Правятся оба рода записей груза                                      | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Правка состояния других полей записи не трогает                      | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Опознание записи правка не меняет                                    | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:moveProposalStates`       |
| Признак предложения считается одним способом на обе стороны          | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:moveProposalStates`       |
| Состояния приходят перечислением, а не строкой в теле запроса        | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Шаг идёт вперёд на соседний                                          | `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`                              |
| Назад ходит один возврат — из «в работе» в «новое»                   | `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`                              |
| Правка в то же состояние переходом не считается и строку не отбивает | `libs/message-bus-common/src/lib/cargo-state-move.ts:cargoStateMove`                              |
| Переход судится по тому, что лежит в хранилище                       | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:movePostmortemStates` |
| Правка приезжает пакетом: одна операция на несколько строк           | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Записи обоих родов едут одним пакетом                                | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Строка пакета отбивается сама по себе, а не уносит пакет целиком     | `libs/message-bus-api/cargo-state/feature/src/lib/cargo-state.controller.ts:CargoStateController` |
| Ответ называет, сколько записей переведено                           | `libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ICargoStateAccepted`        |
| Отбитая строка называется местом в пакете, ключом и причиной         | `libs/message-bus-api/cargo-state/api/src/lib/cargo-state.response.ts:ICargoStateAccepted`        |
| Пакет без строк отбивается по форме                                  | `libs/message-bus-api/cargo-state/util/src/lib/cargo-state-body.ts:cargoStateBody`                |
| Отбитая строка пишется в журнал приёмника наравне с отказом операции | Не исполняется: строка журнала ложится четвёртым этапом                                           |
| Строка журнала несёт род записи, признак дерева и причину            | Не исполняется: строка журнала ложится четвёртым этапом                                           |

Где это ляжет:

| Что                    | Где                                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| операция правки        | свой дом на оба рода — `libs/message-bus-api/cargo-state/`: пакет везёт оба рода разом, а домену одного из них не видно либ другого |
| порядок переходов      | `libs/message-bus-common/src/lib/` — рядом с перечислением состояний                                                                |
| отказ по форме запроса | `libs/message-bus-common/src/lib/cargo-fault.ts`                                                                                    |
| метка доступа          | `libs/message-bus-api/access/util/src/lib/operation-access.ts`                                                                      |
| дерево из токена       | `libs/message-bus-api/trees/util`                                                                                                   |
| строка журнала         | `libs/message-bus-api/observability`                                                                                                |
| команда строки запуска | `projects/agent-kit` — она часть слоя правил, а не приёмника                                                                        |

Три сценария о порядке переходов — `SC-MB-174`, `SC-MB-175` и `SC-MB-176` — закрыты частично:
решение о переходе проверено вызовом в `libs/message-bus-common/src/lib/cargo-state-move.spec.ts`.
Их путь запроса и остальные шесть сценариев закрывает спека операции правки состояния: её файл
заводится этой работой, и адрес встанет сюда последним коммитом PR.
