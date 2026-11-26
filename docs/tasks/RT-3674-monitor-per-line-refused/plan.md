# Plan

**Task:** RT-3674 · **Branch:** RT-3674-monitor-per-line-refused
**Behaviour:** unchanged — правится проверка вызовов пакета правил, код приложений не трогается; слово владельца: «Бери RT-3602»

## Points

- **A:** `Monitor`, который печатает строку на каждый шаг команды, проходит. 24.11 в 03:53:52 исполнитель запустил
  `tail -n 0 -f <вывод фоновой задачи bx106og2k> | grep --line-buffered …`; с 03:54:04 строки шагов набора вставали в
  очередь, и после Esc в 03:54:34 они разбудили 14 ходов. Конец `bx106og2k` и так пришёл бы уведомлением. В записях
  проекта 152 вызова `Monitor`, из них 18 печатают строку на каждый шаг и следят за своей живой фоновой задачей; ни
  один не отказан.
- **This task reaches:** такой `Monitor` отказан, если он следит за выводом живой своей фоновой задачи или за
  файлом, который пишет её команда. Отказ называет задачу и законный ход: дождаться уведомления о её конце и
  прочитать файл после него, без `Monitor`; задача, которая сама не кончается (сервер), ждётся одной строкой через
  `until grep -q`. Опрос PR, таймер и ожидание одной строки проходят.
- **Sign:** 18 команд из записей лежат дословно файлом данных набора нового хука и стоят случаями SC-AK-2017; отказано
  не меньше 17 из 18; восемь проходящих команд из записей (опрос PR, таймер, ожидание одной строки) проходят; живая сессия: фоновая команда пишет
  файл, `Monitor` с `tail -f` по нему — до правки проходит, после раскладки отказан текстом `BLOCKED by
  monitor-stream-guard`.
- **Milestone G of the epic:** версия кита в npm с номерами задач 1–3 в разделе `projects/agent-kit/CHANGELOG.md`,
  набор RT-3594 зелёный.
- **Metric:** построчные `Monitor` по своему живому фоновому в записях проекта: отказано 0 из 18 → не меньше 17 из 18.

## Decision

