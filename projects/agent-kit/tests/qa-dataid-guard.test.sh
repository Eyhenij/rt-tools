#!/usr/bin/env bash
# Сценарии гарда якорей: разметка без опознавателя для сквозных наборов в дерево не уезжает —
# ни правкой инструментом, ни записью командой оболочки.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард якорей"

TREE="$(mktemp -d)"
cleanup() { rm -rf "$TREE"; }
trap cleanup EXIT
mkdir -p "$TREE/apps/admin" "$TREE/docs"

edit_in() {
    jq -n --arg f "$1" --arg b "$2" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:$f,new_string:$b},cwd:$d}'
}
cmd_in() {
    jq -n --arg c "$1" --arg d "$TREE" \
        '{session_id:"tests",tool_name:"Bash",tool_input:{command:$c},cwd:$d}'
}
run() {
    printf '%s' "$1" | CLAUDE_PROJECT_DIR="$TREE" "$HOOKS/qa-dataid-guard.sh" 2>/dev/null
}
decision() {
    local out
    out="$(run "$1")"
    [ -z "$out" ] && { printf 'PASS'; return 0; }
    printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"' 2>/dev/null
}

report "SC-AK-931 — кнопка без якоря отбивается" \
    "$(decision "$(edit_in "$TREE/apps/admin/a.html" '<button (click)="go()">Дальше</button>')")" deny
report "SC-AK-931 — кнопка с якорем проходит" \
    "$(decision "$(edit_in "$TREE/apps/admin/a.html" '<button qa-dataid="go" (click)="go()">Дальше</button>')")" PASS
report "SC-AK-931 — отметка отказа на самом теге пропускает" \
    "$(decision "$(edit_in "$TREE/apps/admin/a.html" '<button qa-skip (click)="go()">Дальше</button>')")" PASS
report "SC-AK-931 — разметка вне кода приложения не судится" \
    "$(decision "$(edit_in "$TREE/docs/a.html" '<button (click)="go()">Дальше</button>')")" PASS

# Та же запись командой оболочки: гард судит запись, а не имя инструмента. Разметка берётся из
# тела команды — записываемое стоит внутри неё.
report "SC-AK-930 — кнопка без якоря в перенаправлении отбивается" \
    "$(decision "$(cmd_in 'printf "<button (click)=\"go()\">Дальше</button>" > apps/admin/a.html')")" deny
report "SC-AK-930 — кнопка без якоря в теле heredoc отбивается" \
    "$(decision "$(cmd_in "$(printf 'cat > apps/admin/a.html <<HTML\n<button (click)="go()">Дальше</button>\nHTML')")")" deny
report "SC-AK-930 — кнопка с якорем командой проходит" \
    "$(decision "$(cmd_in 'printf "<button qa-dataid=\"go\" (click)=\"go()\">Дальше</button>" > apps/admin/a.html')")" PASS
report "SC-AK-930 — чтение разметки гарда не будит" \
    "$(decision "$(cmd_in 'cat apps/admin/a.html')")" PASS
report "SC-AK-930 — запись не в разметку гарда не будит" \
    "$(decision "$(cmd_in 'printf "<button (click)=\"go()\">Дальше</button>" > apps/admin/a.txt')")" PASS

# Отказ в пользу работы: сломанный гард не заклинивает работу.
exit_code_of() {
    printf '%s' "$2" | "$HOOKS/qa-dataid-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "чужой инструмент пропускается" \
    "$(jq -n '{session_id:"tests",tool_name:"Read",tool_input:{file_path:"a.html"}}')"

suite_result "гард якорей"
