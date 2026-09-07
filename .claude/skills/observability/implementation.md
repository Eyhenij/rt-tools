# observability — что здесь своё

Имена и привязки этого дерева при правиле `SKILL.md` рядом.

Дерево до этой работы серверной стороны не держало вовсе, и правило было снято списком отказов.
Оно возвращено вместе с приёмником груза — приложением `apps/message-bus`. Приёмник растёт: у
него есть вывод, проба живости, единый разбор отказов и номер обращения, а домена отказов,
домена оповещений и экрана для владельца нет ни одного. Оттого большая часть таблицы ниже — «не
исполняется», и это состояние работы, а не отказ от статьи.

Правило целиком относится только к приёмнику: публикуемые пакеты в `projects/` ничего о себе не
пишут — их вывод принадлежит тому приложению, которое их поставило.

## Как это называется здесь

- **В правиле** — Здесь
- **то, что приложение о себе пишет** — вывод контейнера: одна строка на вызов журнала — машинная на проде, читаемая вне его
- **ступень важности** — уровень `Logger`: `log`, `warn`, `error`
- **источник строки** — первый довод `Logger` — `Db` у клиента хранилища, `Bootstrap` у подъёма службы, `Failure` у разбора отказов, `CargoState` у правки состояния груза
- **номер обращения** — восемь шестнадцатеричных знаков; стоит в тексте отказов `500` и `503` и в строке журнала об этом же отказе
- **хранилище отказов** — не заведено: отказы живут в выводе контейнера, разобранной причиной в полях строки

## Где это лежит

- **строки клиента хранилища** — `libs/message-bus-api/persistence/data-access/src/lib/prisma.service.ts`
- **сводка подъёма** — `apps/message-bus/src/main.ts`
- **проба живости** — `apps/message-bus/src/app/health/health.controller.ts`
- **потолок вывода контейнера** — `docker-compose.yml`, служба `api` — три файла по десять мегабайт
- **договорённость о том, что пишет приёмник** — `docs/specs/message-bus/spec.md`, раздел о недоехавшем грузе

## Где исполняются статьи

Первая колонка — статья дословно, как она написана в разделе «Как закон применяется здесь»
(жирная часть пункта). Статья без строки и строка без статьи — расхождение: правило обещает то,
чего в дереве нет, либо в дереве стоит то, о чём правило молчит.

