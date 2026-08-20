# Приём груза — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

| Правило                                                                                       | Где исполняется                                                                                    |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Форма груза объявлена одним местом, и приёмник её не переобъявляет.                           | `libs/message-bus-common/src/lib/cargo.ts:IIntakeResponse`                                         |
| Груз каждого рода принимается своей операцией.                                                | `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.ts:accept`            |
| Приёмник не разбирает содержимого сводки.                                                     | `libs/message-bus-api/observations/util/src/lib/summary.const.ts:SUMMARY_FIELDS`                   |
| Версия схемы груза обязательна, а версии схемы строк наблюдения — часть содержимого.          | `libs/message-bus-common/src/lib/cargo-shape.ts:cargoSchemaOf`                                     |
| Груз незнакомой версии схемы принимается и помечается ею.                                     | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:writeMonthSummary`  |
| Груз тяжелее предела не принимается.                                                          | `apps/message-bus/src/app/cargo-limit.ts:cargoLimit`                                               |
| Дерево представляется токеном, а приёмник держит только его хеш.                              | `libs/message-bus-api/trees/util/src/lib/tree-token.util.ts:treeTokenHash`                         |
| Токен печатается один раз, при выдаче.                                                        | `libs/message-bus-api/trees/util/src/lib/tree-report.util.ts:tokenIssuedLines`                     |
| У дерева годен один токен: новый замещает прежний, помечая его отозванным.                    | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:replaceTreeToken`                  |
| Отозванный токен перестаёт приниматься сразу.                                                 | `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`                          |
| Отозванный токен не удаляется.                                                                | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:revokeTreeTokens`                  |
| Признак дерева называется при заведении, а не берётся из первого груза.                       | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:createTreeWithToken`               |
| Признак дерева в грузе сверяется с деревом токена.                                            | `libs/message-bus-common/src/lib/cargo-fault.ts:cargoFault`                                        |
| Заведение и отзыв токена дерева операцией запроса не делаются.                                | `libs/message-bus-api/trees/feature/src/lib/tree-commands.service.ts:run`                          |
| Запись месяца одна на пару «дерево — месяц».                                                  | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:ensureMonthRecord`  |
| Сводка последнего прогона замещает прежнюю целиком.                                           | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:writeMonthSummary`  |
| Предложения и разборы происшествий копятся, а не замещаются.                                  | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:addProposals`              |
| Запись месяца помнит время последнего прогона.                                                | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:IMonthRecordInput`  |
| Месяц берётся по часам приёмника, во всемирном времени.                                       | `libs/message-bus-common/src/lib/month.ts:monthOf`                                                 |
| Наблюдения прошлого месяца, приехавшие первым прогоном нового, ложатся в новый.               | `libs/message-bus-common/src/lib/month.ts:monthOf`                                                 |
| Одновременный приезд двух прогонов одного дерева разрешает хранилище, а не проверка чтением.  | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:ensureMonthRecord`  |
| Пара «дерево — месяц» уникальна.                                                              | `prisma/schema.prisma:MonthRecord`                                                                 |
| Груз, не прошедший проверку формы, отбивается целиком в пределах своей операции.              | `libs/message-bus-common/src/lib/cargo-fault.ts:cargoFaultMessage`                                 |
| Все записи одной операции ложатся вместе или не ложатся вовсе.                                | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:writePostmortems`      |
| Предложения и разборы, приехавшие раньше сводки, заводят запись месяца сами.                  | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept`             |
| Отказ приёмника называет причину дереву, а не подробности своего устройства.                  | `apps/message-bus/src/app/failure.filter.ts:catch`                                                 |
| Каждый отказ записывается в журнал приёмника с родом груза и признаком дерева.                | `apps/message-bus/src/app/failure.filter.ts:FailureFilter`                                         |
| Приёмник ничего не отдаёт без токена дерева.                                                  | `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS`                    |
| Проба живости отвечает только тогда, когда хранилище отвечает тоже.                           | `apps/message-bus/src/app/health/health.controller.ts:check`                                       |
| Проба живости не называет ни редакции, ни состава — ни в теле, ни в заголовках ответа.        | `apps/message-bus/src/main.ts:serve`                                                               |
| Разбор происшествия приезжает текстом целиком.                                                | `libs/message-bus-api/postmortems/util/src/lib/postmortem.const.ts:POSTMORTEM_ITEM_FIELDS`         |
| Проверка на адрес дерева разбор происшествия не накрывает.                                    | `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo`                                              |
| Разбор опознаётся именем своего файла на дереве.                                              | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:IPostmortemRow`        |
| Повторно приехавший разбор обновляет прежний, а не заводит второй.                            | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:writePostmortems`      |
| Разбор, исчезнувший на дереве, у приёмника остаётся.                                          | `libs/message-bus-api/postmortems/feature/src/lib/postmortems-intake.controller.ts:accept`         |
| Предложение опознаётся признаком — хешем своего текста, а не текстом в ограничении.           | `libs/message-bus-api/proposals/util/src/lib/proposal.logic.ts:proposalDigest`                     |
| Признак предложения уникален в пределах дерева, а не записи месяца.                           | `prisma/schema.prisma:Proposal`                                                                    |
| Уже лежавшее пропускается, а не отбивает запрос.                                              | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:addProposals`              |
| Ответ приёма на предложения называет, сколько записей легло и сколько уже лежало.             | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept`             |
| Предложение остаётся при своей записи месяца.                                                 | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept`             |
| Предложение хранит ресурс, к которому относится.                                              | `libs/message-bus-api/proposals/util/src/lib/proposal.logic.ts:PROPOSAL_ITEM_FIELDS`               |
| Токен выдаётся только по годному приглашению.                                                 | `libs/message-bus-api/trees/util/src/lib/tree-invite.util.ts:inviteUsable`                         |
| Приглашение гаснет в той же записи хранилища, которой выпущен токен.                          | `libs/message-bus-api/trees/data-access/src/lib/tree-invite.queries.ts:redeemInvite`               |
| Имя дерева задаёт владелец при выдаче приглашения, а не обращение.                            | `libs/message-bus-api/trees/feature/src/lib/enroll.controller.ts:enroll`                           |
| Признак дерева, уже заведённый, обращением не перезаводится.                                  | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:findTreeClash`                     |
| Приглашение годно ограниченное время.                                                         | `libs/message-bus-api/trees/util/src/lib/tree-invite.util.ts:inviteExpiry`                         |
| Обращение за токеном — публичная операция, заводящая запись, и закрыто ограничителем частоты. | `libs/message-bus-api/access/feature/src/lib/rate-limit.service.ts:allow`                          |
| В хранилище лежит только хеш приглашения.                                                     | `libs/message-bus-api/trees/util/src/lib/tree-invite.util.ts:inviteCodeHash`                       |
| Токен уходит дереву единственным ответом на обращение.                                        | `libs/message-bus-api/trees/feature/src/lib/enroll.controller.ts:enroll`                           |
| Обращение идёт только по защищённому соединению.                                              | `projects/agent-kit/src/lib/enroll.ts:intakeAllowed`                                               |
| Ни приглашение, ни токен не попадают в наблюдения и логи.                                     | `libs/message-bus-api/trees/feature/src/lib/enroll.controller.ts:enroll`                           |
| Пакет не перезаписывает уже лежащий токен, не спросив.                                        | `projects/agent-kit/src/lib/enroll.ts:enroll`                                                      |
| Годное приглашение на имя одно, и держит это хранилище.                                       | `prisma/schema.prisma:TreeInvite`                                                                  |
| Ссылка на заведённое дерево заполняется в момент погашения.                                   | `libs/message-bus-api/trees/data-access/src/lib/tree-invite.queries.ts:redeemInvite`               |
| Приглашение выдают двое — команда узла и операция админки, — и решают они одно и то же.       | `libs/message-bus-api/trees/feature/src/lib/invite-issue.ts:issueInvite`                           |
| Занятое имя отбивает выдачу целиком.                                                          | `libs/message-bus-api/trees/feature/src/lib/invite-issue.ts:issueInvite`                           |
| Код уходит тому, кто позвал выдачу, и никуда больше.                                          | `libs/message-bus-api/trees/feature/src/lib/invites-read.controller.ts:issue`                      |
| Состояние есть у разбора происшествия и у предложения, а у сводки месяца его нет.             | `prisma/schema.prisma:Postmortem`                                                                  |
| Состояний четыре, и других нет.                                                               | `libs/message-bus-common/src/lib/cargo-state.ts:ECargoState`                                       |
| Состояние приходит перечислением, а не строкой в месте использования.                         | `libs/message-bus-common/src/lib/cargo-state.ts:cargoStateOf`                                      |
| Приехавшая запись встаёт в «новое».                                                           | `prisma/schema.prisma:CargoState`                                                                  |
| Записи, приехавшие до заведения поля, читаются как новые.                                     | `prisma/migrations/20260820103518_cargo_record_state/migration.sql:CargoState`                     |
| Приезд, изменивший текст разбора, возвращает его в «новое».                                   | `libs/message-bus-api/postmortems/util/src/lib/postmortem-arrival.util.ts:postmortemArrivalUpdate` |
| Приезд, не изменивший текста, состояния не трогает.                                           | `libs/message-bus-api/postmortems/util/src/lib/postmortem-arrival.util.ts:postmortemArrivalUpdate` |
| Приём груза состояния не принимает.                                                           | `libs/message-bus-api/postmortems/util/src/lib/postmortem.const.ts:POSTMORTEM_ITEM_FIELDS`         |
