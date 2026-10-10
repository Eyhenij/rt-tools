#!/usr/bin/env bash
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
            fault "the run on the tip of the request${name:+ #${name}} is red. A merge over red carries the breakage into the branch, and every next request into it turns red. Read the run — gh run list --commit <tip> — fix it in the branch and repeat." ;;
        running)
            fault "the run on the tip of the request${name:+ #${name}} has not finished. A merge before its end carries what it has not checked yet. Wait for its end and read the result by a command." ;;
    esac
    return 0
}
