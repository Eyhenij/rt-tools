#!/usr/bin/env bash
# rt-kit v0.41.1 · hooks/git-guard-delivery-merge.sh · e61ea58a73f1 · правится надстройкой, не здесь
# The run on the tip of a PR being merged, for the delivery guard.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it and calls it on a merge command. It uses the guard's own variables — the command and
# the tree root — and the guard's `fault`.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

rt_delivery_merge_run() {
    # An epic went into main while the run on its tip was red on the image build: the rollout fell,
    # and every next PR into main turned red. The red was on the PR page and was not read.
    #
    # A red and an unfinished run refuse. `none` passes: a PR into an epic branch gets no run at
    # all, and refusing it would refuse every task of an epic. The tier is a network one — no answer
    # from the work queue helper, no demand.
    command -v rt_pull_state >/dev/null 2>&1 || return 0
    local ref pull run name
    ref="$(printf '%s' "$cmd" | sed -nE 's/.*(gh[[:space:]]+pr[[:space:]]+merge)[[:space:]]+([^[:space:];&|-][^[:space:];&|]*).*/\2/p' | head -1)"
    pull="$(cd "$root" && rt_pull_state "$ref" 2>/dev/null)" || return 0
    printf '%s' "$pull" | jq -e '.exists' >/dev/null 2>&1 || return 0
    run="$(printf '%s' "$pull" | jq -r '.run // empty' 2>/dev/null)"
    name="$(printf '%s' "$pull" | jq -r '.number // empty' 2>/dev/null)"
    name="${name:-$ref}"
    case "$run" in
        failure)
            unmet pr_tip_run failure "the run on the tip of the request${name:+ #${name}} is red. A merge over red carries the breakage into the branch, and every next request into it turns red. Read the run — gh run list --commit <tip> — fix it in the branch and repeat." ;;
        running)
            unmet pr_tip_run running "the run on the tip of the request${name:+ #${name}} has not finished. A merge before its end carries what it has not checked yet. Wait for its end and read the result by a command." ;;
    esac
    return 0
}

rt_delivery_merge_who() {
    # The executor merges the PRs of a task into the epic branch by the owner's word named in
    # advance; the epic into the main branch is the owner's button where the tree says so by
    # `RT_MAIN_MERGE_BY_OWNER=1`. The host's merge signs the merge commit by the merging account's
    # primary email unless the call names the author: a private address then lands in the history.
    case "$cmd" in *gh*) ;; *) return 0 ;; esac
    printf '%s' "$cmd" | grep -qE "(^|[;&|[:space:]])gh[[:space:]]+pr[[:space:]]+merge([[:space:]]|\$)" || return 0
    if [ -n "${RT_COMMIT_EMAIL:-}" ]; then
        local said
        said="$(printf '%s' "$cmd" | sed -nE 's/.*(--author-email|[[:space:]]-A)[[:space:]=]+["'\'']?([^[:space:]"'\'';&|]+).*/\2/p' | head -1)"
        [ "$said" = "$RT_COMMIT_EMAIL" ] \
            || unmet merge_author_declared no "the merge names no author or a foreign one${said:+ (${said})}. The host signs the merge commit by the merging account's primary email, and a private address lands in the history of the branch. Name the declared one: gh pr merge <number> --merge --author-email ${RT_COMMIT_EMAIL}."
    fi
    [ "${RT_MAIN_MERGE_BY_OWNER:-}" = 1 ] || return 0
    local ref pull base
    ref="$(printf '%s' "$cmd" | sed -nE 's/.*(gh[[:space:]]+pr[[:space:]]+merge)[[:space:]]+([^[:space:];&|-][^[:space:];&|]*).*/\2/p' | head -1)"
    pull=''
    command -v rt_pull_state >/dev/null 2>&1 && pull="$(cd "$root" && rt_pull_state "$ref" 2>/dev/null)"
    base="$(printf '%s' "$pull" | jq -r '.base // empty' 2>/dev/null)"
    if [ -z "$base" ]; then
        unmet pr_base_known no "the base of the request${ref:+ ${ref}} is not known: the host did not answer. The merge into the main branch is the owner's here, and a merge with no base known may be one. Repeat when the host answers."
    elif [ "$base" = "$main_branch" ]; then
        unmet merge_into_main yes "the request${ref:+ ${ref}} goes into «${main_branch}», and here the owner merges into it by the button (RT_MAIN_MERGE_BY_OWNER=1). Tell the owner the number and that the work is ready; a task of an epic goes into the epic branch, and that merge is the executor's."
    fi
    return 0
}
