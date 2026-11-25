# План

**Task:** RT-3628 · **Branch:** RT-3628-pr-readiness-before-set
**Spec:** `docs/specs/agent-kit/push-ready/spec.md`
**Behaviour:** unchanged — кода приложений, кита и пакетов с экранами работа не трогает. Меняется команда набора из пакета правил.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** набор не спрашивает, откроется ли PR. 21–25.11 из 30 открытий PR отказ по делу получили 11 веток, 14 раз, и часть из них прогнала набор заново.
- **B1 — сквозной тест.** Признак: ветка с номером, чей код идёт через сквозной набор, без его теста получает отказ команды набора до первого шага. Судит сама `e2e-coverage-guard.sh`, с основой будущего PR.
- **B2 — папка.** Признак: папка, которую ещё нельзя разобрать, — отказ до первого шага: незакрытый шаг, нетронутый след, план или разбор, изменённые после коммита плана. Каждая причина названа отдельно. У ветки эпика — неразобранные папки её задач.
- **B3 — основа.** Признак: ветка эпика ушла вперёд слиянием или обычным коммитом, а у работы вне эпика ушла main — отказ теми же словами, что при открытии PR.
- **B4 — кого не судят.** Признак: ветка без номера и ветка с `--no-pr '<причина>'` идут в набор как сейчас; у ветки без своей папки в HEAD судится только сквозной тест.
- **Веха G эпика:** не больше 30 минут активной работы на мелкую задачу. Эта задача её почти не двигает: верхняя граница по журналу 21–25.11 — 111 минут от отказа о сквозном тесте до PR, с написанием теста и красными снимками; за 23–25.11 таких отказов нет. Она держит редкий дорогой промах.
- **Слова карточки «с открытой папкой».** Открытая папка сама набор не держит: порядок RT-3630 запускает его при открытой папке и разбирает её после зелёного. Отказов из-за неразобранной папки 21–25.11 ноль. Незакрытый шаг и след при открытии PR сейчас не судит никто — это новый отказ. Точка задачи 7 в плане эпика правится теми же словами.
- **Цена:** каждому запуску — секунды и чтение хостинга. Шаг, чей признак — сам набор, планом не бывает: такой шаг был один на 22 плана, его меряет запуск с `--no-pr`. Проверки шагов до набора не входят: около 80 секунд ветке, повторный набор по ним дала одна RT-3508. База, ушедшая под идущим набором (RT-3481), не ловится.
- **Metric:** отказы при открытии PR после зелёного набора по причинам «сквозной тест», «файлы разошлись с планом», «основа ушла» — веток на 30 открытых PR; вниз с 6, RT-3481 по основе осталась бы. Рядом — запуски с `--no-pr` из записи наблюдений. Источник — журналы сессий, меряется на вехе эпика.

## Как устроено

- **Помощник пакета** `git-guard-push-ready.sh`, функция `rt_push_ready_unmet <основа набора>`: строка на каждое невыполненное условие. Его зовёт `git-guard-push-ahead.sh` после основы и до списка шагов; имя основы берётся до её закрепления. Есть строки — они напечатаны, последняя `push ahead: not ready for a PR — …`, код 3, ни один шаг не начат, строка наблюдений `push-ready`.
- **Судят те же функции, что открытие PR.** Помощник берёт `git-guard-delivery-epic.sh` со своими `unmet` и `unmet_class` — первая печатает слова, вторая молчит — и зовёт `rt_epic_pull_base` и `rt_epic_own_pull`. Сама защита открытия PR не меняется.
- **Кого судит.** Ветка с номером задачи. Защиты дерева — у всякой. Папка и основа — пока своя папка `<RT_TASKS_DIR>/<ветка>` лежит в HEAD. Папки задач — у карточки с меткой эпика. Правка после открытого PR и вливание main в эпик под основу не попадают.
- **Основа.** Состояние карточки отдаёт профиль, `rt_task_state`. Эпик есть — `rt_epic_pull_base` с именем основы набора; нет — main не предок HEAD, слова защиты. Карточка не ответила — основа не судится.
- **Основа PR для защит дерева:** у задачи эпика — нижняя ветка цепочки, когда основа набора ею и является, иначе ветка эпика; вне эпика — основа набора.
- **Защиты дерева.** Профиль называет их в `RT_PUSH_READY_HOOKS`. Помощник зовёт каждую входом `gh pr create --base <основа PR>` с корнем этой копии и без унаследованных полей крючка и печатает причину отказа. Здесь это `e2e-coverage-guard.sh`, она не меняется.
- **Папка.** `checks/flow-ready.mjs` строит описание хода с надстройкой дерева и судит отдельно `measure.progress.done`, `measure.footprint.touched` и `changedSincePlan`. Прочие выходы не держат. Код 1 — причины, 0 — готова, 2 — судить не по чему: причина печатается, набор идёт.
- **`--no-pr '<причина>'`** — для незаконченной ветки и шага, чей признак — сам набор. Причина от трёх знаков печатается и пишется в наблюдения. Без причины и при ином доводе — код 3 и строка употребления.
- **Открытый отказ.** Нет помощника, хостинг молчит — набор идёт как сейчас.
- **Тексты.** Спека `push-ready`, строка в корневой спеке, таблица решений. В дереве — готовая команда и холодная часть цикла: отказ, `--no-pr`, «шаг, чей признак — сам набор, планом не бывает»; привязки `testing` и `task-delivery-loop`.

