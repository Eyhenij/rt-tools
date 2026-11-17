# План

**Task:** RT-3270 · **Branch:** RT-3270-work-result-metrics
**Draft:** `docs/specs/agent-kit/proposed/work-result-metrics/`
**Behaviour:** changes

Договорённость из двух половин: пакет — `docs/specs/agent-kit/proposed/work-result-metrics/`,
приёмник — `docs/specs/message-bus/proposed/work-result-metrics/`. Этапы идут в порядке разбора:
слова владельца и срез, счётчик конца хода, слияния и окна, отчёт, строка дня, приёмник, экран,
закрытие. Откатываются они вместе: приёмник без отчёта пуст.

**Как план читает окно эпика.** Окно берёт сессию целиком, если в окне она стояла на ветке эпика
или ветке его задачи. На полной записи 13.11 в окне 00:34:01–03:04:27 одна сессия: RT-3220 — 91
вызов, RT-3227 — 74, RT-3197 — 11, `fix/epic-stop-consent` — 11 вызовов и 6 отказов. При отборе по
ветке каждой записи окно дало бы 29 из 176, а не «35 из 187» из ответа владельца. Чтение записывается
решением в progress до этапа 3.

**Выпуск на экране судится по концу показанного дня.** Окно несёт моменты слияния и выпуска эпика,
и экран за 13.11 печатает «не выпущен» и после будущей редакции пакета — так же, как отчёт.

**Тупик.** Серия из трёх и больше отказов одной проверки любого класса, после которой работу сдвинуло
сообщение владельца или сессия кончилась без изменения дерева. 13.11 проверка конца эпика не
пропускала согласие владельца, и ему пришлось отвечать трижды: это тупик. Число тупиков 13.11
записывается набором на срезе в шаге 1.6.

**Порядок выкатки.** Шаг 4.7 собирает `dist` главной копии с новыми ключами, и до выкатки приёмник
отказывает строкам дня всех копий. Пересчитанные дни уходят заново (шаг 5.2), поэтому числа не
теряются. Просьба о выкатке и о макете уходит владельцу заранее, параллельно этапам 1–5.

**Срок полной записи 13.11.** Она лежит с 14.11 и удаляется по сроку хранения записей около 14.12;
пересчёт 13.11 (шаги 2.7, 4.7) делается раньше.

**Чьи записи пересчитывает `recount`.** Запись разговора считается записью дерева, если её `cwd` —
корень дерева или его копии, а для удалённой копии — если ветки её записей есть в истории дерева.
Запись 13.11 лежит в каталоге удалённой копии: без этого пересчёт её не найдёт.

## Точки

- **A:** `agent-kit metrics --days 30` печатает «нет данных: Экзамены с первого раза» и «вне этого
  отчёта: Повторы ошибок, Полнота отчёта». Из результата есть только «принято с первого раза: 12 из
  26» и отказы проверок по наблюдениям («отказы проверок: 3169»). Флаг `--day` не читается: печатается
  тот же отчёт за 30 дней. Команды `recount` нет. Слияний, выпуска эпика, простоя, отказов на сто
  вызовов, пар, переспросов и прерываний нет ни в отчёте, ни в строке дня, ни в приёмнике:
  `POST /api/intake/epic-windows` отвечает 404.
- **This task reaches:** владелец видит в отчёте и на экране «Качество» приёмника, дошла ли работа до
  слияния и выпуска, сколько часов она стояла, сколько вызовов из ста получили отказ и сколько раз его
  переспросили. Команду на машине запускать не нужно.
- **Sign:** `agent-kit metrics --day 2026-11-13` на этой машине печатает «RT-3227 не выпущен»,
  «отказов 35 из 187», «переспросили 3», и ни одна строка результата не печатает «нет данных». На экране «Качество» приёмника за 13.11 владелец видит строку
  «эпик 3227 не выпущен · отказов 35 из 187 · переспросили 3».
- **Milestone G of the epic:** за рабочий день отказов меньше пяти на сто команд и ни одного тупика,
  из которого исполнитель не может выйти сам. Эта задача даёт отчёт, по которому веха читается.
- **Metric:** нет: счётчик слов владельца считал обёртки среды и не видел сообщений посреди хода —
  на срезе 13.11 он даёт 213, а `owner-nudges` 123. Остальное — новые метрики, а не правка правила.

## След задачи

