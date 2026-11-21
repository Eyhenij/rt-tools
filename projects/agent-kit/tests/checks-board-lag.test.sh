#!/usr/bin/env bash
# Сценарии сверки очереди работ: отставание от главной ветки — прода по последней выкатке и ветки
# открытой заявки.
#
# Отдельный файл от сценариев очереди: вместе они переросли предел длины файла. Стенд общий,
# `lib-board.sh`. Отказ хостинга сравнить прод с главной веткой — SC-AK-1796 — остаётся в
# `checks-board.test.sh`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: сверка очереди работ — отставание от главной ветки"

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
report "SC-AK-752 — расхождением это не считается" "$(board_code)" 0
report "SC-AK-752 — вливать базу строка не велит" "$(board_says 'Merge «main» in')" 0
report "SC-AK-752 — сказано, что делать нечего" "$(board_says 'nothing to do, the host merges such a branch itself')" 1
export STUB_PULL_BEHIND=0
report "SC-AK-752 — ветка вровень с главной молчит" "$(board_says 'lags «main»')" 0
# Сравнить нечем — молчание: сверка без доступа отбивала бы работу вместо промаха.
export STUB_PULL_BEHIND=""
report "SC-AK-752 — пустой ответ судится как ноль" "$(board_says 'lags «main»')" 0
export STUB_PULL_BEHIND=0

rm -rf "$BOARD_TREE"

suite_result "сверка очереди работ — отставание от главной ветки"
