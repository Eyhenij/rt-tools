# План

**Task:** RT-3627 · **Branch:** RT-3627-single-task-without-epic
**Spec:** `docs/specs/agent-kit/delivery-epic/spec.md`
**Behaviour:** unchanged — кода приложений, кита и пакетов с экранами работа не трогает. Меняются движок хода, команда заведения и защита базы ветки из пакета правил.

После написания этот файл не правится. Пересмотр этапа идёт в `progress.md` решением по ходу.

## Точки

- **A:** одной задаче нужен эпик. Движок хода не проводит работу вне эпика дальше состояния `эпик-заведён`, поэтому поверх готовых задач завели RT-3497, RT-3566 и RT-3390. Команда заведения пускает задачу вне эпика только со вторым словом владельца.
- **B1 — движок проводит работу вне эпика.** Признак: у карточки со строкой «Работа вне эпика — …» выход `эпик-заведён` пройден, у черновика с числом 1 — тоже; без строки и без числа — нет, как сейчас.
- **B2 — разбор из одной задачи заводит её без второго слова.** Признак: `task:new --single` на черновике со строкой «**Задач в разборе:** 1» пишет в карточку «Работа вне эпика — разбор дал одну задачу» и печатает ветку от main; уже заведённая карточка получает ту же строку командой.
- **B3 — две задачи по-прежнему требуют эпика.** Признак: число 2, пустое, две строки — отказ до карточки с названным `--epic`; копии с открытым эпиком — отказ; ветка одиночной от чужих коммитов — отказ.
- **Веха G эпика:** не больше 30 минут активной работы на мелкую задачу, а одиночная попадает в main около часа. Эта задача двигает второе: снимает ветку эпика, её план, вторую заявку и набор на ней. Час она одна не даёт: 35 минут CI остаются. До слияния эпика в main польза не доходит ни до одной копии, поэтому второе меряется на первых трёх задачах вне эпика после слияния — строка об этом ложится в `docs/plans/delivery-speed.md`.
- **Цена:** закон `delivery` ослаблен: слово владельца «вне эпика» больше не нужно, где задача одна. Число пишет исполнитель; машина сверяет строку, а не смысл. Несколько независимых одиночных, каждая от main, машина не считает — серию держит закон. Посторонний мелкий заказ в копии с открытым эпиком идёт по-прежнему словом владельца. Карточка, которой строку дописали руками, проходит — как и сейчас.
- **Metric:** у задач вне эпика и одиночных — минуты от первого коммита ветки до открытия её PR и отдельно до слияния, медиана; REST `pulls/N/commits`, `created_at`, `merged_at`; вниз. База до открытия PR: 231, 644 и 1175 с эпиком из одной (RT-3390, RT-3497, RT-3566); 11, 10, 31 и 118 вне эпика до поломки движка (RT-3455, RT-3475, RT-3450, RT-3456). До слияния: 232, 676, 1228 и 26, 28, 73, 573.

## Как устроено