| Что          | Где |
| ------------ | --- |
| Specs        | `docs/specs/agent-kit/metrics/`, `docs/specs/agent-kit/hooks/` (SC-AK-1607, SC-AK-1609), `docs/specs/agent-kit/observations/`, новый поддомен `docs/specs/agent-kit/work-result/`; `docs/specs/message-bus/usage/`, `docs/specs/message-bus/spec.md` (таблица языков) |
| Laws         | `observability`, `verifiability`, `work-conduct`, `delivery`, `lists`, `navigation`, `access`, `entity-models`, `mockups` — читаются, не правятся |
| Rules        | `testing`, `mockups`, `lists`, `navigation`, `entity-models`, `permissions` — читаются, не правятся |
| Code пакета  | `projects/agent-kit/assets/checks/` (новый `record-count.mjs`, `owner-nudges.mjs`), `projects/agent-kit/assets/hooks/` (новый `record-turn.sh`, `turn-exit-role.sh`, `pull-outcomes.sh`), `projects/agent-kit/src/lib/` (`metrics.ts`, `cargo.ts`, `metric-lines.ts`, `metric-send.ts`, `outcomes.ts`, `observations.ts`), `projects/agent-kit/src/bin/agent-kit.ts` |
| Tests пакета | `projects/agent-kit/tests/` (новые `record-count`, `record-hook`, `record-recount`, `metric-merges`, `epic-window`; `real-record`, `metric-events`), `real-data/cut-record.mjs`, `real-data/read-record.mjs`, `fixtures/real-record/2026-11-13.jsonl`, новый `fixtures/real-outcomes/` |
| Code приёмника | `prisma/schema.prisma` и миграция, `libs/message-bus-api/observations/{util,data-access,feature}/`, `libs/message-bus-common/src/lib/refusal.ts` |
| Code админки | `libs/message-bus-admin/usage/{feature/quality,ui,util,data-access}/`, `libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts`, `libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts` и `admin-labels-en.ts` |
| E2E          | `apps/message-bus-admin-e2e/src/quality-section.spec.ts`, `quality.narrow.spec.ts`, `shell.spec.ts`, засев стенда `apps/message-bus-admin-e2e/stand/seed.mjs` |
| Approvals    | `docs/tasks/RT-3270-work-result-metrics/approvals.md` — строка макета |

## Что считается сделанным

- Отчёт за 13.11.2026 на этой машине печатает «RT-3227 не выпущен», «отказов 35 из 187»,
  «переспросили 3».
- Ни одна строка результата отчёта не печатает «нет данных»; «Принято с первого раза» без задач
  печатает «0 из 0», «Повторы ошибок» — «считается в приёмнике».
- Строка дня несёт 16 новых ключей, окно эпика уходит своей записью, приёмник их принимает и хранит.
- Экран «Качество» стоит сразу под «Разборами происшествий» и показывает те же числа за 13.11;
  макет одобрен владельцем до кода экрана.
- Договорённость слита: пакет — в `docs/specs/agent-kit/work-result/`, приёмник — в
  `docs/specs/message-bus/usage/`; у каждого сценария есть тест.
- Приёмник выкачен владельцем раньше любой редакции пакета с новыми ключами.

## Этапы

### 1. Слова владельца и пересобранный срез 13.11

- **Steps:**
    1. Записать в счётчике записи `assets/checks/record-count.mjs` правило слов владельца: обёртки среды не считаются, `queued_command` с `origin.kind = human` считается, очередь, повторённая набранным сообщением, считается один раз
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && grep -oE 'SC-AK-(1610|1650)' projects/agent-kit/tests/record-count.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    2. Перевести `owner-nudges.mjs` на это правило; перевод счёта слов в движке — отдельная задача эпика
       Check: `grep -l 'record-count' projects/agent-kit/assets/checks/owner-nudges.mjs | wc -l | tr -d ' '` → = 1
    3. Записать в счётчике три класса отказа, таблицу проверки отказа и один счёт отказа конца хода
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && grep -oE 'SC-AK-(1612|1645|1646)' projects/agent-kit/tests/record-count.test.sh | sort -u | wc -l | tr -d ' '` → = 3
    4. Пересобрать резчик: срез хранит класс и проверку отказа, ветку записи, записи `attachment` с типом и `origin.kind`, признак переспроса у вопроса меню вместо его текста
       Check: `node projects/agent-kit/tests/real-data/cut-record.mjs --self-test >/dev/null && grep -oE 'attachment|reask|gitBranch' projects/agent-kit/tests/real-data/cut-record.mjs | sort -u | wc -l | tr -d ' '` → = 3
    5. Перерезать срез 13.11 из полной записи с чисткой людей, домашнего каталога и имён соседних проектов
       Check: `test "$(grep -cF -e "$HOME" -e "$(printf %s "$HOME" | tr /. --)" projects/agent-kit/tests/fixtures/real-record/2026-11-13.jsonl)" = 0 && grep -c 'queued_command' projects/agent-kit/tests/fixtures/real-record/2026-11-13.jsonl` → >= 74
    6. Записать в набор на настоящей записи числа полной записи: вызовы и отказы окна 00:34:01–03:04:27 по классам, слова владельца, признаки переспроса, тупики дня
       Check: `bash projects/agent-kit/tests/real-record.test.sh >/dev/null && test "$(grep -c 'находка RT-3277' projects/agent-kit/tests/real-record.test.sh)" = 0 && grep -oE 'SC-AK-(1611|1654)' projects/agent-kit/tests/real-record.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    7. Поправить SC-AK-1607 и SC-AK-1609 в спеке хуков и вписать число слов владельца 13.11 в SC-AK-1611 вместо вопроса Q-13
       Check: `test "$(grep -c 'what it counts on the full record' docs/specs/agent-kit/hooks/scenarios.md)" = 0 && cat docs/specs/agent-kit/proposed/work-result-metrics/scenarios.md docs/specs/agent-kit/work-result/scenarios.md 2>/dev/null | grep -A8 '### SC-AK-1611' | grep -cE 'owner.s words'` → >= 1
