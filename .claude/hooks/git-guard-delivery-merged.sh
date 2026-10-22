#!/usr/bin/env bash
# rt-kit v0.33.1 · hooks/git-guard-delivery-merged.sh · bc5512b34e6e · правится надстройкой, не здесь
# The push into a branch whose PR is merged, for the delivery guard.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it after `deny` — one tier of its verdict, kept apart because the guard is at its length
# limit.
#
# The owner merged a PR, the host deleted its branch, and minutes later the executor committed an
# incident analysis into the same branch and pushed it. The host answered `new branch`: the branch
# came back with one commit over the merged work, and no PR would ever merge it. The pattern of the
# commit already asked for the PR state before such a push, and only memory held it.
#
# What is judged is the branch the push sends: the destination of the last refspec, or the checked
# out branch when the command names none. The branch has a merged PR and no open one — the push is
# refused. A branch reopened by a new PR after the merge is lawful work and passes.
#
# It expects `$cmd` and `$root` to be set and `deny` to be declared.
#
# FAIL-OPEN: no profile function, no network, a dry run, a command that is not a push — silence.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

# The number of the merged PR of a branch that has no open PR; empty output means "not merged". A
# tree on another host declares the function in its profile; this default asks the work queue
# helper. It lives here because the defaults file is at its length limit. No node, no helper, no
# network — a failing exit code, and the push is not judged.
command -v rt_pull_merged >/dev/null 2>&1 || rt_pull_merged() {
    local _state
    command -v node >/dev/null 2>&1 || return 1
    [ -f "${RT_BOARD_HELPER:-tools/board.mjs}" ] || return 1
    _state="$(node "${RT_BOARD_HELPER:-tools/board.mjs}" merged "$1" 2>/dev/null)" || return 1
    printf '%s' "$_state" | jq -e 'has("merged")' >/dev/null 2>&1 || return 1
    printf '%s' "$_state" | jq -r '.merged // empty'
}

rt_delivery_merged() {
    local _rest _target _merged
    printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}git([[:space:]]|\$)" || return 0
    printf '%s' "$cmd" | grep -q -- '--dry-run' && return 0
    _rest="$(printf '%s' "$cmd" | sed -E 's/git[[:space:]]+stash[[:space:]]+push/git stash/g' \
        | sed -nE 's/.*(^|[[:space:]])push([[:space:]]+(.*))?$/\3/p' | head -1)"
    printf '%s' "$cmd" | sed -E 's/git[[:space:]]+stash[[:space:]]+push/git stash/g' \
        | grep -qE '(^|[[:space:]])push([[:space:]]|$)' || return 0
    # The words after `push` up to the end of the call: options are skipped, the first word is the
    # remote, the second — the refspec, whose destination is the branch.
    _target="$(printf '%s' "$_rest" | sed -E 's/[;&|].*$//' | awk '{
        n = 0
        for (i = 1; i <= NF; i++) {
            if ($i ~ /^-/) continue
            n++
            if (n == 2) { spec = $i }
        }
        sub(/^\+/, "", spec); sub(/^.*:/, "", spec); sub(/^refs\/heads\//, "", spec)
        print spec
    }')"
    [ -n "$_target" ] && [ "$_target" != HEAD ] || _target="$(git -C "$root" branch --show-current 2>/dev/null)"
    [ -n "$_target" ] || return 0
    [ "$_target" = "${main_branch:-main}" ] && return 0

    _merged="$(cd "$root" && rt_pull_merged "$_target" 2>/dev/null)" || return 0
    [ -n "$_merged" ] || return 0

    deny "BLOCKED: the PR #${_merged} of the branch «${_target}» is merged, and the branch has no open PR. The host deleted the branch with the merge, and this push recreates it with commits nobody will merge. Take a new branch from the fresh base and move the commits there: git fetch origin && git checkout -b <new branch> origin/<base> && git cherry-pick <commits>."
}
