#!/usr/bin/env bash
# Сценарии остановки в конце эпика: что считается взятием работы и когда оно отбивается.
#
# Состояние эпика спрашивается двойником команды: набор судит гард, а не очередь работ дерева, в
# котором его запустили.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гарды: остановка в конце эпика"

STOP_TREE="$(mktemp -d)"
mkdir -p "$STOP_TREE/tools" "$STOP_TREE/.claude"
git -C "$STOP_TREE" init -q 2>/dev/null
printf '%s\n' '{"layout":{"checks":"tools"}}' > "$STOP_TREE/.claude/rt-kit.json"

# Двойник команды: печатает то, что положил сценарий, и отвечает названным кодом.
cat > "$STOP_TREE/tools/epic-table.mjs" <<'STUB'
const left = process.env.STUB_LEFT ?? '';
const code = Number(process.env.STUB_CODE ?? '0');
if (left !== '') {
    process.stdout.write(`${left}\n`);
}
process.exit(code);
STUB

call() {
    printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "$(printf '%s' "$1" | jq -Rs .)"
}

stop_decision() {
    local label="$1" cmd="$2" want="$3" out got
    out="$(cd "$STOP_TREE" && call "$cmd" | "$HOOKS/epic-stop-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

stop_reason() {
    local label="$1" cmd="$2" pattern="$3" got
    if (cd "$STOP_TREE" && call "$cmd" | "$HOOKS/epic-stop-guard.sh" 2>/dev/null) \
        | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null \
        | grep -qE "$pattern"; then got="есть"; else got="нет"; fi
    report "$label" "$got" "есть"
}

export STUB_LEFT=''
export STUB_CODE=0

# --- SC-AK-979 — взятие работы при кончившемся эпике отбито ---------------------------------
stop_decision "SC-AK-979 — ветка по номеру задачи отбита" 'git checkout -b RT-1999-probe main' deny

# --- SC-AK-980 — незаконченная задача эпика пропускает работу --------------------------------
export STUB_LEFT='1947'
stop_decision "SC-AK-980 — незаконченная задача пропускает" 'git checkout -b RT-1999-probe main' PASS
export STUB_LEFT=''

# --- SC-AK-981 — отказ называет остановку ----------------------------------------------------
stop_reason "SC-AK-981 — названа команда таблицы" 'git checkout -b RT-1999-probe main' 'epic:table'
stop_reason "SC-AK-981 — названо ожидание приказа" 'git checkout -b RT-1999-probe main' 'waits for their orders'
stop_reason "SC-AK-981 — названа лазейка со словом владельца" 'git checkout -b RT-1999-probe main' 'Epic-stop-skip'

# --- SC-AK-982 — задача и столбец судятся наравне с веткой -----------------------------------
stop_decision "SC-AK-982 — заведение задачи отбито" 'npm run task:new -- "Проба"' deny
stop_decision "SC-AK-982 — движение столбца в рабочий отбито" 'npm run task:move -- 1999 in-progress' deny
stop_decision "SC-AK-982 — движение в рецензию не судится" 'npm run task:move -- 1999 in-review' PASS
stop_decision "SC-AK-982 — ветка через switch отбита" 'git switch -c RT-1999-probe main' deny

# --- SC-AK-983 — слово владельца в самом вызове пропускает -----------------------------------
stop_decision "SC-AK-983 — названная причина пропускает" 'git checkout -b RT-1999-probe main  # Epic-stop-skip: владелец сказал брать следующее' PASS
stop_decision "SC-AK-983 — пустая причина не лазейка" 'git checkout -b RT-1999-probe main  # Epic-stop-skip:' deny

# --- SC-AK-984 — ветка без номера задачи не судится ------------------------------------------
stop_decision "SC-AK-984 — ветка без номера пропущена" 'git checkout -b probe-without-number main' PASS

# --- SC-AK-985 — недоступный хостинг пропускает работу ---------------------------------------
export STUB_CODE=1
stop_decision "SC-AK-985 — спросить нечем: работа идёт" 'git checkout -b RT-1999-probe main' PASS
export STUB_CODE=0

# --- SC-AK-986 — вызов не о взятии работы не судится -----------------------------------------
stop_decision "SC-AK-986 — коммит не судится" 'git commit -m "проба"' PASS
stop_decision "SC-AK-986 — отправка ветки не судится" 'git push origin RT-1999-probe' PASS
stop_decision "SC-AK-986 — чтение истории не судится" 'git log --oneline -5' PASS
stop_decision "SC-AK-986 — переход на готовую ветку не судится" 'git checkout RT-1999-probe' PASS

# --- SC-AK-987 — гард ожидания не требует следующей задачи при кончившемся эпике --------------
#
# Отданная работа при живом эпике требует взять следующую задачу; при кончившемся её брать нельзя —
# и оба гарда обязаны сходиться, иначе у хода не остаётся законного конца.
TURNS="$(mktemp -d)"
turn() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : > "$path"
    for line in "$@"; do
        printf '%s\n' "$line" >> "$path"
    done
    printf '%s' "$path"
}
said() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
spoke() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
called() {
    jq -c -n --arg c "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
stop_input() {
    jq -n --arg p "$1" --arg d "$STOP_TREE" '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:false}'
}
stop_turn() {
    local label="$1" hook="$2" json="$3" want="$4" out got
    out="$(cd "$STOP_TREE" && printf '%s' "$json" | "$HOOKS/$hook" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if (.decision == "block") or (.hookSpecificOutput.permissionDecision == "deny") then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# Состояние отданного в ходе спрошено: то требование эпиком не снимается, и без него отказ пришёл
# бы по другой причине.
HANDED="$(turn "$(said 'работай')" "$(called 'gh pr create --draft --title x')" "$(called 'gh run list --branch RT-1-probe')" "$(called 'gh pr ready 1')")"

export STUB_LEFT='1947'
stop_turn "SC-AK-987 — живой эпик требует следующей задачи" waiting-turn-guard.sh "$(stop_input "$HANDED")" BLOCK
export STUB_LEFT=''
stop_turn "SC-AK-987 — кончившийся эпик требования снимает" waiting-turn-guard.sh "$(stop_input "$HANDED")" PASS

# --- SC-AK-988 — ход, ждущий приказа, при кончившемся эпике не отбивается ---------------------
mkdir -p "$STOP_TREE/docs/tasks"
WAITED="$(turn "$(said 'работай')" "$(called 'git commit -m проба')" "$(spoke 'Эпик кончился. Жду вашего слова.')")"

export STUB_LEFT='1947'
stop_turn "SC-AK-988 — при живом эпике объявленная остановка отбита" turn-exit-guard.sh "$(stop_input "$WAITED")" BLOCK
export STUB_LEFT=''
stop_turn "SC-AK-988 — при кончившемся эпике остановка законна" turn-exit-guard.sh "$(stop_input "$WAITED")" PASS

# --- SC-AK-1007 — незакрытый эпик не выпускает ход, кончившийся работой и отчётом -------------
# Ход, в котором работа была, последним действием была команда, а после неё отчёт владельцу. Все
# прежние ярусы такой ход выпускали: по букве правила он законен. Эпик при этом шёл, и следующий
# шаг замысла не был занят ничем — владелец читал такой ход как остановку.
WORKED_THEN_TOLD="$(turn "$(said 'работай')" "$(called 'git commit -m проба')" "$(spoke 'Сделал кусок. Дальше пишу спеку.')")"

export STUB_LEFT='1947'
stop_turn "SC-AK-1007 — при живом эпике ход с отчётом отбит" turn-exit-guard.sh "$(stop_input "$WORKED_THEN_TOLD")" BLOCK
export STUB_LEFT=''
stop_turn "SC-AK-1007 — при кончившемся эпике тот же ход законен" turn-exit-guard.sh "$(stop_input "$WORKED_THEN_TOLD")" PASS

# Слово владельца об остановке снимает ярус: он читает слово с их стороны, а не с исполнительской.
TOLD_STOP="$(turn "$(said 'остановись, дальше не надо')" "$(called 'git commit -m проба')" "$(spoke 'Останавливаюсь.')")"

export STUB_LEFT='1947'
stop_turn "SC-AK-1007 — слово владельца снимает ярус" turn-exit-guard.sh "$(stop_input "$TOLD_STOP")" PASS
export STUB_LEFT=''

rm -rf "$TURNS"

rm -rf "$STOP_TREE"

suite_result "гарды: остановка в конце эпика"
