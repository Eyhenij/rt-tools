# Plan

**Task:** RT-3673 · **Branch:** RT-3673-stop-own-background-only
**Behaviour:** unchanged — правится проверка ходов и вызовов пакета правил, код приложений не трогается; слово владельца: «Бери RT-3602»

## Points

- **A:** после «стоп» или Esc остановка стоит, и проверки конца хода ход отпускают (RT-3672). Но ход будят
  уведомления и строки `Monitor`, вставшие в очередь и до Esc, и после: 24.11 с 03:54:34 по 03:56:32 их строки
  разбудили 14 ходов «Стою» за 118 с, и после каждого хуки конца хода работали по 7–9 с. Своё фоновое никто не
  снимал, в разбуженном ходе вызов прошёл бы.
- **This task reaches:** пока остановка стоит, ход, который открыли уведомление, строка `Monitor` или сообщение
  соседней сессии, хост не начинает, а если начал — в нём любой вызов отказан, кроме снятия своего фонового. Пока
  своё фоновое, запущенное до остановки, живо, конец хода требует его снять. Ход, открытый словом владельца, кроме
  голой остановки, исполняет сказанное.
- **Sign:** случаи SC-AK-2014 в наборе новой проверки и SC-AK-2015 в наборе остановки; живая сессия: фоновый
  `sleep` и `Monitor`, печатающий строки, затем Esc — задачи сняты в первом ходе, разбуженных ходов после первого
  конца хода 0; на записи 24.11 разбуженных ходов после остановки 14 и 118 с — база.
- **Milestone G of the epic:** версия кита в npm с номерами задач 1–3 в разделе `projects/agent-kit/CHANGELOG.md`,
  набор RT-3594 зелёный.
