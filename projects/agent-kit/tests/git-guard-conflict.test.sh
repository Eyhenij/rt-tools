#!/usr/bin/env bash
# Сценарии ветки гарда поставки о конфликтующей своей заявке: пока отданное конфликтует, новая
# работа не берётся, а починка конфликта идёт как прежде.
#
# Опрос заявок в сеть не ходит: свои конфликтующие подставляются надстройкой профиля в дереве
# фикстуры. Живой хостинг отвечал бы по-разному на одной и той же правке, и набор краснел бы от
# чужого слияния.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "конфликт раньше новой работы"

# Дерево фикстуры со своим ответом опроса. Довод — то, что печатает опрос: пустая строка значит
# «конфликтующих нет», а отказ кода возврата подставляется отдельным деревом ниже.
conflict_tree() {
    local dir
    dir="$(fixture_repo main)"
    mkdir -p "$dir/.claude/rt-kit"
    cat > "$dir/.claude/rt-kit/project.sh" <<EOF
rt_conflicting_pulls() {
    printf '%s' '$1'
}
EOF
    printf '%s' "$dir"
}

dlv() {
    local label="$1" dir="$2" cmd="$3" want="$4" out
    out="$(CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecision // "PASS"' 2>/dev/null)"
    report "$label" "${out:-PASS}" "$want"
}

dlv_reason() {
    local label="$1" dir="$2" cmd="$3" pattern="$4" got
    if CLAUDE_PROJECT_DIR="$dir" input_cmd "$cmd" Bash "$dir" \
        | CLAUDE_PROJECT_DIR="$dir" "$HOOKS/git-guard-delivery.sh" 2>/dev/null \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

STUCK="$(conflict_tree '#1529 RT-1527-probe')"
CLEAN="$(conflict_tree '')"

# SC-AK-786 — заведение ветки под задачу при своей конфликтующей заявке
dlv "SC-AK-786 — заведение ветки под задачу отбито" "$STUCK" \
    'git checkout -b RT-1531-next origin/main' deny
dlv_reason "SC-AK-786 — отказ называет, что именно берётся" "$STUCK" \
    'git checkout -b RT-1531-next origin/main' 'заведение ветки под задачу'
dlv_reason "SC-AK-786 — отказ называет конфликтующую заявку" "$STUCK" \
    'git checkout -b RT-1531-next origin/main' '#1529 RT-1527-probe'
dlv "SC-AK-872 — заведение ветки с флагом перед -b отбито так же" "$STUCK" \
    'git checkout -q -b RT-1531-next origin/main' deny

# SC-AK-787 — заведение задачи
dlv "SC-AK-787 — заведение задачи отбито" "$STUCK" 'npm run task:new -- --title x' deny
dlv_reason "SC-AK-787 — отказ называет заведение задачи" "$STUCK" \
    'npm run task:new -- --title x' 'заведение задачи'

# SC-AK-788 — перевод колонки в работу
dlv "SC-AK-788 — перевод колонки в работу отбит" "$STUCK" 'npm run task:move 1531 in-progress' deny
dlv_reason "SC-AK-788 — отказ называет перевод колонки" "$STUCK" \
    'npm run task:move 1531 in-progress' 'перевод колонки в работу'

# SC-AK-788 — перевод в другую колонку концом работы и есть: он не отбивается
dlv "SC-AK-788 — перевод колонки в разбор проходит" "$STUCK" 'npm run task:move 1527 in-review' PASS

# SC-AK-789 — открытие заявки
dlv "SC-AK-789 — открытие заявки отбито" "$STUCK" 'gh pr create --title "x" --body y' deny
dlv_reason "SC-AK-789 — отказ называет открытие заявки" "$STUCK" \
    'gh pr create --title "x" --body y' 'открытие заявки'

# SC-AK-790 — починкой конфликта работа не берётся, и отбивать её нечем
dlv "SC-AK-790 — подтягивание проходит" "$STUCK" 'git fetch origin' PASS
dlv "SC-AK-790 — вливание главной проходит" "$STUCK" 'git merge origin/main' PASS
dlv "SC-AK-790 — переход на конфликтующую ветку проходит" "$STUCK" 'git checkout RT-1527-probe' PASS
dlv "SC-AK-790 — отправка проходит" "$STUCK" 'git push origin RT-1527-probe' PASS

# SC-AK-791 — ветка без номера работой под задачу не бывает
dlv "SC-AK-791 — ветка без номера проходит" "$STUCK" 'git checkout -b probe-scratch' PASS

# SC-AK-792 — конфликтующих нет: взятие работы проходит
dlv "SC-AK-792 — заведение задачи без конфликтов проходит" "$CLEAN" \
    'npm run task:new -- --title x' PASS
dlv "SC-AK-792 — перевод колонки в работу без конфликтов проходит" "$CLEAN" \
    'npm run task:move 1531 in-progress' PASS

# SC-AK-793 — опрос молчит: ярус пропускается, а не отбивает наугад
SILENT="$(fixture_repo main)"
mkdir -p "$SILENT/.claude/rt-kit"
cat > "$SILENT/.claude/rt-kit/project.sh" <<'EOF'
rt_conflicting_pulls() { return 1; }
EOF
dlv "SC-AK-793 — отказ опроса взятие работы пропускает" "$SILENT" \
    'npm run task:new -- --title x' PASS

# SC-AK-793 — дерево, не объявившее опроса вовсе, судится тем же образом
BARE="$(fixture_repo main)"
dlv "SC-AK-793 — дерево без опроса взятие работы пропускает" "$BARE" \
    'npm run task:new -- --title x' PASS

rm -rf "$STUCK" "$CLEAN" "$SILENT" "$BARE"

suite_result "конфликт раньше новой работы"