- **The request number is created once per request and stands in every log line about it.** — `apps/message-bus/src/app/failure.filter.ts:catch` — **уже**, чем статья: номер заводится на отказ, а не на запрос. Строк об одном обращении у приёмника ровно одна — та, которую пишет разбор отказов, — и связывать нечего, пока о запросе не пишет никто другой.
- **The request number goes to the caller as a response header and in the failure details.** — `apps/message-bus/src/app/failure.filter.ts:catch` — **уже**, чем статья: номер стоит в тексте отказа, а заголовка ответа с ним нет. Дерево печатает владельцу текст, и номер, ушедший заголовком, не попал бы в печать вовсе.
- **A number that came from outside is cleaned and shortened, and an empty one is created anew.** — **Не применимо.** Номер снаружи не принимается: обращений с чужим номером у приёмника нет.
- **Outside goes the code and a generic error text; the details stay in the logs.** — `apps/message-bus/src/app/failure.filter.ts:messageOf` — незнакомая поломка не пересказывается вовсе; вместо пересказа называется номер обращения.
- **A failure on input or rights is written apart from a breakage and without a stack.** — `libs/message-bus-api/accounts/feature/src/lib/auth.controller.ts:refused` — неудачный вход пишется строкой без стека и номера обращения не получает.
- **The cause of a failure is parsed in one place.** — `libs/message-bus-api/observability/util/src/lib/describe-error.util.ts:describeError` — один разбор на всё приложение: его зовут и разбор отказов, и клиент хранилища.
- **The fields of a log line are always scrubbed, not at the discretion of whoever writes.** — `libs/message-bus-api/observability/util/src/lib/redact.util.ts:redact` — зовётся журналом на каждой записи, до вывода.
- **At startup the application writes what it came up with.** — `apps/message-bus/src/main.ts:serve` — порт и предел веса груза, полями.
- **The startup digest holds the names of features and their state, but not the values of variables.** — `apps/message-bus/src/main.ts:serve` — в полях стоят порт и предел веса; адреса хранилища и токенов в них нет.
- **A feature enabled by a pair of keys knows a third state.** — **Не применимо.** Возможностей, включаемых парой ключей, у приёмника нет.
- **The level threshold decides whether a log line appears in the output, but not in the failure store.** — **Не исполняется.** Порога нет, хранилища отказов нет.
- **A selected log line is saved to the store as a failure.** — **Не исполняется.** Хранилища отказов нет.
- **The logger hands a failure to the sink and does not see the store.** — **Не исполняется.** Хранилища отказов нет, и отдавать отказ приёмнику неоткуда.
- **Log lines of the storage client, the failures domain and the alerts domain do not go to the sink.** — `libs/message-bus-api/persistence/data-access/src/lib/prisma.service.ts:isAlive` — строки клиента идут в вывод и дальше него не уходят; отбирать их некуда.
- **A call to a foreign service goes with an explicit wait limit.** — **Не применимо.** Приёмник наружу не ходит: он принимает, а не рассылает.
- **A send outside creates its own line before the call, and the outcome is appended to it after.** — **Не применимо.** Приёмник наружу не ходит: исходящих обращений у него нет ни одного.
- **Recording a failure does not delay the response and does not take the request down.** — **Не исполняется.** Записывать отказ некуда, и задерживать ответ нечему.
- **The request context is captured at the moment of the logger call, not at the moment of writing.** — **Не исполняется.** Контекста запроса нет.
- **The owner reads what was recorded in their own section, closed by a separate right.** — **Не исполняется.** Админка приёмника — третья ветка задачи; прав в этой ветке нет вовсе.
- **The store does not grow without limit: once a day the excess and the old are removed.** — **Не исполняется.** Хранилища отказов нет; срок хранения груза — `Q-17` договорённости приёмника.
- **The store limit is named in rows, not bytes.** — **Не исполняется.** Хранилища отказов нет. Потолок вывода контейнера при этом назван байтами — это вывод, а не хранилище.
- **The owner learns of a new failure by themselves — by an event journal line and by mail.** — **Не исполняется.** Ни журнала событий, ни почты у приёмника нет; оповещения прямо выведены из договорённости.
- **The mail holds nothing that is closed by the right to the failures screen.** — **Не применимо.** Писем приёмник не шлёт: почты у него нет вовсе.
- **The owner reads the failure rate as a curve above the feed: a bar is a bucket of the chosen period.** — **Не исполняется.** Экранов у приёмника нет.
- **The alarm is raised by growth in breakages, not in all failures.** — **Не исполняется.** Экранов и счёта отказов у приёмника нет, поднимать тревогу нечему.
- **A spike is counted over the last closed bucket; the current one is not given to the rule.** — **Не исполняется.** Ведёрок и счёта всплесков у приёмника нет вовсе.
- **The rate is analysed by a schedule tick, not by a screen request.** — **Не исполняется.** Расписания у приёмника нет.
- **The owner learns of a spike by a journal line and by mail; a repeat of the mail is held by a fuse.** — **Не исполняется.** Ни журнала событий, ни почты, ни самого счёта всплесков у приёмника нет.

## Что ещё стоит знать при чтении кода

- **Приёмник ничего не рассылает.** Половина правила говорит о письмах, тревогах и обращениях к
  чужим службам; у приёмника нет ни одного исходящего обращения — он принимает груз и отвечает
  кодом. Оттого «не применимо» в таблице стоит не от бедности, а от устройства.
- **Отказ до подъёма приложения записать некуда.** Хранилища в этот момент ещё нет, и такие
  строки остаются только в выводе контейнера. У приёмника это верно и после подъёма: журнала
  отказов у него пока нет вовсе.
- **Проба живости спрашивает хранилище, а не себя.** Служба считается поднятой, когда она
  выполнила задание: `SELECT 1` в клиенте хранилища и есть это задание.

## Чем это проверяется

- `pnpm exec nx test message-bus` — сценарии `SC-MB-17`, `SC-MB-18` и `SC-MB-29`: проба живости
  отвечает без токена, не называет состава и молчит при недоступном хранилище; `SC-MB-72` — номер
  обращения в отказе и тот же номер в журнале.
- Живым прогоном: `docker compose stop db`, затем запрос пробы живости — она отвечает отказом, а
  не «поднята», а чтение груза — отказом с номером обращения.
- `pnpm run agent-kit:check` — что этот компаньон заполнен, а не остался черновиком.
