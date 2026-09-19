#!/usr/bin/env bash
# Сценарии яруса о несделанных шагах: когда страж конца хода отбивает остановку посреди работы.
#
# Ход задаётся записью хода, дерево — фикстурой: набор судит гард, а не задачу дерева, в котором
# его запустили. Состояние эпика при этом подменяется двойником команды и всюду говорит
# «эпик кончился» — иначе отказ приходил бы по соседней причине.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гарды: несделанный шаг не выпускает ход"

WS_TREE="$(mktemp -d)"
mkdir -p "$WS_TREE/tools" "$WS_TREE/.claude" "$WS_TREE/docs/tasks/RT-1-probe"
git -C "$WS_TREE" init -q -b RT-1-probe 2>/dev/null
printf '%s\n' '{"layout":{"checks":"tools"}}' > "$WS_TREE/.claude/rt-kit.json"

# Двойник команды эпика: печатает то, что положил сценарий. Эпик держат открытым — при
# кончившемся эпике страж отпускает ход целиком, и ярус о шагах до слова не доходит.
cat > "$WS_TREE/tools/epic-table.mjs" <<'STUB'
const left = process.env.STUB_LEFT ?? '';
if (left !== '') {
    process.stdout.write(`${left}\n`);
}
process.exit(0);
STUB
export STUB_LEFT='1947'

WS_TURNS="$(mktemp -d)"

ws_turn() {
    local path
    path="$WS_TURNS/turn-$RANDOM.jsonl"
    : > "$path"
    for line in "$@"; do
        printf '%s\n' "$line" >> "$path"
    done
    printf '%s' "$path"
}
ws_said() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
ws_spoke() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ws_called() {
    jq -c -n --arg c "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
ws_input() {
    jq -n --arg p "$1" --arg d "$WS_TREE" '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}
ws_verdict() {
    local label="$1" json="$2" want="$3" out got
    out="$(cd "$WS_TREE" && printf '%s' "$json" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if (.decision == "block") or (.hookSpecificOutput.permissionDecision == "deny") then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}
ws_says() {
    (cd "$WS_TREE" && printf '%s' "$1" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null) \
        | jq -r '.reason // .hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null
}

# Ход работы фикстуры: состояние и перечень шагов с отметками.
ws_progress() {
    {
        printf '# Progress\n\n## Where we stand\n\n'
        printf -- '- **State:** `%s`\n' 'этап-идёт'
        printf -- '- **Next step:** поставить ярус\n\n## Steps\n\n'
        for line in "$@"; do
            printf '%s\n' "$line"
        done
    } > "$WS_TREE/docs/tasks/RT-1-probe/progress.md"
}

# Ход, в котором работа была, последним действием была команда, а после неё отчёт владельцу.
WORKED_THEN_TOLD="$(ws_turn "$(ws_said 'работай')" "$(ws_called 'git commit -m проба')" "$(ws_spoke 'Сделал кусок. Дальше пишу спеку.')")"

# --- SC-AK-1012 — несделанный шаг отбивает ход ------------------------------------------------
ws_progress '- [x] 1.1 поставить ярус' '- [>] 1.2 завести пробы' '- [ ] 2.1 записать статью'
ws_verdict "SC-AK-1012 — при несделанных шагах ход отбит" "$(ws_input "$WORKED_THEN_TOLD")" BLOCK
report "SC-AK-1012 — назван остаток шагов" "$(ws_says "$(ws_input "$WORKED_THEN_TOLD")" | grep -c '2 steps of the plan are not done')" 1
report "SC-AK-1012 — назван текущий шаг" "$(ws_says "$(ws_input "$WORKED_THEN_TOLD")" | grep -c '1.2 завести пробы')" 1
report "SC-AK-1012 — названа команда счёта" "$(ws_says "$(ws_input "$WORKED_THEN_TOLD")" | grep -c 'check:work-steps')" 1

# --- SC-AK-1013 — при сделанных шагах ярус молчит ---------------------------------------------
# Эпик открыт, и ход отбивает соседний ярус: молчание яруса о шагах видно по тексту отказа, а не
# по приговору. При кончившемся эпике отказа нет вовсе, и такая проба не сказала бы ничего.
ws_progress '- [x] 1.1 поставить ярус' '- [x] 1.2 завести пробы' '- [x] 2.1 записать статью'
report "SC-AK-1013 — при сделанных шагах ярус молчит" \
    "$(ws_says "$(ws_input "$WORKED_THEN_TOLD")" | grep -c 'steps of the plan are not done')" 0

# --- SC-AK-1014 — слово владельца снимает ярус ------------------------------------------------
TOLD_STOP="$(ws_turn "$(ws_said 'остановись, дальше не надо')" "$(ws_called 'git commit -m проба')" "$(ws_spoke 'Останавливаюсь.')")"
ws_progress '- [x] 1.1 поставить ярус' '- [>] 1.2 завести пробы' '- [ ] 2.1 записать статью'
ws_verdict "SC-AK-1014 — слово владельца снимает ярус" "$(ws_input "$TOLD_STOP")" PASS

# --- SC-AK-1015 — ход работы без перечня шагов ярусом не судится -------------------------------
printf '# Progress\n\n## Where we stand\n\n- **State:** `%s`\n- **Next step:** поставить ярус\n' 'этап-идёт' \
    > "$WS_TREE/docs/tasks/RT-1-probe/progress.md"
report "SC-AK-1015 — без перечня шагов ярус молчит" \
    "$(ws_says "$(ws_input "$WORKED_THEN_TOLD")" | grep -c 'steps of the plan are not done')" 0

rm -rf "$WS_TURNS" "$WS_TREE"

suite_result "гарды: несделанный шаг не выпускает ход"
