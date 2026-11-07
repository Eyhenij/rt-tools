#!/usr/bin/env bash
# rt-hook: PostToolUse Agent|Task
# rt-hook: UserPromptSubmit
# Requires: hooks/hook-input.sh, hooks/observe.sh
#
# Counts the calls of roles and commands for the package metrics. A role nobody calls is judged the
# same way as a rule nobody loads, and only the host sees the call.
#
# WHAT IS RECORDED. The name of a package role or command, and a constant word for what is the tree's
# own: its name may name the tree, and an observation leaves it. A role is the package's when its
# laid-out file carries the layout header. A built-in role has no file and is not counted.
#
# THE VERDICT. A role that gives one says it in its first line, and the table below is the whole
# knowledge about it: the words of a refusal, in both languages a role answers in. A role outside the
# table is counted by calls. Only the answer goes into the record, the text stays where it is.
#
# FAIL-OPEN: no input, no parser, no record — exit with zero and no output. This hook never refuses.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || exit 0
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/observe.sh" 2>/dev/null || exit 0

rt_hook_read
[ -n "$RT_HOOK_INPUT" ] || exit 0
command -v jq >/dev/null 2>&1 || exit 0

root="${CLAUDE_PROJECT_DIR:-.}"
sid="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.session_id // empty' 2>/dev/null)"

# The name a resource goes under: its own for the package, a constant word for the tree. Empty — the
# host's built-in, with no file at all.
rt_called_name() {
    local file="$1" name="$2"
    [ -f "$file" ] || return 0
    if head -n 3 "$file" 2>/dev/null | grep -q 'rt-kit v'; then
        printf '%s' "$name"
    else
        printf 'tree-own'
    fi
}

# The words of a verdict by role: the refusal first, because it holds the words of a pass. No line —
# the role gives no verdict the report counts.
rt_refusal_words() {
    case "$1" in
        goal-critic) printf '%s' 'not met|partly met|не достигнут|не выполнен|частично' ;;
        product-strategist) printf '%s' 'does not reach|longer route|не достигает|не ведёт|длинн' ;;
    esac
}
rt_pass_words() {
    case "$1" in
        goal-critic) printf '%s' 'is met|достигнут|выполнен' ;;
        product-strategist) printf '%s' 'reaches|достигает|ведёт' ;;
    esac
}

# The verdict by the first line of the answer. A role sent to the background answers with the fact of
# its launch, and that is neither word: such a call counts as a call, not as a pass.
rt_verdict_of() {
    local refusal pass line
    refusal="$(rt_refusal_words "$1")"
    pass="$(rt_pass_words "$1")"
    [ -n "$refusal" ] || return 0
    line="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '
        .tool_response // empty
        | if type == "string" then .
          elif (type == "object" and (.content | type) == "array") then (.content | map(.text? // "") | join("\n"))
          else "" end' 2>/dev/null | awk 'NF { print; exit }')"
    if printf '%s' "$line" | grep -qiE "$refusal"; then
        printf 'refused'
    elif printf '%s' "$line" | grep -qiE "$pass"; then
        printf 'passed'
    fi
}

prompt="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.prompt // empty' 2>/dev/null)"
if [ -n "$prompt" ]; then
    case "$prompt" in
        /*) ;;
        *) exit 0 ;;
    esac
    command="$(printf '%s' "$prompt" | sed -E 's#^/([A-Za-z0-9_-]+).*#\1#' | head -n 1)"
    name="$(rt_called_name "$root/.claude/commands/$command.md" "$command")"
    [ -z "$name" ] || rt_note command-call "res=$name" "sid=$sid"
    exit 0
fi

role="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.tool_input.subagent_type // empty' 2>/dev/null)"
[ -n "$role" ] || exit 0
name="$(rt_called_name "$root/.claude/agents/$role.md" "$role")"
[ -n "$name" ] || exit 0

rt_note role-call "res=$name" "sid=$sid" "verdict=$(rt_verdict_of "$name")"
exit 0