- **Пересечение с RT-3565.** Её «Готово» — та же починка движка, эпик RT-3564, ветки у неё нет. По слову владельца на одобрении плана она закрывается этой работой: PR её называет, строка плана RT-3564 и её карточка правятся при закрытии.
- **Одно чтение строки карточки.** `board-epic-link` получает `outsideReasonOf(body)`: строка «Работа вне эпика — <слова>» открывает свою строку тела. Её зовут аудит (вместо своего поиска по всему тексту), состояние карточки (`board.mjs` — поле `outside`) и команда. Одиночная — `outside` со словами «разбор дал одну задачу». Карточка с эпиком и со строкой — эпик.
- **Одно чтение числа разбора.** `tasksOfGrill(text)` в `measure/text.mjs` рядом с `grillAnswered`: ровно одна строка `**Задач в разборе:** <число>` или `**Tasks of the grill:** <число>`, иначе причина. Её зовут движок и команда; команда находит модуль так же, как `flow-plan` находит свой.
- **Движок.** `measure.epic.declared` пройден, если у карточки задачи нет эпика и есть `outside`; эпик судится раньше памяти, помнится только ответ карточки, ключ — ветка. Для ветки без номера и копии без живого эпика — если черновик один и его число 1; этот ответ не помнится. Слова действия состояния `договорённость-записана`: «create the task, the branch from its base, and the folder»; виды `flow-sync` переписываются генератором.
- **Команда.** `task-new-single.github.mjs`: `--single` требует `--slug`. Отказы до карточки, по порядку: соседство с `--epic`, `--epic-of`, `--outside-epic`; нет черновика; разбор не отвечен; число разбора не 1 — при числе больше 1 назван `--epic`; тело уже называет эпик; эпик копии — открытая карточка с меткой эпика, названы `--epic-of` и `--outside-epic`. Номер самой задачи в строке копии эпиком не считается.
- **Заведённая карточка.** `node tools/task-new-single.mjs <номер> --slug <slug>`: разбор из папки ветки, нет её — из черновика; те же отказы; строка дописана в тело. Карточку с эпиком не трогает.
- **Назначение копии.** `tree-assignment-guard` освобождает `--single` там, где строки копии нет (`no_row`, `unnamed`): номера до заведения ещё нет, строку судит взятие ветки. Прочерк (`dash`) — ответ владельца, не освобождается.
- **База ветки.** Ветка одиночной задачи, чья база несёт коммиты сверх main и принадлежит другой задаче, получает отказ прежним классом `branch_create_stale_base` (строка для работы вне эпика в таблице решений есть), слова — «Take a fresh base». Отказа по базе PR и сторожа выросшего разбора нет: строк в таблице решений для них нет, находка по ходу идёт своей карточкой.
- **Состояние эпика.** `epic-table` на ветке работы вне эпика отвечает «работа вне эпика», а не советом вписать эпик.
- **Тексты.** Закон `delivery` (три места: слово владельца на работу вне эпика, база ветки задачи, первая работа серии), правила `epic-flow`, `task-flow`, `task-flow-start`, холодные части `epic-flow`, `task-flow-start`, `git-workflow-commit`, `task-flow.2`; в дереве `task-delivery-loop` шаг 2 и его готовая команда. В двух холодных частях у предела длины (`task-flow.2` и `git-workflow-commit`) строки сокращаются той же правкой. Новые сценарии спеки идут в файлы с местом: `delivery-epic`, `flow-script/epic`; в `work/scenarios.md` меняются слова без новых строк. Образец разбора получает строку `**Tasks of the grill:** <number>`.

## След задачи