- **Readiness sign:** один счётчик слов владельца у движка и у `owner-nudges`; срез 13.11 хранит то,
  что читает счётчик, и не хранит домашнего каталога; на срезе окно даёт 187 вызовов и 35 отказов
  (30 хуков, 1 разрешение, 4 конца хода).
- **Verified by:** `bash projects/agent-kit/tests/real-record.test.sh` — последняя строка «читатели
  записи на настоящей записи: N ok, 0 провалов»; `bash projects/agent-kit/tests/record-count.test.sh`
  — «0 провалов».

### 2. Счётчик конца хода и пересчёт прошлых дней

- **Steps:**
    1. Считать пары отказов разных проверок, прерывания и правки владельца среди его слов, очередь включая
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && grep -oE 'SC-AK-(1614|1620)' projects/agent-kit/tests/record-count.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    2. Считать простой от отказа до следующего изменения дерева в любой сессии дерева на машине: целые минуты, отрезок принадлежит дню начала, открытый отрезок живёт в метке
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && grep -oE 'SC-AK-(1616|1617|1648)' projects/agent-kit/tests/record-count.test.sh | sort -u | wc -l | tr -d ' '` → = 3
    3. Считать переспросы в задаче отвеченного вопроса меню и тупики — серии, из которых исполнитель не вышел сам
       Check: `bash projects/agent-kit/tests/record-count.test.sh >/dev/null && grep -oE 'SC-AK-(1619|1625)' projects/agent-kit/tests/record-count.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    4. Написать хук `record-turn.sh` на конце хода и конце сессии: наблюдение о каждом вызове и отказе с моментом, классом, проверкой и веткой, метка на сессию, недописанная строка ждёт, битая пропускается и считается, сбой чтения не роняет ход
       Check: `bash projects/agent-kit/tests/record-hook.test.sh >/dev/null && grep -oE 'SC-AK-(1629|1641|1642|1643)' projects/agent-kit/tests/record-hook.test.sh | sort -u | wc -l | tr -d ' '` → = 4
    5. Разложить хук в это дерево
       Check: `bash .claude/hooks/record-turn.sh </dev/null; echo $?` → `0`
    6. Добавить команду `agent-kit recount (--day | --days)`: пересчёт сохранённых записей дерева на этой машине тем же счётчиком, замена прошлого пересчёта дня, день хука не трогается
       Check: `bash projects/agent-kit/tests/record-recount.test.sh >/dev/null && grep -oE 'SC-AK-1632' projects/agent-kit/tests/record-recount.test.sh | sort -u | wc -l | tr -d ' '` → = 1
    7. Пересчитать на этой машине дни с 27.10 (самая старая сохранённая запись) по 16.11
       Check: `grep -c '"ev":"record-refusal"' .claude/rt-kit/observations/2026-11-13.jsonl` → >= 35
- **Readiness sign:** хук пишет наблюдения о вызовах и отказах каждого хода; в наблюдениях 13.11 этой
  копии не меньше 35 отказов по записи разговора; повторный пересчёт дня не удваивает числа.
- **Verified by:** `bash projects/agent-kit/tests/record-hook.test.sh` и
  `bash projects/agent-kit/tests/record-recount.test.sh` — «0 провалов»;
  `grep -c '"ev":"record-call"' .claude/rt-kit/observations/2026-11-13.jsonl` — не меньше 187.

### 3. Слияния, выпуски, взятие, окна эпиков, вердикты ролей