- **Metric:** нет: разбуженные ходы после остановки ничто не гасило.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/agent-kit/assets/task-flow/source/owner.mjs:turnOpener` — чем открыт текущий ход: словом владельца (набранное, из очереди от человека, ответ меню, команда `/…`, набранная человеком) или побудкой (уведомление, строка `Monitor`, сообщение соседней сессии), с временем постановки в очередь; слово, вставшее в очередь до остановки, ход для вызовов не открывает. `projects/agent-kit/assets/task-flow/source/owner.mjs:wordsOf` — слово остановки, оставшееся только в `queue-operation enqueue` (`/stop` 24.11 в 03:56:51), — слово владельца. `projects/agent-kit/assets/task-flow/source/session.mjs:eventsOf` — строка `Monitor` даёт событие вида `monitor`, его читает только мера остановки. `projects/agent-kit/assets/task-flow/measure/owner.mjs:stopCall` — при стоящей остановке: `blockPrompt` — ход открыт побудкой, а своего фонового до остановки нет или о нём уже был отказ; `refuseCalls` — ход открыт побудкой или голой остановкой («стоп», Esc, `/stop`). `projects/agent-kit/assets/task-flow/measure/owner.mjs:backgroundBeforeStop` — свои задачи и `Monitor`, запущенные до остановки, живые, без своего конца в очереди и без `TaskStop` в этом ходе. `projects/agent-kit/assets/task-flow/flow.js` — меры `owner.stopCall`, `owner.backgroundBeforeStop`; случаи отпуска `stopWord` и `interrupted` ждут, пока `backgroundBeforeStop` пуст или отказов о нём за остановку уже 2; слова `notStopped`. `projects/agent-kit/assets/checks/task-flow-script.mjs:runStopCall` — команда `stop-call`: вход хука, ответ `{blockPrompt, refuseCalls}`, выход 0 при отказе. `projects/agent-kit/assets/checks/flow-verdict.mjs` — текст отказа конца хода с `TaskStop <id>`. `projects/agent-kit/assets/hooks/owner-stop-call-guard.sh` — новый хук: строка `UserPromptSubmit` на каждый ход зовёт `stop-call`, при `blockPrompt` не пускает ход (`decision: "block"`), при пропуске ради снятия кладёт в `additionalContext` строку `TaskStop <id>` — один раз на задачу, не на остановку, — и пишет метку хода с `refuseCalls` и местом последнего входа записи; строка `PreToolUse .*` читает метку, метка старая, если после её места в записи есть `queue-operation enqueue`, `queued_command` или запись владельца, — тогда зовёт `stop-call`; `refuseCalls` ставится и тогда, когда последнее слово владельца — голая остановка, в том числе только в очереди; отказ через `rt_decide` |
| Dependencies | хук зовёт движок процессом и `decide.sh`, ничего не импортирует; `runStopCall` читает меры через `openReaders`, как `runStop`; меры читают источники через `owner` и `session`; источники не импортируют меры; обратно никто не ходит |
| Coupling | `projects/agent-kit/assets/task-flow/measure/owner.mjs` исходящие 0 → 0; `projects/agent-kit/assets/task-flow/source/owner.mjs` исходящие 1 → 1; `projects/agent-kit/assets/task-flow/source/session.mjs` исходящие 0 → 0; `projects/agent-kit/assets/checks/task-flow-script.mjs` исходящие 11 → 11; `projects/agent-kit/assets/checks/flow-verdict.mjs` исходящие 2 → 2 |
| Patterns | Guard — `projects/agent-kit/assets/checks/task-flow-script.mjs:runStopCall`, его зовёт хук `projects/agent-kit/assets/hooks/owner-stop-call-guard.sh` по образцу `end-conversation-guard.sh`: отказ строкой таблицы решений. Отброшено: метку остановки пишет конец хода — после Esc хост хуки конца хода не зовёт; отсев по словам «стоп» в хвосте — в длинной записи их десятки, и `node` шёл бы на каждый вызов; сверять `TaskStop` со временем запуска — после остановки новые задачи не запускаются |
| Terms | новых слов глоссария нет: «побудка» не вводится — спек называет уведомление, строку `Monitor` и сообщение соседней сессии; «своё фоновое» — задача, которую запустила эта сессия |
| Input | вход хука: `transcript_path`, `prompt`, `tool_name`, `tool_input`, `agent_id`; ход открыт: Esc, «стоп», «стоп» после Esc, `/stop`, `/stop` только в очереди, слово из очереди до остановки, Esc через 0–50 мс после уведомления, «стоп» в очереди посреди хода от слова, Esc, отменивший отказ конца хода, «Стоп. Пиши инцидент», вопрос, брань, `/команда`, ответ меню, уведомление, строка `Monitor`, сообщение соседней сессии, слово из очереди и его повтор набранным; вызовы `TaskStop`, `KillShell`, `KillBash`, `CronDelete`, `CronList`, `ToolSearch`, `TaskOutput`, `Bash`, `Edit`, `Write`; запись без пути, неразборная, без остановки; остановка, затем 20 МБ разрешённых вызовов, затем уведомление; метки нет, метка от другого хода; движок дольше 10 с; конец задачи уже в очереди. SC-AK-2014, `projects/agent-kit/tests/owner-stop-call-guard.test.sh`; конец хода — SC-AK-2015, `projects/agent-kit/tests/turn-exit-guard-stop.test.sh`; `Monitor` в мерах фонового — `projects/agent-kit/tests/background-delivery.test.sh` |
| Bounds | `runStop` и три хука Stop не меняются; `stopStands` отвечает как сейчас; `Monitor` не входит в меры `running`, `waiting`, `hung` и в слежение за CI; таблица переходов плана эпика не меняется; сломанный хук, упавший движок и движок дольше 10 с вызов пропускают: предел внутри хука, выход всегда 0, следующие ветки `dispatch.sh` судят вызов; вызовы снятия (`STOP_TOOLS`, `CronDelete`, `CronList`, `ToolSearch`, `TaskOutput`) проходят всегда; правило хода `projects/agent-kit/assets/rules/turn-conduct.md` не меняется — места 15 знаков; порядок хуков в `dispatch.sh` не меняется |
| Priority | надёжность остановки выше удобства исполнителя: в ходе от побудки при стоящей остановке вызов отказан; но сломанный или долгий хук вызов пропускает, иначе владелец не снимет тупик |
| Budget | `projects/agent-kit/assets/task-flow/measure/owner.mjs` до 200; `projects/agent-kit/assets/task-flow/source/owner.mjs` плюс 30; `projects/agent-kit/assets/task-flow/source/session.mjs` плюс 15; `projects/agent-kit/assets/task-flow/flow.js` плюс 30; `projects/agent-kit/assets/checks/task-flow-script.mjs` плюс 30; `projects/agent-kit/assets/checks/flow-verdict.mjs` плюс 15; `projects/agent-kit/assets/hooks/owner-stop-call-guard.sh` до 130; `projects/agent-kit/assets/checks/decision-table.json` плюс 25; `projects/agent-kit/tests/owner-stop-call-guard.test.sh` до 260; новых файлов кода: 2; новых зависимостей: 0 |

## Task footprint

| What | Where |
| ---- | ----- |
| Code (правится) | `projects/agent-kit/assets/task-flow/source/owner.mjs`, `projects/agent-kit/assets/task-flow/source/session.mjs`, `projects/agent-kit/assets/task-flow/measure/owner.mjs`, `projects/agent-kit/assets/task-flow/flow.js`, `projects/agent-kit/assets/task-flow/flow.md`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/checks/flow-verdict.mjs`, `projects/agent-kit/assets/hooks/owner-stop-call-guard.sh`, `projects/agent-kit/assets/checks/decision-table.json` |
| Tests (правится) | `projects/agent-kit/tests/owner-stop-call-guard.test.sh`, `projects/agent-kit/tests/turn-exit-guard-stop.test.sh`, `projects/agent-kit/tests/background-delivery.test.sh` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/`, `docs/specs/agent-kit/decision-table/` |
| Rules (правится) | `.claude/skills/turn-conduct/implementation.md` |
| Layout (правится) | `tools/task-flow/source/owner.mjs`, `tools/task-flow/source/session.mjs`, `tools/task-flow/measure/owner.mjs`, `tools/task-flow/flow.js`, `tools/task-flow/flow.md`, `tools/task-flow-script.mjs`, `tools/flow-verdict.mjs`, `tools/decision-table.json`, `.claude/hooks/owner-stop-call-guard.sh` |
| Epic plan (правится) | `docs/plans/owner-stop-holds.md` |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`, `.claude/skills/agent-kit-source/` |

