#!/usr/bin/env bash
# Сценарии хука конца хода `hooks/record-turn.sh`: он считает ход по записи разговора и пишет
# наблюдения для метрик результата работы.
#
# Хук читает запись с места, где остановился прошлый раз, оставляет недописанную последнюю строку
# следующему ходу, пропускает и считает битую строку и никогда не роняет ход. Набор гонит хук на
# записях-заготовках в своём дереве и читает его наблюдения.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "хук конца хода по записи"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
TREE="$WORK/tree"
mkdir -p "$TREE"
RECORD="$WORK/session.jsonl"

run_hook() {
    printf '{"hook_event_name":"%s","session_id":"s1","transcript_path":"%s"}' "$1" "$2" |
        (cd "$TREE" && CLAUDE_PROJECT_DIR="$TREE" bash "$HOOKS/record-turn.sh")
    printf '%s' "$?"
}
events() { cat "$TREE"/.claude/rt-kit/observations/*.jsonl 2>/dev/null | jq -r "select(.ev == \"$1\") | .ev" | wc -l | tr -d ' '; }

call='{"type":"assistant","uuid":"c1","sessionId":"s1","gitBranch":"RT-1-x","timestamp":"2026-11-13T10:00:00Z","message":{"role":"assistant","content":[{"type":"tool_use","id":"t1","name":"Bash","input":{"command":"ls"}}]}}'
refusal='{"type":"user","uuid":"r1","sessionId":"s1","gitBranch":"RT-1-x","timestamp":"2026-11-13T10:00:01Z","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","is_error":true,"content":"PreToolUse:Bash hook error: BLOCKED by task-flow: x"}]}}'
stop='{"type":"user","uuid":"s9","sessionId":"s1","gitBranch":"RT-1-x","timestamp":"2026-11-13T10:01:00Z","message":{"role":"user","content":"Stop hook feedback:\nBLOCKED by turn-exit-guard: x"}}'

# --- an unfinished last line ---------------------------------------------------------------------------
printf '%s\n%s' "$call" "${refusal:0:60}" > "$RECORD"
run_hook Stop "$RECORD" > /dev/null
first="$(events record-call):$(events record-refusal)"
printf '%s\n' "${refusal:60}" >> "$RECORD"
run_hook Stop "$RECORD" > /dev/null
report "SC-AK-1641 — недописанная последняя строка ждёт следующего хода" "$first $(events record-call):$(events record-refusal)" "1:0 1:1"

# --- a broken line in the middle -----------------------------------------------------------------------
rm -rf "$TREE/.claude"
printf '%s\n{broken\n%s\n' "$call" "$refusal" > "$RECORD"
code="$(run_hook Stop "$RECORD")"
report "SC-AK-1642 — битая строка посередине пропущена и сосчитана, обе целые — сосчитаны" \
    "$code $(events record-call):$(events record-refusal):$(events record-skip)" "0 1:1:1"

# --- a record that cannot be read ----------------------------------------------------------------------
rm -rf "$TREE/.claude"
code="$(run_hook Stop "$WORK/missing.jsonl")"
report "SC-AK-1629 — счёт не роняет ход: нечитаемая запись — наблюдение о сбое" "$code $(events record-broken)" "0 1"

# --- the stop refusal of the last turn at the session end -----------------------------------------------
rm -rf "$TREE/.claude"
printf '%s\n%s\n' "$call" "$refusal" > "$RECORD"
run_hook Stop "$RECORD" > /dev/null
printf '%s\n' "$stop" >> "$RECORD"
run_hook SessionEnd "$RECORD" > /dev/null
run_hook SessionEnd "$RECORD" > /dev/null
report "SC-AK-1643 — отказ конца хода последнего хода сосчитан концом сессии один раз" \
    "$(cat "$TREE"/.claude/rt-kit/observations/*.jsonl | jq -r 'select(.ev == "record-refusal") | .kind' | sort | tr '\n' ' ')" "hook stop "

# --- taking a task ----------------------------------------------------------------------------------------
# The first entry of the session on the branch of a task is its taking; a later turn on the same
# branch writes none, a branch of another task writes its own.
rm -rf "$TREE/.claude"
printf '%s\n%s\n' "$call" "$refusal" > "$RECORD"
run_hook Stop "$RECORD" > /dev/null
printf '%s\n' "${call//RT-1-x/RT-2-y}" | sed 's/10:00:00Z/11:00:00Z/; s/"c1"/"c2"/' >> "$RECORD"
run_hook Stop "$RECORD" > /dev/null
report "SC-AK-1622 — взятие задачи: первая запись сессии на ветке, по одной на задачу" \
    "$(cat "$TREE"/.claude/rt-kit/observations/*.jsonl | jq -r 'select(.ev == "task-taken") | .task + "@" + .t' | tr '\n' ' ')" \
    "RT-1@2026-11-13T10:00:00Z RT-2@2026-11-13T11:00:00Z "

suite_result "хук конца хода по записи"
