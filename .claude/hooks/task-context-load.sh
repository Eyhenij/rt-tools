#!/usr/bin/env bash
# rt-kit v0.27.0 · hooks/task-context-load.sh · cf1eea1b4dba · правится надстройкой, не здесь
# rt-hook: SessionStart startup|resume|compact|clear
# Requires: hooks/profile-check.sh
# SessionStart: the state of unfinished work goes into the context at every start of a session.
#
# It is not held by memory for the same reason as the glossary: the plan is read before a file is
# edited, and a conversation with the owner starts with a question — and the session answers without
# knowing that the work is already half done. Here the plan and the progress arrive before the first
# reply, and the owner does not have to retell what is already written down.
#
# The grill (`grill.md`) is given as a path, not as text: it does not change, it is bulky and it is
# needed less often than the rest.
#
# FAIL-OPEN: no `jq`, not a git repository, no task folder — we exit silently. The session matters
# more than the context.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

ROOT="${CLAUDE_PROJECT_DIR:-.}"
command -v jq >/dev/null 2>&1 || exit 0
cd "$ROOT" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

branch="$(git branch --show-current 2>/dev/null)"
[ -z "$branch" ] && exit 0

# The tree profile: first the package default, and over it the project override, if there is one.
rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$ROOT/.claude/rt-kit/defaults/project.sh" "$ROOT/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

# A word about a missing profile function: a hook that exited silently is indistinguishable from a
# working one. The file may not be laid out — then the former behaviour stays, the silent one.
# shellcheck disable=SC1090
[ -f "$rt_hooks_dir/profile-check.sh" ] && . "$rt_hooks_dir/profile-check.sh"
command -v rt_needs >/dev/null 2>&1 || rt_needs() { command -v "$1" >/dev/null 2>&1; }

TASKS_DIR="${RT_TASKS_DIR:-docs/tasks}"
[ -z "$TASKS_DIR" ] && exit 0

DIR="$TASKS_DIR/$branch"
PLAN="$DIR/plan.md"
PROGRESS="$DIR/progress.md"
GRILL="$DIR/grill.md"

emit() {
    jq -Rs '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:.}}' 2>/dev/null
}

# A branch under a task without a folder — the work goes past the rule. We do not tear the session:
# a SessionStart that refuses the start leaves the owner without an agent at all, while a code edit
# will be caught by `task-flow-guard`.
if [ ! -d "$DIR" ]; then
    # The folder is missing for two different reasons, and different things have to be said about
    # them. The first — the work went past the rule. The second — the folder was taken apart by the
    # branch itself with the last commit before the PR: that is a lawful outcome, and an instruction
    # to build it again takes the session from the tail of the work back to its beginning.
    #
    # The branch history tells them apart: the folder removed by a commit of the branch after the
    # common ancestor with the main one. The progress by that minute has gone with the folder, and
    # the state is held by the PR and the session handover.
    main_branch="${RT_MAIN_BRANCH:-main}"
    base="$(git merge-base "origin/${main_branch}" HEAD 2>/dev/null || git merge-base "$main_branch" HEAD 2>/dev/null)"
    dropped=''
    [ -n "$base" ] && dropped="$(git log "${base}..HEAD" --diff-filter=D --name-only --pretty=format: -- "$DIR" 2>/dev/null | head -1)"

    if [ -n "$dropped" ]; then
        {
            printf 'WORK IS CLOSING — the task folder has been taken apart by this branch.\n\n'
            printf 'The progress was removed with the folder: the state is held by the PR and the session handover.\n'
            printf 'The folder is not rebuilt. A code edit after the folder was taken apart requires restoring it\n'
            printf 'for the time of the edit and taking it apart again in the same commit. The order — skill `task-flow`,\n'
            printf 'patterns `task-flow-close` and `task-flow-archive`.\n'
        } | emit
        exit 0
    fi

    if rt_needs rt_task_branch_ok task-context-load && rt_task_branch_ok "$branch"; then
        {
            printf 'WORK WITHOUT A TASK FOLDER.\n\n'
            printf 'Branch `%s` is named after a task, and `%s/` is missing: there is nowhere to write the progress,\n' "$branch" "$DIR"
            printf 'and the next session will start by questioning the owner.\n\n'
            printf 'Build it from the template:\n\n    cp -r %s/_template %s\n\n' "$TASKS_DIR" "$DIR"
            # The folder happens to be named not by the branch name: the stages of one large task
            # go as separate branches with one shared folder. A folder named by name is the only
            # thing by which the session will find it; otherwise it reads the refusal as "there are
            # no records" and answers the owner from the code, bypassing everything decided in those
            # records.
            others="$(find "$TASKS_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '_template' 2>/dev/null | sort)"
            if [ -n "$others" ]; then
                printf 'The tasks directory meanwhile holds:\n\n%s\n\n' "$others"
                printf 'Stages of one task go as separate branches with a shared folder: before\n'
                printf 'concluding that there are no records, look into the folders named above.\n\n'
            fi
            # About a neighbouring resource — conditionally and by name: the package does not know
            # whether it is laid out here, and what is said unconditionally arrives in the context
            # of every session and lies about the tree all the more confidently because the tool
            # prints it itself.
            if [ -f "$rt_hooks_dir/task-flow-guard.sh" ]; then
                printf 'Until then, an application code edit is refused by guard `task-flow-guard`. The rule — skill `task-flow`.\n'
            else
                printf 'The rule — skill `task-flow`. Guard `task-flow-guard` is not in this tree: nothing refuses a code edit until then.\n'
            fi
        } | emit
    fi
    exit 0
fi

# The size threshold. The progress grows with every session, and by the tenth session it costs more
# in full than it gives. Past the threshold we give "Where we stand" and the latest entries.
LIMIT=40000
size=0
for file in "$PLAN" "$PROGRESS"; do
    [ -f "$file" ] || continue
    size=$((size + $(wc -c <"$file" 2>/dev/null || echo 0)))
done

{
    printf 'WORK STATE — branch `%s`, folder `%s/`.\n\n' "$branch" "$DIR"
    printf 'This was written by previous sessions. The owner is not asked about what is here.\n'
    printf 'Done work is marked only in `progress.md`; `plan.md` is not edited along the way.\n'
    printf 'How work is conducted — rule `task-flow`; returning to it — pattern `task-flow-resume`.\n\n'

    if [ -f "$GRILL" ]; then
        printf 'The grill of the owner'"'"'s request — `%s`, read when needed.\n\n' "$GRILL"
    fi

    if [ -f "$PLAN" ]; then
        printf -- '--- PLAN (`%s`) ---\n\n' "$PLAN"
        if [ "$size" -le "$LIMIT" ]; then
            cat "$PLAN"
        else
            sed -n '1,60p' "$PLAN"
            printf '\n<cut for size — read in full: %s>\n' "$PLAN"
        fi
        printf '\n'
    fi

    if [ -f "$PROGRESS" ]; then
        printf -- '--- PROGRESS (`%s`) ---\n\n' "$PROGRESS"
        if [ "$size" -le "$LIMIT" ]; then
            cat "$PROGRESS"
        else
            # The "Where we stand" section is rewritten by every session and survives any size.
            LC_ALL=C awk '/^## (Where we stand|Где стоим)/{f=1} f&&/^## /&&!/^## (Where we stand|Где стоим)/{exit} f' "$PROGRESS"
            printf '\n<cut for size. The latest entries:>\n\n'
            tail -40 "$PROGRESS"
            printf '\n<read in full: %s>\n' "$PROGRESS"
        fi
    fi
} | emit
