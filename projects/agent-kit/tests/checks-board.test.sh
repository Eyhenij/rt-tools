#!/usr/bin/env bash
# Сценарии сверки очереди работ: прогон на вершине открытого PR.
#
# Сеть здесь не трогается: помощник хостинга подставляется через `GH_BIN`, и отвечает он тем,
# что сценарий положил в окружение. Иначе набор проверял бы состояние очереди работ дерева, в
# котором его запустили, — а оно меняется каждым пушем.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: сверка очереди работ"

# --- SC-AK-277…280 — прогон на вершине открытого PR ------------------------------------------

BOARD_TREE="$(mktemp -d)"
mkdir -p "$BOARD_TREE/tools" "$BOARD_TREE/.claude/rt-kit" "$BOARD_TREE/docs/tasks" "$BOARD_TREE/.github/workflows"
cp "$CHECKS/rt-kit-checks.config.mjs" "$BOARD_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$BOARD_TREE/tools/board.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$BOARD_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$BOARD_TREE/tools/board-task-dirs.mjs"
cp "$CHECKS/board-gh.github.mjs" "$BOARD_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-runs.github.mjs" "$BOARD_TREE/tools/board-runs.mjs"
cp "$CHECKS/board-pull-state.github.mjs" "$BOARD_TREE/tools/board-pull-state.mjs"
cp "$CHECKS/board-paths.github.mjs" "$BOARD_TREE/tools/board-paths.mjs"
cp "$CHECKS/board-titles.github.mjs" "$BOARD_TREE/tools/board-titles.mjs"
cp "$CHECKS/board-epics.github.mjs" "$BOARD_TREE/tools/board-epics.mjs"
cp "$CHECKS/board-folders.mjs" "$BOARD_TREE/tools/board-folders.mjs"
cp "$CHECKS/board-long-work.github.mjs" "${BOARD_TREE}/tools/board-long-work.mjs"
cp "$CHECKS/check-board.github.mjs" "$BOARD_TREE/tools/check-board.mjs"
printf '%s\n' 'on: pull_request' 'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"

HEAD_SHA='0123456789abcdef0123456789abcdef01234567'