- **Steps:**
    1. Писать наблюдение взятия задачи — первый момент, когда сессия дерева на этой машине стоит на её ветке, — и пересчитать 14.10–16.11 заново
       Check: `grep -c '"ev":"task-taken"' .claude/rt-kit/observations/2026-11-13.jsonl` → >= 1
    2. Записать в `fixtures/real-outcomes/` ответы хостинга и реестра пакетов с моментами: слияние PR 3266 в ветку эпика, слияние эпика RT-3227 в главную ветку, редакции пакета
       Check: `grep -l 'mergedAt' projects/agent-kit/tests/fixtures/real-outcomes/*.json | wc -l | tr -d ' '` → >= 2
    3. Читать в отправке слияния задач, в ветку прошлой задачи тоже, слияния эпиков и редакции с моментами; оборванный запрос не пишет ничего
       Check: `bash projects/agent-kit/tests/metric-merges.test.sh >/dev/null && grep -oE 'SC-AK-(1622|1636)' projects/agent-kit/tests/metric-merges.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    4. Судить выпуск эпика по концу дня отчёта: редакция каждого пакета эпика после слияния, эпик без пакета выпущен слиянием, дерево без пакета печатает «слит»; минуты эпика от взятия
       Check: `bash projects/agent-kit/tests/metric-merges.test.sh >/dev/null && grep -oE 'SC-AK-(1623|1624|1639|1651|1652)' projects/agent-kit/tests/metric-merges.test.sh | sort -u | wc -l | tr -d ' '` → = 5
    5. Строить окна эпика: открытие слиянием задачи в ветку эпика, закрытие первым из трёх событий, обрез посреди хода по моментам, сессии ветки эпика и его задач со всех копий машины
       Check: `bash projects/agent-kit/tests/epic-window.test.sh >/dev/null && grep -oE 'SC-AK-(1633|1634)' projects/agent-kit/tests/epic-window.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    6. Проверить на срезе 13.11 окно RT-3227 00:34–03:04 с «отказов 35 из 187» и второе окно 04:49–05:48
       Check: `bash projects/agent-kit/tests/real-record.test.sh >/dev/null && grep -oE 'SC-AK-1615' projects/agent-kit/tests/real-record.test.sh | sort -u | wc -l | tr -d ' '` → = 1
    7. Писать вердикт роли с ключом задачи момента: «частично достигнута» — тоже «не достигнута», на главной ветке — эпик назначения копии или «без задачи»
       Check: `bash projects/agent-kit/tests/metric-events.test.sh >/dev/null && grep -oE 'SC-AK-(1621|1640)' projects/agent-kit/tests/metric-events.test.sh | sort -u | wc -l | tr -d ' '` → = 2
    8. Прочитать на этой машине слияния и выпуски с 27.10: у чтения слияний своя метка, первый запуск идёт от срока хранения, а не от метки итогов
       Check: `grep -cE '"ev":"(task-merged|epic-merged)"' .claude/rt-kit/observations/2026-11-13.jsonl` → >= 3
- **Readiness sign:** наблюдения несут взятие, слияния задач и эпиков, редакции с моментами и
  вердикты с задачей; окно RT-3227 на срезе даёт 35 из 187 и закрывается сообщением владельца в
  03:04:27.
- **Verified by:** `bash projects/agent-kit/tests/metric-merges.test.sh`,
  `bash projects/agent-kit/tests/epic-window.test.sh`, `bash projects/agent-kit/tests/real-record.test.sh`
  — «0 провалов» в последней строке каждого.

### 4. Отчёт

- **Steps:**
    1. Добавить отчёту день `--day YYYY-MM-DD`
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metrics.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-1644' projects/agent-kit/src/lib/metrics.spec.ts | sort -u | wc -l | tr -d ' '` → = 1
    2. Печатать строки результата: «Задачи слиты» с «от взятия», «Простой», «Отказов на сто вызовов» по дням и проверкам, «Подряд», «Переспросили», «Прерывания хода» рядом со словами владельца, «Правки владельца», «Цель не достигнута» по задачам, «Принято с первого раза: 0 из 0», «Повторы ошибок: считается в приёмнике»
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metrics.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1613|1621|1627|1640)' projects/agent-kit/src/lib/metrics.spec.ts | sort -u | wc -l | tr -d ' '` → = 4
    3. Печатать день без записи одной фразой со слияниями, день до счётчика словами «запись дня до счётчика», пропущенные строки записи с их днём
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metrics.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1628|1649)' projects/agent-kit/src/lib/metrics.spec.ts | sort -u | wc -l | tr -d ' '` → = 2
    4. Печатать строку каждого эпика периода: окна, моменты, «отказов N из M», переспросы, выпуск, время от взятия, открытое окно словом «открыто»
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metrics.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1623|1639)' projects/agent-kit/src/lib/metrics.spec.ts | sort -u | wc -l | tr -d ' '` → = 2
    5. Печатать строку вехи G на каждый день периода
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metrics.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1626|1637|1638)' projects/agent-kit/src/lib/metrics.spec.ts | sort -u | wc -l | tr -d ' '` → = 3
    6. Проверить отчёт на срезе 13.11: «переспросили 3»
       Check: `bash projects/agent-kit/tests/real-record.test.sh >/dev/null && grep -oE 'SC-AK-1618' projects/agent-kit/tests/real-record.test.sh | sort -u | wc -l | tr -d ' '` → = 1
    7. Собрать пакет, пересчитать 13.11 на этой машине и прочитать отчёт за 13.11
       Check: `pnpm run build:agent-kit >/dev/null 2>&1 && R="$(node dist/agent-kit/bin/agent-kit.js metrics --day 2026-11-13)" && test "$(printf '%s\n' "$R" | grep 'нет данных' | sed -E 's/нет данных|Экзамены с первого раза//g' | grep -cE '[А-Яа-яЁё]{3}')" = 0 && printf '%s\n' "$R" | grep -oE 'RT-3227 не выпущен|отказов 35 из 187|переспросили 3' | sort -u | wc -l | tr -d ' '` → = 3
