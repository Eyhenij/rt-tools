#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/handoff-write.sh · 49cc53bc85cb · правится надстройкой, не здесь
# rt-hook: PreCompact .*
# Requires: hooks/profile-check.sh
# The session handover is written before the context is compacted, not by the hand of the executor.
#
# A session ends in two ways: the executor brings the work to a point and writes the handover
# himself — or the context overflows and the compaction comes from the tool. The second case used to
# lose the handover entirely: at that moment there is nobody left to write it, and after the
# compaction there is nothing to retell. At night, when there is nobody to remind, every session
# ends that way.
#
# The hook assembles the handover from what lies on disk: the progress gives the state and the next
# step, the tree gives the branch, the uncommitted and the commits over the main one. It adds
# nothing of its own: a handover retells what is written down, it does not replace it.
#
# It is put as a section into the progress of the task — where the state lies too. A file of its own
# outside the tree loses the handover on a move to another machine: the directory is closed off from
# the history, and work broken off by a filled window cannot be picked up from there — the state is
# in the progress, while the particulars of the session, the next step and what must not be done
# stay on the previous machine. No second record about one and the same thing appears: the section
# lives in the same file as "Where we stand" and travels into the branch with the same commit. The
# executor commits it — the hook does not know what else lies in the index.
#
# A file outside the tree stays the fallback path: for work without a task folder — on a detached
# head, on a branch without a created task — there is nowhere for the section to lie, while silence
# here costs a whole session.
#
# What is written by hand is not overwritten silently: there is one file, and the last write wins.
# An executor who closes the session by the rule writes over it — his handover is fuller, because he
# knows what is not on disk.
#
# FAIL-OPEN: no parser, empty input, not a repository, no handover directory — the hook exits with
# zero and stays silent. It never refuses the compaction: a stopped compaction leaves the session
# without room.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_hook_read
input="$RT_HOOK_INPUT"
[ -z "$input" ] && exit 0

command -v jq >/dev/null 2>&1 || exit 0

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" \
    "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/defaults/project.sh" "${CLAUDE_PROJECT_DIR:-.}/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

workdir="$(rt_hook_cwd)"
[ -z "$workdir" ] && workdir="${CLAUDE_PROJECT_DIR:-.}"
cd "$workdir" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# An empty branch name does not stop the hook. On a detached head there is no name, and everything
# that goes into the handover lies in the tree and is available in full: the name is needed only by
# the file. The former exit with zero was complete silence — the compaction came without a handover,
# and the session after it started from an empty place.
branch="$(git branch --show-current 2>/dev/null)"
head_name=""
if [ -z "$branch" ]; then
    head_name="$(git rev-parse --short HEAD 2>/dev/null)"
    [ -z "$head_name" ] && head_name='detached'
    head_name="detached-$head_name"
fi

root="$(git rev-parse --show-toplevel 2>/dev/null)"
[ -z "$root" ] && exit 0

handoff_dir="${RT_HANDOFF_DIR:-.claude/handoff}"
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"

mkdir -p "$root/$handoff_dir" 2>/dev/null || exit 0
[ -d "$root/$handoff_dir" ] || exit 0

# Manual compaction differs from automatic in one thing: at a manual one the executor is at the
# keyboard and can add to the handover himself. It is written in both cases — a session compacted by
# hand loses the context in exactly the same way.
trigger="$(printf '%s' "$input" | jq -r '.trigger // "auto"' 2>/dev/null)"
[ -z "$trigger" ] && trigger='auto'

# The handover file is looked for by the branch name; for a head without a name it is named by its
# short snapshot.
handoff_name="$branch"
[ -z "$handoff_name" ] && handoff_name="$head_name"

progress=""
[ -n "$branch" ] && progress="$root/$tasks_dir/$branch/progress.md"

# A line of the "Where we stand" section by its name. Empty — the work goes outside a task folder,
# and the state must not be invented for it: the handover then holds what the tree knows.
line_of() {
    [ -f "$progress" ] || return 0
    sed -nE "s/^[[:space:]]*[-*][[:space:]]*\*\*($1):\*\*[[:space:]]*(.*)/\2/p" "$progress" 2>/dev/null | head -1
}

