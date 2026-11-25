# План

**Task:** RT-3626 · **Branch:** RT-3626-light-path
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/spec.md`
**Behaviour:** unchanged — правка правил, движка хода и инструментов дерева; кода приложений, кита и
пакетов для потребителя она не трогает.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** любая правка идёт через чтение плана ролями и два круга по три роли; RT-3526 на 91 строку шла 49 минут, из них код 6.
- **Эта задача доводит до:** правка до 150 строк без запретных признаков идёт с коротким планом, без чтения плана ролями и с одним кругом `qa-engineer` и `goal-critic`; путь называет команда.
- **Признак:** на слитых RT-3525 и RT-3526 команда отвечает «лёгкий»; на RT-3514 и RT-3585 — «полный» по размеру; на RT-3446, RT-3473 и RT-3497 — «полный» по признаку. Короткий план получает отметку одобрения без вызова ролей.
- **Веха G эпика:** то же измерение на мелких задачах — не больше 30 минут активной работы в среднем.
- **Metric:** активные минуты на мелкую задачу; вниз; сейчас 61. Ожидаемый вклад П1 на прежних шести — 61,2 → 55,4; с П2 предел около 47. RT-3525 и RT-3526 в одиночку пришли бы к 30–36. До вехи на прежних шести остальным задачам эпика остаётся снять около 17 минут.

## Как судит команда

`tools/review-path.mjs` печатает `путь: лёгкий` или `путь: полный` и причины, по одной на строку.

- **Строки** — добавленные и удалённые строки кода. Не считаются тесты, истории витрины, сквозные наборы, `docs/`, `*.md`, `*.mdx`, снимки, графы кода и файл замка. Предел — 150 включительно. Образцы путей лежат одним списком в файле команды.
- **Полный путь при любом числе строк:**
    - *публичный API* — входной файл или `exports` и зависимости в `package.json` опубликованного пакета; объявление, отданное `export` из исходника под `projects/`, чей вид снаружи изменился. Вид снаружи — это текст объявления без тел функций и без закрытых членов, с изначальным видом входов и выходов компонента; его считает `tools/review-path-api.mjs` по дереву разбора до и после;
    - *безопасность* — пакеты и примеры входа, права, секреты, `deploy/`, `.github/`; изменённая строка с `DomSanitizer`, `bypassSecurityTrust`, `innerHTML` или проверкой протокола ссылки;
    - *миграции* — схема и миграции хранилища;
    - *смена вида* — стили, шаблоны, токены и значки кита и админки, видимый файл кита (`isVisibleKitFile`) без строки «Без вида» в записи согласий;
    - *защиты правил* — `.claude/` кроме `assignments.md`, `postmortems/`, `proposals/`, `observations/`; `docs/constitution/`; `projects/agent-kit/assets/` и `projects/agent-kit/src/`; движок хода в `tools/`; всякий файл с заголовком `rt-kit`; `tools/review-path*.mjs`, `tools/check-kit-approval.mjs`, `tools/check-push-gate.mjs`, `tools/check-hooks.mjs`, `tools/check-boundary.mjs`; `tools/*-allowlist.json`; `.husky/`. Прочие проверки `tools/check-*` защитами правил не считаются, иначе RT-3526, ради которой путь заведён, шла бы полным.
- **До кода** — `--plan <файл>`: судятся пути строк «(правится)» и заголовок `**Путь:** лёгкий · <N> строк`. Файл кита или пакета в следе требует в заголовке ещё `API и вид не меняются`; без этих слов — полный. Нет заголовка — полный.
- **После кода** — `--base <база>`: разница ветки с базой. Базу называет вызов: ветка цепочки судится от предыдущей ветки, а не от main.
- **`--roles <план>`** печатает `none` для лёгкого плана и обе роли иначе.
- **`--round-two --serious <N> [--since <вершина первого круга>]`**: на лёгком «не нужен». На полном «нужен» при N больше нуля, при правке кита (код под `projects/`, кроме тестов), защит правил или безопасности. Без `--serious` — «нужен». С `--since`, за которым нет ни одной правки, — «не нужен: читать нечего». Серьёзное — находка со степенью «высокая» или выше в ответе роли. Второй круг читает разницу от `--since`, ответ команды и N идут в тело PR.
- **`--check --base <база>`**: план ветки назван лёгким, а разница полная — код 1, причина и ход. План берётся из коммита, который его добавил, поэтому разобранная папка не мешает. Отказ снимает коммит ветки «…после второго круга ревью (RT-N)»: тогда прошло чтение всей ветки ролями полного пути. Ветка без плана и план без пометки — код 0.
- Разница или план, которые нельзя прочесть, — полный путь.

**Движок.** Ключ `planRolesCommand` в настройках проверок дерева. `plan-red` зовёт его с путём файла плана; ответ `none` снимает требование ролей. Ключа нет, код не 0 или другой ответ — требуются обе роли.

**Крючок меню.** `ask-judge` отпускает меню одобрения без вызова ролей, когда в заголовке плана стоит `**Путь:** лёгкий`; полный план без обеих ролей держит, как сейчас. Обман заголовком ловит движок: он зовёт команду.

**Короткий план** — заголовок, «Точки» (A, к чему доводит, признак), след, один этап с шагами и проверками. Образец лежит в `task-delivery-loop-run`. Таблицу «Точки» тела PR на лёгком пути даёт исполнитель выводом признаков, таблицу «Цель» — `goal-critic`.

## След задачи

| Что                   | Где                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs (правится)      | `docs/specs/agent-kit/turn-guards/flow-script/`, `docs/specs/agent-kit/turn-guards/flow-script/step-mark/spec.md`                                           |
| Specs (правится)      | `docs/specs/agent-kit/turn-guards/spec.md`                                                                                                                  |
| Laws                  | `docs/constitution/verifiability.md`, `docs/constitution/work-conduct.md`                                                                                   |
| Rules (правится)      | `.claude/skills/task-delivery-loop/`, `.claude/skills/task-delivery-loop-run/`, `.claude/skills/task-flow/`                                                 |
| Rules (правится)      | `.claude/rt-kit/overrides/rules/task-flow.md`, `.claude/rt-kit/overrides/pitfalls/task-flow.2.md`                                                           |
| Движок (правится)     | `projects/agent-kit/assets/checks/flow-plan.mjs`, `tools/flow-plan.mjs`                                                                                     |
| Крючок (правится)     | `projects/agent-kit/assets/hooks/ask-judge.md`, `.claude/hooks/ask-judge.md`                                                                                |
| Code (правится)       | `tools/review-path.mjs`, `tools/review-path-api.mjs`, `tools/tests/review-path.test.sh`                                                                     |
| Code (правится)       | `tools/session-time-steps.mjs`, `tools/session-time.mjs`, `tools/tests/session-time.test.sh`                                                                |
| Tests (правится)      | `projects/agent-kit/tests/flow-approval.test.sh`, `projects/agent-kit/tests/turn-replay.test.sh`                                                            |
| Настройки (правится)  | `.claude/rt-kit/checks.json`, `.claude/rt-kit/project.sh`, `CLAUDE.md`, `docs/plans/delivery-speed.md`                                                       |

## Что считается сделанным

- Сценарии показывают выбор пути по составу правки: 150 и 151 строка, каждый из пяти признаков, план без пометки, слова об API и виде, нечитаемая разница, цепочка из двух веток.
- Семь слитых задач судятся как в признаке.
- `plan-red` на коротком плане лёгкого пути не требует ролей; на полном, без ключа, при отказе команды и чужом ответе — требует обе.
- `ask-judge` называет лёгкий заголовок единственным случаем без ролей.
- `--check`: отказ лёгкому плану с полной разницей, после коммита второго круга — зелёно.
- `--round-two` отвечает «нужен» без `--serious`.
- Правило цикла, холодная часть, образец команд, надстройки и `CLAUDE.md` называют оба пути; «Every change passes … two review rounds» и «The loop has no exceptions» в них не осталось. Короткий план проходит `plan-check`.
- `session:time --steps` даёт ветке с одним кругом строку в отдельной группе, медианы полного хода на журнале 21–24.11 прежние.
- В плане эпика записано, что RT-3626 идёт раньше RT-3612.

## Этапы

### 1. Команда выбирает путь

- **Steps:**
    1. Сценарии выбора пути по составу правки зелёные
       Check: `sh -c 'out=$(VERBOSE=1 bash tools/tests/review-path.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok "'` → >= 40
    2. Слитые задачи судятся как в признаке
       Check: `sh -c 'for p in c850e5f87 4ac4d88d0 c9d8cbdb4 5abceba2a 7a49cced3 04965ec2d a46a0a868; do node tools/review-path.mjs --base "$p^1" --head "$p^2" | head -1 | cut -d" " -f2; done | paste -sd" " -'` → `лёгкий лёгкий полный полный полный полный полный`
- **Readiness sign:** команда отвечает по слитым задачам и сценариям.
- **Verified by:** `bash tools/tests/review-path.test.sh` — «0 failures».

### 2. Движок и крючок меню не требуют ролей на лёгком пути

- **Steps:**
    1. Сценарии движка: ключ есть, нет, отказал, ответил чужим
       Check: `sh -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/flow-approval.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "ok   .*SC-AK-1950"'` → >= 5
    2. Текст крючка меню отпускает лёгкий план и держит полный без ролей
       Check: `sh -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/turn-replay.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "ok   .*SC-AK-1951"'` → >= 2
    3. Пакет собран и разложен, дерево назвало команду
       Check: `sh -c 'grep -q planRolesCommand tools/flow-plan.mjs && grep -q planRolesCommand .claude/rt-kit/checks.json && grep -q "Путь" .claude/hooks/ask-judge.md && pnpm run -s agent-kit:check >/dev/null 2>&1 && echo 1'` → = 1
- **Readiness sign:** короткий план получает отметку без ролей.
- **Verified by:** `bash projects/agent-kit/tests/flow-approval.test.sh` — «0 провалов».

### 3. Правила и отправка

- **Steps:**
    1. Правило, холодная часть, образец команд, надстройки и CLAUDE.md называют оба пути
       Check: `sh -c 'for f in .claude/skills/task-delivery-loop/SKILL.md .claude/skills/task-delivery-loop/pitfalls.md .claude/skills/task-delivery-loop-run/SKILL.md .claude/rt-kit/overrides/rules/task-flow.md .claude/rt-kit/overrides/pitfalls/task-flow.2.md CLAUDE.md; do grep -q "light path" "$f" || exit 1; done; ! grep -rqE "The loop has no exceptions|Every change passes (a live check and )?two review rounds" .claude/skills/task-delivery-loop .claude/rt-kit/overrides .claude/skills/task-flow && echo 1'` → = 1
    2. Проверка пути стоит в наборе перед отправкой и судит от базы отправки
       Check: `bash -c '. .claude/rt-kit/project.sh; rt_push_checks origin/RT-3624-delivery-speed | grep -c "review-path.mjs --check --base origin/RT-3624-delivery-speed"'` → = 1
    3. Порядок с RT-3612 записан в плане эпика
       Check: `grep -c "RT-3626 идёт раньше RT-3612" docs/plans/delivery-speed.md` → = 1
- **Readiness sign:** тексты согласны, набор отказывает обману.
- **Verified by:** вывод шагов 3.1–3.3 — 1.

### 4. Время по шагам и проверки дерева

- **Steps:**
    1. Ветка с одним кругом получает строку, полный ход не изменился
       Check: `sh -c 'out=$(VERBOSE=1 bash tools/tests/session-time.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "ok   .*one round"'` → >= 3
    2. Быстрые проверки дерева зелёные на правке
       Check: `sh -c 'test -f tools/review-path.mjs && node tools/check-dupes.mjs >/dev/null && node tools/check-file-size.mjs >/dev/null && node tools/check-specs.mjs >/dev/null && node tools/check-doc-paths.mjs >/dev/null && pnpm run -s check:unused >/dev/null 2>&1 && echo 1'` → = 1
- **Readiness sign:** медианы журнала 21–24.11 прежние: 5, 4, 23, 8, 4, 9, 4, 33, 1.
- **Verified by:** `node tools/session-time.mjs --steps --file <журнал 9a26b817>` — те же девять чисел.

## Что эта работа не делает

- Взгляд ревью на структуру кода и счёт переделок — RT-3612.
- Одна задача без эпика — RT-3627, порядок набора и круга — RT-3630.
- Учёт числа кругов защитой: круги и дальше видны по коммитам и телу PR.
- Выбор мелких задач для сравнения «после» — слово владельца.
- Путь рядом со строкой `session:time`: журнал его не хранит.