| Part | What is chosen |
| --- | --- |
| Modules | `projects/agent-kit/assets/checks/flow-monitor.mjs:linesPerStep` — печатает ли команда строку на каждый шаг: `tail` с `-f`, `-F` или `--follow`, или команда вывода в теле цикла `while`, `until`, `for` — `echo`, `printf`, `cat`, `head`, `tail`, `awk`, `sed` без `-i`, `grep` без `-q`, — за которой следующей командой не стоят `break` и `exit`; конвейер — одна команда, `break` и `exit` судятся после него, конвейер, который кончается на `grep -q`, не печатает; `tail -f`, за которым в конвейере стоит `grep -m 1` или `head -1`, ждёт одну строку и не печатает на шаг; текст внутри `$(…)` и обратных кавычек не считается. `projects/agent-kit/assets/checks/flow-monitor.mjs:followedTask` — живая своя фоновая задача, за которой следит команда: команда называет её файл вывода или файл, который команда задачи пишет через `>`, `>>` или `tee`. До сравнения в обеих командах подставляются присваивания `NAME=значение` той же команды, `${TMPDIR:-/tmp}` и `$TMPDIR` — значением среды, `$PWD` и `$(basename "$PWD")` — по `cwd` входа хука, команда задачи с `cd` в начале — предел; кавычки снимаются, двойной `/` схлопывается. Своё фоновое — событие `background` команды `Bash` без `backgroundEnd` своего номера и вызов `Bash` с `run_in_background`, у которого ещё нет результата; фоновые события агентов не участвуют. `projects/agent-kit/assets/checks/task-flow-script.mjs:runMonitorCall` — команда `monitor-call`: вход хука из stdin, события записи из источника `session`, ответ `{refuse, task, file}`, выход 0 при отказе. `projects/agent-kit/assets/hooks/monitor-stream-guard.sh` — новый хук `PreToolUse Monitor`: дешёвый отсев по тексту команды без `node`, затем `monitor-call` с пределом 10 с, отказ через `rt_decide` строкой `monitor_stream` |
| Dependencies | `flow-monitor.mjs` ничего не импортирует: события, среда и `cwd` приходят аргументами; `task-flow-script.mjs` импортирует `flow-monitor.mjs` и читает события через `openSources`, как `runStopCall`; хук зовёт движок процессом и `decide.sh`, ничего не импортирует; обратно никто не ходит |
| Coupling | `projects/agent-kit/assets/checks/task-flow-script.mjs` исходящие 11 → 12; `projects/agent-kit/assets/checks/flow-monitor.mjs` исходящие 0; циклов нет; импортов мимо входа нет |
| Patterns | Guard — `projects/agent-kit/assets/checks/task-flow-script.mjs:runMonitorCall`, его зовёт хук `projects/agent-kit/assets/hooks/monitor-stream-guard.sh` по образцу `owner-stop-call-guard.sh`: отсев в оболочке, решение в движке, отказ строкой таблицы решений. Отброшено: отказывать любой `Monitor` при живом фоновом — опрос PR и таймер следят не за ним и уведомлением не кончаются, по записям это отказало бы 8 проходящих вызовов; судить `Monitor` по числу строк после запуска — отказ нужен до первой строки; сравнивать только имя файла — `prepush.log` и `run.log` повторяются у разных задач |
| Terms | новых слов глоссария нет: «своё фоновое» — задача, которую запустила эта сессия, как в RT-3673 |
| Input | вход хука: `tool_name`, `tool_input.command`, `transcript_path`, `cwd`; 18 команд из записей лежат дословно в `projects/agent-kit/tests/fixtures/monitor-records.tsv` с датой и фоновой командой, их должно быть отказано: `tail -f`, `tail -F`, `tail -n 0 -f`, `tail -n +1 -F`, `tail … \| grep --line-buffered`, цикл с `echo` на каждой смене (23.11 05:03), циклы с `sed -n` (16.11 21:40, 21:46), с `grep … \| sed -n` (18.11 11:47), `until … do grep … \| tail -1; sleep; done` (20.11 07:52); файл задачи через `$S/…` (15.11 15:57, 15:59), через `$(basename "$PWD")`, вывод задачи `tasks/<id>.output`, фоновое из того же ответа (13.11 11:53, 05.11 16:55), ожидание двух своих задач по строке на конец каждой (06.11 11:39) — отказ: оба конца придут уведомлением; восемь проходящих из записей и одна синтетическая (`tail -f … \| grep -m 1`): опрос `gh pr checks` с `$(… \|\| echo '[]')`, таймер `sleep 600; echo tick`, `for … sleep; done; echo`, `until grep -q …; do sleep; done; tail -3 …`, цикл с `echo` и затем `break` в одной ветке (20.11 08:19), `grep … \| tail -3 \| cut …; break` (05.11 17:00), `tail -f … \| grep -m 1`, ожидание конца агента; файл задачи, которая кончилась или снята `TaskStop`; файл, который не пишет ни одна задача; запись без пути, неразборная, без фоновых; движок дольше 10 с. SC-AK-2017, `projects/agent-kit/tests/monitor-stream-guard.test.sh` |
| Bounds | `owner-stop-call-guard.sh`, `runStopCall` и `eventsOf` не меняются; другие инструменты хук не судит; сломанный хук, упавший движок и движок дольше 10 с вызов пропускают; путь из подстановки команды, кроме `$(basename "$PWD")`, не раскрывается — такой `Monitor` проходит, спек называет цену; строка на конец каждого агента не судится: агент — не фоновая команда; повтор `turn-replay` зовёт только хуки конца хода, ожидание набора RT-3594 этот хук не меняет; таблица переходов плана эпика не меняется |
| Priority | простота и надёжность пропуска выше полноты: ложный отказ мешает работе, пропуск стоит строк в очереди; `Monitor` без признака строки на шаг проходит без `node`; с признаком — чтение записи 338 МБ за 1,26–1,30 с по замеру роли, поэтому до 2 с на вызов, предел 10 с |
| Budget | `projects/agent-kit/assets/checks/flow-monitor.mjs` до 140; `projects/agent-kit/assets/checks/task-flow-script.mjs` плюс 20; `projects/agent-kit/assets/hooks/monitor-stream-guard.sh` до 70; `projects/agent-kit/assets/checks/decision-table.json` плюс 20; `projects/agent-kit/tests/monitor-stream-guard.test.sh` до 300; `projects/agent-kit/tests/fixtures/monitor-records.tsv` до 40 строк; новых файлов кода: 2; новых зависимостей: 0 |

