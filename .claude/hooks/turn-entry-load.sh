#!/usr/bin/env bash
# rt-kit v0.25.0 · hooks/turn-entry-load.sh · 4ee1826143b2 · правится надстройкой, не здесь
# rt-hook: SessionStart startup|resume|compact|clear
# Requires: hooks/handoff-write.sh
# SessionStart: the handover of the previous session and the turn map travel into the context on
# every start.
#
# The handover is written by a hook before the compaction — and there its path ended: nobody could
# read it, and it was a person who put it into the new session. Written and not read, it equals not
# written.
#
# The second thing a session after a compaction does not know is how work is conducted here. The
# list of states with their mandatory actions lies in the rule, and after a compaction the rule is
# not loaded: as its first move the session goes to read it whole, that is, spends on restoring the
# order the very part of the window the compaction happened for. The map answers that question
# before it is asked.
#
# This is served on all four starts, not only after a compaction: a session after a break and a
# session after a clear begin from the same empty place, and the difference between them is not
# visible to the executor.
#
# FAIL-OPEN: not a git repository, no branch, no handover directory, no map, an unreadable file —
# the hook exits with zero and says nothing about the part that is missing. It never refuses the
# start: the session matters more than the context.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

ROOT="${CLAUDE_PROJECT_DIR:-.}"
cd "$ROOT" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"

# The tree profile: first the package default, and over it the project override, if there is one.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" \
    "$ROOT/.claude/rt-kit/defaults/project.sh" "$ROOT/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

handoff_dir="${RT_HANDOFF_DIR:-.claude/handoff}"
map="$rt_hooks_dir/../rt-kit/defaults/turn-map.md"
[ -f "$map" ] || map="$ROOT/.claude/rt-kit/defaults/turn-map.md"

# The handover is taken by the name of the current branch. Someone else's, served as one's own,
# describes work that is not in this tree — so both the section and the file are looked for by the
# branch, not picked out of the directory.
#
# There are two places, and one order between them. The handover of a branch with a task folder lies
# as a section of its progress: it is committed and travels with the branch, so it survives a move
# to another machine. A file outside the tree is the fallback: for work without a task folder the
# section has nowhere to lie. Once the section is found, the file is not read: it is the same
# handover, and the second copy is older than the first.
tasks_dir="${RT_TASKS_DIR:-docs/tasks}"
progress=''
[ -n "$branch" ] && progress="$ROOT/$tasks_dir/$branch/progress.md"

section=''
if [ -n "$progress" ] && [ -r "$progress" ]; then
    # Comparison by bytes: under a locale with national settings this system's `awk` counts
    # different Cyrillic headings equal, and the entry would read the first heading it met as the
    # handover section.
    section="$(LC_ALL=C awk '
        $0 == "## Handover of the session" || $0 == "## Передача захода" { skip = 1; next }
        skip && /^## / { skip = 0 }
        skip { print }
    ' "$progress" 2>/dev/null)"
fi

handoff=''
[ -n "$branch" ] && handoff="$ROOT/$handoff_dir/$branch.md"

if [ -n "$section" ]; then
    printf 'HANDOVER OF THE PREVIOUS SESSION — the handover section of `%s/%s/progress.md`, in full below.\n\n' "$tasks_dir" "$branch"
    printf 'It was written by the previous session and describes the minute it was put together. Everything\n'
    printf 'it says about the tree is checked against the tree: a command of this turn outranks what was written yesterday.\n\n'
    printf '%s\n\n' "$section"
elif [ -n "$handoff" ] && [ -r "$handoff" ]; then
    printf 'HANDOVER OF THE PREVIOUS SESSION — `%s/%s.md`, in full below.\n\n' "$handoff_dir" "$branch"
    printf 'It was written by the previous session and describes the minute it was put together. Everything\n'
    printf 'it says about the tree is checked against the tree: a command of this turn outranks what was written yesterday.\n\n'
    cat "$handoff" 2>/dev/null
    printf '\n\n'
fi

if [ -r "$map" ]; then
    printf 'TURN MAP — the work states and what a turn ends with. In full below.\n\n'
    printf 'It is a digest of the work-conduct rule, not the rule itself: the rule explains, the map\n'
    printf 'names. A session reads its own state in the section of the progress that says where the work stands.\n\n'
    cat "$map" 2>/dev/null
    printf '\n'
fi

exit 0
