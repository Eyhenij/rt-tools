#!/usr/bin/env bash
# The scenarios of the open-epic guard: while the epic has an unfinished task, a turn does not end
# without a lawful reason — and every lawful reason releases it.
#
# The guard is run for real on a one-off repository with a substituted epic table and a written
# turn record: the scenarios do not touch the network.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the guard of the open epic"

GUARD="${RT_GUARD_PATH:-$TOOLS/../.claude/hooks/work-continues-guard.sh}"

# The run may be started from under the dispatcher of a live session: the guard must judge the
# fixture, not the input of that session.
unset RT_HOOK_INPUT RT_HOOK_TOOL RT_HOOK_CMD RT_HOOK_FILE RT_HOOK_CWD RT_HOOK_PARSED CLAUDE_PROJECT_DIR
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE

REPO="$(mktemp -d)"
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT

git -C "$REPO" init -q 2>/dev/null
git -C "$REPO" config commit.gpgsign false 2>/dev/null
git -C "$REPO" checkout -q -b RT-1-probe 2>/dev/null
mkdir -p "$REPO/tools" "$REPO/docs/tasks/RT-1-probe" "$REPO/.claude"
printf '{"layout":{"checks":"tools"}}\n' > "$REPO/.claude/rt-kit.json"

# The substituted epic table: what it prints on `--unfinished` is the scenario's epic state.
epic_left() {
    printf '#!/usr/bin/env node\nprocess.stdout.write(%s);\n' "'$1'" > "$REPO/tools/epic-table.mjs"
}
epic_unreadable() {
    printf '#!/usr/bin/env node\nprocess.exit(1);\n' > "$REPO/tools/epic-table.mjs"
}

progress_is() {
    printf '# Progress\n\n## Where we stand\n\n- **State:** `этап-идёт`\n- **Next step:** write the store\n- **Waiting for the owner:** %s\n' "$1" > "$REPO/docs/tasks/RT-1-probe/progress.md"
}

# The turn record: an owner's line, then what the turn did, then the reply.
TRANSCRIPT="$REPO/turn.jsonl"
turn_begin() {
    jq -nc --arg t "$1" '{type:"user",message:{role:"user",content:$t}}' > "$TRANSCRIPT"
}
turn_tool() {
    jq -nc --arg n "$1" --arg c "${2:-}" '{type:"assistant",message:{role:"assistant",content:[{type:"tool_use",name:$n,input:{command:$c}}]}}' >> "$TRANSCRIPT"
    jq -nc --arg r "${3:-ok}" '{type:"user",message:{role:"user",content:[{type:"tool_result",content:$r}]}}' >> "$TRANSCRIPT"
}
turn_say() {
    jq -nc --arg t "$1" '{type:"assistant",message:{role:"assistant",content:[{type:"text",text:$t}]}}' >> "$TRANSCRIPT"
}

stop_input() {
    jq -nc --arg p "$TRANSCRIPT" --arg d "$REPO" --argjson a "${1:-false}" \
        '{session_id:"tests",transcript_path:$p,cwd:$d,stop_hook_active:$a}'
}

verdict() {
    local out
    out="$(printf '%s' "$(stop_input "${1:-false}")" | bash "$GUARD" 2>/dev/null)"
    if [ -z "$out" ]; then
        printf 'PASS'
    else
        printf '%s' "$out" | jq -r '.decision // "PASS"' 2>/dev/null
    fi
}

# --- the epic is open: a stop without a reason is refused --------------------------------------
epic_left '2 3'
progress_is 'no'

turn_begin 'сделай хранилище'
turn_say 'Готово: хранилище написано, дальше операции приёма.'
report "a report without work is refused" "$(verdict)" block

turn_begin 'сделай хранилище'
turn_tool Edit
turn_tool Bash 'git commit -m x'
report "a turn that ended with work is refused all the same" "$(verdict)" block

