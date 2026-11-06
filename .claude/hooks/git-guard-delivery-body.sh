#!/usr/bin/env bash
# rt-kit v0.34.0 · hooks/git-guard-delivery-body.sh · 99fac57dd529 · правится надстройкой, не здесь
# The body of a PR being opened, for the delivery guard: the section about the remaining step, the
# table of points and the line that closes the task.
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
    local pull_goal_section="${RT_PULL_GOAL_SECTION:-}"
    [ -z "$pull_body_section" ] && [ -z "$pull_points_section" ] && [ -z "$pull_goal_section" ] \
        && [ -z "$pull_closes_line" ] && return 0
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

    # The table of points: without it the owner learns whether the work reached its point only after
    # the merge. The guard sees the heading, not whether the signs were run.
    if [ -n "$pull_points_section" ] && ! printf '%s' "$body" | grep -qE "$pull_points_section"; then
        fault "the body of the request carries no section with the table of points. The owner decides on the request page whether the work reached its point. Run the role product-strategist and put its table of points into the body; a sign not run is written as not run."
    fi

    # The table of the critic: the session's own points prove nothing about what the owner asked for.
    # A heading alone is not a table: a header, a divider and one row make three lines.
    if [ -n "$pull_goal_section" ]; then
        local goal_rows
        goal_rows="$(printf '%s\n' "$body" | awk -v head="$pull_goal_section" '
            $0 ~ head { inside = 1; next }
            /^## / { inside = 0 }
            inside && /^\|/ { rows++ }
            END { print rows + 0 }
        ')"
        [ "$goal_rows" -ge 3 ] \
            || fault "the body of the request carries no section with the table of the critic. Give the role goal-critic the owner's words verbatim and the result, and put its table into the body word for word."
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