- **Readiness sign:** отчёт за 13.11 на этой машине печатает три числа признака; строки результата
  печатают числа, JSON не несёт null для них.
- **Verified by:** `node dist/agent-kit/bin/agent-kit.js metrics --day 2026-11-13` — строки «RT-3227 не
  выпущен», «отказов 35 из 187», «переспросили 3», ни одной строки результата с «нет данных».

### 5. Строка дня и отправка окон

- **Steps:**
    1. Внести 16 ключей в `METRIC_KEYS` и `METRIC_RESOURCE_KEYS`: ключ пары из двух имён, чужие проверки под `own`, день до счётчика без ключей записи
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metric-lines.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1630|1647|1649|1653)' projects/agent-kit/src/lib/metric-lines.spec.ts | sort -u | wc -l | tr -d ' '` → = 4
    2. Отправлять пересчитанные дни старше последнего успеха в пределах срока хранения
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metric-send.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-1632' projects/agent-kit/src/lib/metric-send.spec.ts | sort -u | wc -l | tr -d ' '` → = 1
    3. Отправлять окно эпика своей записью в `POST /api/intake/epic-windows` под признаком копии с меткой `.marks/epic-windows.json`: пересылка с новой отметкой до выпуска, после «выпущен» не слать, окно удалённой копии берёт любая копия машины
       Check: `pnpm exec nx test @rt-tools/agent-kit --testFile=src/lib/metric-send.spec.ts >/dev/null 2>&1 && grep -oE 'SC-AK-(1631|1635)' projects/agent-kit/src/lib/metric-send.spec.ts | sort -u | wc -l | tr -d ' '` → = 2
- **Readiness sign:** строка дня несёт новые ключи закрытого списка и не теряет ни одного числа;
  окно уходит своей записью и пересылается, пока эпик не выпущен.
- **Verified by:** `pnpm exec nx test @rt-tools/agent-kit` — код ноль.

### 6. Приёмник: приём, хранение, запросы

- **Steps:**
    1. Принимать строку дня с новыми ключами и без них; ключ пары судить по двум половинам
       Check: `pnpm exec nx run-many -t test -p message-bus-api-observations-util message-bus-api-observations-feature >/dev/null 2>&1 && grep -rhoE 'SC-MB-(434|445)' libs/message-bus-api/observations --include='*.spec.ts' | sort -u | wc -l | tr -d ' '` → = 2
    2. Добавить таблицу окон эпика в `prisma/schema.prisma` с уникальной четвёркой и индексом момента открытия, миграцию и новый клиент; строки `metrics_day` не меняются
       Check: `grep -q 'model EpicWindow' prisma/schema.prisma && ls prisma/migrations | grep -c epic_window` → = 1
    3. Добавить `POST /api/intake/epic-windows` по токену дерева: замена по четвёрке, `metrics-stale` на старую отметку, `epic-window-field-refused` с именем поля
       Check: `pnpm exec nx run-many -t test -p message-bus-common message-bus-api-observations-util message-bus-api-observations-feature >/dev/null 2>&1 && grep -rhoE 'SC-MB-(435|436|437|446|447)' libs/message-bus-api/observations --include='*.spec.ts' | sort -u | wc -l | tr -d ' '` → = 5
    4. Убирать окна старше года ночной уборкой
       Check: `pnpm exec nx test message-bus-api-observations-feature >/dev/null 2>&1 && grep -ci 'epicWindow' libs/message-bus-api/observations/feature/src/lib/observation-retention.service.spec.ts` → >= 1
    5. Считать в запросах «Качества» новые плитки, веху по дням, пары, столбец «Отказов на сто вызовов» таблицы причин и окна периода с отбором по дереву
       Check: `pnpm exec nx run-many -t test -p message-bus-api-observations-util message-bus-api-observations-data-access >/dev/null 2>&1 && grep -rhoE 'SC-MB-(439|440|441|444|448|449|450|451|452)' libs/message-bus-api/observations --include='*.spec.ts' | sort -u | wc -l | tr -d ' '` → = 9
    6. Отдавать новые числа, веху, пары и окна в ответе `GET /api/usage/quality` под правом `quality:read`
       Check: `pnpm exec nx test message-bus-api-observations-feature >/dev/null 2>&1 && grep -c 'epicWindows' libs/message-bus-api/observations/feature/src/lib/usage-read.controller.ts` → >= 1