# Помощник хостинга: отвечает по роду вызова, а числа и даты берёт из окружения сценария.
cat > "$BOARD_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
printf '%s\n' "$args" >> "${STUB_CALLS:-/dev/null}"
case "$args" in
    *graphql*) printf '%s' "$STUB_BOARD" ;;
    "issue list"*) printf '%s' "$STUB_ISSUES" ;;
    "pr list"*) printf '%s' "$STUB_PULLS" ;;
    "pr view"*files*) printf '%s' "${STUB_FILES}" ;;
    *contents*) printf 'Not Found\n' >&2; exit 1 ;;
    *actions/workflows/*runs*) printf '%s\n' "$STUB_DEPLOY" ;;
    *actions/runs/*/jobs*) printf '%s\n' "${STUB_JOBS:-0}" ;;
    *actions/runs*tojson*) printf '%s\n' "${STUB_EVICTED:-[]}" ;;
    *actions/runs*per_page=20*) printf '%s\n' "$STUB_VERDICT" ;;
    *actions/runs*) printf '%s\n' "$STUB_RUNS" ;;
    # Отставание ветки заявки и отставание прода спрашиваются одним видом вызова, а отвечают
    # на разное: у первого читается «позади», у второго — «впереди». Различает их ключ выборки.
    *compare/*behind_by*) printf '%s\n' "${STUB_PULL_BEHIND:-0}" ;;
    *compare/*) printf '%s\n' "$STUB_BEHIND" ;;
    */commits/*) printf '%s\n' "$STUB_HEAD_DATE" ;;
    *) printf 'неожиданный вызов: %s\n' "$args" >&2; exit 1 ;;
esac
STUB
chmod +x "$BOARD_TREE/gh"

board_config() {
    printf '%s\n' "$1" > "$BOARD_TREE/.claude/rt-kit/checks.json"
}
# Дата вершины считается узлом, а не `date`: ключи сдвига у него свои на каждой системе.
minutes_ago() {
    node -e "process.stdout.write(new Date(Date.now() - $1 * 60000).toISOString())"
}
board_run() {
    (cd "$BOARD_TREE" && GH_BIN="$BOARD_TREE/gh" node tools/check-board.mjs 2>&1)
}
board_code() {
    (cd "$BOARD_TREE" && GH_BIN="$BOARD_TREE/gh" node tools/check-board.mjs > /dev/null 2>&1)
    printf '%s' "$?"
}
board_says() {
    board_run | grep -cE "$1"
}

export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"In review","optionId":"r"},"content":{"__typename":"Issue","number":700}}]}}}}'
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
pulls_json() {
    printf '[{"number":701,"title":"[RT-700] Правка","headRefName":"RT-700-probe","headRefOid":"%s","isDraft":%s,"body":"Closes #700"}]' "$HEAD_SHA" "$1"
}
export STUB_PULLS="$(pulls_json false)"
# Состав заявки: спрашивается только там, где конвейер называет пути, которых не слушает.
export STUB_FILES='{"files":[]}'

BOARD_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'
board_config "$BOARD_CONFIG"

# SC-AK-279 — прогон на вершине есть: сверка молчит
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
report "SC-AK-279 — прогон на вершине есть: расхождений нет" "$(board_code)" 0

# SC-AK-277 — вершина без прогона названа расхождением
export STUB_RUNS=0
report "SC-AK-277 — вершина без прогона отбита" "$(board_code)" 1
report "SC-AK-277 — сказано, что прогона нет" "$(board_says 'there is no run on the tip 01234567')" 1
report "SC-AK-277 — назван возраст вершины" "$(board_says 'it has lain there 60 min')" 1
report "SC-AK-277 — назван способ вернуть событие" "$(board_says 'gh pr close 701 && gh pr reopen 701')" 1

# SC-AK-278 — свежая вершина без прогона не судится
export STUB_HEAD_DATE="$(minutes_ago 2)"
report "SC-AK-278 — свежая вершина не судится" "$(board_code)" 0

# SC-AK-280 — дерево без файла конвейера прогонов не спрашивает
export STUB_HEAD_DATE="$(minutes_ago 600)"
board_config "${BOARD_CONFIG/.github\/workflows\/ci.yml/.github\/workflows\/nope.yml}"
report "SC-AK-280 — конвейера нет: расхождений нет" "$(board_code)" 0
report "SC-AK-280 — сказано, почему пропущено" "$(board_says 'the tree has no pipeline file')" 1

# SC-AK-733 — открытые задачи с совпадающими заголовками перечисляются сводкой
# Дубль по отдельности исправен: номер, исполнитель и колонка у обеих задач на месте, и сверка
# принимает каждую. Отказом это не считается — серия однотипных задач эпика законна.
board_config "$BOARD_CONFIG"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
saved_issues="$STUB_ISSUES"
saved_board="$STUB_BOARD"
export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"In review","optionId":"r"},"content":{"__typename":"Issue","number":700}},{"id":"item-2","status":{"name":"In review","optionId":"r"},"content":{"__typename":"Issue","number":702}}]}}}}'
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Письма владельцу уходят молча","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]},{"number":702,"title":"[RT-702] Письма владельцу уходят молча мимо очереди","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
report "SC-AK-733 — совпавшие заголовки названы" "$(board_says '#700, #702 — the titles overlap heavily')" 1
# Отказом это не считается: строка стоит в сводке, а не среди расхождений.
report "SC-AK-733 — расхождением это не считается" "$(board_run | sed -n '/расхождений/,$p' | grep -c 'сильно совпадают')" 0

# Разные работы в сводку не идут: совпадения слов у них нет.
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Письма владельцу уходят молча","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]},{"number":702,"title":"[RT-702] Кнопка сохранения теряет фокус","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
report "SC-AK-733 — разные заголовки молчат" "$(board_says 'the titles overlap heavily')" 0

export STUB_ISSUES="$saved_issues"
export STUB_BOARD="$saved_board"

# --- SC-AK-751 — связь задачи с эпиком читается в обе стороны ---------------------------------
# Односторонняя привязка выглядит целой так же, как двусторонняя: читатель приходит то от линии
# работ, то от карточки.
board_config "$BOARD_CONFIG"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
saved_issues="$STUB_ISSUES"
saved_board="$STUB_BOARD"
saved_pulls="$STUB_PULLS"
export STUB_PULLS='[]'
export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"Backlog","optionId":"b"},"content":{"__typename":"Issue","number":700}},{"id":"item-2","status":{"name":"Backlog","optionId":"b"},"content":{"__typename":"Issue","number":702}}]}}}}'

mkdir -p "$BOARD_TREE/docs/plans"
printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' '| 1 | RT-702 |' \
    > "$BOARD_TREE/docs/plans/epic.md"

epic_issues() {
    printf '[{"number":700,"title":"[RT-700] Эпик","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"epic"}],"body":"Замысел — docs/plans/epic.md"},{"number":702,"title":"[RT-702] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[],"body":"%s"}]' "$1"
}

# Метка эпика не названа — связь не судится вовсе: карточку эпика отличить от задачи нечем.
export STUB_ISSUES="$(epic_issues 'Повод и разбор')"
report "SC-AK-751 — метка эпика не названа: связь молчит" "$(board_says 'эпика — нет')" 0

EPIC_CONFIG="${BOARD_CONFIG/\"taskKey\":\"RT\"/\"epicLabel\":\"epic\",\"taskKey\":\"RT\"}"
board_config "$EPIC_CONFIG"

report "SC-AK-751 — замысел задачу называет, а её тело эпика — нет" \
    "$(board_says '#702: the plan of the epic #700 names the task')" 1
report "SC-AK-751 — названа строка, которой это чинится" "$(board_says 'Задача эпика #700, замысел — docs/plans/epic.md')" 1

# Обе стороны на месте — сверка молчит.
export STUB_ISSUES="$(epic_issues 'Задача эпика #700, замысел — docs/plans/epic.md')"
report "SC-AK-751 — двусторонняя привязка молчит" "$(board_says 'эпик')" 0

# Обратная сторона: тело эпик называет, а линия работ эпика этой задачи не знает.
printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' > "$BOARD_TREE/docs/plans/epic.md"
report "SC-AK-751 — тело называет эпик, а в замысле задачи нет" \
    "$(board_says '#702: the body names the epic #700, and its plan does not carry the task')" 1

# Карточка эпика без пути к замыслу — состав читать негде.
export STUB_ISSUES="$(printf '[{"number":700,"title":"[RT-700] Эпик","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"epic"}],"body":"Возможность без замысла"},{"number":702,"title":"[RT-702] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[],"body":"Повод"}]')"
report "SC-AK-751 — карточка без пути к замыслу названа" "$(board_says '#700: the epic card names no path to the plan')" 1

# Путь есть, а файла нет: карточка ссылается в пустоту.
export STUB_ISSUES="$(epic_issues 'Повод')"
rm -f "$BOARD_TREE/docs/plans/epic.md"
report "SC-AK-751 — замысла нет на диске" "$(board_says 'is not on disk — the card points into emptiness')" 1

# --- SC-AK-919 — замыслом считается документ с таблицей состава --------------------------------
# Карточка называет своё решение рядом с замыслом, и решение стоит первым. Пока замыслом считался
# первый путь в теле, состав выходил пустым, и все открытые задачи эпика читались как не входящие
# в него: четырнадцать ложных строк разом.
mkdir -p "$BOARD_TREE/docs/adr"
printf '%s\n' '# Решение' '' 'Решение о том, что киту быть одному.' > "$BOARD_TREE/docs/adr/decision.md"
printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' '| 1 | RT-702 |' \
    > "$BOARD_TREE/docs/plans/epic.md"

epic_two_docs() {
    printf '[{"number":700,"title":"[RT-700] Эпик","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"epic"}],"body":"Решение — docs/adr/decision.md; порядок задач — docs/plans/epic.md"},{"number":702,"title":"[RT-702] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[],"body":"%s"}]' "$1"
}

export STUB_ISSUES="$(epic_two_docs 'Повод')"
report "SC-AK-919 — решение перед замыслом состав не прячет" \
    "$(board_says '#702: the plan of the epic #700 names the task')" 1
export STUB_ISSUES="$(epic_two_docs 'Задача эпика #700, замысел — docs/plans/epic.md')"
report "SC-AK-919 — с решением перед замыслом двусторонняя привязка молчит" "$(board_says 'эпик')" 0

# Ни один названный документ состава не несёт — это своя строка, а не молчание и не «нет на диске».
printf '%s\n' '# Замысел эпика' '' 'Порядок задач ещё не записан.' > "$BOARD_TREE/docs/plans/epic.md"
export STUB_ISSUES="$(epic_two_docs 'Повод')"
report "SC-AK-919 — ни один названный документ состава не несёт" \
    "$(board_says 'none of the documents the card names carries the makeup')" 1

rm -f "$BOARD_TREE/docs/adr/decision.md" "$BOARD_TREE/docs/plans/epic.md"

# --- SC-AK-920 — принадлежность объявляется словом о задаче ------------------------------------
# Номер эпика стоит в теле задачи и в объяснении, и в цитате отказа, и в перечне того, чего работа
# не делает. Пока принадлежность читалась по упоминанию номера, всякая такая задача получала
# ложную строку — и обе задачи, заведённые разбором этого же промаха, её получили.
printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' > "$BOARD_TREE/docs/plans/epic.md"

export STUB_ISSUES="$(epic_issues 'Сверка дала четырнадцать ложных строк о составе эпика #700')"
report "SC-AK-920 — упоминание номера в объяснении принадлежностью не считается" \
    "$(board_says '#702: the body names the epic #700')" 0
export STUB_ISSUES="$(epic_issues 'Вторая задача эпика #700, идёт после первой')"
report "SC-AK-920 — объявленная принадлежность судится как прежде" \
    "$(board_says '#702: the body names the epic #700')" 1

# Обратная сторона читает то же объявление: замысел задачу называет, а тело её эпиком не объявляет.
printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' '| 1 | RT-702 |' \
    > "$BOARD_TREE/docs/plans/epic.md"
export STUB_ISSUES="$(epic_issues 'Сверка дала четырнадцать ложных строк о составе эпика #700')"
report "SC-AK-920 — упоминание номера объявлением не считается и со стороны замысла" \
    "$(board_says '#702: the plan of the epic #700 names the task')" 1
export STUB_ISSUES="$(epic_issues 'Вторая задача эпика #700, идёт после первой')"
report "SC-AK-920 — объявление со стороны замысла принимается" \
    "$(board_says '#702: the plan of the epic #700 names the task')" 0

rm -f "$BOARD_TREE/docs/plans/epic.md"

board_config "$BOARD_CONFIG"
export STUB_ISSUES="$saved_issues"
export STUB_BOARD="$saved_board"
export STUB_PULLS="$saved_pulls"

# SC-AK-732 — ветка, чей вклад конвейер не слушает, прогона не требует
# Такой ветке события не будет никогда, и совет вернуть его не исполним: красная строка означает
# «сверка не знает», а не «конвейер отказал», и стоит она рядом с настоящими расхождениями.
board_config "$BOARD_CONFIG"
printf '%s\n' 'on:' '    pull_request:' '        paths-ignore:' '            - "docs/**"' '            - "**.md"' \
    'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"
export STUB_RUNS=0
export STUB_HEAD_DATE="$(minutes_ago 600)"
export STUB_FILES='{"files":[{"path":"docs/specs/x/scenarios.md"},{"path":"README.md"}]}'
report "SC-AK-732 — вклад целиком под игнорируемыми путями: расхождений нет" "$(board_code)" 0

# Один файл вне списка — прогон требуется по-прежнему: конвейер на такую ветку встаёт.
export STUB_FILES='{"files":[{"path":"docs/specs/x/scenarios.md"},{"path":"projects/kit/src/a.ts"}]}'
report "SC-AK-732 — файл вне списка возвращает требование" "$(board_code)" 1

# Состав заявки пустой — судим как прежде: молчать наугад дороже одной лишней строки.
export STUB_FILES='{"files":[]}'
report "SC-AK-732 — пустой состав судится как прежде" "$(board_code)" 1

printf '%s\n' 'on: pull_request' 'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"
unset STUB_FILES

# SC-AK-281 — готовая работа, оставленная черновиком, названа отдельной строкой
board_config "$BOARD_CONFIG"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_PULLS="$(pulls_json true)"
report "SC-AK-281 — зелёный прогон при черновике отбит" "$(board_code)" 1
report "SC-AK-281 — сказано, что прогон зелёный, а PR черновик" "$(board_says 'the run on the tip 01234567 is green, and the PR is a draft')" 1
report "SC-AK-281 — назван способ снять черновик" "$(board_says 'gh pr ready 701')" 1

# SC-AK-282 — черновик при незелёном прогоне не судится
export STUB_VERDICT=failure
report "SC-AK-282 — красный прогон при черновике не отбит" "$(board_code)" 0
export STUB_VERDICT=running
report "SC-AK-282 — идущий прогон при черновике не отбит" "$(board_code)" 0

# SC-AK-425 — конфликт приезжает в отданную заявку чужим слиянием, и своего хода у него нет:
# гард судит один ход, а заявка стоит в очереди днями.
export STUB_RUNS=1
export STUB_VERDICT=success
conflicting_json() {
    printf '[{"number":701,"title":"[RT-700] Правка","headRefName":"RT-700-probe","headRefOid":"%s","isDraft":false,"body":"Closes #700","mergeable":"%s"}]' \
        "$HEAD_SHA" "$1"
}
export STUB_PULLS="$(conflicting_json CONFLICTING)"
report "SC-AK-425 — конфликтующая заявка названа расхождением" "$(board_code)" 1
report "SC-AK-425 — сказано, с чем конфликт" "$(board_says 'it conflicts with the main branch')" 1

# SC-AK-426 — «ещё не посчитано» конфликтом не считается: хостинг считает сливаемость заново
# после каждой правки главной ветки, и строка краснела бы на каждой свежей вершине.
export STUB_PULLS="$(conflicting_json UNKNOWN)"
report "SC-AK-426 — неизвестная сливаемость расхождением не считается" "$(board_code)" 0
export STUB_PULLS="$(conflicting_json MERGEABLE)"
report "SC-AK-426 — сливаемая заявка молчит" "$(board_code)" 0

# SC-AK-670…672 — у конфликтующей заявки прогона нет, и причина не в потерянном событии:
# конвейер проверяет слияние ветки с базой, а слияния при конфликте нет. Перезакрытие не помогает.
export STUB_RUNS=0
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_PULLS="$(conflicting_json CONFLICTING)"
report "SC-AK-670 — причиной названа не потеря события, а конфликт" \
    "$(board_says 'there will be none while it conflicts')" 1
report "SC-AK-671 — совета перезакрыть заявку при конфликте нет" \
    "$(board_says 'gh pr close 701 && gh pr reopen 701')" 0

# Заявка без конфликта судится как прежде: там причина и вправду в событии.
export STUB_PULLS="$(conflicting_json MERGEABLE)"
report "SC-AK-672 — у сливаемой заявки строка о событии прежняя" \
    "$(board_says 'the pipeline received no event')" 1

# SC-AK-845 — заявка поверх соседней прогона не получает: рабочий поток слушает заявки в главную
# ветку и событий с другой базой не видит. Прежняя строка была неверна дважды: событие не
# терялось, и перезакрытие его не вернёт.
based_json() {
    printf '[{"number":702,"title":"[RT-700] Правка","headRefName":"RT-700-probe","headRefOid":"%s","isDraft":false,"body":"Closes #700","mergeable":"MERGEABLE","baseRefName":"%s"}]' \
        "$HEAD_SHA" "$1"
}
export STUB_PULLS="$(based_json RT-699-nizhnyaya)"
report "SC-AK-845 — чужая база названа причиной" \
    "$(board_says 'the request is opened into the branch «RT-699-nizhnyaya»')" 1
report "SC-AK-845 — совета перезакрыть заявку при чужой базе нет" \
    "$(board_says 'gh pr close 702 && gh pr reopen 702')" 0
report "SC-AK-845 — названо, чем это исправляется" "$(board_says 'move the base')" 1

# База — главная ветка: строка о событии прежняя.
export STUB_PULLS="$(based_json main)"
report "SC-AK-845 — заявка в главную проверяется как прежде" \
    "$(board_says 'the pipeline received no event')" 1
export STUB_RUNS=1
export STUB_PULLS="$(pulls_json false)"

# --- SC-AK-584…590 — прогон, вытесненный из очереди конвейера --------------------------------
# Группа очереди сохраняет идущий прогон, а ждущий вытесняется следующим. Вытесненный завершается
# отменой и в списке неотличим от упавшего, хотя ветку не проверял — заданий у него ноль.

board_config "$BOARD_CONFIG"
export STUB_PULLS="$(pulls_json false)"
export STUB_RUNS=1
export STUB_VERDICT=failure
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_CALLS="$BOARD_TREE/вызовы"
evicted_json='[{"id":32701785738,"status":"completed","conclusion":"cancelled"}]'

# SC-AK-584 — вытесненный прогон на вершине заявки назван строкой сверки
export STUB_EVICTED="$evicted_json"
export STUB_JOBS=0
report "SC-AK-584 — вытесненный прогон отбит" "$(board_code)" 1
report "SC-AK-584 — назван номер прогона и вершина" "$(board_says 'the run 32701785738 on the tip 01234567 was pushed out of the pipeline queue')" 1
report "SC-AK-584 — сказано, что ветка не проверялась" "$(board_says 'the branch was not checked')" 1

# SC-AK-585 — строка называет чтение прогона раньше его перезапуска
report "SC-AK-585 — команды названы по порядку" "$(board_says 'gh run view 32701785738 && gh run rerun 32701785738')" 1

# SC-AK-586 — отменённый на ходу прогон строки не даёт: журнал у него есть
export STUB_JOBS=1
report "SC-AK-586 — отменённый с заданиями не отбит" "$(board_code)" 0

# SC-AK-587 — число заданий спрашивается только у отменённых прогонов вершины
export STUB_EVICTED='[{"id":32702491780,"status":"completed","conclusion":"success"}]'
export STUB_VERDICT=success
: > "$STUB_CALLS"
board_code > /dev/null
report "SC-AK-587 — о числе заданий успешного прогона не спрашивали" "$(grep -c '/jobs' "$STUB_CALLS")" 0

# SC-AK-588 — зелёный прогон на той же вершине снимает строку: вытесненный уже перезапущен
export STUB_EVICTED='[{"id":32702491780,"status":"completed","conclusion":"success"},{"id":32701785738,"status":"completed","conclusion":"cancelled"}]'
export STUB_JOBS=0
: > "$STUB_CALLS"
report "SC-AK-588 — зелёный рядом с вытесненным молчит" "$(board_code)" 0
report "SC-AK-588 — и число заданий не спрашивалось" "$(grep -c '/jobs' "$STUB_CALLS")" 0

# SC-AK-589 — вытеснение судится раньше отсутствия прогона: одна вершина — одна строка
export STUB_EVICTED="$evicted_json"
export STUB_RUNS=0
export STUB_VERDICT=failure
export STUB_HEAD_DATE="$(minutes_ago 600)"
report "SC-AK-589 — строка одна, и она о вытеснении" "$(board_says 'was pushed out of the pipeline queue')" 1
report "SC-AK-589 — об отсутствии прогона не сказано" "$(board_says 'there is no run')" 0

# SC-AK-590 — дерево без файла конвейера о вытеснении не судит
board_config "${BOARD_CONFIG/.github\/workflows\/ci.yml/.github\/workflows\/nope.yml}"
: > "$STUB_CALLS"
report "SC-AK-590 — конвейера нет: расхождений нет" "$(board_code)" 0
report "SC-AK-590 — прогоны не спрашивались вовсе" "$(grep -c 'actions/runs' "$STUB_CALLS")" 0

board_config "$BOARD_CONFIG"
export STUB_EVICTED='[]'
unset STUB_CALLS
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"

# --- SC-AK-531…532 — прод против главной ветки ------------------------------------------------
# Проверяется последняя успешная выкатка, а не последний прогон главной ветки: там, где выкатку
# запускают вручную, слияние прод не двигает.
export STUB_PULLS="$(pulls_json false)"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_DEPLOY='{"sha":"fedcba9876543210fedcba9876543210fedcba98","at":"2026-08-20T10:00:00Z"}'
DEPLOY_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"deploy":{"workflow":"deploy.yml","mainBranch":"main"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'

board_config "$DEPLOY_CONFIG"
export STUB_BEHIND=0
report "SC-AK-531 — сошедшийся прод расхождением не считается" "$(board_code)" 0

export STUB_BEHIND=476
report "SC-AK-531 — отставший прод отбит" "$(board_code)" 1
report "SC-AK-531 — названо число коммитов" "$(board_says 'production lags «main» by 476 commits')" 1
report "SC-AK-531 — назван коммит последней выкатки" "$(board_says 'the last rollout is fedcba98 of 2026-08-20')" 1

# Выкаток не было ни одной: сравнивать не с чем, и это тоже расхождение — прода нет вовсе.
export STUB_DEPLOY=''
report "SC-AK-531 — дерево без единой выкатки названо" "$(board_says 'not a single rollout by «deploy.yml»')" 1

# SC-AK-532 — поток выкатки не назван: сверка молчит вслух, а не тихо
board_config "$BOARD_CONFIG"
export STUB_BEHIND=476
report "SC-AK-532 — без названного потока прод не сверяется" "$(board_code)" 0
report "SC-AK-532 — и сказано, почему" "$(board_says 'the rollout workflow is not named in the tree config')" 1

# SC-AK-752 — отставание ветки открытой заявки от главной называется сверкой
# Гард судит основание один раз, в минуту открытия, а заявка стоит днями: влитого за это время
# не видит ни он, ни зелёный прогон на её вершине.
board_config "$BOARD_CONFIG"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_PULL_BEHIND=4
report "SC-AK-752 — отставание названо числом" "$(board_says 'lags «main» by 4 commits')" 1
report "SC-AK-752 — расхождением это считается" "$(board_code)" 1
export STUB_PULL_BEHIND=0
report "SC-AK-752 — ветка вровень с главной молчит" "$(board_says 'lags «main»')" 0
# Сравнить нечем — молчание: сверка без доступа отбивала бы работу вместо промаха.
export STUB_PULL_BEHIND=""
report "SC-AK-752 — пустой ответ судится как ноль" "$(board_says 'lags «main»')" 0
export STUB_PULL_BEHIND=0

rm -rf "$BOARD_TREE"

suite_result "сверка очереди работ"
