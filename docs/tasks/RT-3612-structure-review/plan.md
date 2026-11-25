# План

**Task:** RT-3612 · **Branch:** RT-3612-structure-review
**Behaviour:** unchanged — работа правит слой правил и инструменты дерева, код приложений `apps/` и `libs/` не трогает.

## Points

- **A:** ревью не получает «Решения» и вывода зацепления, структуру кода не смотрит, строки «Зависимости» и «Границы»
  плана с кодом не сверяет никто. Строки, переделанные после ревью, и файлы вне следа не считает ничто.
- **This task reaches:** роль `qa-engineer` в ручном круге получает путь к «Решению» плана и вывод `check-coupling`
  против базы, в конвейере — путь плана и команду `check-coupling` с базой из обязательного `args.base`. Она называет
  модуль с двумя обязанностями, лишний экспорт, импорт против строки «Зависимости» и правку файла, который «Границы»
  не велели трогать. Команда печатает переделки задачи и последних задач без разложенных копий, папки задачи, архива
  и планов.
- **Sign:** шаги 1.1, 1.2, 1.3, 1.4, 2.1, 2.2 и 2.3.
- **Milestone G of the epic:** у 20 задач после выпуска новых циклов и обходов ноль, медиана строк первого круга
  ревью меньше, чем у 20 задач до.
- **Metric:** строки первого круга ревью: вниз; медиана 177,5 у последних 20 задач на `a79855d82`, без копий.

## Решение

| Часть | Что выбрано |
| --- | --- |
| Модули | `tools/task-rework.mjs:reworkOf` — считает переделки задачи по истории; рядом чистые `strayOf` — файлы вне следа — и `median`. `agents/qa-engineer.md` — раздел «Structure of the code»: что роль ищет в структуре и как сверяет «Зависимости» и «Границы»; из команд роль зовёт сама только `check-coupling` против базы, git — нет. `workflows/feature.js:LENSES` — грань `structure`, её запрос несёт путь плана — из `args.plan` или `plan.md` рядом с разбором — и команду `check-coupling --base=` с базой из `args.base`; вызов без `base` отказан, как без `grill` |
| Зависимости | `tools/task-rework.mjs` берёт `footprintRows` и `touches` у `tools/task-flow/measure/text.mjs` и зовёт `check-coupling.mjs` отдельным процессом; обратно никто. Конвейер не подключает модулей дерева: команду зацепления зовёт роль |
| Зацепление | `tools/task-rework.mjs` исходящие 0 → 1; `tools/tests/task-rework.test.sh` исходящие 0 → 1. Циклов и обходов нет |
| Паттерны | Pure Fabrication — `tools/task-rework.mjs:reworkOf`: история git ни в один модуль задач не входит; отброшено: счёт внутри движка задач, он защищён и судит состояние, а не прошлое; отброшено: `tools/coupling-read.mjs:ownVersions`, он читает свои коммиты ветки от развилки, а команда — слитые задачи по заголовкам |
| Термины | первый круг — коммит «… после первого круга ревью (RT-N)»; строки круга — добавленные и удалённые строки этого коммита без разложенных копий, папки задачи, архива и планов, круг без своих строк — 0; вне следа — файл, которого не называет первая версия плана; образец — записанная правка в `projects/agent-kit/tests/fixtures/structure-review/`: дифф `review.diff`, её план с «Решением», вывод зацепления `coupling.txt`, запрос к роли `request.txt` и её ответ `role-reply.md` |
| Данные: довод | `RT-<номер>`; `--last=<число>`; `--since=<ревизия>`; ни одного, два, слово, не число, неизвестная ревизия — отказ с кодом 2; задача без коммитов — код 1. SC-AK-1968, `task-rework.test.sh` |
| Данные: история | задача с кругом и без него; без плана; план чужой задачи; строка следа, дописанная позже; папка разобрана; маска `*` и `**`, папка, имя файла; разложенная копия, папка задачи, архив и планы — ни в строках круга, ни вне следа; удалённый и двоичный файл; номер, который начинается так же; слияние эпика и слияние без задачи; новый цикл и неназванный рост; задача без коммита круга в медиану не входит и названа отдельно; `--since` берёт только слияния после ревизии. У каждой формы случай. SC-AK-1969, `task-rework.test.sh` |
| Данные: роль | раздел «Structure of the code» стоит в тексте роли и называет «Dependencies» и «Bounds»; грань `structure` стоит в `LENSES`; её запрос несёт путь плана и команду зацепления с базой; без `args.plan` берёт `plan.md` рядом с разбором; вызов без `base` отказан; строки запуска в ловушке `task-flow-resume` и в README передают `base`. SC-AK-1970, `roles-kind.test.sh` |
| Границы | `check-coupling.mjs`, движок задач и чтение следа не правятся. Роль по-прежнему кода не правит; из команд дерева сама зовёт только `check-coupling` против базы |
| Приоритет | простота: команда читает историю и ничего не хранит; `--last=20` — до трёх минут |
| Бюджет | `tools/task-rework.mjs` до 210 строк; `tools/tests/task-rework.test.sh` до 180; `projects/agent-kit/assets/agents/qa-engineer.md` плюс 32; `projects/agent-kit/assets/workflows/feature.js` плюс 16; `projects/agent-kit/tests/roles-kind.test.sh` плюс 30; новых файлов кода: 2; новых зависимостей: 0 |

