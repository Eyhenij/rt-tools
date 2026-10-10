#!/usr/bin/env bash
# rt-kit v0.30.1 · hooks/git-guard-delivery-body.sh · 02eb7b77b448 · правится надстройкой, не здесь
# The body of a PR being opened, for the delivery guard: the section about the remaining step and the
# line that closes the task.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it — one tier of its verdict, moved out when the guard reached its length limit. It uses
# the guard's own variables — the command, the task number of the branch, both samples — and the
# guard's `fault`.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

rt_delivery_pull_body() {
    # The body arrives either as an argument or as a file, both are read here; by the time of the
    # parse the file is already written. Neither one nor the other — there is no requirement: a PR
    # without a body is checked by the guard elsewhere. The flag is recognised only as a separate
    # word: the tail `-b` of a branch name in the base argument read as the body flag, and the next
    # word of the command became the body.
    [ -z "$pull_body_section" ] && [ -z "$pull_closes_line" ] && return 0
    command -v perl >/dev/null 2>&1 || return 0

    local body body_file closes
    body="$(printf '%s' "$cmd" | perl -0ne '
        if (/(?:^|\s)(?:--body|-b)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    body_file="$(printf '%s' "$cmd" | perl -0ne '
        if (/(?:^|\s)(?:--body-file|-F)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|\x27([^\x27]*)\x27|(\S+))/s) {
            print defined $1 ? $1 : (defined $2 ? $2 : $3);
        }
    ' 2>/dev/null)"
    [ -z "$body" ] && [ -n "$body_file" ] && [ -f "$body_file" ] && body="$(cat "$body_file" 2>/dev/null)"
    [ -z "$body" ] && return 0

    # The section about the remaining step: without it the owner merges the PR by the button while
    # the run is still going.
    if [ -n "$pull_body_section" ] && ! printf '%s' "$body" | grep -qE "$pull_body_section"; then
        fault "the body of the request carries no section about the remaining step. The merge button is pressed by a person on the hosting, where there are no guards, and they merge as soon as they see green: all that holds the requirement there is what the owner read on the page. The section stands last and says exactly one thing — whether anything is left before the merge; it is rewritten by the same call that edits the body."
    fi

    # The line that closes the task. Without it the merged task stays open on the board, and the
    # work queue audit names that only after the merge — three PRs of one epic went out so, and the
    # owner closed their tasks by hand. The number is the branch's, not the one the executor
    # remembers.
    if [ -n "$pull_closes_line" ] && [ -n "$number" ]; then
        closes="${pull_closes_line//\{number\}/$number}"
        printf '%s' "$body" | grep -qE "$closes" \
            || fault "the body of the request carries no line that closes the task #${number}. Without it the task stays open after the merge, and the board shows the merged work as not done. Write the line by the sample of the tree: ${closes}"
    fi
    return 0
}
