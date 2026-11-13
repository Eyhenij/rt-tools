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

# Whether the branch changes texts alone: files under `docs/`, a markdown file at the root and the
# table of assignments. Deliberately narrow — a rule or a spec inside a package is read by that
# package's build and tests, so a markdown file under a project does not count. No change at all
# answers «no»: there is nothing to judge the branch by.
rt_push_texts_only() {
    _texts="$(git diff --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$_texts" ] && return 1

    for _t in $_texts; do
        case "$_t" in
            docs/* | .claude/rt-kit/assignments.md) ;;
            */*) return 1 ;;
            *.md) ;;
            *) return 1 ;;
        esac
    done

    printf 'the push set: the branch changes texts alone — lint, types, tests, build and the guard scenarios are not run\n' >&2

    return 0
}

# Whether the branch touched only texts. A zero code — only texts, otherwise — code.
#
# An empty list of what was touched does not count as a textual edit: there is nothing to compare
# against, and silence here would read as "there is nothing to change".
rt_push_docs_only() {
    changed="$(git diff --name-only "$1"...HEAD 2>/dev/null)"
    [ -z "$changed" ] && return 1
    printf '%s\n' "$changed" | grep -qvE '(^docs/|\.md$)' && return 1

    return 0
}

# The paths a check of the set does not read, as path specs — one per line. The mark of such a check
# stays in force over a commit of these paths alone: the task folder taken apart by the last commit
# of a branch and a line in the plan of an epic no longer run the builder over code it just judged.
#
# Named for the steps of the builder and the styles linter only, and by the same narrow sign as a
# branch of texts: files under `docs/`, a markdown file at the root and the table of assignments.
# The checks of texts and of the tree are not named — they are what reads such a commit.
rt_push_check_unread() {
    case "$1" in
        *'nx affected'* | *'lint:styles'*)
            printf '%s\n' ':(exclude)docs' ':(exclude,glob)*.md' ':(exclude).claude/rt-kit/assignments.md'
            ;;
    esac
}
