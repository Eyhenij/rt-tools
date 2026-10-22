#!/usr/bin/env bash
# Сценарии гарда разговора о списке вариантов после отбитого меню. Набор вынесен из
# `grill-gate.test.sh`, когда тот дорос до предела длины; запись хода собирается так же.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард разговора: список вариантов"

TREE="$(fixture_tree)"
export CLAUDE_PROJECT_DIR="$TREE"
TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TREE" "$TURNS"; }
trap cleanup EXIT

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : > "$path"
    for line in "$@"; do
        printf '%s\n' "$line" >> "$path"
    done
    printf '%s' "$path"
}

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
reply() { jq -c -n --arg t "$1" '{type:"assistant",message:{content:[{type:"text",text:$t}]}}'; }
uses() {
    local input="$2"
    [ -z "$input" ] && input='{}'
    jq -c -n --arg n "$1" --arg i "$input" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:$n,input:($i|fromjson)}]}}'
}
refused() { jq -c -n '{type:"user",message:{content:[{type:"tool_result",is_error:true,content:"BLOCKED: the push is refused"}]}}'; }

input_stop() {
    jq -n --arg p "$1" --argjson a "${2:-false}" '{session_id:"tests",transcript_path:$p,stop_hook_active:$a}'
}
input_ask_text() {
    jq -n --arg p "$1" --arg q "$2" \
        '{session_id:"tests",transcript_path:$p,tool_name:"AskUserQuestion",tool_input:{questions:[{question:$q}]}}'
}

expect_stop() {
    local label="$1" json="$2" want="$3" out got
    out="$(printf '%s' "$json" | "$HOOKS/grill-gate.sh" 2>/dev/null)"
    if [ -z "$out" ]; then
        got="PASS"
    else
        got="$(printf '%s' "$out" | jq -r 'if .decision == "block" then "BLOCK" else "PASS" end' 2>/dev/null)"
    fi
    report "$label" "$got" "$want"
}

LOADED='{"skill":"task-flow"}'

# --- SC-AK-1231 — после отбитого меню список вариантов прозой тоже вопрос --------------------
# Меню отбили за отсутствие строки, исполнитель дал те же варианты нумерованным списком без знака
# вопроса и закончил ход: признак узнавал прозу только по «?».
OPTIONS='Как закоммитить работу задачи:

1. Коммит из рабочего дерева задачи.
2. Перенос правки в основную копию.
3. Ждать слова владельца.'
ONE_OPTION='Что дальше:

1. Перенос правки в основную копию.'

expect_stop "SC-AK-1231 — список вариантов после отбитого меню ход не заканчивает" \
    "$(input_stop "$(transcript \
        "$(say 'закоммить работу')" \
        "$(uses Skill "$LOADED")" \
        "$(uses AskUserQuestion '{"questions":[]}')" "$(refused)" \
        "$(reply "$OPTIONS")")")" BLOCK
expect_stop "SC-AK-1231 — тот же список без отбитого меню не судится" \
    "$(input_stop "$(transcript \
        "$(say 'закоммить работу')" \
        "$(uses Skill "$LOADED")" \
        "$(uses Bash '{"command":"git push"}')" "$(refused)" \
        "$(reply "$OPTIONS")")")" PASS
expect_stop "SC-AK-1231 — один пункт после отбитого меню вопросом не считается" \
    "$(input_stop "$(transcript \
        "$(say 'закоммить работу')" \
        "$(uses Skill "$LOADED")" \
        "$(uses AskUserQuestion '{"questions":[]}')" "$(refused)" \
        "$(reply "$ONE_OPTION")")")" PASS

refusal_text="$(printf '%s' "$(input_ask_text "$(transcript \
        "$(say 'отправь выпуск')" \
        "$(uses Skill "$LOADED")" \
        "$(uses Bash '{"command":"git push"}')" "$(refused)")" \
        'Чинить или ждать?')" | "$HOOKS/grill-gate.sh" 2>/dev/null \
    | jq -r '.hookSpecificOutput.permissionDecisionReason // ""' 2>/dev/null)"
case "$refusal_text" in
    *'does not walk around this refusal'*) got=yes ;;
    *) got=no ;;
esac
report "SC-AK-1231 — отказ меню говорит, что проза его не обходит" "$got" yes

# Итог стоит последней строкой.
suite_result "гард разговора: список вариантов"
