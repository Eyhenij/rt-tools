#!/usr/bin/env bash
# rt-hook: PostToolUse Skill
# The record of a loaded rule. PostToolUse on the `Skill` tool.
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
[ -z "$skill" ] && exit 0

dir="${TMPDIR:-/tmp}/claude-skill-gate"
mkdir -p "$dir" 2>/dev/null || exit 0
printf '%s\n' "$skill" >> "$dir/${sid}.loaded" 2>/dev/null

# The same load at a second address — the tree's observations. The record above lives until context
# compaction and dies with it: it answers the gate's question "is it loaded", and nothing else.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/observe.sh" ] && . "$rt_hooks_dir/observe.sh" 2>/dev/null
command -v rt_note >/dev/null 2>&1 && rt_note skill-load "res=$skill" "sid=$sid"

exit 0