state="$(line_of 'State|Состояние')"
stage="$(line_of 'Stage|Этап')"
next_step="$(line_of 'Next step|Следующий шаг')"
pull="$(line_of 'PR')"

uncommitted="$(git status --short 2>/dev/null | head -20)"
[ -z "$uncommitted" ] && uncommitted='none'

ahead="$(git log --oneline origin/main..HEAD 2>/dev/null | head -20)"
[ -z "$ahead" ] && ahead='no commits over the main branch'

target="$root/$handoff_dir/$handoff_name.md"

# The heading of the section in the progress: the previous handover is found by it.
section='## Handover of the session'

# The handover is assembled into a temporary file: the section and the fallback path write one and
# the same thing, and no second assembly is made for the second place.
scratch="$(mktemp 2>/dev/null)" || exit 0

{
    printf 'Put together by a hook before the compaction of the context (%s).\n\n' "$trigger"
    printf '**Working tree:** %s\n' "$root"
    if [ -n "$branch" ]; then
        printf '**Branch:** %s\n\n' "$branch"
    else
        printf '**Branch:** no name — a detached head %s\n\n' "$head_name"
    fi

    if [ -n "$state" ]; then
        printf '### Where we stand at the minute of the compaction\n\n'
        printf -- '- **State:** %s\n' "$state"
        [ -n "$stage" ] && printf -- '- **Stage:** %s\n' "$stage"
        [ -n "$next_step" ] && printf -- '- **Next step:** %s\n' "$next_step"
        [ -n "$pull" ] && printf -- '- **PR:** %s\n' "$pull"
        printf '\nThe progress in full — `%s/%s/progress.md`; the plan lies next to it.\n\n' "$tasks_dir" "$branch"
    elif [ -z "$branch" ]; then
        printf '### Where we stand at the minute of the compaction\n\nThe head has no name and no task folder next to it: there is nowhere to take the state of the work from. The reading side looks for the handover by the branch name, and failing that — by the last record of the directory.\n\n'
    else
        printf '### Where we stand at the minute of the compaction\n\nThis branch has no task folder: there is nowhere to take the state of the work from.\n\n'
    fi

    printf '### Uncommitted\n\n```\n%s\n```\n\n' "$uncommitted"
    printf '### Commits over the main branch\n\n```\n%s\n```\n\n' "$ahead"
    printf 'Written by a hook before the compaction of the context. Everything standing here is checked\n'
    printf 'against the tree: a handover retells what was written and describes the minute it was put together.\n'
} > "$scratch" 2>/dev/null

[ -s "$scratch" ] || exit 0

# There is a progress — the handover lies as its section, and a previous section of that kind is
# replaced entirely: appended as a second one, it would leave two truths about one work in one file.
if [ -n "$progress" ] && [ -f "$progress" ]; then
    kept="$scratch.kept"
    # The comparison goes by bytes. Under a locale with national settings the `awk` of this system
    # counts different Cyrillic strings equal — the heading of "Where we stand" matched the heading
    # of the handover section — and cutting out the previous section removed the work state along
    # with it. The miss is visible only where the locale is declared: for an executor with `C.UTF-8`
    # the suite is green, on the pipeline run — red.
    LC_ALL=C awk -v mark="$section" -v old='## Передача захода' '
        $0 == mark || $0 == old { skip = 1; next }
        skip && /^## / && $0 != mark && $0 != old { skip = 0 }
        !skip { print }
    ' "$progress" > "$kept" 2>/dev/null || { rm -f "$scratch" "$kept"; exit 0; }

    {
        # The trailing blank lines of the previous text are removed: the section is appended to it
        # through one blank line, not through however many were left there.
        awk 'BEGIN { blanks = 0 }
            { if ($0 ~ /^[[:space:]]*$/) { blanks++; next }
              while (blanks > 0) { print ""; blanks-- }
              print }' "$kept"
        printf '\n%s\n\n' "$section"
        cat "$scratch"
    } > "$progress.rt-handoff" 2>/dev/null \
        && mv "$progress.rt-handoff" "$progress" 2>/dev/null

    rm -f "$scratch" "$kept"
    exit 0
fi

mv "$scratch" "$target" 2>/dev/null || rm -f "$scratch"

exit 0