| Что                  | Где |
| -------------------- | --- |
| Specs (правится)     | `docs/specs/agent-kit/delivery-epic/spec.md`, `docs/specs/agent-kit/delivery-epic/scenarios.md`, `docs/specs/agent-kit/delivery-epic/implementation.md`, `docs/specs/agent-kit/turn-guards/flow-script/epic/spec.md`, `docs/specs/agent-kit/turn-guards/flow-script/epic/scenarios.md`, `docs/specs/agent-kit/turn-guards/flow-script/epic/implementation.md`, `docs/specs/agent-kit/turn-guards/flow-script/spec.md`, `docs/specs/agent-kit/work/spec.md`, `docs/specs/agent-kit/work/scenarios.md`, `docs/specs/agent-kit/work/implementation.md`, `docs/specs/agent-kit/board/scenarios.md`, `docs/specs/agent-kit/tree-assignment/spec.md`, `docs/specs/agent-kit/tree-assignment/scenarios.md`, `docs/specs/agent-kit/tree-assignment/implementation.md` |
| Laws (правится)      | `projects/agent-kit/assets/laws/delivery.md` |
| Laws                 | `docs/constitution/work-conduct.md` |
| Rules (правится)     | `projects/agent-kit/assets/rules/epic-flow.md`, `projects/agent-kit/assets/rules/task-flow.md`, `projects/agent-kit/assets/pitfalls/epic-flow.md`, `projects/agent-kit/assets/patterns/task-flow-start.md`, `projects/agent-kit/assets/pitfalls/task-flow-start.md`, `projects/agent-kit/assets/pitfalls/git-workflow-commit.github.md`, `projects/agent-kit/assets/pitfalls/task-flow.2.md`, `.claude/rt-kit/overrides/pitfalls/git-workflow-commit.github.md`, `.claude/rt-kit/overrides/pitfalls/task-flow.2.md`, `.claude/skills/epic-flow/implementation.md`, `.claude/skills/task-delivery-loop/pitfalls.md`, `.claude/skills/task-delivery-loop-run/SKILL.md` |
| Code (правится)      | `projects/agent-kit/assets/checks/task-new.github.mjs`, `projects/agent-kit/assets/checks/task-new-single.github.mjs`, `projects/agent-kit/assets/checks/board-epic-link.github.mjs`, `projects/agent-kit/assets/checks/board.github.mjs`, `projects/agent-kit/assets/checks/board-epics.github.mjs`, `projects/agent-kit/assets/checks/epic-table.github.mjs`, `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh`, `projects/agent-kit/assets/hooks/git-guard-delivery.sh`, `projects/agent-kit/assets/hooks/tree-assignment-guard.sh`, `projects/agent-kit/assets/task-flow/measure/epic.mjs`, `projects/agent-kit/assets/task-flow/measure/text.mjs`, `projects/agent-kit/assets/task-flow/source/host.mjs`, `projects/agent-kit/assets/task-flow/flow.js`, `projects/agent-kit/assets/task-flow/flow.md`, `projects/agent-kit/assets/defaults/turn-map.md`, `projects/agent-kit/assets/samples/tasks/_template/grill.md`, `.prettierignore` |
| Tests (правится)     | `projects/agent-kit/tests/single-task.test.sh`, `projects/agent-kit/tests/task-flow-script.test.sh`, `projects/agent-kit/tests/checks-board-epic-base.test.sh`, `projects/agent-kit/tests/guard-epic-base.test.sh`, `projects/agent-kit/tests/guard-tree-assignment.test.sh`, `projects/agent-kit/tests/epic-table.test.sh`, `projects/agent-kit/tests/task-new-epic.test.sh`, `projects/agent-kit/tests/task-new-queue.test.sh` |
| Настройки (правится) | раскладка пакета: `tools/`, `.claude/hooks/`, `.claude/skills/`, `.claude/rt-kit/`, `docs/constitution/`, `docs/tasks/_template/` |
| Записи (правится)    | `docs/plans/delivery-speed.md`, `docs/plans/delivery-speed-findings.md` |

Выпуск пакета идёт своим порядком, версии в ветке нет.

## Что считается сделанным

- Движок: пройден у карточки с любой строкой «Работа вне эпика», у черновика с числом 1; не пройден у карточки без эпика и без строки, у карточки, получившей эпик после памяти, у черновика с 2, без числа и с двумя строками, у копии с живым эпиком без его ветки. Молчащий хостинг: помнится прошлый ответ карточки.
- Команда: каждый названный отказ без карточки и в названном порядке; проход с карточкой, строкой и веткой от main; строка копии с номером самой задачи — проход. Прежние вызовы ведут себя как раньше.
- Заведённая карточка: разбор в папке ветки без черновика — строка дописана; с эпиком в теле и с числом 2 — отказ, тело прежнее.
- Аудит: карточка со строкой посреди предложения названа; со своей строкой — нет.
- Защита: ветка одиночной от main пускается; от ветки другой задачи с коммитами — отказ; работа вне эпика по слову и задача эпика судятся как раньше. Копия без строки заводит `--single`, с прочерком — нет.
- Живые вызовы: `task:new --single` на черновике с 2 — отказ по числу, карточек не прибавилось; состояние живой карточки вне эпика отдаёт `outside`.

## Этапы

### 1. Движок хода и чтение строки

- **Steps:**
    1. Сценарии выхода `эпик-заведён` вне эпика зелёные
       Check: `sh -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok .*outside an epic"'` → >= 9
    2. Аудит читает строку на своём месте
       Check: `sh -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/checks-board-epic-base.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok .*outside line"'` → >= 2
- **Readiness sign:** ветка задачи вне эпика доходит до `работа-отдана`.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — последняя строка без провалов.

### 2. Команда заведения

- **Steps:**
    1. Сценарии отказов, прохода и заведённой карточки зелёные
       Check: `bash -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/single-task.test.sh 2>&1) || exit 1; n() { printf "%s\n" "$out" | grep -c "^  ok .*$1"; }; [ "$(n "single refused")" -ge 11 ] && [ "$(n "single created")" -ge 4 ] && [ "$(n "single card")" -ge 5 ]'` → exit 0
    2. Прежние сценарии заведения и очереди зелёные, раскладка сходится
       Check: `bash -c 'test -s tools/task-new-single.mjs || exit 1; for t in task-new-epic task-new-queue checks-board checks-board-epic-plan epic-table; do bash projects/agent-kit/tests/$t.test.sh >/dev/null 2>&1 || exit 1; done; pnpm -s run agent-kit:check >/dev/null 2>&1'` → exit 0
