#!/usr/bin/env bash
# Сценарии сверки очереди работ: открытая задача в закрывающей колонке.
#
# Отделено от остальных сценариев очереди работ потому, что вместе с ними это переросло предел
# длины файла. Стенд общий — `lib-board.sh`: свой был бы копией и разошёлся бы с ним молча.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: закрывающие колонки очереди работ"

. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"

# --- SC-AK-1112 — открытая задача в закрывающей колонке названа -------------------------------
# В закрывающую колонку карточку переносит правило доски о закрытой задаче. Открытая задача там
# говорит владельцу обратное тому, что он читает по колонке, и до сих пор об этом не говорил
# никто: перенос в последнюю колонку такую карточку молча пропускает, а закрытие задачи, влитой
# в ветку эпика, держит конвейер — его у дерева может не быть, он может появиться позже правок и
# может упасть. Семь таких задач простояли в «Done» двое суток.
PLAIN_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'
CLOSING_CONFIG='{"tasksDir":"docs/tasks","pushGate":{"pipelineFile":".github/workflows/ci.yml"},"board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"},"done":{"id":"d","name":"Done"},"deployed":{"id":"p","name":"Deployed"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'
board_config "$CLOSING_CONFIG"
export STUB_PULLS='[]'
export STUB_FILES='{"files":[]}'
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'

board_item_status() {
    printf '{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"%s","optionId":"%s"},"content":{"__typename":"Issue","number":700}}]}}}}' "$1" "$2"
}

export STUB_BOARD="$(board_item_status Done d)"
report "SC-AK-1112 — открытая задача в «Done» названа" \
    "$(board_says '#700: the task is open, and its card stands at «Done»')" 1
report "SC-AK-1112 — расхождением это считается" "$(board_code)" 1

export STUB_BOARD="$(board_item_status Deployed p)"
report "SC-AK-1112 — последняя колонка судится так же" \
    "$(board_says '#700: the task is open, and its card stands at «Deployed»')" 1

# Рабочая колонка молчит: там открытой задаче и место.
export STUB_BOARD="$(board_item_status 'In review' r)"
report "SC-AK-1112 — рабочая колонка молчит" "$(board_says 'card stands at «')" 0

# Дерево, не назвавшее закрывающих колонок, такого разбора не получает вовсе.
board_config "$PLAIN_CONFIG"
export STUB_BOARD="$(board_item_status Done d)"
report "SC-AK-1112 — без названных колонок сверка молчит" "$(board_says 'card stands at «Done»')" 0

rm -rf "$BOARD_TREE"

suite_result "закрывающие колонки очереди работ"