## След задачи

| Что                  | Где |
| -------------------- | --- |
| Specs (правится)     | `docs/specs/agent-kit/push-ready/spec.md`, `docs/specs/agent-kit/push-ready/scenarios.md`, `docs/specs/agent-kit/push-ready/implementation.md`, `docs/specs/agent-kit/spec.md`, `docs/specs/agent-kit/decision-table/spec.md` |
| Laws                 | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md` |
| Rules (правится)     | `.claude/skills/task-delivery-loop-run/SKILL.md`, `.claude/skills/task-delivery-loop/pitfalls.md`, `.claude/skills/task-delivery-loop/implementation.md`, `.claude/skills/testing/implementation.md` |
| Code (правится)      | `projects/agent-kit/assets/hooks/git-guard-push-ready.sh`, `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh`, `projects/agent-kit/assets/checks/flow-ready.mjs`, `projects/agent-kit/assets/checks/decision-table.json`, `.claude/rt-kit/project.sh` |
| Tests (правится)     | `projects/agent-kit/tests/push-ready.test.sh`, `tools/tests/e2e-coverage-guard.test.sh` |
| Настройки (правится) | раскладка пакета: `tools/`, `.claude/hooks/` |
| Записи (правится)    | `docs/plans/delivery-speed.md` |

Выпуск пакета идёт своим порядком, версии в ветке нет.

## Что считается сделанным

- Команда набора: отказ с кодом 3 без начатого шага при каждой причине B1–B3; две причины названы одним запуском; готовая ветка начинает первый шаг; ветка без номера и `--no-pr` с причиной идут; `--no-pr` без причины и чужой довод — код 3.
- Основа: эпик, ушедший обычным коммитом и слиянием, — отказ словами защиты; в цепочке ушедший эпик — отказ; нижняя ветка — основа PR; разобранная папка, молчащий хостинг, ветка эпика с ушедшей main и чужой конфликтный PR — набор идёт.
- Папка: незакрытый шаг, нетронутый след, изменённый план — по строке; две причины сразу — две строки; потерянная отметка одобрения не держит; сломанное описание — слово и набор идёт; папки задач в ветке эпика — отказ.
- Вызов из другой копии и под крючком отправки судит эту копию.
- Живые вызовы: на этой ветке до закрытия шагов — отказ за секунды; в клоне с правкой кита без теста — отказ с именем сквозного набора; с ушедшим эпиком — отказ со словом о слиянии.

## Этапы

### 1. Команда набора

- **Steps:**
    1. Сценарии готовности зелёные, у каждой причины свой
       Check: `bash -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/push-ready.test.sh 2>&1) || exit 1; n() { printf "%s\n" "$out" | grep -c "^  ok .*$1"; }; for i in 1993 1994 1995 1996; do [ "$(n SC-AK-$i)" -ge 4 ] || exit 1; done; for w in "no step starts" "all reasons in one run" "ready branch starts the first step" "without a reason" "open step" "untouched footprint" "plan edited" "two folder reasons" "lost approval mark" "epic folders left" "epic moved by a plain commit" "epic moved by a merge" "lower branch of a chain" "main moved outside an epic" "silent host" "taken-apart folder" "inherited hook input" "another copy"; do [ "$(n "$w")" -ge 1 ] || exit 1; done'` → exit 0
    2. Прежние сценарии команды набора и защиты эпика зелёные, раскладка сходится
       Check: `bash -c 'test -s tools/flow-ready.mjs || exit 1; for t in push-ahead-copy push-ahead-call-guard push-set-runs push-over-budget git-guard-push-nothing-new git-guard-push-base-live metric-events git-guard-push-tests guard-epic-base delivery-epic-classes; do bash projects/agent-kit/tests/$t.test.sh >/dev/null 2>&1 || exit 1; done; pnpm -s run agent-kit:check >/dev/null 2>&1'` → exit 0
