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
cp "$CHECKS/check-board.github.mjs" "$BOARD_TREE/tools/check-board.mjs"
printf '%s\n' 'on: pull_request' 'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"

HEAD_SHA='0123456789abcdef0123456789abcdef01234567'

# Помощник хостинга: отвечает по роду вызова, а числа и даты берёт из окружения сценария.
cat > "$BOARD_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
case "$args" in
    *graphql*) printf '%s' "$STUB_BOARD" ;;
    "issue list"*) printf '%s' "$STUB_ISSUES" ;;
    "pr list"*) printf '%s' "$STUB_PULLS" ;;
    *contents*) printf 'Not Found\n' >&2; exit 1 ;;
    *actions/runs*per_page=20*) printf '%s\n' "$STUB_VERDICT" ;;
    *actions/runs*) printf '%s\n' "$STUB_RUNS" ;;
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

rm -rf "$BOARD_TREE"

suite_result "сверка очереди работ"
