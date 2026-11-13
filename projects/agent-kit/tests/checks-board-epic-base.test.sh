#!/usr/bin/env bash
# Сценарии сверки очереди работ: база PR из стопки эпика и повтор номера в таблице эпика.
#
# Сеть не трогается: помощник хостинга подставляется через `GH_BIN` и отвечает тем, что положил
# сценарий. Иначе набор судил бы очередь того дерева, в котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: очередь работ, база стопки и таблица эпика"

. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"

export STUB_FILES='{"files":[]}'
export STUB_RUNS=1
export STUB_VERDICT=success
export STUB_HEAD_DATE="$(minutes_ago 60)"
export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[]}}}}'
board_config '{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"epicLabel":"epic","taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'

mkdir -p "$BOARD_TREE/docs/plans"
plan_rows() {
    printf '%s\n' '# Замысел эпика' '' '| № | Задача |' '| - | ------ |' "$@" > "$BOARD_TREE/docs/plans/epic.md"
}
plan_rows '| 1 | RT-701 |' '| 2 | RT-702 |'

export STUB_ISSUES='[{"number":700,"title":"[RT-700] Эпик","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"epic"}],"body":"Замысел — docs/plans/epic.md"},{"number":701,"title":"[RT-701] Нижняя","state":"OPEN","assignees":[{"login":"probe"}],"labels":[],"body":"Задача эпика #700, замысел — docs/plans/epic.md"},{"number":702,"title":"[RT-702] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[],"body":"Задача эпика #700, замысел — docs/plans/epic.md"}]'
epic_pull() {
    printf '[{"number":703,"title":"[RT-702] Задача","headRefName":"RT-702-probe","headRefOid":"%s","isDraft":true,"body":"Closes #702","baseRefName":"%s"}]' \
        "$HEAD_SHA" "$1"
}

# --- SC-AK-1203 — база из стопки того же эпика ---------------------------------------------
# Ветка нижней задачи того же эпика несёт ветку эпика, и такая база законна.
export STUB_PULLS="$(epic_pull RT-701-lower)"
report "SC-AK-1203 — база из нижней задачи того же эпика молчит" "$(board_says 'PR #703: the task #702 belongs to the epic #700')" 0
export STUB_PULLS="$(epic_pull RT-699-stray)"
report "SC-AK-1203 — база задачи вне эпика названа" "$(board_says 'PR #703: the task #702 belongs to the epic #700')" 1

# --- SC-AK-1206 — номер задачи дважды в таблице эпика ---------------------------------------
# Склейка обеих сторон конфликта задваивает строки, а связь читает номера множеством.
export STUB_PULLS='[]'
report "SC-AK-1206 — таблица без повтора молчит" "$(board_says 'rows of the makeup')" 0
plan_rows '| 1 | RT-701 |' '| 2 | RT-702 |' '| 2 | RT-702 |'
report "SC-AK-1206 — повтор номера назван" "$(board_says '#700: the plan names the task #702 in 2 rows of the makeup')" 1