## Task footprint

| What             | Where                            |
| ---------------- | -------------------------------- |
| Specs (правится) | `projects/agent-kit/tests/fixtures/structure-review/`, `projects/agent-kit/assets/pitfalls/task-flow-resume.md`, `projects/agent-kit/README.md`, `docs/specs/agent-kit/metrics/`, `docs/specs/agent-kit/roles/`, `docs/plans/clear-task-statement.md`, `docs/plans/clear-task-statement-findings.md` |
| Rules (правится) | `.claude/skills/task-delivery-loop-run/SKILL.md` |
| Code (правится)  | `tools/task-rework.mjs`, `tools/tests/task-rework.test.sh`, `projects/agent-kit/assets/agents/qa-engineer.md`, `projects/agent-kit/assets/workflows/feature.js`, `projects/agent-kit/tests/roles-kind.test.sh` |

## What counts as done

- Роль с новым текстом на записанной правке называет четыре находки: модуль `report.mjs` с двумя обязанностями
  отдельной находкой средней важности или выше, лишний экспорт `legacyTotalsOf`, импорт `db/raw.mjs` против строки
  «Зависимости», правку `ledger.mjs` против строки «Границы».
- Роль зовётся на образец рамкой запроса из паттерна и строкой плана `qa-engineer` дословно: запрос совпадает с ними,
  где вместо мест стоят пути образца, строка в строку. Запрос и ответ лежат рядом с образцом и переживают разбор папки
  задачи. Строка плана стоит вне общей рамки: `goal-critic` плана не получает.
- Роль получает путь «Решения» и зацепление против базы в обоих местах, где её зовут: в паттерне круга — вывод, в
  конвейере — команду с базой из `args.base`; конвейер без базы не запускается.
- Команда печатает для RT-3535 150 строк, для RT-3592 — 17 файлов и «no commit of the first round».

## Stages

### 1. Роль

