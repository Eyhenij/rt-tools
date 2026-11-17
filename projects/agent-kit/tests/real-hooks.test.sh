#!/usr/bin/env bash
# Сценарии хуков, которые читают запись разговора сами, на срезе настоящей записи 13.11.2026.
#
# Гард перезапуска, гард экзамена, гард совести и гард входа из передачи читают запись своим
# запросом `jq`, а учёт ролей — запись роли. Их решения на срезе сняты и сверены с решениями на
# полной записи в тот же момент: срез, на котором хук решает иначе, краснеет здесь. Срез записи —
# `fixtures/real-record/2026-11-13.jsonl`, записи ролей — `fixtures/real-record/roles/`; режет их
# `real-data/cut-record.mjs`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "хуки на настоящей записи"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CUT="$HERE/fixtures/real-record/2026-11-13.jsonl"
ROLES="$HERE/fixtures/real-record/roles"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# The record up to a moment: a hook judges at a moment, on what was written by then.
AT="$WORK/until.jsonl"
node -e '
const fs = require("fs");
const out = [];
for (const line of fs.readFileSync(process.argv[1], "utf8").split("\n")) {
    if (!line) continue;
    if ((JSON.parse(line).timestamp ?? "") > process.argv[2]) break;
    out.push(line);
}
fs.writeFileSync(process.argv[3], out.join("\n") + "\n");' "$CUT" 2026-11-13T05:40:00Z "$AT"

TREE="$(fixture_tree)"
decision() {
    local out
    out="$(printf '%s' "$2" | CLAUDE_PROJECT_DIR="$TREE" "$HOOKS/$1" 2>/dev/null)"
    if [ -z "$out" ]; then printf 'PASS'; else printf '%s' "$out" | jq -r '.hookSpecificOutput.permissionDecision // "deny"'; fi
}
bash_in() { jq -cn --arg c "$1" --arg p "$AT" '{session_id:"t",tool_name:"Bash",tool_input:{command:$c},transcript_path:$p}'; }

# --- the guards on the record of 05:40, after eleven PRs were opened --------------------------------
report "SC-AK-1601 — rerun-guard: журнал прогона в записи не читался — перезапуск отказан" \
    "$(decision rerun-guard.sh "$(bash_in 'gh run rerun 19123456789')")" "deny"
report "SC-AK-1601 — exam-guard: после открытия PR экзамена не было — снятие черновика отказано" \
    "$(decision exam-guard.sh "$(bash_in 'gh pr ready 3100')")" "deny"
report "SC-AK-1601 — conscience-guard: находки совести в ходе нет — выход пропущен" \
    "$(decision conscience-guard.sh "$(jq -cn --arg p "$AT" '{session_id:"t",hook_event_name:"Stop",stop_hook_active:false,transcript_path:$p}')")" "PASS"
report "SC-AK-1601 — handoff-entry-guard: заход не из передачи — правка пропущена" \
    "$(decision handoff-entry-guard.sh "$(jq -cn --arg p "$AT" --arg f "$TREE/x.ts" '{session_id:"t",tool_name:"Write",tool_input:{file_path:$f,content:"x"},transcript_path:$p}')")" "PASS"

# --- the role metrics on the records of two goal-critic runs ----------------------------------------
verdict_of() {
    local tree
    tree="$(fixture_tree)"
    mkdir -p "$tree/.claude/agents"
    printf -- '---\nname: goal-critic\n---\n\n<!-- rt-kit v0.37.0 · agents/goal-critic.md · abc -->\n' > "$tree/.claude/agents/goal-critic.md"
    jq -cn --arg p "$1" '{session_id:"s",hook_event_name:"SubagentStop",agent_type:"goal-critic",agent_transcript_path:$p}' \
        | CLAUDE_PROJECT_DIR="$tree" "$HOOKS/role-calls.sh"
    cat "$tree/.claude/rt-kit/observations/"*.jsonl 2>/dev/null | jq -r 'select(.ev == "role-verdict") | .verdict'
}
report "SC-AK-1602 — role-calls: «цель достигнута частично» в 07:20 — отказ" \
    "$(verdict_of "$ROLES/goal-critic-07-20.jsonl")" "refused"
# A finding of RT-3277: the report of 11:00 opens with a table, and the word «Достигнуто» in its
# header reads as the pass word. The case names what the hook counts today.
report "SC-AK-1602 — role-calls: шапка таблицы в 11:00 читается как приговор «пройдено» — находка RT-3277" \
    "$(verdict_of "$ROLES/goal-critic-11-00.jsonl")" "passed"

suite_result "хуки на настоящей записи"