- **Readiness sign:** приёмник принимает строку дня с новыми ключами и без них, хранит окно эпика по
  четвёрке, отказывает старой отметке и полю вне формы; ответ «Качества» несёт новые числа и окна.
- **Verified by:** `pnpm exec nx run-many -t test -p 'message-bus-api-observations-*' message-bus-common`
  — код ноль.

### 7. Экран «Качество»

- **Steps:**
    1. Нарисовать в Figma макет новых плиток, вехи по дням, блоков «Подряд» и «Окна эпиков» на трёх ширинах и записать одобрение владельца
       Check: `cat docs/tasks/RT-3270-work-result-metrics/approvals.md docs/archive/RT-3270-work-result-metrics.md 2>/dev/null | grep -cE '^- \*\*Макет:\*\* «.+» — https://www\.figma\.com/'` → >= 1
    2. Перенести пункт «Качество» сразу под «Разборы происшествий»
       Check: `grep -A1 "title: 'sectionPostmortems'" libs/message-bus-admin/common/container/util/src/lib/menu.declaration.ts | grep -c sectionQuality` → = 1
    3. Сверстать по макету плитки, веху, блоки «Подряд» и «Окна эпиков» с метками `qa-dataid` и карточками на узком экране
       Check: `pnpm exec nx run-many -t test -p message-bus-admin-usage-feature-quality message-bus-admin-usage-util message-bus-admin-usage-ui >/dev/null 2>&1 && grep -rhoE 'qa-dataid="quality-(milestone|pairs|windows)[a-z-]*"' libs/message-bus-admin/usage/ | sort -u | wc -l | tr -d ' '` → >= 3
    4. Записать подписи новых плиток и блоков на русском и английском
       Check: `node tools/check-admin-texts.mjs >/dev/null && test "$(grep -c quality libs/message-bus-admin/common/core/util/src/lib/admin-labels.ts)" = "$(grep -c quality libs/message-bus-admin/common/core/util/src/lib/admin-labels-en.ts)" && grep -c quality libs/message-bus-admin/common/core/util/src/lib/admin-labels-en.ts` → >= 34
    5. Покрыть экран сквозными тестами на стенде со снимками трёх ширин
       Check: `(cd apps/message-bus-admin-e2e && node ../../tools/shot-browser.mjs npx playwright test quality-section quality.narrow shell) >/dev/null 2>&1 && grep -hoE 'SC-MB-4(3[89]|4[0-46-9]|5[01])' apps/message-bus-admin-e2e/src/*.spec.ts | sort -u | wc -l | tr -d ' '` → >= 12
- **Readiness sign:** макет одобрен до кода экрана; пункт меню стоит сразу под «Разборами
  происшествий»; на стенде блок «Окна эпиков» показывает «эпик 3227 не выпущен · отказов 35 из 187 ·
  переспросили 3».
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — код ноль; снимки трёх ширин совпали.

### 8. Закрытие

- **Steps:**
    1. Слить половину пакета в новый поддомен `docs/specs/agent-kit/work-result/` и поправить в спеке метрик строки, которые договорённость меняет
       Check: `test -f docs/specs/agent-kit/work-result/scenarios.md && grep 'after «Использование»' docs/specs/agent-kit/metrics/spec.md | wc -l | tr -d ' '` → = 0
    2. Слить половину приёмника в `docs/specs/message-bus/usage/`, поправить строку раздела в спеке usage и строку разделов в таблице языков `docs/specs/message-bus/spec.md`
       Check: `node tools/check-file-size.mjs >/dev/null && test ! -d docs/specs/message-bus/proposed/work-result-metrics && grep -c 'epic-windows' docs/specs/message-bus/usage/spec.md` → >= 1
    3. Свести покрытие сценариев обеих половин
       Check: `node tools/check-specs.mjs` → exit 0
    4. Привести тексты к сделанному: README пакета и справку команды о `recount` и `--day`
       Check: `pnpm run build:agent-kit >/dev/null 2>&1 && grep -q recount projects/agent-kit/README.md && node dist/agent-kit/bin/agent-kit.js help 2>&1 | grep -cE 'recount|--day'` → >= 2
    5. Прогнать все наборы пакета
       Check: `bash projects/agent-kit/tests/run.sh >/dev/null && ls projects/agent-kit/tests/{record-count,record-hook,record-recount,metric-merges,epic-window}.test.sh | wc -l | tr -d ' '` → = 5
    6. Прогнать lint, типы и тесты затронутых проектов
       Check: `pnpm exec nx run-many -t lint typecheck test -p @rt-tools/agent-kit message-bus-common 'message-bus-api-observations-*' 'message-bus-admin-usage-*' message-bus-admin-common-container-util >/dev/null 2>&1 && grep -c 'model EpicWindow' prisma/schema.prisma` → = 1
    7. Владелец запускает выкатку приёмника; исполнитель готовит форму Deploy и оставляет её открытой, приёмник уходит раньше редакции пакета
       Check: `curl -s -o /dev/null -w '%{http_code}\n' -m 15 -X POST https://message-bus.dev/api/intake/epic-windows` → `401`
    8. Отправить строки дня и окна из этого дерева и сверить экран «Качество» приёмника за 13.11 с отчётом
       Check: `jq -r '.factsByDay | has("2026-11-13")' .claude/rt-kit/observations/.marks/send.json` → `true`
