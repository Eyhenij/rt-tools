#!/usr/bin/env bash
# Сценарии сверки очереди работ: прод против главной ветки — отставание последней выкатки, отказ
# хостинга сравнить и упавшая выкатка.
#
# Отдельный файл от сценариев очереди: вместе они переросли предел длины файла, а у прода свой
# предмет — поток выкатки и её отставание. Стенд общий, `lib-board.sh`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: сверка очереди работ — прод против главной ветки"

. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"

export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"In review","optionId":"r"},"content":{"__typename":"Issue","number":700}}]}}}}'
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
pulls_json() {
    printf '[{"number":701,"title":"[RT-700] Правка","headRefName":"RT-700-probe","headRefOid":"%s","isDraft":%s,"body":"Closes #700"}]' "$HEAD_SHA" "$1"
}
export STUB_FILES='{"files":[]}'
export STUB_EVICTED='[]'
BOARD_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'
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

# Фильтр прогонов по статусу хостинг считает по отстающему указателю: один и тот же запрос за
# минуту отдавал то месячный прогон, то вчерашний. Запрос идёт без него, по последним прогонам.
export STUB_CALLS="$BOARD_TREE/calls.log"
: > "$STUB_CALLS"
board_code > /dev/null
report "SC-AK-1213 — последняя выкатка спрашивается без отбора по статусу" "$(grep -c 'workflows/deploy.yml/runs?status=' "$STUB_CALLS")" 0
report "SC-AK-1213 — берутся двадцать последних прогонов" "$(grep -c 'workflows/deploy.yml/runs?per_page=20' "$STUB_CALLS")" 1
unset STUB_CALLS

# --- SC-AK-1796 — сравнение, которое хостинг не смог построить, — заметка ----------------------
# GraphQL-сравнение отказывает по времени словами «result of a timeout»: аудит печатает заметку с
# коммитом и днём выкатки и идёт дальше. Пропавший коммит, другой 422, сбой 500 и отказ другого
# запроса ломают аудит одной строкой — без стека, и уже насчитанное печатается.
export RT_GH_RETRY_MS=1
export STUB_COMPARE=timeout
report "SC-AK-1796 — заметка названа с коммитом и днём выкатки" \
    "$(board_says 'production was not compared with «main» — the last rollout is fedcba98 of 2026-08-20')" 1
report "SC-AK-1796 — заметка несёт слова хостинга" "$(board_says 'the host answered: .*result of a timeout')" 1
# Последняя выкатка спрошена и прошла: счёт без расхождений и код 0 — после заметки.
export STUB_DEPLOY_LAST='{"status":"completed","conclusion":"success","sha":"fedcba9876543210fedcba9876543210fedcba98","at":"2026-08-20T10:00:00Z","url":"https://host/run/8"}'
export STUB_CALLS="$BOARD_TREE/calls.log"
: > "$STUB_CALLS"
report "SC-AK-1796 — строки после заметки: выкатка спрошена, счёт без расхождений, код 0" \
    "$(board_says 'no divergences'):$(board_code):$(grep -c 'deploy.yml/runs?per_page=1 ' "$STUB_CALLS")" '1:0:2'
unset STUB_CALLS
FAILED_ROLLOUT='{"status":"completed","conclusion":"failure","sha":"abcdef0123456789abcdef0123456789abcdef01","at":"2026-08-21T10:00:00Z","url":"https://host/run/9"}'
export STUB_DEPLOY_LAST="$FAILED_ROLLOUT"
report "SC-AK-1796 — строки после заметки: упавшая выкатка названа" \
    "$(board_says 'the rollout «deploy.yml» failed on abcdef01 of 2026-08-21')" 1
# Те же первые слова хостинг говорит о пропавшем коммите: это не «не успел», и аудит ломается.
export STUB_COMPARE=gone
report "SC-AK-1796 — другой отказ: пропавший коммит ломает аудит, а не даёт заметку" \
    "$(board_says 'production was not compared'):$(board_says 'the host failed — .*Something went wrong'):$(board_code)" '0:1:1'
# Сбой ломает аудит одной строкой, без стека; упавшая выкатка и счёт расхождений всё равно названы.
export STUB_COMPARE=500
report "SC-AK-1796 — другой отказ: сбой 500 сравнения ломает аудит одной строкой, без стека" \
    "$(board_says 'production was not compared'):$(board_says '^check-board: production was not checked, the host failed — gh: Server Error \(HTTP 500\)'):$(board_says '^    at '):$(board_code)" '0:1:0:1'
report "SC-AK-1796 — другой отказ: после сбоя 500 упавшая выкатка и счёт расхождений напечатаны" \
    "$(board_says 'the rollout «deploy.yml» failed on abcdef01'):$(board_says 'divergences 1')" '1:1'
unset STUB_DEPLOY_LAST
report "SC-AK-1796 — другой отказ: после сбоя 500 строка «no divergences» не печатается" \
    "$(board_says 'no divergences')" 0
export STUB_COMPARE=422
report "SC-AK-1796 — другой отказ: слова REST-сравнения ломают аудит" \
    "$(board_says 'production was not compared'):$(board_code)" '0:1'
export STUB_COMPARE=422-other
report "SC-AK-1796 — другой отказ: 422 без слов «не успел» ломает аудит" \
    "$(board_says 'production was not compared'):$(board_code)" '0:1'
export STUB_COMPARE=timeout STUB_DEPLOY_LAST=500
report "SC-AK-1796 — другой отказ: сбой запроса последней выкатки ломает аудит" \
    "$(board_says 'production was not compared with'):$(board_says 'the host failed — gh: Server Error \(HTTP 500\)'):$(board_code)" '1:1:1'
# Нет сети — заметка одна, а не по строке на каждый запрос о проде.
export STUB_COMPARE=offline STUB_DEPLOY_LAST=offline
report "SC-AK-1796 — нет сети: заметка о проде одна" "$(board_says 'production was not checked — ')" 1
unset STUB_DEPLOY_LAST
unset RT_GH_RETRY_MS STUB_COMPARE

# Выкаток не было ни одной: сравнивать не с чем, и это тоже расхождение — прода нет вовсе.
export STUB_DEPLOY=''
report "SC-AK-531 — дерево без единой выкатки названо" "$(board_says 'not a single rollout by «deploy.yml»')" 1

# SC-AK-532 — поток выкатки не назван: сверка молчит вслух, а не тихо
board_config "$BOARD_CONFIG"
export STUB_BEHIND=476
report "SC-AK-532 — без названного потока прод не сверяется" "$(board_code)" 0
report "SC-AK-532 — и сказано, почему" "$(board_says 'the rollout workflow is not named in the tree config')" 1

rm -rf "$BOARD_TREE"

suite_result "сверка очереди работ — прод против главной ветки"
