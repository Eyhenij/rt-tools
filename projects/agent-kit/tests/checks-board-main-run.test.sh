#!/usr/bin/env bash
# Сценарии сверки очереди работ: последний прогон главной ветки.
#
# Отделено от остальных сценариев очереди работ потому, что вместе с ними это переросло предел
# длины файла. Двойник хостинга — общий, из lib-board.sh: прогон главной ветки он отдаёт по имени
# файла конвейера, выкатку — по имени потока выкатки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: прогон главной ветки в сверке очереди работ"

. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"

export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"In review","optionId":"r"},"content":{"__typename":"Issue","number":700}}]}}}}'
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
pulls_json() {
    printf '[{"number":701,"title":"[RT-700] Правка","headRefName":"RT-700-probe","headRefOid":"%s","isDraft":%s,"body":"Closes #700"}]' "$HEAD_SHA" "$1"
}
export STUB_FILES='{"files":[]}'
export STUB_EVICTED='[]'
export STUB_BEHIND=0
export STUB_SUB_ISSUES='[]'

BOARD_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'

# --- SC-AK-1104 — последний прогон главной ветки -------------------------------------------
# Заявка проверяется до слияния, а само слияние никто не смотрит: красный прогон главной ветки
# стоял полтора дня без единой строки о нём, а вытесненный из очереди выглядел как прошедший.
board_config "$BOARD_CONFIG"
export STUB_PULLS="$(pulls_json false)"
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_MAIN_RUN='{"id":7,"status":"completed","conclusion":"failure","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/7"}'

# Конвейер дерева на push в главную не встаёт: прогона нет, и сверка говорит об этом вслух.
report "SC-AK-1104 — конвейер без push: расхождений нет" "$(board_code)" 0
report "SC-AK-1104 — и сказано, что прогон главной не проверялся" "$(board_says 'the pipeline does not wake on a push to «main»')" 1

printf '%s\n' 'on:' '    push:' '        branches:' '            - main' '    pull_request:' \
    'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"
report "SC-AK-1104 — красный прогон главной отбит" "$(board_code)" 1
report "SC-AK-1104 — назван коммит и день" "$(board_says 'the last run of «main» is red on abcdef01 of 2026-09-10')" 1
report "SC-AK-1104 — названо следствие и адрес" "$(board_says 'merges on top go out unchecked — https://probe/runs/7')" 1

# Отменённый без единого шага — вытеснен очередью: слияние не проверялось вовсе.
export STUB_MAIN_RUN='{"id":8,"status":"completed","conclusion":"cancelled","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/8"}'
export STUB_JOBS=0
report "SC-AK-1104 — вытесненный прогон отбит" "$(board_code)" 1
report "SC-AK-1104 — назван как вытесненный" "$(board_says 'was pushed out of the queue and never checked the merge — https://probe/runs/8')" 1

# Отменённый с шагами — не вытеснен, а остановлен: судится как красный.
export STUB_JOBS=3
report "SC-AK-1104 — отменённый с шагами судится как красный" "$(board_says 'the last run of «main» is red')" 1
unset STUB_JOBS

export STUB_MAIN_RUN='{"id":9,"status":"completed","conclusion":"success","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/9"}'
report "SC-AK-1104 — зелёный прогон главной — тишина" "$(board_code)" 0

export STUB_MAIN_RUN='{"id":10,"status":"in_progress","conclusion":null,"sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-09-10T08:00:00Z","url":"https://probe/runs/10"}'
report "SC-AK-1104 — идущий прогон главной — тишина" "$(board_code)" 0

# Прогона на главной не было ни одного — тоже тишина: конвейер встаёт, но ещё не вставал.
export STUB_MAIN_RUN=''
report "SC-AK-1104 — без единого прогона расхождений нет" "$(board_code)" 0
report "SC-AK-1104 — и строки о непроверенном нет" "$(board_says 'the main branch run was not checked')" 0

printf '%s\n' 'on: pull_request' 'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"
unset STUB_MAIN_RUN

rm -rf "$BOARD_TREE"

suite_result "прогон главной ветки в сверке очереди работ"