- **Readiness sign:** договорённость слита, `proposed/` пуст по этой работе, у каждого сценария есть
  тест; приёмник выкачен; на экране «Качество» за 13.11 владелец видит «эпик 3227 не выпущен ·
  отказов 35 из 187 · переспросили 3».
- **Verified by:** `node tools/check-specs.mjs` — код ноль; `bash projects/agent-kit/tests/run.sh` —
  «ВСЕ НАБОРЫ ЗЕЛЁНЫЕ»; замер в закреплённом браузере на `https://message-bus.dev/quality` за 13.11 —
  строка блока «Окна эпиков» совпадает с отчётом.

## Правила договорённости по шагам

Пакет — `docs/specs/agent-kit/proposed/work-result-metrics/spec.md`:

| Правило | Шаг |
| ------- | --- |
| Вызовы, отказы, слова владельца, прерывания и переспросы считаются по записи разговора | 1.1, 1.3, 2.1–2.3 |
| Хук конца хода считает и пишет наблюдения; отправка записи не читает | 2.4 |
| Метка на сессию | 2.4 |
| Недописанная последняя строка ждёт следующего хода (SC-AK-1641) | 2.4 |
| Битая строка пропускается и считается, отчёт называет её день (SC-AK-1642) | 2.4, 4.3 |
| Отказ конца хода считает следующий счёт и конец сессии (SC-AK-1643) | 2.4 |
| Счёт не роняет ход (SC-AK-1629) | 2.4 |
| Наблюдение хранит момент, класс, проверку и ветку каждого вызова и отказа | 2.4 |
| Прошлый день — разовым пересчётом, повтор заменяет прошлый (SC-AK-1632) | 2.6, 2.7 |
| Отправка шлёт пересчитанные дни старше последнего успеха (SC-AK-1632) | 5.2 |
| Слияния и выпуски читает отправка с моментами; набор — на записанных ответах | 3.2, 3.3 |
| Срез пересобирается из полной записи и хранит то, что читает счётчик | 1.4, 1.5 |
| Пересобранный срез меняет SC-AK-1607 и SC-AK-1609 | 1.6, 1.7 |
| Слова владельца по сообщению, обёртки не считаются, повтор очереди — один раз (SC-AK-1610, SC-AK-1650, SC-AK-1611) | 1.1, 1.2, 1.6 |
| Правки владельца среди его слов, очередь включая (SC-AK-1620) | 2.1 |
| Отказы на сто вызовов по дням и проверкам (SC-AK-1613) | 4.2 |
| Пары отказов по упорядоченной паре, повтор той же проверки не пара (SC-AK-1614) | 2.1, 4.2 |
| Простой в целых минутах, отрезок — дню начала, вопрос его не останавливает (SC-AK-1616, SC-AK-1617, SC-AK-1648) | 2.2, 4.2 |
| Переспрос по началу вопроса, отказанный вопрос считается (SC-AK-1618, SC-AK-1619) | 1.4, 2.3, 4.6 |
| Прерывание по записи, печать рядом со словами владельца | 2.1, 4.2 |
| Вердикт «не достигнута» по задаче момента, «частично» — тоже (SC-AK-1621, SC-AK-1640) | 3.7, 4.2 |
| Слитая задача — в день слияния с минутами от взятия (SC-AK-1622) | 3.1, 3.3 |
| «Задачи слиты» не «Принято с первого раза» (SC-AK-1636) | 3.3, 4.2 |
| Эпик судится по концу дня отчёта (SC-AK-1624) | 3.4 |
| Минуты эпика от взятия до выпуска или слияния (SC-AK-1639) | 3.4, 4.4 |
| Дерево без пакета печатает эпики слитыми (SC-AK-1652); эпик без пакета выпущен слиянием (SC-AK-1651); эпик многих пакетов — по редакции каждого | 3.4 |
| Окно открывается слиянием задачи в ветку эпика (SC-AK-1636) | 3.5 |
| Окно закрывается первым из трёх событий, незакрытое — «открыто» (SC-AK-1615) | 3.5, 3.6, 4.4 |
| Окно считает только сессии эпика и его задач (SC-AK-1634) | 3.5 |
| Окно считает сессии всех копий машины; обрез посреди хода (SC-AK-1633) | 3.5 |
| Окно шлёт копия, прочитавшая слияние; удалённую копию заменяет любая копия машины (SC-AK-1631) | 5.3 |
| Признаки «слит» и «выпущен» пересчитываются до выпуска (SC-AK-1635) | 5.3 |
| Эпики периода — каждый с окном или слиянием, открытые включая | 4.4 |
| Тупик — серия от трёх отказов одной проверки, из которой исполнитель не вышел (SC-AK-1625, SC-AK-1654) | 1.6, 2.3 |
| Окно несёт моменты слияния и выпуска, экран судит «выпущен» по концу показанного дня (SC-MB-452) | 6.2, 6.3, 6.5 |
| Слияния и выпуски прошлых дней читаются со своей метки | 3.8 |
| Веха G: меньше пяти на сто и без тупика, ровно пять — нет, день без вызовов не судится (SC-AK-1626, SC-AK-1637, SC-AK-1638) | 4.5 |
| Строки результата перечислены и не печатают «нет данных» (SC-AK-1627) | 4.2, 4.7 |
| «Принято с первого раза» без задач — «0 из 0» | 4.2 |
| День без записи — одна фраза и слияния (SC-AK-1628) | 4.3 |
| День до счётчика назван отдельно, строка дня без ключей записи (SC-AK-1649) | 4.3, 5.1 |
| «Повторы ошибок» — «считается в приёмнике» | 4.2 |
| Отчёт берёт день `--day` (SC-AK-1644) | 4.1 |
| Каждое новое число — ключ закрытого списка в той же правке (SC-AK-1630) | 5.1 |
| `recordRefusals` не `guardRefusals` (SC-AK-1630) | 5.1 |
| Ключ пары — два имени, чужая проверка — `own` (SC-AK-1647, SC-AK-1653) | 5.1 |
| Окно уходит своей записью (SC-AK-1631) | 5.3 |
| Приёмник уходит в прод только выкаткой владельца и раньше редакции пакета | 8.7 |
| Договорённость сливается новым поддоменом `work-result` | 8.1 |