- **Steps:**
    1. Текст роли держит раздел о структуре с «Dependencies» и «Bounds», грань стоит в конвейере, набор держит и то и другое
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/roles-kind.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1970'` → >= 6
    2. Запрос грани `structure` несёт путь плана и команду зацепления с базой; вызов без базы отказан
       Check: `set -o pipefail; o="$(VERBOSE=1 bash projects/agent-kit/tests/roles-kind.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1970 .*(путь плана|зацеплени|баз)'` → >= 3
    3. Паттерн круга пишет вывод зацепления против базы в файл; строку с планом и этим файлом получает только `qa-engineer`: она стоит вне общей рамки трёх ролей, подводка к ней — ровно строка «`qa-engineer` also gets this line, after the frame:», а `goal-critic` плана по-прежнему не получает
       Check: `set -o pipefail; f=.claude/skills/task-delivery-loop-run/SKILL.md; L='The plan: <plan>; the coupling against the base: <scratchpad>/coupling-N.txt.'; [ "$(sed -n '/^Review <scratchpad>/,/a severity\.$/p' "$f" | wc -l)" -eq 2 ] && { for p in 'check-coupling\.mjs --base=origin/<base> > <scratchpad>/coupling-N\.txt' '^The plan: <plan>; the coupling against the base: <scratchpad>/coupling-N\.txt\.$' 'never the plan'; do grep -cE "$p" "$f"; done; grep -B3 -xF "$L" "$f" | grep -cxE '.qa-engineer. also gets this line, after the frame:'; } | paste -sd' ' -` → `1 1 1 1`
    4. Роль, позванная на образец запросом ручного круга дословно, называет все четыре находки
       Check: `d=projects/agent-kit/tests/fixtures/structure-review/; f="$d"role-reply.md; q="$d"request.txt; n=0; [ -s "$q" ] && diff <({ sed -n '/^Review <scratchpad>/,/a severity\.$/p' .claude/skills/task-delivery-loop-run/SKILL.md | sed -e "s#<scratchpad>/review-N\.diff#${d}review.diff#" -e 's#RT-N-<slug>#RT-0-sample#'; grep -xF 'The plan: <plan>; the coupling against the base: <scratchpad>/coupling-N.txt.' .claude/skills/task-delivery-loop-run/SKILL.md | sed -e "s#<plan>#${d}plan.md#" -e "s#<scratchpad>/coupling-N\.txt#${d}coupling.txt#"; }) "$q" > /dev/null && n=$((n+1)); grep -qiE 'report\.mjs.*two duties.*(medium|high)' "$f" && n=$((n+1)); grep -qE 'legacyTotalsOf' "$f" && n=$((n+1)); grep -qE 'db/raw\.mjs.*Dependencies' "$f" && n=$((n+1)); grep -qE 'ledger\.mjs.*Bounds' "$f" && n=$((n+1)); echo "$n"` → `5`
- **Readiness sign:** образец, его план, вывод зацепления, запрос к роли и её ответ лежат в
  `projects/agent-kit/tests/fixtures/structure-review/`.
- **Verified by:** `bash projects/agent-kit/tests/roles-kind.test.sh` — без провалов.

### 2. Команда

- **Steps:**
    1. Одна задача: первый круг без копий, файлы вне следа, отказы
       Check: `set -o pipefail; o="$(VERBOSE=1 bash tools/tests/task-rework.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1968'` → >= 15
    2. Последние задачи и окно от ревизии: циклы, обходы, превышения, медиана без задач без круга
       Check: `set -o pipefail; o="$(VERBOSE=1 bash tools/tests/task-rework.test.sh 2>&1)" && printf '%s\n' "$o" | grep -cE '^  ok +SC-AK-1969'` → >= 12
    3. Числа карточки сходятся на истории дерева
       Check: `set -o pipefail; { node tools/task-rework.mjs RT-3535 | head -1; node tools/task-rework.mjs RT-3592 | head -1; } | grep -cE 'first round 150 lines|no commit of the first round; 17 files'` → = 2
    4. Описание, сценарии и привязки сходятся
       Check: `node tools/check-specs.mjs > /dev/null && grep -hcE '^### SC-AK-19(68|69) ' docs/specs/agent-kit/metrics/scenarios.md` → = 2
- **Readiness sign:** оба сценария зелёные, числа карточки сходятся.
- **Verified by:** `bash tools/tests/run.sh` и `node tools/check-specs.mjs`.

## What this work does not do

- Не отказывает и не встраивает команду в состояние task flow: она печатает числа, веху эпика судит отчёт с
  `--since` от выпуска кита.
- Не правит `check-coupling`: импорт без употребления скрывает число «taken by nobody», это отдельная находка.
- Не считает второй круг: веха эпика о первом.
- Не раскрывает маску в движке задач: там след судит RT-3611.
- Ответ роли проверяется на одной записанной правке.
