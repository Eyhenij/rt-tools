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
cp "$CHECKS/board-runs.github.mjs" "$BOARD_TREE/tools/board-runs.mjs"
cp "$CHECKS/board-paths.github.mjs" "$BOARD_TREE/tools/board-paths.mjs"
cp "$CHECKS/board-titles.github.mjs" "$BOARD_TREE/tools/board-titles.mjs"
cp "$CHECKS/board-epics.github.mjs" "$BOARD_TREE/tools/board-epics.mjs"
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
report "SC-AK-277 — сказано, что прогона нет" "$(board_says 'на вершине 01234567 прогона нет')" 1
report "SC-AK-277 — назван возраст вершины" "$(board_says 'лежит она 60 мин')" 1
report "SC-AK-277 — назван способ вернуть событие" "$(board_says 'gh pr close 701 && gh pr reopen 701')" 1

# SC-AK-278 — свежая вершина без прогона не судится
export STUB_HEAD_DATE="$(minutes_ago 2)"
report "SC-AK-278 — свежая вершина не судится" "$(board_code)" 0

# SC-AK-280 — дерево без файла конвейера прогонов не спрашивает
export STUB_HEAD_DATE="$(minutes_ago 600)"
board_config "${BOARD_CONFIG/.github\/workflows\/ci.yml/.github\/workflows\/nope.yml}"
report "SC-AK-280 — конвейера нет: расхождений нет" "$(board_code)" 0
report "SC-AK-280 — сказано, почему пропущено" "$(board_says 'файла конвейера в дереве нет')" 1

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
report "SC-AK-733 — совпавшие заголовки названы" "$(board_says '#700, #702 — заголовки сильно совпадают')" 1
# Отказом это не считается: строка стоит в сводке, а не среди расхождений.
report "SC-AK-733 — расхождением это не считается" "$(board_run | sed -n '/расхождений/,$p' | grep -c 'сильно совпадают')" 0

