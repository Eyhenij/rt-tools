#!/usr/bin/env bash
# Сценарии сверки очереди работ: многозаходная работа и упавшая выкатка.
#
# Сеть не трогается: помощник хостинга подставляется через `GH_BIN` и отвечает тем, что положил
# сценарий. Иначе набор судил бы очередь того дерева, в котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: очередь работ, долгая работа и выкатка"

LW_TREE="$(mktemp -d)"
mkdir -p "$LW_TREE/tools" "$LW_TREE/.claude/rt-kit" "$LW_TREE/docs/tasks" "$LW_TREE/docs/plans"
cp "$CHECKS/rt-kit-checks.config.mjs" "$LW_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$LW_TREE/tools/board.mjs"
cp "$CHECKS/board-gh.github.mjs" "$LW_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-runs.github.mjs" "$LW_TREE/tools/board-runs.mjs"
cp "$CHECKS/board-paths.github.mjs" "$LW_TREE/tools/board-paths.mjs"
cp "$CHECKS/board-titles.github.mjs" "$LW_TREE/tools/board-titles.mjs"
cp "$CHECKS/board-epics.github.mjs" "$LW_TREE/tools/board-epics.mjs"
cp "$CHECKS/board-long-work.github.mjs" "$LW_TREE/tools/board-long-work.mjs"
cp "$CHECKS/check-board.github.mjs" "$LW_TREE/tools/check-board.mjs"

# Выкатка и её отставание спрашиваются одним видом вызова и отвечают на разное: отставание идёт
# с отбором по успеху, вердикт последней — без него.
cat > "$LW_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
case "$args" in
    *graphql*) printf '%s' "$STUB_BOARD" ;;
    "issue list"*) printf '%s' "$STUB_ISSUES" ;;
    "pr list"*) printf '%s' "$STUB_PULLS" ;;
    "pr view"*files*) printf '%s' '{"files":[]}' ;;
    *contents*) printf 'Not Found\n' >&2; exit 1 ;;
    *actions/workflows/*status=success*) printf '%s\n' "$STUB_DEPLOY_OK" ;;
    *actions/workflows/*runs*) printf '%s\n' "$STUB_DEPLOY_LAST" ;;
    *actions/runs/*/jobs*) printf '%s\n' '0' ;;
    *actions/runs*tojson*) printf '%s\n' '[]' ;;
    *actions/runs*per_page=20*) printf '%s\n' 'success' ;;
    *actions/runs*) printf '%s\n' '1' ;;
    *compare/*behind_by*) printf '%s\n' '0' ;;
    *compare/*) printf '%s\n' "${STUB_BEHIND:-0}" ;;
    */commits/*) printf '%s\n' "$STUB_HEAD_DATE" ;;
    *) printf 'неожиданный вызов: %s\n' "$args" >&2; exit 1 ;;
esac
STUB
chmod +x "$LW_TREE/gh"

HEAD_SHA='0123456789abcdef0123456789abcdef01234567'
export STUB_BOARD='{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[]}}}}'
export STUB_PULLS='[]'
export STUB_HEAD_DATE="$(node -e "process.stdout.write(new Date().toISOString())")"
export STUB_DEPLOY_OK=''
export STUB_DEPLOY_LAST=''

lw_config() {
    printf '%s\n' "$1" > "$LW_TREE/.claude/rt-kit/checks.json"
}
lw_run() {
    (cd "$LW_TREE" && GH_BIN="$LW_TREE/gh" node tools/check-board.mjs 2>&1)
}
lw_says() {
    lw_run | grep -cE "$1"
}

BASE='"tasksDir":"docs/tasks","board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}'

# --- SC-AK-823 — метка многозаходной работы против линии работ -----------------------------
# Одна метка без другой лжёт молча: исполнитель открывает карточку раньше, чем линию, а
# планирует по линии.
lw_config "{$BASE,\"longWork\":{\"label\":\"долгая\",\"plansDir\":\"docs/plans\"}}"
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"долгая"}]}]'
printf '# Линия\n\nОбычная строка про RT-700.\n' > "$LW_TREE/docs/plans/линия.md"
report "SC-AK-823 — метка без записи в линии названа" "$(lw_says 'помечена как «долгая», а в линиях работ')" 1

printf '# Линия\n\n- долгая: RT-700 — тянется несколько заходов\n' > "$LW_TREE/docs/plans/линия.md"
report "SC-AK-823 — метка с записью расхождением не считается" "$(lw_says 'помечена как «долгая»')" 0

# Обратная сторона: линия знает работу долгой, а карточка выглядит работой на один заход.
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[]}]'
report "SC-AK-823 — запись без метки названа" "$(lw_says 'знает её многозаходной, а метки')" 1

# Однозаходные задачи линии обратной стороной не судятся: строки без слова метки не читаются.
printf '# Линия\n\n| Порядок | Задача |\n| --- | --- |\n| 1 | RT-700 |\n' > "$LW_TREE/docs/plans/линия.md"
report "SC-AK-823 — строка линии без слова метки записью не считается" "$(lw_says 'знает её многозаходной')" 0

# Дерево, не назвавшее метки, получает молчание, а не отказ.
lw_config "{$BASE}"
export STUB_ISSUES='[{"number":700,"title":"[RT-700] Задача","state":"OPEN","assignees":[{"login":"probe"}],"labels":[{"name":"долгая"}]}]'
report "SC-AK-823 — без имени метки связь не судится" "$(lw_says 'долгая')" 0

# --- SC-AK-824 — упавшая выкатка --------------------------------------------------------------
# Отставание считается по последней УСПЕШНОЙ выкатке, и «не запускали» с «упала» выглядят через
# него одинаково. Ведут они к разному: первую запускают, вторую читают журналом и чинят.
lw_config "{$BASE,\"deploy\":{\"workflow\":\"deploy.yml\",\"mainBranch\":\"main\"}}"
export STUB_ISSUES='[]'
export STUB_DEPLOY_OK='{"sha":"aaaaaaaabbbbbbbbccccccccdddddddd","at":"2026-08-30T10:00:00Z"}'
export STUB_DEPLOY_LAST='{"status":"completed","conclusion":"failure","sha":"eeeeeeeeffffffff11111111222222","at":"2026-08-30T12:00:00Z","url":"https://host/run/9"}'
report "SC-AK-824 — упавшая выкатка названа своей строкой" "$(lw_says 'выкатка «deploy.yml» упала')" 1
report "SC-AK-824 — и названа ссылкой на прогон" "$(lw_says 'https://host/run/9')" 1

export STUB_DEPLOY_LAST='{"status":"in_progress","conclusion":null,"sha":"eeeeeeeeffffffff11111111222222","at":"2026-08-30T12:00:00Z","url":"https://host/run/9"}'
report "SC-AK-824 — идущая выкатка расхождением не считается" "$(lw_says 'упала')" 0

export STUB_DEPLOY_LAST=''
report "SC-AK-824 — выкатки не было ни разу: об упавшей не говорится" "$(lw_says 'упала')" 0

rm -rf "$LW_TREE"

suite_result "проверки: очередь работ, долгая работа и выкатка"