turn_begin 'сделай хранилище'
turn_tool Edit
turn_say 'Сделано.'
report "the second pass over the turn is judged too" "$(verdict true)" block

turn_begin 'сделай хранилище'
turn_say 'Ready.'
out="$(printf '%s' "$(stop_input)" | bash "$GUARD" 2>/dev/null | jq -r '.reason' 2>/dev/null)"
if printf '%s' "$out" | grep -q '2 3' && printf '%s' "$out" | grep -q 'write the store'; then got=yes; else got=no; fi
report "the refusal names the unfinished tasks and the next step" "$got" yes

# --- the lawful exits release the turn ---------------------------------------------------------
turn_begin 'сделай хранилище'
turn_tool AskUserQuestion
report "a question by the tool releases" "$(verdict)" PASS

turn_begin 'сделай хранилище'
turn_tool Edit '' 'Refused by the rules gate: load the rule'
report "a refusal of a guard as the last action releases" "$(verdict)" PASS

turn_begin 'сделай хранилище'
turn_tool Edit '' 'Refused by the rules gate: load the rule'
turn_tool Skill
turn_tool Edit '' 'ok'
turn_say 'Готово.'
report "a refusal lifted in the middle of the turn is not an exit" "$(verdict)" block

# A loaded rule comes back as a user message marked as meta: it is neither the start of a turn nor
# the owner's word, whatever the rule's text says.
turn_begin 'сделай хранилище'
jq -nc '{type:"user",isMeta:true,message:{role:"user",content:[{type:"text",text:"Base directory for this skill: x\n\nA turn ends... стоп, подожди, не двигайся"}]}}' >> "$TRANSCRIPT"
turn_say 'Готово.'
report "a loaded rule is not read as the owner's word" "$(verdict)" block

turn_begin 'стой, дальше не двигайся'
turn_say 'Стою.'
report "the owner's word about stopping in the turn releases" "$(verdict)" PASS

turn_begin 'не двигайся дальше пока я не скажу'
turn_say 'Стою.'
report "«не двигайся дальше» is the owner's word too" "$(verdict)" PASS

turn_begin 'работай без остановок до утра'
turn_say 'Работаю.'
report "the standing word to work is not a stop" "$(verdict)" block

turn_begin 'сделай хранилище'
turn_say 'Готово.'
progress_is 'the word to go on with stage 2 — «не двигайся дальше пока я не скажу»'
report "the owner's word quoted in the progress releases" "$(verdict)" PASS
progress_is 'the word to go on with stage 2'
report "a retelling without a quote does not release" "$(verdict)" block
progress_is 'no'

printf '\n## Handover of the session\n\n### Where we stand at the minute of the compaction\n' >> "$REPO/docs/tasks/RT-1-probe/progress.md"
report "a written handover releases" "$(verdict)" PASS
progress_is 'no'

# A line of the hook's own feedback is not the owner's word, whatever it says.
turn_begin 'Stop hook feedback: BLOCKED by turn-exit-guard: стоп, подожди'
turn_say 'Готово.'
report "the hook feedback is not read as the owner's word" "$(verdict)" block

turn_begin 'сделай хранилище'
turn_say 'Готово.'
turn_begin 'Stop hook feedback:
BLOCKED by turn-exit-guard: the next step is written in the progress: остановлен словом владельца «не двигайся дальше»'
turn_say 'Продолжаю.'
report "a quoted stop word inside the feedback does not release either" "$(verdict true)" block

# --- the epic decides --------------------------------------------------------------------------
turn_begin 'сделай хранилище'
turn_say 'Готово.'
epic_left ''
report "the epic is over — the stop is lawful" "$(verdict)" PASS

epic_unreadable
report "no epic behind the branch or no way to ask — fail-open" "$(verdict)" PASS

rm -f "$REPO/tools/epic-table.mjs"
report "no epic table at all — fail-open" "$(verdict)" PASS

suite_result "the guard of the open epic"
