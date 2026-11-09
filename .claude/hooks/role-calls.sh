#!/usr/bin/env bash
# rt-kit v0.36.0 · hooks/role-calls.sh · 5e0580a1d2de · правится надстройкой, не здесь
# rt-hook: PostToolUse Agent|Task
# rt-hook: UserPromptSubmit
# rt-hook: SubagentStop
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
# table is counted by calls. Only the answer goes into the record, the text stays where it is. It is
# read when the role ends, not when it is called: a role usually runs in the background, and at the
# call its answer is only the fact of the launch.
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
    # The layout header stands after the front matter of the file, so the top lines are not enough.
    if head -n 12 "$file" 2>/dev/null | grep -q 'rt-kit v'; then
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

# The answer of a role. A role that hands its report back by a tool ends with no text, so the host
# gives the event an empty last message, and the answer is the last report in its record.
rt_role_answer() {
    local answer path
    answer="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.last_assistant_message // empty' 2>/dev/null)"
    if [ -n "$answer" ]; then
        printf '%s' "$answer"
        return 0
    fi
    path="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.agent_transcript_path // empty' 2>/dev/null)"
    [ -f "$path" ] || return 0
    tail -n 20 "$path" 2>/dev/null \
        | jq -c 'select(.message.content? | type == "array") | .message.content[]
                 | select(.type? == "tool_use" and .name? == "SubagentHandback") | .input.message // empty' 2>/dev/null \
        | tail -n 1 | jq -r '.' 2>/dev/null
}

# The verdict by the first line of the answer of the role. Neither word — no verdict.
rt_verdict_of() {
    local refusal pass line
    refusal="$(rt_refusal_words "$1")"
    pass="$(rt_pass_words "$1")"
    [ -n "$refusal" ] || return 0
    line="$(rt_role_answer | awk 'NF { print; exit }')"
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

# A role that ended: only the verdict is written here, the call was counted when it was made. The
# event is asked by name: a call made inside a role carries the type of that role too.
if [ "$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.hook_event_name // empty' 2>/dev/null)" = SubagentStop ]; then
    ended="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.agent_type // empty' 2>/dev/null)"
    name="$(rt_called_name "$root/.claude/agents/$ended.md" "$ended")"
    verdict="$(rt_verdict_of "$name")"
    [ -z "$verdict" ] || rt_note role-verdict "res=$name" "sid=$sid" "verdict=$verdict"
    exit 0
fi

role="$(printf '%s' "$RT_HOOK_INPUT" | jq -r '.tool_input.subagent_type // empty' 2>/dev/null)"
[ -n "$role" ] || exit 0
name="$(rt_called_name "$root/.claude/agents/$role.md" "$role")"
[ -n "$name" ] || exit 0

rt_note role-call "res=$name" "sid=$sid"
exit 0