# Разные работы в сводку не идут: совпадения слов у них нет.
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Письма владельцу уходят молча","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]},{"number":702,"title":"[RT-702] Кнопка сохранения теряет фокус","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
report "SC-AK-733 — разные заголовки молчат" "$(board_says 'заголовки сильно совпадают')" 0

export STUB_ISSUES="$saved_issues"
export STUB_BOARD="$saved_board"

# --- SC-AK-751 — связь задачи с эпиком читается в обе стороны ---------------------------------
#
# Односторонняя привязка выглядит целой ровно так же, как двусторонняя: читатель приходит то от
# линии работ, то от карточки, и вторая сторона существует только для одного из них.
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
    "$(board_says '#702: замысел эпика #700 задачу называет')" 1
report "SC-AK-751 — названа строка, которой это чинится" "$(board_says 'Задача эпика #700, замысел — docs/plans/epic.md')" 1

# Обе стороны на месте — сверка молчит.
export STUB_ISSUES="$(epic_issues 'Задача эпика #700, замысел — docs/plans/epic.md')"
report "SC-AK-751 — двусторонняя привязка молчит" "$(board_says 'эпик')" 0

# Обратная сторона: тело эпик называет, а линия работ эпика этой задачи не знает.
printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' > "$BOARD_TREE/docs/plans/epic.md"
report "SC-AK-751 — тело называет эпик, а в замысле задачи нет" \
    "$(board_says '#702: тело называет эпик #700, а в его замысле задачи нет')" 1

# Карточка эпика без пути к замыслу — состав читать негде.
export STUB_ISSUES="$(printf '[{"number":700,"title":"[RT-700] Эпик","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"epic"}],"body":"Возможность без замысла"},{"number":702,"title":"[RT-702] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[],"body":"Повод"}]')"
report "SC-AK-751 — карточка без пути к замыслу названа" "$(board_says '#700: карточка эпика не называет путь к замыслу')" 1

# Путь есть, а файла нет: карточка ссылается в пустоту.
export STUB_ISSUES="$(epic_issues 'Повод')"
rm -f "$BOARD_TREE/docs/plans/epic.md"
report "SC-AK-751 — замысла нет на диске" "$(board_says 'нет на диске — карточка ссылается в пустоту')" 1

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
report "SC-AK-281 — сказано, что прогон зелёный, а PR черновик" "$(board_says 'прогон на вершине 01234567 зелёный, а PR черновик')" 1
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
report "SC-AK-425 — сказано, с чем конфликт" "$(board_says 'конфликтует с главной веткой')" 1

# SC-AK-426 — «ещё не посчитано» конфликтом не считается: хостинг считает сливаемость заново
# после каждой правки главной ветки, и строка краснела бы на каждой свежей вершине.
export STUB_PULLS="$(conflicting_json UNKNOWN)"
report "SC-AK-426 — неизвестная сливаемость расхождением не считается" "$(board_code)" 0
export STUB_PULLS="$(conflicting_json MERGEABLE)"
report "SC-AK-426 — сливаемая заявка молчит" "$(board_code)" 0

# SC-AK-670…672 — у конфликтующей заявки прогона не бывает вовсе, и причина не в потерянном
# событии: конвейер проверяет слияние ветки с базой, а слияния при конфликте нет. Совет вернуть
# событие выполняется буквально и не помогает — за один заход заявка перезакрывалась дважды
# подряд, и прогон встал только после вливания главной ветки.
export STUB_RUNS=0
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_PULLS="$(conflicting_json CONFLICTING)"
report "SC-AK-670 — причиной названа не потеря события, а конфликт" \
    "$(board_says 'прогона нет и не будет, пока она конфликтует')" 1
report "SC-AK-671 — совета перезакрыть заявку при конфликте нет" \
    "$(board_says 'gh pr close 701 && gh pr reopen 701')" 0

# Заявка без конфликта судится как прежде: там причина и вправду в событии.
export STUB_PULLS="$(conflicting_json MERGEABLE)"
report "SC-AK-672 — у сливаемой заявки строка о событии прежняя" \
    "$(board_says 'конвейер события не получил')" 1
export STUB_RUNS=1
export STUB_PULLS="$(pulls_json false)"

# --- SC-AK-584…590 — прогон, вытесненный из очереди конвейера --------------------------------
#
# Группа очереди бережёт идущий прогон и не бережёт ждущего: следующий встающий вытесняет
# прежний. Вытесненный завершается отменой и в списке неотличим от упавшего, хотя ветку не
# проверял ни строчкой — заданий у него ноль.

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
report "SC-AK-584 — назван номер прогона и вершина" "$(board_says 'прогон 32701785738 на вершине 01234567 вытеснен из очереди конвейера')" 1
report "SC-AK-584 — сказано, что ветка не проверялась" "$(board_says 'ветка не проверялась')" 1

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
report "SC-AK-589 — строка одна, и она о вытеснении" "$(board_says 'вытеснен из очереди конвейера')" 1
report "SC-AK-589 — об отсутствии прогона не сказано" "$(board_says 'прогона нет')" 0

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
#
# Судится последняя успешная выкатка, а не последний прогон главной ветки: там, где выкатку
# запускают рукой, слияние прода не двигает вовсе, и прогон о нём не говорит ничего.
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
report "SC-AK-531 — названо число коммитов" "$(board_says 'прод отстал от «main» на 476 коммитов')" 1
report "SC-AK-531 — назван коммит последней выкатки" "$(board_says 'последняя выкатка — fedcba98 от 2026-08-20')" 1

# Выкаток не было ни одной: сравнивать не с чем, и это тоже расхождение — прода нет вовсе.
export STUB_DEPLOY=''
report "SC-AK-531 — дерево без единой выкатки названо" "$(board_says 'выкаток по «deploy.yml» не было ни одной')" 1

# SC-AK-532 — поток выкатки не назван: сверка молчит вслух, а не тихо
board_config "$BOARD_CONFIG"
export STUB_BEHIND=476
report "SC-AK-532 — без названного потока прод не сверяется" "$(board_code)" 0
report "SC-AK-532 — и сказано, почему" "$(board_says 'рабочий поток выкатки в настройке дерева не назван')" 1

# SC-AK-752 — отставание ветки открытой заявки от главной называется сверкой
# Гард судит основание один раз, в минуту открытия, а заявка стоит днями: влитого за это время
# не видит ни он, ни зелёный прогон на её вершине.
board_config "$BOARD_CONFIG"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_PULL_BEHIND=4
report "SC-AK-752 — отставание названо числом" "$(board_says 'отстала от «main» на 4 коммитов')" 1
report "SC-AK-752 — расхождением это считается" "$(board_code)" 1
export STUB_PULL_BEHIND=0
report "SC-AK-752 — ветка вровень с главной молчит" "$(board_says 'отстала от «main»')" 0
# Сравнить нечем — молчание: сверка без доступа отбивала бы работу вместо промаха.
export STUB_PULL_BEHIND=""
report "SC-AK-752 — пустой ответ судится как ноль" "$(board_says 'отстала от «main»')" 0
export STUB_PULL_BEHIND=0


rm -rf "$BOARD_TREE"

# --- SC-AK-377…346 — состояние заявки: разбор у неё есть или нет ------------------------------
#
# Ревьювера не спрашивал никто: он жил прозой в паттерне о коммите и PR, а запрос разбора на
# самого себя хостинг принимает молча и не создаёт — разбор при этом выглядит запрошенным.
# Теперь его читает гард поставки на снятии черновика, и ответ ему собирает эта функция.
#
# Дерево своё, одноразовое: помощник ищет настройки от своего же каталога, и общий стенд соседних
# сценариев здесь означал бы, что набор проверяет их подстановки, а не разбор ответа хостинга.
pull_tree() {
    local dir
    dir="$(mktemp -d)"
    mkdir -p "$dir/tools" "$dir/.claude/rt-kit"
    cp "$CHECKS/rt-kit-checks.config.mjs" "$dir/tools/"
    cp "$CHECKS/board.github.mjs" "$dir/tools/board.mjs"
    printf '%s\n' '{"board":{"owner":"probe","repo":"tree","taskKey":"RT","tokenPath":""}}' \
        > "$dir/.claude/rt-kit/checks.json"
    # Помощник хостинга: отдаёт то, что положил сценарий, а с непустой жалобой — отказывает.
    # Заодно записывает свои доводы: ссылка на заявку необязательна, и то, что при её нехватке
    # клиент зовётся вовсе без довода, из одного ответа не видно.
    cat > "$dir/gh" <<'STUB'
#!/usr/bin/env bash
printf '%s' "$*" > "${STUB_ARGS:-/dev/null}"
if [ -n "$STUB_PULL_ERR" ]; then
    printf '%s\n' "$STUB_PULL_ERR" >&2
    exit 1
fi
printf '%s' "$STUB_PULL"
STUB
    chmod +x "$dir/gh"
    printf '%s' "$dir"
}

# Состояние заявки одной строкой JSON: дерево, ответ хостинга, жалоба вместо ответа, ссылка на
# заявку. Ссылка передаётся всегда, в том числе пустой строкой: профиль зовёт помощника именно
# так, и вызов без четвёртого довода проверял бы не ту форму.
pull_state() {
    (cd "$1" && GH_BIN="$1/gh" STUB_PULL="$2" STUB_PULL_ERR="$3" STUB_ARGS="$1/доводы" \
        node tools/board.mjs pr "${4-701}" 2>/dev/null)
}
# Чем позвали клиента хостинга в последний раз.
pull_args() {
    cat "$1/доводы" 2>/dev/null
}

PULL_TREE="$(pull_tree)"

# Разбором считается и запрошенный ревьювер, и уже оставленный отзыв: до слияния годится любой
# из двух, а запрошенный после отзыва из списка запросов пропадает.
BOTH_SIDES='{"number":701,"isDraft":true,"author":{"login":"probe-bot"},"reviewRequests":[{"login":"alice"}],"latestReviews":[{"author":{"login":"bob"}}]}'
report "SC-AK-377 — разбор есть" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.reviewed')" true
report "SC-AK-377 — запрошенный ревьювер в списке" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.reviewers | index("alice") != null')" true
report "SC-AK-377 — оставивший отзыв в том же списке" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.reviewers | index("bob") != null')" true
report "SC-AK-377 — заявка найдена" \
    "$(pull_state "$PULL_TREE" "$BOTH_SIDES" | jq -r '.exists')" true

# Отзыв самого автора разбором не считается: заявку, разобранную ею же написавшим, не разбирал
# никто, а снятый черновик читается как «можно вливать».
SELF_REVIEW='{"number":701,"isDraft":true,"author":{"login":"probe-bot"},"reviewRequests":[],"latestReviews":[{"author":{"login":"probe-bot"}}]}'
report "SC-AK-378 — отзыв автора разбором не считается" \
    "$(pull_state "$PULL_TREE" "$SELF_REVIEW" | jq -r '.reviewed')" false
# Сам он при этом из списка не исчезает: список говорит, кто трогал заявку, а приговор — отдельно.
report "SC-AK-378 — автор из списка не пропадает" \
    "$(pull_state "$PULL_TREE" "$SELF_REVIEW" | jq -r '.reviewers | index("probe-bot") != null')" true

# Заявки с таким номером нет — это ответ по существу, а не молчание.
report "SC-AK-378 — неизвестная заявка отвечает отсутствием" \
    "$(pull_state "$PULL_TREE" '' 'no pull requests found for branch' | jq -r '.exists')" false

# Сети нет, токена нет, клиента нет — спросить некого. Такой ответ не смеет читаться как «разбора
# нет»: по нему заявку без ревьювера не отличить от заявки, о которой не спросили.
report "SC-AK-379 — офлайн назван офлайном" \
    "$(pull_state "$PULL_TREE" '' 'dial tcp 140.82.121.5:443: connect: network is unreachable' | jq -r '.offline')" true
report "SC-AK-379 — и приговора о разборе в таком ответе нет" \
    "$(pull_state "$PULL_TREE" '' 'dial tcp 140.82.121.5:443: connect: network is unreachable' | jq -r 'has("reviewed")')" false
# Отказ входа сетевым тоже считается: проверить нечем, и работу это не отбивает.
report "SC-AK-379 — отказ входа считается офлайном" \
    "$(pull_state "$PULL_TREE" '' 'gh: Bad credentials (HTTP 401)' | jq -r '.offline')" true

# --- SC-AK-391…359 — заявка называется чем угодно, а то и не называется вовсе -----------------
#
# Ссылка на заявку необязательна: клиент хостинга без неё берёт заявку текущей ветки, и это
# самая короткая форма вызова. Пока помощник требовал номер, всё требование о разборе снималось
# одним пробелом — `gh pr ready` без довода проходил мимо гарда.
NUMBERED='{"number":701,"isDraft":true,"author":{"login":"probe-bot"},"reviewRequests":[],"latestReviews":[]}'

report "SC-AK-391 — без ссылки клиент зовётся вовсе без довода" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' '' >/dev/null; pull_args "$PULL_TREE")" \
    'pr view --json number,isDraft,reviewRequests,latestReviews,author,mergeable'
report "SC-AK-391 — и заявка при этом найдена" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' '' | jq -r '.exists')" true
# Номер приходит из ответа: заявку, названную не номером, в отказе гарда узнают по нему.
report "SC-AK-391 — номер берётся из ответа хостинга" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' '' | jq -r '.number')" 701

# Ссылка любого рода уходит клиенту как есть: разбирать адрес и имя ветки — его работа, не наша.
report "SC-AK-392 — имя ветки уходит клиенту доводом" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' 'RT-700-probe' >/dev/null; pull_args "$PULL_TREE")" \
    'pr view RT-700-probe --json number,isDraft,reviewRequests,latestReviews,author,mergeable'
report "SC-AK-392 — и адрес заявки тоже" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' 'https://example.invalid/o/r/pull/701' >/dev/null; pull_args "$PULL_TREE")" \
    'pr view https://example.invalid/o/r/pull/701 --json number,isDraft,reviewRequests,latestReviews,author,mergeable'
report "SC-AK-392 — по имени ветки заявка тоже находится" \
    "$(pull_state "$PULL_TREE" "$NUMBERED" '' 'RT-700-probe' | jq -r '.exists')" true

rm -rf "$PULL_TREE"


suite_result "сверка очереди работ"