## What counts as done

- Пока остановка стоит, ход, который открыли уведомление, строка `Monitor` или сообщение соседней сессии, хук
  `UserPromptSubmit` не пускает. Исключение одно: своё фоновое до остановки живо и отказа о нём ещё не было — тогда
  первую побудку хук пускает, вызовы в ней отказаны, кроме снятия, и конец хода требует `TaskStop`. Если хост ход начал
  без этого хука, любой вызов в нём отказан; отказ называет остановку и что можно: снять своё фоновое, ответить словами.
- В ходе, открытом словом владельца, вызов проходит: вопрос, брань, «пиши инцидент», «Стоп. Пиши инцидент»,
  `/команда`, ответ меню. В ходе, открытом голым «стоп», Esc или `/stop`, вызов отказан, а снятие проходит. «стоп»,
  набранное после Esc, хук не глушит.
- Слово, вставшее в очередь до остановки и доставленное после неё, ход для вызовов не открывает. `/stop`, оставшийся
  только в очереди, ставит остановку. Esc, записанный через 0–50 мс после уведомления, остановку ставит.
- Вызовы снятия проходят всегда: `TaskStop`, `KillShell`, `KillBash`, `CronDelete`, `CronList`, `ToolSearch`,
  `TaskOutput`.
- Пока своё фоновое или `Monitor`, запущенные до остановки, живы и их конца нет в очереди, конец хода отказан, не
  больше двух раз за остановку; отказ называет `TaskStop <id>` каждой задачи. Задача, чей конец уже в очереди, отказа
  не даёт. `Monitor` не отпускает ход как фоновое, не считается слежением за CI и не держит ход как зависший.