## Task footprint

| What | Where |
| ---- | ----- |
| Code (правится) | `projects/agent-kit/assets/checks/flow-monitor.mjs`, `projects/agent-kit/assets/checks/task-flow-script.mjs`, `projects/agent-kit/assets/hooks/monitor-stream-guard.sh`, `projects/agent-kit/assets/checks/decision-table.json` |
| Tests (правится) | `projects/agent-kit/tests/monitor-stream-guard.test.sh`, `projects/agent-kit/tests/fixtures/monitor-records.tsv` |
| Specs (правится) | `docs/specs/agent-kit/turn-guards/`, `docs/specs/agent-kit/decision-table/` |
| Rules (правится) | `.claude/skills/turn-conduct/implementation.md` |
| Layout (правится) | `tools/flow-monitor.mjs`, `tools/task-flow-script.mjs`, `tools/decision-table.json`, `.claude/hooks/monitor-stream-guard.sh` |
| Changelog (правится) | `projects/agent-kit/CHANGELOG.md` |
| Epic plan (правится) | `docs/plans/owner-stop-holds.md` |
| Rules | `projects/agent-kit/assets/rules/turn-conduct.md`, `.claude/skills/agent-kit-source/` |

## What counts as done

- `Monitor` с `tail -f`, `-F`, `--follow` или циклом, который печатает на каждом круге любой командой вывода, отказан,
  если команда называет файл вывода живой своей фоновой задачи или файл, который пишет её команда через `>`, `>>` или
  `tee`. Пути сравниваются после подстановки присваиваний, `TMPDIR`, `$PWD` и `$(basename "$PWD")`. Фоновое,
  запущенное в том же ответе, считается живым. Отказ называет номер задачи и файл и говорит, что делать: конец придёт
  уведомлением, файл читается после него без `Monitor`; задача, которая сама не кончается, ждётся одной строкой через
  `until grep -q`.
- Из 18 построчных команд записей по своему фоновому отказаны не меньше 17; восемь проходящих команд записей и
  синтетический `tail -f … | grep -m 1` проходят; `echo` внутри `$(…)` признаком не считается; конвейер судится как одна команда.
- Запись без пути, неразборная или без фоновых, упавший движок и движок дольше 10 с — вызов проходит. `Monitor` без
  признака строки на шаг проходит без `node`. Хук с признаком на записи 338 МБ отвечает не дольше 2 с.
- Строка `USAGE` движка называет обе формы после слияния `main`: `step <N.M>|<N>|--done`, `stop`, `stop-call` и
  новую `monitor-call`. В `projects/agent-kit/CHANGELOG.md` раздел 0.41.1 стоит один раз: повтор записал второй
  запуск выпуска 26.11.
- Живая проверка записана: до правки фоновая команда пишет файл, `Monitor` с `tail -f` по нему проходит; после
  раскладки тот же вызов отказан текстом `BLOCKED by monitor-stream-guard`, а ожидание одной строки по тому же файлу
  проходит.

## Stages

### 1. Замер до правки и решение

- **Steps:**
    1. Замер до правки записан в ход работы
       Check: `grep -c '^- Замер до правки: отказано 0 из 18, живой tail -f по своему фоновому прошёл' docs/tasks/RT-3674-monitor-per-line-refused/progress.md` → = 1
    2. Модуль решает, печатает ли команда строку на шаг и за какой своей задачей следит
       Check: `grep -c 'export function linesPerStep\|export function followedTask' projects/agent-kit/assets/checks/flow-monitor.mjs` → >= 2
    3. Команда движка судит вызов Monitor
       Check: `grep -c "'monitor-call'" projects/agent-kit/assets/checks/task-flow-script.mjs` → >= 2
    4. Строка USAGE движка называет обе формы после слияния main
       Check: `grep -c 'step <N.M>|<N>|--done.*stop-call.*monitor-call' projects/agent-kit/assets/checks/task-flow-script.mjs` → = 1
