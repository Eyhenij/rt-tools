#!/usr/bin/env bash
# rt-kit v0.39.1 · hooks/skill-loaded.sh · be9659c2973d · правится надстройкой, не здесь
# rt-hook: PostToolUse Skill|Read
# The record of a loaded rule. PostToolUse on the `Skill` tool and on a read of a rule file.
#
# The gate has to know whether a rule is loaded or not, and it has nobody to ask: the tool does not
# tell about its past calls. So the load is recorded here, per session.
#
# The hook only observes: it always passes and refuses nothing.
#
# FAIL-OPEN: no input, no name of the rule, no way to write the record — the call goes through. The
# record is a note for the gate, not a permission: a rule not written down is demanded a second
# time, and that costs one refusal, not the work.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

sid="$(printf '%s' "$input" | jq -r '.session_id // "nosession"' 2>/dev/null)"
skill="$(printf '%s' "$input" | jq -r '.tool_input.skill // empty' 2>/dev/null)"
# A read of a rule file by the tool `Read` is a load too: the gate names that read for a rule
# longer than the host limit, and for a rule created after the session began the registry of the
# tool `Skill` does not know the name. Only the rule file itself counts, not its companion.
if [ -z "$skill" ]; then
    read_path="$(printf '%s' "$input" | jq -r 'select(.tool_name == "Read") | .tool_input.file_path // empty' 2>/dev/null)"
    rules_dir="${RT_RULES_DIR:-.claude/skills}"
    case "$read_path" in
        */"$rules_dir"/*/SKILL.md)
            skill="${read_path%/SKILL.md}"
            skill="${skill##*/}"
            ;;
    esac
fi
[ -z "$skill" ] && exit 0

# A subagent's load lands in the subagent's own record: its context is not the parent's.
agent="$(printf '%s' "$input" | jq -r '.agent_id // empty' 2>/dev/null)"
dir="${TMPDIR:-/tmp}/claude-skill-gate"
mkdir -p "$dir" 2>/dev/null || exit 0
printf '%s\n' "$skill" >> "$dir/${agent:-$sid}.loaded" 2>/dev/null

# The same load at a second address — the tree's observations. The record above lives until context
# compaction and dies with it: it answers the gate's question "is it loaded", and nothing else.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
command -v rt_note >/dev/null 2>&1 && rt_note skill-load "res=$skill" "sid=$sid"

exit 0