- Жалоба с «не остановил», «не снял», «без присмотра» или «продолжаешь работать» остановку не снимает: «почему ты
  всё бросил и не остановил набор?» — остановка стоит. «продолжай» и «не останавливайся» остановку снимают.
- Запись без пути, неразборная или без остановки, долгий или упавший движок — вызов проходит, а следующие хуки его
  судят. Остановка, 20 МБ разрешённых вызовов и уведомление — отказ. «стоп», вставший в очередь посреди хода от
  слова владельца, отказывает следующий вызов этого хода.
- Время на записи 338 МБ: `PreToolUse` со свежей меткой и `UserPromptSubmit` на слово владельца без остановки — не
  дольше 100 мс в 95 случаях из 100, без `node`; `UserPromptSubmit` на побудку при стоящей остановке — не дольше 5 с,
  и под нагрузкой идущего набора тоже.
- Живая проверка записана. Что хост зовёт `UserPromptSubmit` на уведомление Bash и строку `Monitor`, видно по записям:
  в 40 последних записях проекта таких срабатываний 6, например 15.11 в 08:12:11 на уведомление `bcwuz7ns6`. Живая
  проверка отвечает на остальное пробным хуком в своей копии, вне коммита, и у каждого ответа своя ветка:
  - хост после отказа сам берёт следующий элемент очереди без хода — так и остаётся; доставляет отказанное снова или
    показывает владельцу строку на каждый отказ — `blockPrompt` выключается, остаются `refuseCalls` и ответ без слов;
  - `Monitor` отдаёт номер для `TaskStop` — снимается по номеру; не отдаёт — отказ конца хода о нём не даётся, строка
    контекста называет его командой;
  - `transcript_path` у вызова субагента — запись родителя: вызовы субагента судятся так же; своя запись — не судятся,
    это цена, она названа в спеке;
  - `decision: "block"` без `suppressOriginalPrompt` гасит ход — поле не пишется.
- Живая сессия после раскладки: фоновый `sleep` и `Monitor`, ход занят, пока в очереди не встанет 5 строк и больше,
  затем Esc — задачи сняты в первом ходе, разбуженных ходов после него 0. В плане эпика строка точки RT-3594 вместо
  «станет 0» называет ожидание набора на записи 24.11: число отказов и номер задачи для `TaskStop`, которые даёт мера.

## Stages

### 1. Живая проверка и меры

- **Steps:**
    1. Живая проверка хоста записана в ход работы
       Check: `grep -c '^  - Ветка:' docs/tasks/RT-3673-stop-own-background-only/progress.md` → >= 4
    2. Замер до правки записан в ход работы
       Check: `grep -c '^- Замер до правки:' docs/tasks/RT-3673-stop-own-background-only/progress.md` → = 1
    3. Источник называет, чем открыт текущий ход
       Check: `grep -c 'turnOpener' projects/agent-kit/assets/task-flow/source/owner.mjs` → >= 2
    4. Строка Monitor — своё событие, его читает только мера остановки
       Check: `grep -c "kind: 'monitor'" projects/agent-kit/assets/task-flow/source/session.mjs` → >= 1
    5. Мера судит вызов и своё фоновое при остановке
       Check: `grep -cE 'stopCall|backgroundBeforeStop' projects/agent-kit/assets/task-flow/measure/owner.mjs` → >= 4
    6. Жалоба на то, что исполнитель не остановился, остановку не снимает
       Check: `grep -c 'notStopped' projects/agent-kit/assets/task-flow/flow.js` → >= 1
    7. Команда движка судит вызов при остановке
       Check: `grep -c "'stop-call'" projects/agent-kit/assets/checks/task-flow-script.mjs` → >= 2