- **Readiness sign:** разбор из одной заводит задачу, из двух — нет.
- **Verified by:** `bash projects/agent-kit/tests/single-task.test.sh` — последняя строка без провалов.

### 3. Защиты

- **Steps:**
    1. База ветки одиночной задачи
       Check: `sh -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/guard-epic-base.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok .*single task"'` → >= 4
    2. Копия без строки заводит одиночную
       Check: `sh -c 'out=$(VERBOSE=1 bash projects/agent-kit/tests/guard-tree-assignment.test.sh 2>&1) && printf "%s\n" "$out" | grep -c "^  ok .*single task"'` → >= 3
- **Readiness sign:** ветка одиночной задачи растёт от main.
- **Verified by:** `bash projects/agent-kit/tests/delivery-epic-classes.test.sh` — последняя строка без провалов.

### 4. Закон, правила и спека

- **Steps:**
    1. Закон и тексты называют одиночную задачу
       Check: `bash -c 'flat() { tr "\n" " " < $1 | tr -s " "; }; l=docs/constitution/delivery.md; flat $l | grep -q "exists only by the owner.s word about that work" && exit 1; [ "$(flat $l | grep -o "grill gave one task" | wc -l)" -ge 3 ] || exit 1; for f in .claude/skills/epic-flow/SKILL.md .claude/skills/task-flow-start/SKILL.md .claude/skills/task-flow-start/pitfalls.md .claude/skills/git-workflow-commit/pitfalls.md .claude/skills/task-flow/pitfalls-2.md; do flat $f | grep -qi "grill gave one task" || exit 1; done; for f in .claude/skills/task-delivery-loop/pitfalls.md .claude/skills/task-delivery-loop-run/SKILL.md; do grep -q -e "--single" $f || exit 1; done'` → exit 0
    2. Спека названа и сходится с кодом
       Check: `bash -c 'grep -qi "grill gave one task" docs/specs/agent-kit/delivery-epic/spec.md && node projects/agent-kit/assets/checks/flow-sync.mjs --check >/dev/null && node tools/check-specs.mjs >/dev/null && node tools/check-spec-coverage.mjs >/dev/null && node tools/check-doc-paths.mjs >/dev/null && node tools/check-file-size.mjs >/dev/null && node tools/check-descriptions.mjs >/dev/null && node tools/check-glossary.mjs >/dev/null'` → exit 0
- **Readiness sign:** закон, правила и спека говорят одно.
- **Verified by:** `node tools/check-specs.mjs` — код 0.

### 5. Живая проверка

- **Steps:**
    1. Слова живого отказа, ответ хостинга и мутанты стоят в ходе работы
       Check: `bash -c 'p=docs/tasks/RT-3627-single-task-without-epic/progress.md; grep -qE "^- \*\*Живой отказ:\*\* «task-new: .*Задач в разборе:.* 2.*--epic[^-].*», карточек ([0-9]+) до, \1 после" $p && grep -qE "^- \*\*Хостинг:\*\* RT-[0-9]+ — outside «.+»" $p && grep -qE "^- \*\*Мутанты:\*\* ([1-9][0-9]*) из \1( |$)" $p'` → exit 0
- **Readiness sign:** слова взяты из запуска; запись ложится коммитом раньше отметки шага.
- **Verified by:** `npm run task:new -- --single …` на черновике из двух задач — код 1 и отказ по числу.

## Чего эта работа не делает

- Не снимает строку копии в таблице назначений и заказ владельца на работу.
- Не меняет PR эпика, ветки его задач и лёгкий путь П1.
- Не заводит одиночную задачу из найденного по ходу эпика: она идёт в эпик.
- Не считает задачи по смыслу разбора: машина сверяет строку. Одна найдена, вторая отложена словом владельца — это две.
- Не снимает черновик PR одиночной: движок считает отданной и заявку-черновик, как сейчас.