Приёмник — `docs/specs/message-bus/proposed/work-result-metrics/spec.md`:

| Правило | Шаг |
| ------- | --- |
| Строка дня с новыми ключами и без них принимается (SC-MB-434) | 6.1 |
| Закрытый список приёмника — список пакета, приёмник уходит первым | 6.1, 8.7 |
| Ключ пары судится по двум половинам (SC-MB-445) | 6.1 |
| Окно принимается своей операцией по токену дерева | 6.3 |
| Окно заменяет хранимое по четвёрке, старая отметка — `metrics-stale` (SC-MB-435, SC-MB-436, SC-MB-446) | 6.3 |
| Моменты окна судятся как день строки (SC-MB-447) | 6.3 |
| Числа окна целые (SC-MB-437) | 6.3 |
| Окно хранится год, ночная уборка убирает старые | 6.4 |
| Хранение: своя таблица, уникальная четвёрка, индекс момента открытия | 6.2 |
| Пункт «Качество» сразу под «Разборами происшествий», три строки слитых спек (SC-MB-438) | 7.2, 8.1, 8.2 |
| Код экрана ждёт одобренного макета | 7.1 |
| Плитки раздела и их суммы (SC-MB-439, SC-MB-448) | 6.5, 7.3 |
| «0 из 0» только у «Принято с первого раза» (SC-MB-449) | 6.5, 7.3 |
| Значение, которого нет в строке, — не ноль (SC-MB-440) | 6.5 |
| Веха G по дням (SC-MB-441, SC-MB-450) | 6.5, 7.3 |
| Блок «Подряд» | 6.5, 7.3 |
| Столбец «Отказов на сто вызовов» в таблице причин (SC-MB-451) | 6.5, 7.3 |
| Блок «Окна эпиков», новые сверху (SC-MB-442, SC-MB-443) | 6.5, 7.3, 7.5 |
| Окно относится к периоду по пересечению, открытое — до сейчас | 6.5 |
| Дерево сужает окна, версия — нет (SC-MB-444) | 6.5 |
| Раздел под правом `quality:read` | 6.6 |
| Узкий экран: блоки складываются в карточки | 7.3, 7.5 |

## Чего эта работа не делает

- Шапка таблицы в учёте ролей — вне задачи по решению разбора; сценарий вердиктов строится на
  заготовке.
- Падение аудита на 422 — вне задачи по решению разбора.
- Выпуск пакета: его назначает владелец отдельно.
- Метрика бесполезности проверок набора — задача RT-3283, следующая в эпике; строка «Пустые запуски»
  остаётся, как есть, и печатает число.
- Повторы ошибок, посчитанные одним деревом: их считает приёмник.
- Время сессии и цена в токенах: простой меряет только отрезки после отказа.
