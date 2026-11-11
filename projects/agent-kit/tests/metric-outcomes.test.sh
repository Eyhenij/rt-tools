#!/usr/bin/env bash
# Передача заявки и чтение итогов: когда появляется подпись передачи и что отчёт узнаёт от хостинга.
# Подпись остаётся в дереве, в строку наблюдения попадает только итог.
#
# Сценарии договорённости: SC-AK-1306, SC-AK-1297.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "ПЕРЕДАЧА И ИТОГИ ЗАЯВОК"

# Рабочее дерево: репозиторий с коммитом и рабочая ветка.
fixture_metric_tree() {
    local dir
    dir="$(fixture_repo_branched main work)"
    printf '%s' "$dir"
}

# --- Передача на ревью ----------------------------------------------------------------------

# Метка передачи ветки: коммит и дерево головы. Имя файла считается той же записью, что в проверке.
handover_of() {
    CLAUDE_PROJECT_DIR="$1" bash -c '. "$1/metric-marks.sh"; cat "$(rt_branch_mark handover "$2")" 2>/dev/null' _ "$HOOKS" "$2"
}

guard_in() {
    input_cmd "$2" Bash "$1" | CLAUDE_PROJECT_DIR="$1" "$HOOKS/git-guard-delivery.sh" >/dev/null 2>&1
}

# Конец вызова: подпись кладёт хук после него, а не проверка до него.
after_in() {
    local answer="${3:-}"
    [ -n "$answer" ] || answer='{}'
    jq -n --arg c "$2" --arg d "$1" --argjson r "$answer" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d,tool_response:$r}' \
        | CLAUDE_PROJECT_DIR="$1" "$HOOKS/handover-mark.sh" >/dev/null 2>&1
}

open_in() {
    guard_in "$1" "$2"
    after_in "$1" "$2"
}

READY='gh pr create --title "[RT-7] Сделано" --base main --reviewer owner --body x'
tree="$(fixture_repo_branched main RT-7-probe)"
open_in "$tree" 'gh pr create --title "[RT-7] Сделано" --base main --draft --reviewer owner --body x'
report "SC-AK-1297 — передача:черновик ещё не передан" "$(handover_of "$tree" RT-7-probe)" ""
open_in "$tree" 'gh pr create --title "[RT-7] Сделано" --base main --body x'
report "SC-AK-1297 — передача:заявка без проверяющего не передана" "$(handover_of "$tree" RT-7-probe)" ""
guard_in "$tree" "$READY"
report "SC-AK-1297 — передача:до конца вызова подписи нет" "$(handover_of "$tree" RT-7-probe)" ""
after_in "$tree" "$READY" '{"exit_code":1}'
report "SC-AK-1297 — передача:упавший вызов подписи не оставляет" "$(handover_of "$tree" RT-7-probe)" ""
open_in "$tree" "$READY"
want="$(git -C "$tree" rev-parse HEAD) $(git -C "$tree" rev-parse 'HEAD^{tree}')"
report "SC-AK-1297 — передача:открытие готовой заявки оставляет подпись" "$(handover_of "$tree" RT-7-probe)" "$want"
fixture_commit "$tree" extra.txt 'body' 'chore: правка после передачи'
open_in "$tree" "$READY"
report "SC-AK-1297 — передача:первая подпись остаётся" "$(handover_of "$tree" RT-7-probe)" "$want"
rm -rf "$tree"

# Проверка пропустила, а следующая в ряду отказала: хук после вызова не приходит, подписи нет.
tree="$(fixture_repo_branched main RT-7-probe)"
guard_in "$tree" "$READY"
report "SC-AK-1297 — передача:отказанный другой проверкой вызов подписи не оставляет" "$(handover_of "$tree" RT-7-probe)" ""
rm -rf "$tree"

# Снятие черновика: голова приходит с хостинга.
tree="$(fixture_repo_branched main RT-8-probe)"
mkdir -p "$tree/.claude/rt-kit"
printf 'rt_pull_state() { printf "%%s" %s; }\n' \
    "'{\"exists\":true,\"number\":9,\"draft\":true,\"reviewed\":true,\"conflicting\":false,\"branch\":\"RT-8-probe\"}'" \
    > "$tree/.claude/rt-kit/project.sh"
