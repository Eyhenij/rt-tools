#!/usr/bin/env bash
# The part of this tree's profile that tells a branch of texts alone. It is read by `project.sh`
# next to it, where the set before a push is assembled; it stands apart because that file is at the
# length limit.
#
# A branch of texts alone pays for no lint, types, tests, build or guard scenarios: none of them
# reads a plan, an archive record or the table of assignments. The builder counts such files as an
# input of every project all the same, and a commit with the plan of an epic ran the whole of it —
# seven minutes of lint and build and a quarter of an hour of guard scenarios over two text files.
# The checks of texts and of the tree stay in the set: they are what reads such a commit.

# Whether a path is a text no step of the builder reads: a plan, an archive record, a task folder,
# the table of assignments and a markdown file at the root.
#
# Deliberately narrow. The specs under `docs/specs` do not count: the guard scenarios read them —
# one asks for a spec file by its path, another walks the bindings of every spec. The sample of a
# task folder does not count for the same reason: a scenario reads it from this very tree. A rule or a spec
# inside a package does not count either: that package's build and tests read it.
rt_push_text_path() {
    case "$1" in
        docs/plans/* | docs/archive/* | docs/tasks/RT-* | docs/tasks/_draft-* | .claude/rt-kit/assignments.md) return 0 ;;
        */*) return 1 ;;
        *.md) return 0 ;;
    esac

    return 1
}

# Whether the branch changes such texts alone. No change at all answers «no»: there is nothing to
# judge the branch by. A move is read as a removal and an addition — otherwise a file moved out of
# a package into the archive shows its new path alone and passes for a text.
rt_push_texts_only() {
    _texts="$(git -c core.quotePath=false diff --no-renames --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$_texts" ] && return 1

    while IFS= read -r _t; do
        rt_push_text_path "$_t" || return 1
    done <<EOF
$_texts
EOF

    printf 'the push set: the branch changes texts alone — lint, types, tests, build and the guard scenarios are not run\n' >&2

    return 0
}

# Whether the branch touched only texts. A zero code — only texts, otherwise — code.
#
# An empty list of what was touched does not count as a textual edit: there is nothing to compare
# against, and silence here would read as "there is nothing to change".
rt_push_docs_only() {
    changed="$(git diff --no-renames --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$changed" ] && return 1
    printf '%s\n' "$changed" | grep -qvE '(^docs/|\.md$)' && return 1

    return 0
}

# The paths a check of the set does not read, as path specs — one per line. The mark of such a check
# stays in force over a commit of these paths alone: the task folder taken apart by the last commit
# of a branch and a line in the plan of an epic no longer run a step over code it just judged.
#
# Named for the steps of the builder, the styles linter and the heavy steps — frames, end-to-end
# suites, stands and image builds — and by the same narrow sign as a branch of texts. The checks of
# texts and of the tree are not named: they are what reads such a commit.
rt_push_check_unread() {
    case "$1" in
        *'nx affected'* | *'lint:styles'* | *visual-gate* | *':e2e'* | *'serve:auth'* | *'docker build'*)
            printf '%s\n' ':(top,exclude)docs/plans' ':(top,exclude)docs/archive' \
                ':(top,exclude,glob)docs/tasks/RT-*/**' ':(top,exclude,glob)docs/tasks/_draft-*/**' \
                ':(top,exclude,glob)*.md' ':(top,exclude).claude/rt-kit/assignments.md'
            ;;
    esac
}

# The time limit of each step lies next to this file: the profile is at its length limit.
# shellcheck disable=SC1091
. "$(dirname "${BASH_SOURCE[0]}")/project-budget.sh" 2>/dev/null || true
