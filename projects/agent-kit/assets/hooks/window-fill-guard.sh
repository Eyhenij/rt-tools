#!/usr/bin/env bash
# rt-hook: PostToolUse .*
# Requires: hooks/profile-check.sh, hooks/deny-tail.sh
# rt-hook: PreToolUse .*
# Window fill: the session is brought to a logical point in advance, not cut off in the middle.
#
# Why exactly this way. The place where the executor remembers the progress of the work is limited,
# and having filled it, the executor loses not the last action but the whole picture at once. From
# inside the session this limit is visible by nothing: no check of the tree shows it, and context
# compaction fires when there is nothing left to bring the work to a point with.
#
# The guard stands on two events at once — splitting it over two files would mean keeping two
# parses of one record and two places where one threshold is edited:
#   PostToolUse — at the first threshold it gives a reminder: time to choose a stopping point;
#   PreToolUse  — at the second it refuses everything but writing the progress, the handover
#                 and the delivery commands.
# The space between the thresholds is what the session closes on: finish the progress, write the
# handover, commit what has been checked.
#
# Where the tree has declared the compaction threshold below the stopping threshold, the reminder
# says the opposite: there is no need to choose a stopping point, because the session will pass the
# threshold by itself — compaction comes first, a hook of its own will have written the handover by
# then, and the work goes on within the same session. The refusal stays at that: it turns from the
# end of the session into insurance for the case when compaction did not come. A reminder that
# calls for closing the session where it need not be closed is a stop of the work without a reason,
# and it costs exactly as much as a refusal.
#
# The size of the window is taken from the tree setting. It is not derived from the session record:
# the model is recorded there without a mark about an extended window, and a session on a wide
# window is indistinguishable from a session on a narrow one.
#
# FAIL-OPEN: no window size, no session record, no parser, a broken parse — the work is ALLOWED
# (exit 0). A broken guard has no right to jam the work.

# Its own name in the observations: the refusal is written by the shared deny tail, not by the guard.
RT_GUARD_NAME=window-fill-guard

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# The tree profile: the window size, the thresholds, the directories of tasks and of the handover.
# A tree that has not set the window size gets no guard — there is nothing to count the share from.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that exited silently is indistinguishable from a
# working one. The file may not be laid out — then the former, silent behaviour stays.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

window="${RT_WINDOW_TOKENS:-}"
case "$window" in
    '' | *[!0-9]*) exit 0 ;;
esac
[ "$window" -gt 0 ] 2>/dev/null || exit 0

warn_pct="${RT_WINDOW_WARN_PCT:-40}"
stop_pct="${RT_WINDOW_STOP_PCT:-50}"

# The share at which the tool compacts the context itself. Declared by the tree — the session
# passes the threshold by itself: compaction comes first, a hook of its own has written the
# handover by then, and the work goes on within the same session. Not declared — the former order:
# the session ends with a handover.
#
# The text of the reminder depends on this, not the refusal. The refusal at the stopping threshold
# stays in both cases: it is the insurance for when compaction did not come — the setting was
# removed, the version is another, compaction failed. Taking the refusal away from a tree that
# declared compaction, the guard would let such a session run to the limit of the window, where the
# work is lost whole.
compact_pct="${CLAUDE_AUTOCOMPACT_PCT_OVERRIDE:-}"
case "$compact_pct" in
    '' | *[!0-9]*) compact_pct='' ;;
esac
[ -n "$compact_pct" ] && [ "$compact_pct" -ge "$stop_pct" ] 2>/dev/null && compact_pct=''

tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
handoff_dir="${RT_HANDOFF_DIR:-.claude/handoff}"

event="$(printf '%s' "$input" | jq -r '.hook_event_name // empty' 2>/dev/null)"
transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -n "$transcript" ] || exit 0
[ -f "$transcript" ] || exit 0

