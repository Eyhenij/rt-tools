#!/usr/bin/env bash
# Обвязка сценариев проверки выхода из хода: запись хода, папка задачи и вызов проверки
# собираются здесь и делятся двумя наборами — общим и набором открытого эпика. Файл не набор:
# бегун берёт только `*.test.sh`, а этот подключается ими.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

TURNS="$(mktemp -d)"
REPO="$(fixture_repo RT-1-probe)"
export CLAUDE_PROJECT_DIR="$REPO"
cleanup() { rm -rf "$TURNS" "$REPO"; }
trap cleanup EXIT

TASK="$REPO/docs/tasks/RT-1-probe"
mkdir -p "$TASK"

state_is() {
    printf '# Ход работы\n\n## Где стоим\n\n- **Состояние:** `%s`\n- **Следующий шаг:** дописать страж\n' \
        "$1" > "$TASK/progress.md"
}

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : >"$path"
    for line in "$@"; do
        printf '%s\n' "$line" >>"$path"
    done
    printf '%s' "$path"
}

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Read",input:{file_path:"a.md"}}]}}'; }
said() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
ran() {
    jq -c -n --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
}
edited() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"Edit",input:{file_path:"a.md"}}]}}'
}
edited_file() {
    jq -c -n --arg p "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Edit",input:{file_path:$p}}]}}'
}
asked() {
    jq -c -n '{type:"assistant",message:{content:[{type:"tool_use",name:"AskUserQuestion",input:{questions:[]}}]}}'
}
answered() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"tool_result",content:$t}]}}'; }

input_stop() {
    jq -n --arg p "$1" --arg d "$REPO" --argjson a "${2:-false}" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:$a}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

# Отказ читается тем, кому он адресован: страж называет первый этап замысла, а не общие слова.
expect_reason() {
    local label="$1" json="$2" want="$3" out
    out="$(printf '%s' "$json" | "$HOOKS/turn-exit-guard.sh" 2>/dev/null | jq -r '.reason // ""' 2>/dev/null)"
    case "$out" in
        *"$want"*) report "$label" "есть:$want" "есть:$want" ;;
        *) report "$label" "нет:$want" "есть:$want" ;;
    esac
}
