#!/usr/bin/env bash
# rt-hook: Stop
# Requires: hooks/deny-tail.sh
# The cargo mark guard: a turn that took a cargo record into work or handed over the work on it
# does not end while the record's state in the intake is not moved. Stop.
#
# Why exactly so. The rule of sorting out the cargo demands two marks: "in work" — by the same turn
# that creates a task for the record, and "done" — when the edit is merged. Both requirements were
# held by the executor's memory and for exactly that reason were not held: in one session five
# tasks were created by cargo records and not one mark was set, and the owner saw an intake where
# two hundred records stand new while the work is done.
#
# The rule itself said there would be no check for this. That is true about the sorting out — the
# decision "there will be no work on the record" leaves no trace — and untrue about taking into
# work: taking has a trace, and it is machine-readable. The task folder sample demands that the
# keys of cargo records be named in the grill in full, "as the intake read prints them"; so the
# link "task — record" lies on the disk.
#
# One moment is judged — the handing over of the work — rather than every turn. A guard asking for
# a mark on every turn would refuse the work itself.
#
# There is no taking into work here on purpose, and that is no easing. The state "in work" is set
# on its own record by the tree that owns it; a foreign record is moved only by the publisher's
# closing, and that accepts two states — "done" and "released" — because "in work" speaks of work
# the tree leads. The cargo arrives from neighbours, and a demand to mark the taking of a foreign
# record would be a demand to do the impossible: a session would run into it on every task from
# the cargo. Handing over the work has no such fork — both roads there lead into "done".
#
# A REFUSAL IN FAVOUR OF THE WORK: no `jq`, no turn record, no task folder, no keys in the grill,
# no mark command in the profile, a repeated approach, any error of its own — the turn is ALLOWED
# (exit 0). A broken guard has no right to jam the work.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

# A repeated approach on the same turn is not judged: the guard said its word once and lets go.
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
[ "$active" = "true" ] && exit 0

transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
[ -z "$transcript" ] && exit 0
[ -f "$transcript" ] || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="${CLAUDE_PROJECT_DIR:-.}"

# The tree's profile: first the package default, over it the project's override, if there is one.
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" \
    "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# The mark command is the tree's own. Set empty, it is the tree's refusal of the requirement: a
# tree that carries no cargo is not forced into this guard.
mark_cmd="${RT_CARGO_MARK_CMD-npm run cargo:mark}"
[ -z "$mark_cmd" ] && exit 0

tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
branch="$(git -C "$root" branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0

# The keys of cargo records lie in the grill of the task folder. The folder may already have left
# by the taking apart — then the branch history reads it: handing over the work is judged exactly
# after the clean-up.
grill="$tasks_dir/$branch/grill.md"
text="$(cat "$root/$grill" 2>/dev/null)"
[ -z "$text" ] && text="$(git -C "$root" show "HEAD:$grill" 2>/dev/null)"
[ -z "$text" ] && exit 0

# The sign of a cargo record is what the mark command calls it by: the full mark key or the sign in
# the intake. Eight characters are not enough, and a short sign does not count as a key: a mark
# with it is refused by the intake with the line "the tree has no such record", and demanding it
# would mean driving the executor after a refusal.
keys="$(printf '%s' "$text" \
    | grep -ohE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{64}|[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.md' 2>/dev/null \
    | sort -u)"
[ -z "$keys" ] && exit 0

# A turn is everything written after the last real input of the owner. A tool's answer comes by the
# same role, so lines with `tool_result` do not count as input.
#
# A tail of 400 lines: the turn record grows the whole session, and only the last turn is judged.
verdict="$(tail -n 400 "$transcript" 2>/dev/null | jq -s -r --arg dir "$tasks_dir" --arg br "$branch" '
    def is_input:
        .type == "user"
        and (((.message.content // []) | if type == "array"
                then ([.[] | select(.type == "tool_result")] | length)
                else 0 end) == 0);

    (map(is_input) | rindex(true)) as $i
    | (if $i == null then . else .[$i + 1:] end) as $turn
    | [$turn[] | select(.type == "assistant") | (.message.content // [])[] | select(.type == "tool_use")] as $uses
    | ($uses | map((.input.command // "") + " " + (.input.file_path // ""))| join("\n")) as $said
    # Handing over: over the turn a request was opened or the task folder taken apart.
    | ($said | test("pr create|pr ready|git rm[^\n]*" + $dir + "/" + $br)) as $gave
    # The mark: a command that moves the record state in the intake. A dry run does not count as a
    # mark — it shows what would have travelled and leaves no trace outward; so every command is
    # judged apart rather than the glued text of the turn: a dry run next to a real mark does not
    # cancel it.
    | ($uses | map((.input.command // ""))
        | map(select(test("cargo:mark|cargo:close|cargo:fixed|cargo-mark|cargo-close")))
        | map(select(test("--dry-run") | not)) | length > 0) as $marked
    | if $marked then "pass" elif $gave then "gave" else "pass" end
' 2>/dev/null)"

[ "$verdict" = "gave" ] || exit 0

named="$(printf '%s' "$keys" | head -5 | sed 's/^/    /')"
more="$(printf '%s' "$keys" | wc -l | tr -d ' ')"
[ "$more" -gt 5 ] 2>/dev/null && named="${named}
    … and $((more - 5)) more"

reason="BLOCKED by cargo-mark-guard: the turn handed over the work on a cargo record, and the record's state in the intake was not moved by that same turn — it stayed as it was.

The mark and the work go by one turn. A postponed one is not set: between the decision and the next turn a day passes, and by that day the executor remembers the task rather than the cargo record; the record stays among the unsorted, and the next session sorts it out anew.

The records of this work — from the grill ${grill}:
${named}

It has to be moved into \"done\", and the fix travels with the move — what the miss was fixed by, not a retelling of what was wrong:

    ${mark_cmd} -- --state fixed --fix '<what it is fixed by>' --proposal <sign> --postmortem <sign>

A foreign record is moved by the publisher's closing, one's own by the ordinary mark; which of them this is the line \"дерево\" in the cargo read says.

A dry run does not count as a mark: it shows what would have travelled and leaves no trace outward.

The guard judges one turn: the next approach is not refused."

# The shared tail of a refusal: two lawful moves. The file may be not laid out — then there is no
# tail, and the reason for the refusal stays as it was.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/deny-tail.sh" ] && . "$rt_hooks_dir/deny-tail.sh" 2>/dev/null
command -v rt_deny_tail >/dev/null 2>&1 || rt_deny_tail() { :; }
deny_tail_text="$(rt_deny_tail "")"
[ -n "$deny_tail_text" ] && reason="${reason}

${deny_tail_text}"

jq -n --arg r "$reason" '{decision:"block",reason:$r}' 2>/dev/null \
    || printf '{"decision":"block","reason":"cargo-mark-guard: a cargo record is taken or handed over — move its state in the intake."}\n'

exit 0
