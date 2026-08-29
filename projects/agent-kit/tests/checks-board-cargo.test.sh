#!/usr/bin/env bash
# Сценарии сверки очереди работ: груз, заведённый в очередь прежним порядком, задачей не судится.
#
# Отделено от остальных сценариев очереди работ потому, что вместе с ними это переросло предел
# длины файла. Двойник хостинга здесь свой и отвечает только тем, что нужно этим сценариям:
# списком задач, бордой и пустым списком заявок.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: груз в очереди работ"

CARGO_TREE="$(mktemp -d)"
mkdir -p "$CARGO_TREE/tools" "$CARGO_TREE/.claude/rt-kit" "$CARGO_TREE/docs/tasks"
for f in rt-kit-checks.config.mjs; do cp "$CHECKS/$f" "$CARGO_TREE/tools/"; done
cp "$CHECKS/board.github.mjs" "$CARGO_TREE/tools/board.mjs"
cp "$CHECKS/board-gh.github.mjs" "$CARGO_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-runs.github.mjs" "$CARGO_TREE/tools/board-runs.mjs"
cp "$CHECKS/board-paths.github.mjs" "$CARGO_TREE/tools/board-paths.mjs"
cp "$CHECKS/board-titles.github.mjs" "$CARGO_TREE/tools/board-titles.mjs"
cp "$CHECKS/board-epics.github.mjs" "$CARGO_TREE/tools/board-epics.mjs"
cp "$CHECKS/check-board.github.mjs" "$CARGO_TREE/tools/check-board.mjs"

# Двойник хостинга: списки приходят из окружения сценария, всё прочее отвечает пустотой.
# Конвейера у дерева нет намеренно — прогоны на вершинах здесь не предмет.
cat > "$CARGO_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
case "$args" in
    *graphql*) printf '%s' "$STUB_BOARD" ;;
    "issue list"*) printf '%s' "$STUB_ISSUES" ;;
    "pr list"*) printf '%s' '[]' ;;
    *compare/*) printf '0\n' ;;
    *) printf '\n' ;;
esac
STUB
chmod +x "$CARGO_TREE/gh"

cargo_config() {
    printf '%s\n' "$1" > "$CARGO_TREE/.claude/rt-kit/checks.json"
}
cargo_run() {
    (cd "$CARGO_TREE" && GH_BIN="$CARGO_TREE/gh" node tools/check-board.mjs 2>&1)
}
cargo_code() {
    (cd "$CARGO_TREE" && GH_BIN="$CARGO_TREE/gh" node tools/check-board.mjs > /dev/null 2>&1)
    printf '%s' "$?"
}
cargo_says() {
    cargo_run | grep -cE "$1"
}

export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[{"id":"item-1","status":{"name":"In progress","optionId":"p"},"content":{"__typename":"Issue","number":700}}]}}}}'
PLAIN='{"tasksDir":"docs/tasks","board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}}'
LABELLED="${PLAIN/\"taskKey\":\"RT\"/\"cargoLabels\":[\"agent-kit-feedback\"],\"taskKey\":\"RT\"}"

# Задача и запись груза рядом: у груза нет ни номера в заголовке, ни исполнителя, ни места на
# борде — ровно то, за что сверка печатала на него три строки.
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]},{"number":837,"title":"предложение: гард ожидания","state":"OPEN","assignees":[],"labels":[{"name":"agent-kit-feedback"}]}]'

# SC-AK-794 — дерево метки не назвало: судится как прежде
cargo_config "$PLAIN"
report "SC-AK-794 — без названной метки груз судится задачей" "$(cargo_says '#837: задачи нет на борде')" 1
report "SC-AK-794 — и заголовком тоже" "$(cargo_says '#837: заголовок не начинается')" 1
report "SC-AK-794 — и исполнителем" "$(cargo_says '#837: у задачи нет исполнителя')" 1

# SC-AK-795 — метка названа: ни одной строки о записи груза
cargo_config "$LABELLED"
report "SC-AK-795 — помеченная запись не судится вовсе" "$(cargo_says '#837')" 0
report "SC-AK-795 — расхождений не осталось" "$(cargo_code)" 0

# SC-AK-795 — отсев берёт метку, а не всё подряд: соседняя задача судится как прежде
export STUB_ISSUES='[{"number":700,"title":"Задача без номера","state":"OPEN","assignees":[],"labels":[]},{"number":837,"title":"предложение: гард ожидания","state":"OPEN","assignees":[],"labels":[{"name":"agent-kit-feedback"}]}]'
report "SC-AK-795 — задача без метки судится как прежде" "$(cargo_says '#700: заголовок не начинается')" 1
report "SC-AK-795 — и о грузе по-прежнему молчок" "$(cargo_says '#837')" 0

# SC-AK-796 — отсеянное названо числом
report "SC-AK-796 — число отсеянных записей названо" "$(cargo_says 'записей груза в очереди 1')" 1

# SC-AK-796 — отсеивать нечего: строки нет вовсе
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
report "SC-AK-796 — без груза строки о нём нет" "$(cargo_says 'записей груза в очереди')" 0

rm -rf "$CARGO_TREE"

suite_result "груз в очереди работ"
