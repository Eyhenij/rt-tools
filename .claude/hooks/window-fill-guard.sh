#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/window-fill-guard.sh · dd1061744647 · правится надстройкой, не здесь
# rt-hook: PostToolUse .*
# Requires: checks/decide.mjs, hooks/decide.sh, hooks/facts.sh, hooks/profile-check.sh, hooks/deny-tail.sh
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
RT_GUARD_RULE=turn-conduct

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
# shellcheck disable=SC1091
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
transcript="$(rt_fact_transcript "$input")"
[ -n "$transcript" ] || exit 0
[ -f "$transcript" ] || exit 0

# The fill is the last usage record of a reply: the input, the one-off write into the cache, what
# was read from the cache and the output. A sum over all the records will not do at all here — what
# was read from the cache repeats in each of them, and the sum comes out several times the window.
#
# A tail of 200 lines: the session record grows all session, and one last line of it is what is
# needed.
fill="$(rt_fact_window_fill "$transcript")"

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

# A mark for the turn exit guard: past this threshold the next step of work is refused here, so
# the exit guard must not name it — the session closes by the progress and the handover.
stop_sid="$(printf '%s' "$input" | jq -r '.session_id // "unknown"' 2>/dev/null)"
stop_file="$(rt_fact_window_stop_file "$stop_sid")"
mkdir -p "$(dirname "$stop_file")" 2>/dev/null && : >"$stop_file" 2>/dev/null

tool="$(rt_hook_tool)"
path="$(rt_hook_file)"
cmd="$(rt_hook_cmd)"

allowed=0
case "$tool" in
    # The conversation with the owner and reading what is edited at the closing. Loading a rule is
    # reading too: the closing edits need their rules, and the rules gate refuses them until then.
    AskUserQuestion | TodoWrite | Read | SendUserFile | Skill)
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

# The decision, the move and the text come from the decision table; the action is the class of
# this call. The first named move is the progress edit, and the rules gate refuses it while the rule
# of the course of work is not loaded: that is the fact the table tells the two texts apart by.
facts="$(jq -cn --arg r "$(rt_fact_rule_loaded "${RT_TASK_FLOW_RULE:-task-flow}" "$stop_sid")" \
    '{window_over_stop:"yes", rule_loaded:$r}')"
# shellcheck disable=SC1091
. "$rt_hooks_dir/decide.sh" 2>/dev/null
command -v rt_decide >/dev/null 2>&1 && rt_decide window-fill-guard.sh "?work_call" "$facts" '{}' PreToolUse "$input"
exit 0
