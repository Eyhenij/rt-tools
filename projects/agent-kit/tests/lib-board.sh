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
cp "$CHECKS/main-run.github.mjs" "$BOARD_TREE/tools/main-run.mjs"
printf '%s\n' 'on: pull_request' 'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BOARD_TREE/.github/workflows/ci.yml"

HEAD_SHA='0123456789abcdef0123456789abcdef01234567'

# Помощник хостинга: отвечает по роду вызова, а числа и даты берёт из окружения сценария.
cat > "$BOARD_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
printf '%s\n' "$args" >> "${STUB_CALLS:-/dev/null}"
case "$args" in
    # Отставание прода спрашивается GraphQL-сравнением, и стоит оно раньше доски: доска — тоже
    # GraphQL. STUB_COMPARE задаёт отказ хостинга: timeout — «не успел», gone — те же первые
    # слова, которыми хостинг отвечает на пропавший коммит (замер 21.11), 422 — слова REST-сравнения,
    # 422-other — другой отказ с тем же кодом, offline — нет сети, 500 — сбой.
    *graphql*behindBy*)
        case "${STUB_COMPARE:-}" in
            timeout) printf '%s\n' 'gh: Something went wrong while executing your query. This may be the result of a timeout, or it could be a GitHub bug. Please include `F80D:1` when reporting this issue.' >&2; exit 1 ;;
            gone) printf '%s\n' 'gh: Something went wrong while executing your query on 2026-11-21T01:07:25Z. Please include `F80D:1` when reporting this issue.' >&2; exit 1 ;;
            422) printf '%s\n' 'gh: Server Error: Sorry, this diff is taking too long to generate. (HTTP 422)' >&2; exit 1 ;;
            422-other) printf '%s\n' 'gh: Validation Failed (HTTP 422)' >&2; exit 1 ;;
            offline) printf '%s\n' 'dial tcp: lookup api.github.com: no such host' >&2; exit 1 ;;
            500) printf '%s\n' 'gh: Server Error (HTTP 500)' >&2; exit 1 ;;
            *) printf '%s\n' "$STUB_BEHIND" ;;
        esac
        ;;
    *graphql*) printf '%s' "$STUB_BOARD" ;;
    "issue list"*) printf '%s' "$STUB_ISSUES" ;;
    "pr list"*) printf '%s' "$STUB_PULLS" ;;
    "pr view"*files*) printf '%s' "${STUB_FILES}" ;;
    # Ревьюеры читаются отдельным вызовом. Сценарий, который их не задал, получает отказ хостинга:
    # так отвечает токен без нужных прав, и аудит обязан пройти мимо, а не упасть.
    *requested_reviewers*) [ -n "${STUB_ASKED+x}" ] || exit 1; printf '%s\n' "$STUB_ASKED" ;;
    */pulls/*/reviews*) printf '%s\n' "${STUB_LEFT:-[]}" ;;
    # Хостинг отдаёт подзадачи страницами, и вызов без пролистывания получает только первую.
    # Помощник различает их поэтому: с одним списком на оба вида вызова сценарий был бы зелёным
    # и на коде, который читает одну страницу из двух. Признак ищется по всей строке вызова: он
    # стоит перед путём, а не после него.
    *sub_issues*)
        case "$args" in
            *--paginate*) printf '%s\n' "${STUB_SUB_ISSUES:-[]}" ;;
            *) printf '%s\n' "${STUB_SUB_ISSUES_PAGE:-${STUB_SUB_ISSUES:-[]}}" ;;
        esac
        ;;
    *contents*) printf 'Not Found\n' >&2; exit 1 ;;
    # Последний прогон главной ветки и последняя выкатка спрашиваются одним видом вызова: их
    # различает имя потока — прогон идёт у файла конвейера, выкатка у потока выкатки.
    *workflows/ci.yml/runs*) printf '%s\n' "${STUB_MAIN_RUN:-}" ;;
    # Состояние последней выкатки спрашивается страницей из одного прогона; сценарий, которому оно
    # нужно отдельно от отставания, задаёт STUB_DEPLOY_LAST.
    *actions/workflows/*per_page=1\ *)
        [ "${STUB_DEPLOY_LAST:-}" = 500 ] && { printf '%s\n' 'gh: Server Error (HTTP 500)' >&2; exit 1; }
        [ "${STUB_DEPLOY_LAST:-}" = offline ] && { printf '%s\n' 'dial tcp: lookup api.github.com: no such host' >&2; exit 1; }
        printf '%s\n' "${STUB_DEPLOY_LAST:-$STUB_DEPLOY}"
        ;;
    *actions/workflows/*runs*) printf '%s\n' "$STUB_DEPLOY" ;;
    *actions/runs/*/jobs*) printf '%s\n' "${STUB_JOBS:-0}" ;;
    *actions/runs*tojson*) printf '%s\n' "${STUB_EVICTED:-[]}" ;;
    *actions/runs*per_page=20*) printf '%s\n' "$STUB_VERDICT" ;;
    *actions/runs*) printf '%s\n' "$STUB_RUNS" ;;
    # Отставание ветки заявки спрашивается REST-сравнением; отставание прода сюда больше не ходит.
    *compare/*behind_by*) printf '%s\n' "${STUB_PULL_BEHIND:-0}" ;;
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

# The helper of the hosting that answers from the recorded answers of the real host, not from the
# scenario: `real-data/replay-gh.mjs` over `fixtures/real-host`. It answers by the arguments and by
# the kind of the token, the way the host does. Prints the path to put into `GH_BIN`.
board_replay_bin() {
    local dir="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fixtures/real-host}"
    local here
    here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    printf '#!/usr/bin/env bash\nREPLAY_DIR=%q exec node %q "$@"\n' "$dir" "$here/real-data/replay-gh.mjs" > "$BOARD_TREE/gh-replay"
    chmod +x "$BOARD_TREE/gh-replay"
    printf '%s' "$BOARD_TREE/gh-replay"
}