# The fill is the last usage record of a reply: the input, the one-off write into the cache, what
# was read from the cache and the output. A sum over all the records will not do at all here — what
# was read from the cache repeats in each of them, and the sum comes out several times the window.
#
# A tail of 200 lines: the session record grows all session, and one last line of it is what is
# needed.
fill="$(tail -n 200 "$transcript" 2>/dev/null | jq -s -r '
    [.[] | select(.type == "assistant") | .message.usage | select(. != null)]
    | last
    | if . == null then empty
      else ((.input_tokens // 0) + (.cache_creation_input_tokens // 0)
            + (.cache_read_input_tokens // 0) + (.output_tokens // 0))
      end
' 2>/dev/null)"

case "$fill" in
    '' | *[!0-9]*) exit 0 ;;
esac

pct=$((fill * 100 / window))
fill_k=$((fill / 1000))
window_k=$((window / 1000))

# --- the first threshold: a reminder, the work is not refused ----------------------------

if [ "$event" = "PostToolUse" ]; then
    [ "$pct" -ge "$warn_pct" ] || exit 0

    # The reminder repeats not on every call but on each next step of five per cent: otherwise it
    # takes up the very place it saves.
    step=$(((pct / 5) * 5))
    session="$(printf '%s' "$input" | jq -r '.session_id // "unknown"' 2>/dev/null)"
    mark_dir="${TMPDIR:-/tmp}/claude-window-fill"
    mark="$mark_dir/$session.step"
    mkdir -p "$mark_dir" 2>/dev/null
    last="$(cat "$mark" 2>/dev/null)"
    case "$last" in
        '' | *[!0-9]*) last=0 ;;
    esac
    [ "$step" -gt "$last" ] || exit 0
    printf '%s' "$step" > "$mark" 2>/dev/null

    if [ "$pct" -ge "$stop_pct" ]; then
        if [ -n "$compact_pct" ]; then
            text="WINDOW FILL ${pct}% (${fill_k}k of ${window_k}k) — the session closes now. The compaction was announced at ${compact_pct}% and did not come: the stop threshold ${stop_pct}% is passed and the context is the same. Everything but writing the progress, the handover and the commands of delivery is already refused — close the session and tell the owner the compaction did not work."
        else
            text="WINDOW FILL ${pct}% (${fill_k}k of ${window_k}k) — the session closes now. Everything but writing the progress, the handover and the commands of delivery is already refused."
        fi
    elif [ -n "$compact_pct" ]; then
        text="WINDOW FILL ${pct}% (${fill_k}k of ${window_k}k). There is no stopping point to choose: at ${compact_pct}% the tool compacts the context itself, the hook writes the handover by then, and the work goes on in this same session. The stop threshold ${stop_pct}% is the insurance in case the compaction does not come. Work on."
    else
        text="WINDOW FILL ${pct}% (${fill_k}k of ${window_k}k). It is time to choose the stopping point: from ${stop_pct}% only closing the session is left. Bring the current step to a state the next session continues from, rewrite «Where we stand» in the progress, write the handover and give the owner the path to it — the pattern task-flow-handoff."
    fi

    jq -n --arg t "$text" \
        '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$t}}' 2>/dev/null
    exit 0
fi

# --- the second threshold: work is refused, closing the session passes --------------------

[ "$event" = "PreToolUse" ] || exit 0
[ "$pct" -ge "$stop_pct" ] || exit 0

tool="$(rt_hook_tool)"
path="$(rt_hook_file)"
cmd="$(rt_hook_cmd)"

allowed=0
case "$tool" in
    # The conversation with the owner and reading what is edited at the closing.
    AskUserQuestion | TodoWrite | Read | SendUserFile)
        allowed=1
        ;;
    Edit | Write | MultiEdit | mcp__webstorm__create_new_file)
        # The progress and the handover. The rest is work, and the session no longer starts it.
        case "$path" in
            "$tasks_dir"/* | */"$tasks_dir"/* | "$handoff_dir"/* | */"$handoff_dir"/* | */scratchpad/*) allowed=1 ;;
        esac
        ;;
    Bash | mcp__webstorm__execute_terminal_command)
        # Delivery and checks: commit, push, PR, the task column, the state of the tree. The list
        # is added to by the tree profile — the hosting client and the command names differ from
        # tree to tree.
        if rt_needs rt_handoff_allowed_cmd window-fill-guard && rt_handoff_allowed_cmd "$cmd"; then
            allowed=1
        fi
        ;;
esac

[ "$allowed" -eq 1 ] && exit 0

reason="BLOCKED by window-fill-guard: window fill ${pct}% (${fill_k}k of ${window_k}k), the stop threshold is ${stop_pct}%. The session works no further — it closes.

What is left to do in this session:
1. Rewrite the section «Where we stand» in the progress and add a session entry — what was done, what confirms it, what did not work out.
2. Commit what is checked: what is not committed does not survive the break.
3. Write the handover into ${handoff_dir}/ and give the owner the path to it — what goes into it is said by the pattern task-flow-handoff.

What passes after the threshold:
- an edit of ${tasks_dir}/** and ${handoff_dir}/**, a read of any file, a question to the owner;
- a command starting with a word of delivery or verification: git, the client of the hosting, moving a column, npm run check:*.

A command is judged by the start of the line: entering a directory before it removes the match, and the very commit that would have passed without it is refused. Start the command with the word of delivery itself."

# The shared deny tail: the two lawful moves and the lawful form of bypass, if the refusal has one.
# The file may not be laid out — then there is no tail, and the reason for the refusal stays as it
# was.
# shellcheck disable=SC1090
[ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" ] \
    && . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null \
    || printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"window-fill-guard: the window is full, the session closes with a handover."}}\n'

exit 0