open_in "$tree" 'gh pr ready 9'
report "SC-AK-1297 — передача:снятие черновика оставляет подпись" \
    "$(handover_of "$tree" RT-8-probe)" "$(git -C "$tree" rev-parse HEAD) $(git -C "$tree" rev-parse 'HEAD^{tree}')"
rm -rf "$tree"

# Отказ передачей не считается: заявка не ушла.
tree="$(fixture_repo_branched main RT-9-probe)"
fixture_commit "$tree" docs/tasks/RT-9-probe/plan.md 'план' 'docs: папка задачи'
open_in "$tree" 'gh pr create --title "[RT-9] Сделано" --base main --body x'
report "SC-AK-1297 — передача:отказанная заявка подписи не оставляет" "$(handover_of "$tree" RT-9-probe)" ""

second="$tree-second"
git -C "$tree" worktree add -q -b RT-11-probe "$second" 2>/dev/null
CLAUDE_PROJECT_DIR="$second" bash -c '. "$1/metric-marks.sh"; printf "c2 t2\n" > "$(rt_branch_mark handover RT-11-probe)"' _ "$HOOKS"
report "SC-AK-1306 — подпись второй копии видна из основной" "$(handover_of "$tree" RT-11-probe)" "c2 t2"
rm -rf "$second"
rm -rf "$tree"

# --- Итоги заявок: значение по умолчанию и соединение с метками ---------------------------

# Поддельный клиент хостинга: список заявок и коммиты одной из них. Настоящий клиент здесь не зовётся.
fixture_host() {
    local dir
    dir="$(mktemp -d)"
    cat > "$dir/gh" <<'EOF'
#!/usr/bin/env bash
case "$1 $2" in
    'pr list')
        printf '%s' '[{"number":31,"state":"MERGED","headRefName":"RT-5-probe","title":"[RT-5] Сделано","closedAt":"2026-08-10T10:00:00Z"},
{"number":32,"state":"CLOSED","headRefName":"RT-6-probe","title":"[RT-6] Брошено","closedAt":"2026-08-11T10:00:00Z"},
{"number":33,"state":"OPEN","headRefName":"RT-7-probe","title":"[RT-7] Идёт","closedAt":null},
{"number":34,"state":"MERGED","headRefName":"revert-31-RT-5-probe","title":"Revert \"[RT-5] Сделано\"","closedAt":"2026-08-12T10:00:00Z"}]'
        ;;
    'api repos/{owner}/{repo}/issues/6') printf '%s' '["epic"]' ;;
    'api repos/{owner}/{repo}/issues/'*) printf '%s' '["bug"]' ;;
    api*) printf '%s' '[{"sha":"c1","tree":"t1","parents":1}]' ;;
esac
EOF
    chmod +x "$dir/gh"
    printf '%s' "$dir"
}

# Значение по умолчанию читается как его зовёт разложенное дерево.
outcomes_in() {
    (cd "$1" && PATH="$2:$PATH" CLAUDE_PROJECT_DIR="$1" RT_BOARD_EPIC_LABEL=epic \
        bash "$HOOKS/pull-outcomes.sh" 2026-07-01 2>/dev/null)
}

tree="$(fixture_metric_tree)"
host="$(fixture_host)"
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT="{\"cwd\":\"$tree\"}" bash -c '
    . "$1/metric-marks.sh"
    printf "c1 t1\n" > "$(rt_branch_mark handover RT-5-probe)"
    printf "before 2026-08-01\nafter 2026-08-02\nafter 2026-08-03\n" > "$(rt_branch_mark corrections RT-5-probe)"' _ "$HOOKS"
out="$(outcomes_in "$tree" "$host")"
report "итоги: открытая заявка не читается" "$(printf '%s\n' "$out" | grep -c .)" "3"
report "итоги: без подписи коммиты не спрашиваются" "$(printf '%s\n' "$out" | sed -n 2p | jq -c '.commits')" '[]'
report "итоги: слитая заявка названа" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '[.number,.merged,.task,.revert,.epic,.closed]')" \
    '[31,true,5,false,false,"2026-08-10"]'
