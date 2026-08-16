# message-bus — где исполняются правила

Первая колонка — правило дословно, как оно написано в разделе «Правила» спека. Правило без
строки и строка без правила — расхождение: спек обещает то, чего в коде нет, либо в коде стоит
то, о чём спек молчит.

У трёх правил дороги названо по два места. Настоящее — конфиг проксировщика, но имени файла без
расширения сверка якорей не узнаёт вовсе и считает такую строку пустой привязкой; вторым назван
тот же конфиг строкой, которой он попадает в образ дороги.

| Правило                                                                                      | Где исполняется                                                                                   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Форма груза объявлена одним местом, и приёмник её не переобъявляет.                          | `libs/message-bus-common/src/lib/cargo.ts:IIntakeResponse`                                        |
| Груз каждого рода принимается своей операцией.                                               | `libs/message-bus-api/observations/feature/src/lib/summary-intake.controller.ts:accept`           |
| Приёмник не разбирает содержимого сводки.                                                    | `libs/message-bus-api/observations/util/src/lib/summary.logic.ts:SUMMARY_FIELDS`                  |
| Версия схемы груза обязательна, а версии схемы строк наблюдения — часть содержимого.         | `libs/message-bus-common/src/lib/cargo-shape.ts:cargoSchemaOf`                                    |
| Груз незнакомой версии схемы принимается и помечается ею.                                    | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:writeMonthSummary` |
| Груз тяжелее предела не принимается.                                                         | `apps/message-bus/src/app/cargo-limit.ts:cargoLimit`                                              |
| Дерево представляется токеном, а приёмник держит только его хеш.                             | `libs/message-bus-api/trees/util/src/lib/tree-token.util.ts:treeTokenHash`                        |
| Токен печатается один раз, при выдаче.                                                       | `libs/message-bus-api/trees/util/src/lib/tree-report.util.ts:tokenIssuedLines`                    |
| У дерева годен один токен: новый замещает прежний, помечая его отозванным.                   | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:replaceTreeToken`                 |
| Отозванный токен перестаёт приниматься сразу.                                                | `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate`                         |
| Отозванный токен не удаляется.                                                               | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:revokeTreeTokens`                 |
| Признак дерева называется при заведении, а не берётся из первого груза.                      | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:createTreeWithToken`              |
| Признак дерева в грузе сверяется с деревом токена.                                           | `libs/message-bus-common/src/lib/cargo-fault.ts:cargoFault`                                       |
| Заведение и отзыв токена дерева операцией запроса не делаются.                               | `libs/message-bus-api/trees/feature/src/lib/tree-commands.service.ts:run`                         |
| Запись месяца одна на пару «дерево — месяц».                                                 | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:ensureMonthRecord` |
| Сводка последнего прогона замещает прежнюю целиком.                                          | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:writeMonthSummary` |
| Предложения и разборы происшествий копятся, а не замещаются.                                 | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:addProposals`             |
| Запись месяца помнит время последнего прогона.                                               | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:IMonthRecordInput` |
| Месяц берётся по часам приёмника, во всемирном времени.                                      | `libs/message-bus-common/src/lib/month.ts:monthOf`                                                |
| Наблюдения прошлого месяца, приехавшие первым прогоном нового, ложатся в новый.              | `libs/message-bus-common/src/lib/month.ts:monthOf`                                                |
| Одновременный приезд двух прогонов одного дерева разрешает хранилище, а не проверка чтением. | `libs/message-bus-api/observations/data-access/src/lib/month-record.queries.ts:ensureMonthRecord` |
| Груз, не прошедший проверку формы, отбивается целиком в пределах своей операции.             | `libs/message-bus-common/src/lib/cargo-fault.ts:cargoFaultMessage`                                |
| Все записи одной операции ложатся вместе или не ложатся вовсе.                               | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:writePostmortems`     |
| Предложения и разборы, приехавшие раньше сводки, заводят запись месяца сами.                 | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept`            |
| Отказ приёмника называет причину дереву, а не подробности своего устройства.                 | `apps/message-bus/src/app/failure.filter.ts:catch`                                                |
| Каждый отказ записывается в журнал приёмника с родом груза и признаком дерева.               | `apps/message-bus/src/app/failure.filter.ts:FailureFilter`                                        |
| Приёмник ничего не отдаёт без токена дерева.                                                 | `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS`                   |
| Проба живости отвечает только тогда, когда хранилище отвечает тоже.                          | `apps/message-bus/src/app/health/health.controller.ts:check`                                      |
| Проба живости не называет ни редакции, ни состава — ни в теле, ни в заголовках ответа.       | `apps/message-bus/src/main.ts:serve`                                                              |
| Разбор происшествия приезжает текстом целиком.                                               | `libs/message-bus-api/postmortems/util/src/lib/postmortem.logic.ts:POSTMORTEM_ITEM_FIELDS`        |
| Проверка на адрес дерева разбор происшествия не накрывает.                                   | `projects/agent-kit/src/lib/shipment.ts:leaksOfCargo`                                             |
| Разбор опознаётся именем своего файла на дереве.                                             | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:IPostmortemRow`       |
| Повторно приехавший разбор обновляет прежний, а не заводит второй.                           | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:writePostmortems`     |
| Разбор, исчезнувший на дереве, у приёмника остаётся.                                         | `libs/message-bus-api/postmortems/feature/src/lib/postmortems-intake.controller.ts:accept`        |
| Предложение опознаётся признаком — хешем своего текста, а не текстом в ограничении.          | `libs/message-bus-api/proposals/util/src/lib/proposal.logic.ts:proposalDigest`                    |
| Признак предложения уникален в пределах дерева, а не записи месяца.                          | `prisma/schema.prisma:Proposal`                                                                   |
| Уже лежавшее пропускается, а не отбивает запрос.                                             | `libs/message-bus-api/proposals/data-access/src/lib/proposal.queries.ts:addProposals`             |
| Ответ приёма на предложения называет, сколько записей легло и сколько уже лежало.            | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept`            |
| Предложение остаётся при своей записи месяца.                                                | `libs/message-bus-api/proposals/feature/src/lib/proposals-intake.controller.ts:accept`            |
| Предложение хранит ресурс, к которому относится.                                             | `libs/message-bus-api/proposals/util/src/lib/proposal.logic.ts:PROPOSAL_ITEM_FIELDS`              |
| Пара «дерево — месяц» уникальна.                                                             | `prisma/schema.prisma:MonthRecord`                                                                |

## Команды деревьев

Четыре команды исполняет та же сборка, что и служба: точка входа разветвляется по доводам —
`apps/message-bus/src/main.ts:runCommand`. Доводы разбирает и подсказку печатает
`libs/message-bus-api/trees/util/src/lib/tree-command.util.ts:parseTreeCommand`, а сами команды
исполняет `libs/message-bus-api/trees/feature/src/lib/tree-commands.service.ts:run`: заведение
дерева с печатью токена, перевыпуск токена с пометкой прежнего отозванным, отзыв и список
деревьев с днём последнего прогона. Запросы к хранилищу — в
`libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts`.

Таблица здесь одна, и это таблица привязок: сверка спеков читает строками весь файл.
| Груза без входа не отдаёт ни одна операция. | `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate` |
| Человек представляется именем учётной записи и паролем. | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login` |
| Браузер несёт вход кукой, недоступной скриптам, и посылает её только своему адресу. | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:cookieOptions` |
| Приёмник держит только хеш пароля. | `libs/message-bus-api/accounts/util/src/lib/password.util.ts:passwordHash` |
| Отказ входа не называет, что именно не сошлось, и отвечает за то же время. | `libs/message-bus-api/accounts/util/src/lib/password.util.ts:burnAbsentAccountTime` |
| Пароль не попадает ни в журнал, ни в ответ, ни в адрес. | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login` |
| Неудачная попытка входа записывается в журнал с именем учётной записи. | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:login` |
| Неудачные попытки подряд удлиняют ответ. | `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:refusal` |
| Вход живёт сроком и по его истечении перестаёт приниматься. | `libs/message-bus-api/accounts/util/src/lib/session-token.util.ts:sessionAlive` |
| Входов у одной записи бывает несколько, и выход обрывает тот, которым пришли. | `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:revokeSession` |
| Токен дерева админки не открывает, а вход человека не открывает приёма груза. | `libs/message-bus-api/access/feature/src/lib/access.guard.ts:canActivate` |
| Каждая операция объявляет свой способ доступа явно. | `libs/message-bus-api/access/util/src/lib/operation-access.ts:OPERATION_ACCESS` |
| Учётная запись заводится, меняет пароль и отключается командой строки запуска. | `libs/message-bus-api/accounts/feature/src/lib/account-commands.service.ts:run` |
| Имя учётной записи занято одним человеком, и в нём не различается регистр. | `libs/message-bus-api/accounts/util/src/lib/account-name.util.ts:accountNameKey` |
| Отключённая запись входа не заводит, а её прежние входы перестают приниматься. | `libs/message-bus-api/accounts/data-access/src/lib/account.queries.ts:disableAccount` |
| Служба говорит при старте, что учётных записей нет ни одной. | `libs/message-bus-api/accounts/feature/src/lib/account-startup.service.ts:onApplicationBootstrap` |
| Админка читает груз и не правит его. | `libs/message-bus-admin/common/core/api/src/lib/admin-read.api.ts:readPage` |
| Пункт меню заводится вместе со своим экраном. | `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts:ADMIN_MENU` |
| Раздел открывается своим адресом — прямой ссылкой и после перезагрузки. | `libs/message-bus-admin/postmortems/shell/src/lib/postmortems.routes.ts:POSTMORTEMS_ROUTE` |
| Выборка живёт в адресе раздела. | `libs/message-bus-admin/common/core/util/src/lib/list-query.ts:listQueryParams` |
| Человек, отправленный с адреса раздела на вход, после входа попадает туда, куда шёл. | `libs/message-bus-admin/auth/shell/src/lib/session.guard.ts:sessionGuard` |
| Подписи экранов берутся из словаря приложения, а не пишутся в разметке. | `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts:adminLabel` |
| Каждый раздел собран одним и тем же списочным экраном. | `libs/message-bus-admin/common/core/ui/src/lib/list-page/admin-list-page.component.ts:AdminListPageComponent` |
| Каждая запись показана отдельной строкой, а каждое её свойство — своим столбцом. | `libs/message-bus-admin/postmortems/util/src/lib/postmortem.columns.ts:POSTMORTEMS_COLUMNS` |
| Нажатие на строку открывает панель подробностей. | `libs/message-bus-admin/postmortems/feature/list/src/lib/admin-postmortems-list.component.ts:AdminPostmortemsListComponent` |
| Панель показывает запись целиком, а строка списка — нет. | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:readPostmortem` |
| Текст, приехавший с дерева, показывается текстом, а не исполняется как разметка. | `libs/message-bus-admin/postmortems/ui/src/lib/postmortem-view/admin-postmortem-view.component.ts:AdminPostmortemViewComponent` |
| Список приезжает страницами, а не целиком. | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:readPostmortems` |
| Размер страницы назван умолчанием и ограничен сверху. | `libs/message-bus-common/src/lib/page.ts:pageAsked` |
| Страница за пределом списка отвечает пустой страницей и общим числом, а не отказом. | `libs/message-bus-common/src/lib/page.ts:pageFault` |
| Порядок по умолчанию — свежие сверху, и он назван на экране. | `libs/message-bus-admin/common/core/util/src/lib/list-view.ts:sortModelOf` |
| Человек меняет порядок заголовком столбца и видит, какой порядок применён. | `libs/message-bus-admin/common/core/util/src/lib/list-view.ts:sortAskedOf` |
| Состав и порядок столбцов выбирает человек, и выбор сохраняется. | `libs/message-bus-admin/common/container/feature/src/lib/admin-columns-aside.ts:adminColumnsAside` |
| Отбор по дереву называет деревья именами, а не признаками. | `libs/message-bus-api/trees/data-access/src/lib/tree.queries.ts:listTreeChoices` |
| Отбор переживает переход на другую страницу списка. | `libs/message-bus-admin/common/core/util/src/lib/list-query.ts:listQueryOf` |
| Ответ, догнавший свой список после следующего запроса, не показывается. | `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:AdminListStoreBase` |
| Пока список читается, на месте строк видно, что идёт чтение. | `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:AdminListScreenBase` |
| Пустой список объясняет, почему он пуст. | `libs/message-bus-admin/common/core/feature/src/lib/admin-list-screen.base.ts:emptyMessage` |
| Не прочитавшийся список говорит почему, и попытка повторяется одним действием. | `libs/message-bus-admin/common/core/data-access/src/lib/admin-list-store.base.ts:retry` |
| Закрытая панель возвращает список в том же состоянии. | `libs/message-bus-admin/postmortems/shell/src/lib/postmortems.routes.ts:postmortemsRoutes` |
| Записи, которой нет, панель не рисует пустой. | `libs/message-bus-admin/postmortems/data-access/src/lib/postmortem.store.ts:PostmortemStore` |
| Вошедший видит груз всех деревьев. | `libs/message-bus-api/postmortems/feature/src/lib/postmortems-read.controller.ts:page` |
| Время показывается в поясе того, кто смотрит, а хранится во всемирном. | `libs/message-bus-admin/common/core/ui/src/lib/moment/admin-moment.pipe.ts:AdminMomentPipe` |
| Отказ службы называет человеку номер обращения, и тот же номер стоит в журнале. | `apps/message-bus/src/app/failure.filter.ts:catch` |
| Ожидание ответа ограничено сроком. | `libs/message-bus-admin/common/core/api/src/lib/admin-read.api.ts:READ_TIMEOUT_MS` |
| Имя учётной записи уникально по приведённому виду. | `prisma/schema.prisma:Account` |
| Пароль в хранилище лежит только хешем. | `prisma/schema.prisma:Account` |
| Админка читает те же записи, что кладёт приём. | `libs/message-bus-api/postmortems/data-access/src/lib/postmortem.queries.ts:readPostmortems` |
| Приёмник отвечает только по защищённому соединению. | `deploy/Caddyfile:http`, в образ его кладёт `deploy/message-bus-web.Dockerfile:Caddyfile` |
| Сертификат выписывает и продлевает проксировщик сам. | `docker-compose.prod.yml:message-bus-caddy-data` |
| Наружу узел открывает только два порта дороги. | `docker-compose.prod.yml:ports` |
| Админка и приём отвечают с одного имени. | `deploy/Caddyfile:reverse_proxy`, в образ его кладёт `deploy/message-bus-web.Dockerfile:Caddyfile` |
| Адрес раздела админки открывается прямой ссылкой. | `deploy/Caddyfile:try_files`, в образ его кладёт `deploy/message-bus-web.Dockerfile:Caddyfile` |
| Узел поднимает готовый образ, а не собирает его у себя. | `docker-compose.prod.yml:image` |
| Образ на узле опознаётся sha коммита, а не подвижной меткой. | `docker-compose.prod.yml:IMAGE_TAG` |
| Миграции накатываются до того, как приёмник начинает отвечать. | `docker-compose.prod.yml:depends_on` |
| Выкатка начинается рукой человека, а не слиянием. | `.github/workflows/deploy.yml:workflow_dispatch` |
| Выкатка кончается пробой живости, а не подъёмом контейнеров. | `.github/workflows/deploy.yml:health` |
| После удачной пробы узел оставляет три последних sha. | `deploy/prune-images.sh:KEEP` |
| Чистка отбирает образы по имени своего реестра, а не по возрасту. | `deploy/prune-images.sh:REFERENCE` |
| Хранилище лежит на именованном томе, а не внутри контейнера. | `docker-compose.prod.yml:volumes` |
| Контейнеры поднимаются сами после перезапуска узла. | `docker-compose.prod.yml:restart` |
| Дамп снимается и загружается одной командой каждый. | `deploy/dump.sh:DUMPS` |
| Загруженный дамп возвращает и свод, и годность выданных токенов. | `deploy/dump.sh:compose` |
| Адрес приёма в настройке дерева — имя, а не местная машина. | `.claude/rt-kit.json:intake` |
| Отказ пишется разобранной причиной, а не одним текстом. | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:describeError` |
| Причина разворачивается по цепочке до предела глубины. | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:MAX_CAUSE_DEPTH` |
| Ошибка хранилища узнаётся формой кода, а не классом. | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STORAGE_CODE` |
| Стек пишется срезанным. | `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:STACK_LINES` |
| Отказ по вводу и правам пишется без стека. | `apps/message-bus/src/app/failure.filter.ts:journalFields` |
| Строка журнала машинная: имя и поля объектом. | `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts:machineLine` |
| Имя строки постоянно, а всё переменное лежит полями. | `apps/message-bus/src/app/failure.filter.ts:journalName` |
| Вне прода строка печатается читаемой. | `libs/message-bus-api/observability/feature/src/lib/app-logger.service.ts:humanLine` |
| Уже написанные вызовы журнала пишут так же, ничего в них не правя. | `apps/message-bus/src/main.ts:useLogger` |
| Поля вычищаются по имени ключа, а не по виду значения. | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:SECRET_KEY` |
| Пароль, токен и хеш вырезаются целиком. | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:redact` |
| Текст ошибки внутри разобранной причины вычисткой не съедается. | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:ERROR_BRANCH` |
| Обход в глубину и в длину ограничен. | `libs/message-bus-api/observability/util/src/lib/redact.util.ts:MAX_DEPTH` |