- **Readiness sign:** движок отвечает, отказан ли ход или вызов, и называет своё фоновое до остановки.
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard-stop.test.sh`,
  `bash projects/agent-kit/tests/task-flow-script.test.sh`, `bash projects/agent-kit/tests/background-delivery.test.sh`
  — 0 провалов.

### 2. Хук и снятие фонового

- **Steps:**
    1. Конец хода после остановки называет снятие своего фонового
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/turn-exit-guard-stop.test.sh 2>&1 | grep -c 'SC-AK-2015'` → >= 6
    2. Хук не пускает ход от побудки и отказывает вызову в нём
       Check: `grep -cE '^# rt-hook: (UserPromptSubmit|PreToolUse)' projects/agent-kit/assets/hooks/owner-stop-call-guard.sh` → = 2
    3. Строка таблицы решений называет отказ
       Check: `grep -c '"owner_stop_call"' projects/agent-kit/assets/checks/decision-table.json` → >= 1
    4. Случаи набора на каждую форму входа
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/owner-stop-call-guard.test.sh 2>&1 | grep -c 'SC-AK-2014'` → >= 20
    5. Время хука без остановки записано в ход работы
       Check: `grep -c '^- Время хука:' docs/tasks/RT-3673-stop-own-background-only/progress.md` → = 1
- **Readiness sign:** ход от побудки не начинается или его вызовы отказаны, своё фоновое снимается, снятие проходит.
- **Verified by:** `bash projects/agent-kit/tests/owner-stop-call-guard.test.sh`,
  `bash projects/agent-kit/tests/turn-exit-guard-stop.test.sh`, `bash projects/agent-kit/tests/hooks-kind.test.sh`,
  `bash projects/agent-kit/tests/decision-table.test.sh` — 0 провалов.

### 3. Тексты, раскладка, живая сессия

- **Steps:**
    1. Спек проверок хода называет запрет ходов и вызовов после остановки
       Check: `grep -c 'SC-AK-2014' docs/specs/agent-kit/turn-guards/scenarios.md` → >= 1
    2. Спек выхода называет снятие фонового после остановки
       Check: `grep -c 'SC-AK-2015' docs/specs/agent-kit/turn-guards/flow-script/exit/scenarios.md` → >= 1
    3. Привязка спека называет хук
       Check: `grep -c 'owner-stop-call-guard' docs/specs/agent-kit/turn-guards/implementation.md` → >= 1
    4. Спек таблицы решений называет строку хука
       Check: `grep -c 'owner-stop-call-guard' docs/specs/agent-kit/decision-table/spec.md` → >= 1
    5. Файл правила хода для дерева называет проверку
       Check: `grep -c 'owner-stop-call-guard' .claude/skills/turn-conduct/implementation.md` → >= 1
    6. План эпика называет ожидание набора RT-3594
       Check: `grep -cE 'Ожидание набора RT-3594: [0-9]+ отказ.*TaskStop' docs/plans/owner-stop-holds.md` → >= 1
    7. Пакет разложен в дерево
       Check: `grep -c 'stop-call' tools/task-flow-script.mjs` → >= 2
    8. Живая сессия после раскладки записана в ход работы
       Check: `grep -c '^- Живая сессия после раскладки:' docs/tasks/RT-3673-stop-own-background-only/progress.md` → = 1
- **Readiness sign:** спеки, привязка и файл правила называют проверку; разложенное сходится с пакетом; на живой
  сессии ходов после первого конца хода 0.
- **Verified by:** `node tools/check-specs.mjs`, `pnpm run agent-kit:check`,
  `bash projects/agent-kit/tests/owner-stop-call-guard.test.sh` — 0 провалов.

## What this work does not do

- Не отказывает `Monitor`, который печатает строку на каждый шаг: это RT-3674. Здесь `Monitor` только снимается.
- Не меняет таблицу переходов плана эпика и три хука конца хода.
- Не снимает процессы, запущенные мимо фоновых задач (`nohup`, `&`, контейнеры стенда): их `TaskStop` не видит.
- Не ограничивает, что делает ход, открытый вопросом или «пиши инцидент», кроме выбора владельца в меню одобрения.
