#!/usr/bin/env bash
# Сценарии гарда входа из передачи: заход, начатый с передачи, не правит файлов без правила.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "гард входа из передачи"

TURNS="$(mktemp -d)"
cleanup() { rm -rf "$TURNS"; }
trap cleanup EXIT

transcript() {
    local path
    path="$TURNS/turn-$RANDOM.jsonl"
    : >"$path"
    for line in "$@"; do printf '%s\n' "$line" >>"$path"; done
    printf '%s' "$path"
}

say() { jq -c -n --arg t "$1" '{type:"user",message:{content:[{type:"text",text:$t}]}}'; }
skill() { jq -c -n --arg s "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Skill",input:{skill:$s}}]}}'; }
ran() { jq -c -n --arg c "$1" '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'; }

edit_in() {
    jq -n --arg p "$1" '{session_id:"tests",tool_name:"Edit",tool_input:{file_path:"a.md"},transcript_path:$p}'
}
h() { expect_decision "$1" handoff-entry-guard.sh "$(edit_in "$2")" "$3"; }

h "SC-AK-342 — заход с передачей без правила правку не ведёт" \
    "$(transcript "$(say '.claude/handoff/2026-08-19-x.md — работай по нему')")" deny
h "SC-AK-343 — загруженное правило вход открывает" \
    "$(transcript "$(say '.claude/handoff/2026-08-19-x.md')" "$(skill 'task-flow')")" PASS
h "SC-AK-344 — заход без передачи гардом не судится" \
    "$(transcript "$(say 'почини сборку')")" PASS

# Правило, названное словом «передача захода», ловится наравне с путём к файлу: передачу дают и
# текстом, а не только путём.
h "SC-AK-345 — передача, вставленная текстом, ловится тоже" \
    "$(transcript "$(say 'вот передача захода прошлого агента, продолжай')")" deny

# Чтение правила файлом засчитывается наравне с загрузкой инструментом: путь к нему тот же.
h "SC-AK-346 — чтение правила файлом засчитывается" \
    "$(transcript "$(say 'handoff — работай')" "$(ran 'cat .claude/skills/task-flow/SKILL.md')")" PASS

exit_code_of() {
    printf '%s' "$2" | "$HOOKS/handoff-entry-guard.sh" >/dev/null 2>&1
    report "$1" "код:$?" "код:0"
}
exit_code_of "пустой вход пропускается" ''
exit_code_of "неразбираемый вход пропускается" 'не json'
exit_code_of "записи хода нет — правка проходит" "$(edit_in "$TURNS/нет-такой.jsonl")"

suite_result "гард входа из передачи"