- **Readiness sign:** движок отвечает, отказан ли `Monitor`, и называет задачу и файл.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — 0 провалов.

### 2. Хук и случаи

- **Steps:**
    1. Хук отказывает Monitor по своему фоновому
       Check: `grep -c '^# rt-hook: PreToolUse Monitor' projects/agent-kit/assets/hooks/monitor-stream-guard.sh` → = 1
    2. Строка таблицы решений называет отказ
       Check: `grep -c '"monitor_stream"' projects/agent-kit/assets/checks/decision-table.json` → >= 1
    3. Случаи набора на каждую форму входа
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/monitor-stream-guard.test.sh 2>&1 | grep -c '^  ok .*SC-AK-2017'` → >= 34
    4. Команды из записей отказаны не меньше 17 из 18
       Check: `set -o pipefail; VERBOSE=1 bash projects/agent-kit/tests/monitor-stream-guard.test.sh 2>&1 | grep -c '^  ok .*SC-AK-2017 — запись .* deny'` → >= 17
    5. Время хука на большой записи записано в ход работы
       Check: `grep -cE '^- Время хука: [01],[0-9]+ с на записи 338 МБ' docs/tasks/RT-3674-monitor-per-line-refused/progress.md` → = 1
- **Readiness sign:** `Monitor` по своему фоновому отказан, опрос PR, таймер и ожидание одной строки проходят.
- **Verified by:** `bash projects/agent-kit/tests/monitor-stream-guard.test.sh`, `bash projects/agent-kit/tests/hooks-kind.test.sh`,
  `bash projects/agent-kit/tests/decision-table.test.sh` — 0 провалов.

### 3. Тексты, раскладка, живая проверка

- **Steps:**
    1. Спек проверок хода называет отказ Monitor
       Check: `grep -c 'SC-AK-2017' docs/specs/agent-kit/turn-guards/scenarios.md` → >= 1
    2. Привязка спека называет хук
       Check: `grep -c 'monitor-stream-guard' docs/specs/agent-kit/turn-guards/implementation.md` → >= 1
    3. Спек таблицы решений называет строку хука
       Check: `grep -c 'monitor-stream-guard' docs/specs/agent-kit/decision-table/spec.md` → >= 1
    4. Файл правила хода для дерева называет проверку
       Check: `grep -c 'monitor-stream-guard' .claude/skills/turn-conduct/implementation.md` → >= 1
    5. Раздел 0.41.1 стоит в журнале изменений один раз
       Check: `grep -c '^## \[0.41.1\]' projects/agent-kit/CHANGELOG.md` → = 1
    6. Пакет разложен в дерево
       Check: `grep -c 'monitor-call' tools/task-flow-script.mjs` → >= 2
    7. Живая проверка после раскладки записана в ход работы
       Check: `grep -c '^- Живая проверка после раскладки:.*BLOCKED by monitor-stream-guard' docs/tasks/RT-3674-monitor-per-line-refused/progress.md` → = 1
- **Readiness sign:** спеки, привязка и файл правила называют проверку; разложенное сходится с пакетом; на живой
  сессии `tail -f` по своему фоновому отказан.
- **Verified by:** `node tools/check-specs.mjs`, `pnpm run agent-kit:check`,
  `bash projects/agent-kit/tests/monitor-stream-guard.test.sh` — 0 провалов.

## What this work does not do

- Не отказывает `Monitor`, который печатает одну строку в конце, даже если он следит за своим фоновым.
- Не раскрывает путь из подстановки команды, кроме `$(basename "$PWD")`: такой `Monitor` проходит.
- Не раскрывает путь после `cd` в команде задачи: он считается от `cwd` входа хука, при расхождении такой `Monitor`
  проходит.
- Не судит строки на конец каждого агента и `Monitor` опроса PR и таймера: они не следят за фоновой командой.
- Не меняет остановку владельца, хуки конца хода и таблицу переходов плана эпика.