report "итоги: коммиты заявки дошли" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '.commits')" '[{"sha":"c1","tree":"t1","parents":1}]'
report "итоги: подпись передачи присоединена" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '.handover')" '{"commit":"c1","tree":"t1"}'
report "итоги: считаются правки после передачи" "$(printf '%s\n' "$out" | sed -n 1p | jq -c '.corrections')" '["2026-08-02","2026-08-03"]'
report "итоги: имя ветки наружу не выходит" "$(printf '%s' "$out" | grep -c 'probe')" "0"
report "итоги: заявка без метки без подписи" "$(printf '%s\n' "$out" | sed -n 2p | jq -c '[.handover,.merged]')" '[null,false]'
report "итоги: откат называет задачу из заголовка" "$(printf '%s\n' "$out" | sed -n 3p | jq -c '[.task,.revert]')" '[5,true]'
rm -rf "$tree" "$host"

# Эпик узнаётся по метке карточки, как его узнаёт проверка поставки.
tree="$(fixture_metric_tree)"
host="$(fixture_host)"
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT="{\"cwd\":\"$tree\"}" bash -c \
    '. "$1/metric-marks.sh"; printf "c1 t1\n" > "$(rt_branch_mark handover RT-6-probe)"' _ "$HOOKS"
report "итоги: эпик по метке карточки" "$(outcomes_in "$tree" "$host" | sed -n 2p | jq -c '.epic')" 'true'
rm -rf "$tree" "$host"

# Сотня заявок без подписи: один вызов хостинга, а не две сотни.
tree="$(fixture_metric_tree)"
host="$(mktemp -d)"
cat > "$host/gh" <<'EOF'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$GH_LOG"
jq -cn '[range(100) | {number:., state:"MERGED", headRefName:"RT-\(.)-probe", title:"[RT-\(.)] X", closedAt:"2026-08-10T10:00:00Z"}]'
EOF
chmod +x "$host/gh"
export GH_LOG="$host/log"
report "итоги: все заявки прочитаны" "$(outcomes_in "$tree" "$host" | grep -c .)" "100"
report "итоги: заявки без подписи стоят один вызов" "$(wc -l < "$GH_LOG" | tr -d ' ')" "1"
unset GH_LOG
rm -rf "$tree" "$host"

# Спросить некого: без клиента хостинга код говорит об этом, а не печатает пустоту.
tree="$(fixture_metric_tree)"
(cd "$tree" && PATH="/usr/bin:/bin" CLAUDE_PROJECT_DIR="$tree" bash "$HOOKS/pull-outcomes.sh" 2026-07-01 >/dev/null 2>&1)
after_call=$?

# Сбой одного вызова — обрыв чтения: заявка не теряется молча, день чтения стоит.
broken="$(mktemp -d)"
cat > "$broken/gh" <<'EOF'
#!/usr/bin/env bash
[ "$1 $2" = 'pr list' ] || exit 1
printf '%s' '[{"number":41,"state":"MERGED","headRefName":"RT-8-probe","title":"[RT-8] X","closedAt":"2026-08-10T10:00:00Z"}]'
EOF
chmod +x "$broken/gh"
CLAUDE_PROJECT_DIR="$tree" RT_HOOK_INPUT="{\"cwd\":\"$tree\"}" bash -c \
    '. "$1/metric-marks.sh"; printf "c1 t1\n" > "$(rt_branch_mark handover RT-8-probe)"' _ "$HOOKS"
out="$(outcomes_in "$tree" "$broken")"
report "SC-AK-1301 — сбой вызова даёт код обрыва" "$?" "4"
report "SC-AK-1301 — заявка не прочитана наполовину" "$out" ""
rm -rf "$broken"

report "итоги: без клиента хостинга код 3" "$after_call" "$(command -v gh | grep -q '^/usr/bin\|^/bin' && echo 0 || echo 3)"
rm -rf "$tree"

suite_result
