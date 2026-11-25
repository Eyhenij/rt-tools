#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/skill-gate-rearm.sh · 18639c01785b · правится надстройкой, не здесь
# rt-hook: SessionStart compact|clear
# Re-arming the gate. SessionStart(compact|clear).
#
# The gate remembers a loaded rule by the session id and from then on lets that area through
# silently. Context compaction and clearing take the TEXT of the rule itself out of the context but
# leave the session id as it was — without this hook the gate would keep letting through while the
# agent works from a retelling instead of the rule itself.
#
# Removing the record makes every area load its rule again.
#
# FAIL-OPEN: any error passes. The hook removes a temporary file and refuses nothing.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // empty' 2>/dev/null)"
[ -z "$sid" ] && exit 0

record="${TMPDIR:-/tmp}/claude-skill-gate/${sid}.loaded"

# The names the session had loaded are read before the record is removed. The gate asks for one rule
# per refusal, and a session that does not know which rules it had loaded meets them one refusal at
# a time: one edit after a compaction went through six refusals in a row. An empty or missing record
# gives no names, and the line stays as it was.
#
# The gate puts a rule within the host limit into the session itself at the next edit of its area,
# so only the rules longer than the limit are named: asking to load the rest in one turn is the
# round the delivery removed.
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
over=""
if [ -s "$record" ]; then
    while IFS= read -r name; do
        [ -z "$name" ] && continue
        name="${name##*:}"
        case ", $over, " in *", $name, "*) continue ;; esac
        command -v rt_fact_rule_deliverable >/dev/null 2>&1 && rt_fact_rule_deliverable "$name" "$sid" && continue
        [ -f "${CLAUDE_PROJECT_DIR:-.}/${RT_RULES_DIR:-.claude/skills}/$name/SKILL.md" ] || continue
        over="${over}${over:+, }${name}"
    done < "$record"
fi

rm -f "$record" 2>/dev/null

# The re-arming is told to the session in words.
#
# A silent re-arming reads as breakage: the compaction summary says the rules were already loaded,
# the gate answers that they were not — and the session spends a turn finding out which of the two
# is right. A turn was spent that way four times in one session. The line removes the contradiction:
# the rule text is no longer in the context, which is why it is asked for again.
context="The rules gate is armed anew: the compaction carried the text of the rules themselves out of the session. Every rule within the host limit comes back by itself, whole, at the next edit of its area — the gate puts it into the session. Where the rules of one edit do not fit the limit together, the gate delivers as many as fit in the order of the map and refuses the edit for the rest, naming them. The rules of the grill and of a plan are the exception: they are read by the tool Skill before the document is written, and the write without them is refused."
if [ -n "$over" ]; then
    context="${context} Longer than the host limit, and so not delivered: ${over}. Load these by the tool Skill, or read their SKILL.md by the tool Read, before the first edit of their area."
fi

jq -n --arg c "$context" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}' 2>/dev/null

exit 0