# --- SC-AK-1342 — отставание заявки задачи считается от её базы ------------------------------
# База задачи — ветка эпика; отставание эпика от main — его собственное, не задачи.
plan_rows '| 1 | RT-701 |' '| 2 | RT-702 |'
task_pull() {
    printf '[{"number":703,"title":"[RT-702] Задача","headRefName":"RT-702-probe","headRefOid":"%s","isDraft":false,"body":"Closes #702","baseRefName":"RT-700-epic","mergeable":"%s"}]' \
        "$HEAD_SHA" "$1"
}
export STUB_PULLS="$(task_pull MERGEABLE)"
export STUB_PULL_BEHIND=3
report "SC-AK-1342 — названа база задачи и число" "$(board_says 'lags «RT-700-epic» by 3 commits')" 1
report "SC-AK-1342 — отставание стоит в итоговой строке" "$(board_says '^check-board: open PRs behind.*PR #703 lags')" 1
report "SC-AK-1342 — строкой расхождения отставание не названо" "$(board_run | grep 'lags' | grep -vc '^check-board:')" 0
report "SC-AK-1342 — отставание от main на задачу не легло" "$(board_says 'lags «main»')" 0
report "SC-AK-1342 — влить базу строка не велит" "$(board_says 'Merge «RT-700-epic» in')" 0
# Конфликтующую заявку называет строка о конфликте, в счёт отставших она не идёт.
export STUB_PULLS="$(task_pull CONFLICTING)"
report "SC-AK-1342 — конфликтующая заявка в отставшие не попадает" "$(board_says 'lags «RT-700-epic»')" 0
report "SC-AK-1342 — у неё своя строка о конфликте" "$(board_says 'PR #703: it conflicts with its base «RT-700-epic»')" 1
export STUB_PULL_BEHIND=0

# --- SC-AK-1344 — открытая заявка без ревьюера называется аудитом ----------------------------
# Правило обещало эту строку, а аудит её не печатал: заявка без ревьюера ни к кому не приходит.
export STUB_PULLS="$(task_pull MERGEABLE | sed 's/"mergeable"/"author":{"login":"rt-bot"},"mergeable"/')"
export STUB_ASKED='[]' STUB_LEFT='[]'
report "SC-AK-1344 — заявка без ревьюера названа" "$(board_says 'PR #703: the PR has no reviewer')" 1
report "SC-AK-1344 — заявка без ревьюера — расхождение" "$(board_code)" 1
export STUB_ASKED='[{"login":"review-helper","type":"Bot"}]' STUB_LEFT='[{"login":"checks[bot]","type":"User"},{"login":"copilot-pull-request-reviewer","type":"Bot"}]'
report "SC-AK-1344 — бот ревьюером не считается" "$(board_says 'PR #703: the PR has no reviewer')" 1
export STUB_ASKED='[{"login":"owner","type":"User"}]' STUB_LEFT='[]'
report "SC-AK-1344 — запрошенный ревьюер строку снимает" "$(board_says 'has no reviewer')" 0
export STUB_ASKED='[]' STUB_LEFT='[{"login":"owner","type":"User"}]'
report "SC-AK-1344 — оставленное ревью строку снимает" "$(board_says 'has no reviewer')" 0
export STUB_ASKED='[{"login":"rt-bot","type":"User"}]' STUB_LEFT='[{"login":"rt-bot","type":"User"}]'
report "SC-AK-1344 — запрос ревью у самого автора ревьюером не считается" "$(board_says 'PR #703: the PR has no reviewer')" 1
# Токен без нужных прав: хостинг отказывает в списке ревьюеров. Аудит обязан идти дальше.
unset STUB_ASKED STUB_LEFT
report "SC-AK-1344 — отказ хостинга в ревьюерах не судится" "$(board_says 'has no reviewer')" 0
report "SC-AK-1344 — после отказа хостинга аудит печатает свои строки" "$(board_run | grep -q '^check-board:' && printf 1 || printf 0)" 1
export STUB_PULL_BEHIND=0

# --- SC-AK-1338 — конфликтующая заявка в ветку эпика: строки о прогоне нет ------------------
# Конвейер на эту базу не просыпается вовсе, и «прогона не будет, пока конфликт» обещала бы
# прогон, которого не будет и после конфликта.
export STUB_RUNS=0
export STUB_PULLS="$(task_pull CONFLICTING)"
report "SC-AK-1338 — конфликт с базой эпика назван" "$(board_says 'conflicts with its base «RT-700-epic»')" 1
report "SC-AK-1338 — строки о прогоне при конфликте нет" "$(board_says 'there will be none while it conflicts')" 0
export STUB_RUNS=1

rm -rf "$BOARD_TREE"

suite_result "очередь работ, база стопки и таблица эпика"