- **Readiness sign:** неготовая ветка не начинает ни одного шага.
- **Verified by:** `bash projects/agent-kit/tests/push-ready.test.sh` — последняя строка без провалов.

### 2. Сквозной тест

- **Steps:**
    1. Команда набора и защита открытия PR отвечают одно на одних ветках
       Check: `bash -c 'out=$(VERBOSE=1 bash tools/tests/e2e-coverage-guard.test.sh 2>&1) || exit 1; n() { printf "%s\n" "$out" | grep -c "^  ok .*$1"; }; [ "$(n "before the set refused")" -ge 2 ] && [ "$(n "before the set passes")" -ge 3 ]'` → exit 0
- **Readiness sign:** ветка без теста узнаёт о нём до набора.
- **Verified by:** `bash tools/tests/e2e-coverage-guard.test.sh` — последняя строка без провалов.

### 3. Спека и тексты

- **Steps:**
    1. Спека названа и сходится с кодом, тексты цикла называют отказ и `--no-pr`
       Check: `bash -c 'test -s docs/specs/agent-kit/push-ready/spec.md && grep -q "push-ready/spec.md" docs/specs/agent-kit/spec.md && grep -q -e "--no-pr" .claude/skills/task-delivery-loop-run/SKILL.md && grep -q -e "--no-pr" .claude/skills/task-delivery-loop/pitfalls.md && grep -q "RT_PUSH_READY_HOOKS" .claude/skills/testing/implementation.md && grep -q "которую ещё нельзя разобрать" docs/plans/delivery-speed.md && node tools/check-specs.mjs >/dev/null && node tools/check-spec-coverage.mjs >/dev/null && node tools/check-doc-paths.mjs >/dev/null && node tools/check-file-size.mjs >/dev/null && node tools/check-glossary.mjs >/dev/null'` → exit 0
- **Readiness sign:** спека, таблица решений, цикл и план эпика говорят одно.
- **Verified by:** `node tools/check-specs.mjs` — код 0.

### 4. Живая проверка

- **Steps:**
    1. Слова живых отказов, их секунды и мутанты стоят в ходе работы
       Check: `bash -c 'p=docs/tasks/RT-3628-pr-readiness-before-set/progress.md; grep -qE "^- \*\*Живой отказ:\*\* «push ahead: not ready for a PR.*», ([0-9]|[12][0-9]) с, шагов начато 0" $p && grep -qE "^- \*\*Основа:\*\* «.*git merge origin/RT-3624-delivery-speed.*», код 3" $p && grep -qE "^- \*\*Сквозной тест:\*\* «.*apps/message-bus-admin-e2e/.*», код 3" $p && grep -qE "^- \*\*Мутанты:\*\* ([1-9][0-9]*) из \1( |$)" $p'` → exit 0
- **Readiness sign:** слова взяты из запуска; запись ложится коммитом раньше отметки шага.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` на незаконченной ветке — код 3 и ни одного шага.

## Чего эта работа не делает

- Не перемеряет шаги до набора и не судит тело PR: цена названа выше, набор по телу не повторяется.
- Не судит карточку, запись архива, несхлопнутую договорённость и конфликт своего PR: отказов по ним 21–25.11 ноль, а судить их до набора — запереть починку конфликта и первый набор ветки эпика.
- Не ловит основу, ушедшую под идущим набором.
- Не меняет отказов при открытии PR: они остаются последней линией.
- Не судит отправку мимо команды набора — крючок git `pre-push` в терминале и деревья, где набор вперёд не гоняют.
- Не возвращает разбор папки до набора.
