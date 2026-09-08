#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/git-guard-delivery-conflict.sh · 5dcf3b97e674 · правится надстройкой, не здесь
# A conflicting PR of one's own, for the delivery guard: while at least one handed-over piece of
# work is marked conflicting, a new one is not taken.
#
# There is deliberately no `# rt-hook:` line here: the event and the call pattern are declared by
# the guard itself, while a helper next to it registers as no hook and decides nothing on its own.
# It is called from the guard, uses the guard's variables and the guard's refusal — the same way as
# the helpers of the folder and of the signature.
#
# Why exactly so. The delivery guard stands at three points and at each one demands what is fixable
# at that minute, while the state of what has already been handed over it asks about nowhere. A
# conflict arrives into a handed-over PR through someone else's merge, without a single action by
# its author: a person can no longer merge it, and the PR stands until the author notices. There is
# nothing to notice it by — the demand to reread one's own open PRs is written as text and rests on
# memory: two PRs stood conflicting for a whole session, and it was the owner who noticed.
#
# It is fixable exactly at the minute when the next piece of work is taken: after it there are more
# conflicts, not fewer — every new PR grows from the same main branch and arrives into the same
# queue that will have to be caught up with.
#
# Four commands count as taking work here: creating a task, creating a branch for a task, moving the
# column into work and opening a PR. Everything a conflict is fixed by — pulling, merging,
# committing, pushing, switching between branches — goes as before: a guard that refuses the repair
# would lock the tree shut.
#
# Only an outright "conflicts" is judged. While the hosting computes mergeability it answers with
# uncertainty — and it computes it again after every edit of the main branch — and reading
# uncertainty as a conflict would mean refusing work at every fresh tip.
#
# FAIL-OPEN: no profile function, no network, no machine account — the tier is skipped.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
# The helper takes the start of a call from the same place as every guard does. It is sourced here
# too, although the calling guard has already done so: an empty pattern would turn the sign into a
# word search over the whole line.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_delivery_conflict() {
    # The sign of taking work is read from the text of the command and stands first: the query goes
    # to the network, and paying for it on every shell command is not allowed.
    taking=''
    case "$cmd" in
        *"${task_new}"*) taking='creating a task' ;;
    esac
    # Moving the column is judged together with the name of the work column: a move into review and
    # into closed is the end of the work, not its beginning.
    if [ -z "$taking" ] && [ -n "$task_move" ]; then
        case "$cmd" in
            *"${task_move}"*)
                case "$cmd" in
                    *"${RT_BOARD_INPROGRESS_KEY:-in-progress}"*) taking='moving the column into work' ;;
                esac
                ;;
        esac
    fi
    if [ -z "$taking" ] \
        && printf '%s' "$cmd" | grep -qE '(^|[;&|[:space:]])git[[:space:]]+(checkout([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-b|switch([[:space:]]+-[A-Za-z-]+)*[[:space:]]+-c)[[:space:]]+[A-Za-z]+-[0-9]+'; then
        taking='creating a branch for a task'
    fi
    if [ -z "$taking" ] \
        && printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(gh[[:space:]]+pr[[:space:]]+create|glab[[:space:]]+mr[[:space:]]+create)([[:space:]]|\$)"; then
        taking='opening a request'
    fi
    [ -z "$taking" ] && return 0

    rt_needs rt_conflicting_pulls git-guard-delivery || return 0
    stuck="$(cd "$root" && rt_conflicting_pulls 2>/dev/null)" || return 0
    [ -z "$stuck" ] && return 0

    listed=''
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        listed="${listed}${listed:+
}— ${line}"
    done <<EOF
${stuck}
EOF
    [ -z "$listed" ] && return 0

    deny "BLOCKED: ${taking} while a conflicting request of your own stands. What was handed over conflicts with the main branch, and a person cannot merge it:

${listed}

The conflict arrives by someone else's merge, without a single action by the author of the request: it stands until it is caught up with. New work does not fix it — it adds one more branch to the queue, growing from the same main and falling behind the same way.

There is one move from here: pull the main branch, merge it into the named branch, resolve the conflict and send it — and only then take new work. What is fixed by what — the pattern git-workflow-freshness."
}
