#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/work-start-guard.sh · 6364e25f539a · правится надстройкой, не здесь
# rt-hook: Stop
# Requires: hooks/deny-tail.sh, hooks/profile-check.sh
# Work-start guard: a turn that edited application code does not end unless the owner asked for
# the work in that same turn. Stop.
#
# Why this way. The article "a session does not start work by itself" is held by the executor's
# memory, and held badly: a session opened after a context compaction gets the state of unfinished
# work and the plan with its stages from the startup hook — and both say what to do, if working.
# Whether to work, neither says. A line with a file path sent by the owner is read as an
# assignment, and the session edits fifty files nobody asked it for.
#
# The neighbouring guards do not catch this, and not by oversight: each judges its own matter.
# The plan guard demands a plan on disk — it lies there; the epic guard refuses someone else's
# task — the task is its own; the conversation guard judges a turn in which a question was asked
# — and no question was asked precisely because it was decided not to ask. All three judge the
# subject of the edit and its order, and none asks who ordered this edit.
#
# The request is caught by form, not by meaning. Meaning is invisible to a machine, and a guard
# that took to understanding it would refuse work by mood; so the opposite is judged — what is
# never a request under any reading: an empty message, a single word and a file path. Everything
# else counts as a request, and this is chosen on purpose: a false refusal here costs more than a
# miss — it stops work the owner ordered.
#
# Application code is recognised by the tree's sign `rt_is_app_code` — the same one the plan
# guard recognises it by. A tree that declared no sign does not get this guard: it has nothing to
# judge by.
#
# FAIL-OPEN: no `jq`, no turn transcript, no tree sign, a repeated pass, any error of its own —
# the turn is ALLOWED (exit 0). A broken guard has no right to jam the work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the
# guard itself.
RT_GUARD_NAME=work-start-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated pass over the same turn is not judged: the guard has said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The tree profile: first the package default, over it the project override, if there is one.
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" \
    "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }
rt_needs rt_is_app_code work-start-guard || exit 0

# A turn is everything recorded after the owner's last real input. A tool result arrives under
# the same role, so lines with `tool_result` are not counted as input.
#
# A 400-line tail: the transcript grows all session long, and only the last turn is judged.
asked="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | if $i == null then "" else
        (.[$i].message.content
         | if type == "string" then .
           elif type == "array" then (map(if type == "object" then (.text // "") else tostring end) | join("\n"))
           else "" end)
      end
' 2>/dev/null)"

# No input in the transcript at all — nothing to judge: the turn is allowed.
[ -z "$asked" ] && exit 0

# Files edited during the turn: the edit tools name the path in a field, while a shell command
# would need its own parsing, and there is none here on purpose. The guard judges an explicit file
# edit: a command writing into code past the edit tool remains its known boundary.
edited="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r '
    def is_input:
        .type == "user"
        and ((.isCompactSummary // false) | not)
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then [] else .[$i:] end)
    | [.[] | select(.type == "assistant") | (.message.content // [])[]
        | select(.type == "tool_use")
        | select(.name == "Edit" or .name == "Write" or .name == "MultiEdit" or .name == "NotebookEdit")
        | (.input.file_path // .input.notebook_path // empty)]
    | unique | .[]
' 2>/dev/null)"

[ -z "$edited" ] && exit 0

touched=""
while IFS= read -r path; do
    [ -z "$path" ] && continue
    if rt_is_app_code "$path" 2>/dev/null; then
        touched="$path"
        break
    fi
done <<EOF
$edited
EOF

# No application code was edited during the turn: the guard is silent. Exploration, texts and
# harness go their own way — demanding the owner's word on them would forbid scouting before a
# request.
[ -z "$touched" ] && exit 0

# Never a request under any reading: an empty message, a single word, a file path. The first
# non-empty line of the input is judged: a detailed request is already a request by its first
# line, and a path sent alone does not become one further down either.
first="$(printf '%s' "$asked" | tr -d '\r' | sed -n '/[^[:space:]]/{p;q;}')"
words="$(printf '%s' "$asked" | tr -s '[:space:]' '\n' | grep -c '[^[:space:]]' 2>/dev/null || echo 0)"

case "$first" in
    # A service note about an interruption: there is no request of its own in it.
    '[Request interrupted'*) kind="an interruption" ;;
    *)
        if [ "$words" -le 1 ] 2>/dev/null; then
            case "$first" in
                */*) kind="a path to a file" ;;
                *) kind="one word" ;;
            esac
        else
            kind=""
        fi
        ;;
esac

# There is a request in the turn: the work was ordered, and the guard lets go.
[ -z "$kind" ] && exit 0

reason="BLOCKED by work-start-guard: application code was edited in this turn — «${touched}» — while the last message of the owner was not a request: ${kind}.

A session does not start work by itself. The handover of the previous session, the task state from the startup hook and the assigned epic say what to do if working, and stay silent about whether to work. A line with an address names a file, not an action: read as an order, it gives the session work the owner never ordered.

There is one move from here: name the state of the work to the owner and ask whether to go on — and wait for the answer. What was done in this turn does not roll itself back: say what is already edited.

The guard judges one turn: the next session is not refused."

# The shared deny tail: the two lawful moves. The file may not be laid out — then there is no
# tail, and the reason for the refusal stays the same.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"work-start-guard: code was edited, and there was no request from the owner in this turn."}\n'

exit 0
