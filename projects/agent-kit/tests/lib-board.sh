#!/usr/bin/env bash
# Стенд сверки очереди работ: дерево-фикстура, двойник помощника хостинга и вызовы сверки.
#
# Общий на два набора: сценарии очереди и сценарии эпиков читаются порознь, а стенд у них один —
# второй такой же был бы копией, и разошлись бы они молча. Подключается через
# `. "$(dirname "${BASH_SOURCE[0]}")/lib-board.sh"` после `lib.sh`.

BOARD_TREE="$(mktemp -d)"
mkdir -p "$BOARD_TREE/tools" "$BOARD_TREE/.claude/rt-kit" "$BOARD_TREE/docs/tasks" "$BOARD_TREE/.github/workflows"
cp "$CHECKS/rt-kit-checks.config.mjs" "$BOARD_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$BOARD_TREE/tools/board.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$BOARD_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-epic-plan.github.mjs" "$BOARD_TREE/tools/board-epic-plan.mjs"
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
    *sub_issues*) printf '%s\n' "${STUB_SUB_ISSUES:-[]}" ;;
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

