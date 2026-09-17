#!/usr/bin/env bash
# Сценарии аудита очереди работ: папка задачи в ветке.
#
# Стенд свой, а не общий: эта часть аудита — единственная, читающая местный репозиторий, и у общего
# стенда репозитория нет вовсе. Без него проверка молчала на любом дереве, и её поведение не
# испытывалось ни разу.
#
# Сеть не трогается: помощник хостинга подставляется через `GH_BIN` и отвечает пустыми списками.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "проверки: очередь работ, папка задачи в ветке"

BF_TREE="$(mktemp -d)"
mkdir -p "$BF_TREE/tools" "$BF_TREE/.claude/rt-kit" "$BF_TREE/docs/tasks" "$BF_TREE/docs/plans" "$BF_TREE/.github/workflows"
cp "$CHECKS/rt-kit-checks.config.mjs" "$BF_TREE/tools/"
cp "$CHECKS/board.github.mjs" "$BF_TREE/tools/board.mjs"
cp "$CHECKS/board-epic-link.github.mjs" "$BF_TREE/tools/board-epic-link.mjs"
cp "$CHECKS/board-epic-plan.github.mjs" "$BF_TREE/tools/board-epic-plan.mjs"
cp "$CHECKS/board-task-dirs.github.mjs" "$BF_TREE/tools/board-task-dirs.mjs"
cp "$CHECKS/board-gh.github.mjs" "$BF_TREE/tools/board-gh.mjs"
cp "$CHECKS/board-runs.github.mjs" "$BF_TREE/tools/board-runs.mjs"
cp "$CHECKS/board-pull-state.github.mjs" "$BF_TREE/tools/board-pull-state.mjs"
cp "$CHECKS/board-paths.github.mjs" "$BF_TREE/tools/board-paths.mjs"
cp "$CHECKS/board-titles.github.mjs" "$BF_TREE/tools/board-titles.mjs"
cp "$CHECKS/board-epics.github.mjs" "$BF_TREE/tools/board-epics.mjs"
cp "$CHECKS/board-folders.mjs" "$BF_TREE/tools/board-folders.mjs"
cp "$CHECKS/board-long-work.github.mjs" "$BF_TREE/tools/board-long-work.mjs"
cp "$CHECKS/check-board.github.mjs" "$BF_TREE/tools/check-board.mjs"
printf '%s\n' 'on: pull_request' 'jobs:' '    main:' '        steps:' '            - name: Lint' \
    > "$BF_TREE/.github/workflows/ci.yml"

cat > "$BF_TREE/gh" <<'STUB'
#!/usr/bin/env bash
args="$*"
case "$args" in
    *graphql*) printf '%s' '{"data":{"node":{"items":{"pageInfo":{"hasNextPage":false,"endCursor":null},"nodes":[]}}}}' ;;
    "issue list"*) printf '%s' '[]' ;;
    "pr list"*) printf '%s' '[]' ;;
    "pr view"*files*) printf '%s' '{"files":[]}' ;;
    *contents*) printf 'Not Found\n' >&2; exit 1 ;;
    *actions/runs/*/jobs*) printf '%s\n' '0' ;;
    *actions/runs*tojson*) printf '%s\n' '[]' ;;
    *actions/runs*per_page=20*) printf '%s\n' 'success' ;;
    *actions/runs*) printf '%s\n' '1' ;;
    *actions/workflows/*runs*) printf '%s\n' '' ;;
    *compare/*behind_by*) printf '%s\n' '0' ;;
    *compare/*) printf '%s\n' '0' ;;
    */commits/*) node -e "process.stdout.write(new Date().toISOString())" ;;
    *) printf 'неожиданный вызов: %s\n' "$args" >&2; exit 1 ;;
esac
STUB
chmod +x "$BF_TREE/gh"

BASE='"tasksDir":"docs/tasks","plansDir":"docs/plans","board":{"owner":"probe","repo":"tree","projectId":"P","statusFieldId":"F","statusOptions":{"in-review":{"id":"r","name":"In review"}},"taskKey":"RT","bot":"probe-bot","tokenPath":"","reviewer":"probe"}'
printf '{%s}\n' "$BASE" > "$BF_TREE/.claude/rt-kit/checks.json"

bf_git() { (cd "$BF_TREE" && git -c user.name=probe -c user.email=probe@probe "$@" >/dev/null 2>&1); }
bf_run() { (cd "$BF_TREE" && GH_BIN="$BF_TREE/gh" node tools/check-board.mjs 2>&1); }
bf_says() { bf_run | grep -cE "$1"; }

# Дерево-фикстура: главная ветка с одним коммитом, от неё ветка задачи и ветка эпика.
bf_git init -b main
printf 'дерево\n' > "$BF_TREE/README.md"
bf_git add -A
bf_git commit -m 'первый коммит'

bf_git checkout -b RT-700-task
printf 'правка\n' >> "$BF_TREE/README.md"
bf_git add -A
bf_git commit -m 'правка задачи'

bf_git checkout main
bf_git checkout -b RT-800-epic
printf '# Эпик\n\n**Эпик:** RT-800 · **Ветка эпика:** `RT-800-epic`\n' > "$BF_TREE/docs/plans/эпик.md"
bf_git add -A
bf_git commit -m 'план эпика'
bf_git checkout main

# --- SC-AK-1115 — ветка задачи без своей папки названа ------------------------------------
# Папку задачи ветка доносит первым же коммитом: незакоммиченная пропускает правки всю работу, и
# отказ приходит на выходе из хода, когда чинить уже нечем.
report "SC-AK-1115 — ветка задачи без папки названа" "$(bf_says 'RT-700-task: the task folder never travelled')" 1

# --- SC-AK-1116 — ветка эпика папки задачи не требует -------------------------------------
# Папки задачи у ветки эпика нет по устройству: она несёт план эпика и слияния своих задач.
# Требование к ней невыполнимо, и такая строка снаружи неотличима от настоящего расхождения.
report "SC-AK-1116 — ветка эпика папки не требует" "$(bf_says 'RT-800-epic: the task folder never travelled')" 0

# --- SC-AK-1117 — ветка задачи со своей папкой расхождением не считается -------------------
bf_git checkout RT-700-task
mkdir -p "$BF_TREE/docs/tasks/RT-700-task"
printf '# План\n' > "$BF_TREE/docs/tasks/RT-700-task/plan.md"
bf_git add -A
bf_git commit -m 'папка задачи'
bf_git checkout main
report "SC-AK-1117 — ветка задачи с папкой не называется" "$(bf_says 'RT-700-task: the task folder never travelled')" 0

rm -rf "$BF_TREE"

suite_result "очередь работ, папка задачи в ветке"
