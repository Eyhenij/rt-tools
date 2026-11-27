#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/git-guard-delivery-merge.sh · 8f41ae66b034 · правится надстройкой, не здесь
# The run on the tip of a PR being merged, its author and its base, for the delivery guard.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it and calls it on a merge command. It uses the guard's own variables — the command, the
# tree root and the token variable — and the guard's `unmet`.
#
# A shell command has more forms than a parser reads: a runner, a wrapper, a subshell, a flag before
# the number, a chain. Two review rounds found a new bypass in each parser. So a tree that declares
# the machine account's email takes the executor's merge in one form only, and refuses every other.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

# Whether the command merges a request at all: `pr merge` outside quotes and heredocs, or inside a
# string handed to a shell. A commit message or a body that names the words is text.
rt_delivery_merge_said() {
    command -v rt_bare >/dev/null 2>&1 || rt_bare() { cat; }
    command -v rt_no_heredocs >/dev/null 2>&1 || rt_no_heredocs() { cat; }
    local text
    # Quotes around a single word, or around `pr merge` itself, are part of the call, not text.
    text="$(printf '%s\n' "$cmd" | rt_no_heredocs | sed -E 's/"([^"[:space:]]*)"/\1/g; s/'\''([^'\''[:space:]]*)'\''/\1/g; s/["'\''](pr[[:space:]]+merge)["'\'']/\1/g')"
    printf '%s\n' "$text" | rt_bare | grep -qE '(^|[^[:alnum:]_.-])pr[[:space:]]+merge([[:space:]]|$)' && return 0
    printf '%s\n' "$text" | grep -qE '(^|[[:space:];&|(])((ba|z|da)?sh|eval)[[:space:]][^;&|]*["'\''][^"'\'']*pr[[:space:]]+merge'
}

# The number of the request when the command is the one form, otherwise empty. The form: the token
# of the machine account where the tree names its variable, the client by any path, the number, the
# merge method, the declared author — and nothing else in the command.
rt_delivery_merge_number() {
    local email token='' form
    email="$(printf '%s' "$RT_COMMIT_EMAIL" | sed 's/[][\.*^$+?(){}|/]/\\&/g')"
    [ -n "${pull_token_var:-}" ] && token="${pull_token_var}=(\"\\\$\\(cat [^)\"]*\\)\"|\\\$\\(cat [^)\"]*\\)|[^[:space:]\"'\$;&|()]+)[[:space:]]+"
    form="^[[:space:]]*(test -s [^[:space:];&|]+[[:space:]]+&&[[:space:]]+)?${token}(/[A-Za-z0-9_./-]+/)?gh[[:space:]]+pr[[:space:]]+merge[[:space:]]+([0-9]+)[[:space:]]+--merge[[:space:]]+(--author-email[[:space:]=]+|-A[[:space:]]*)${email}[[:space:]]*\$"
    [[ "$cmd" =~ $form ]] || return 0
    printf '%s' "${BASH_REMATCH[$((${#BASH_REMATCH[@]} - 2))]}"
}

# The request of the merge and its state, asked of the host once. Without the declared email the
# number is read where it always was: the first word after `merge`.
rt_delivery_merge_pull() {
    [ -n "${rt_merge_read:-}" ] && return 0
    rt_merge_read=1 rt_merge_ref='' rt_merge_pull=''
    if [ -n "${RT_COMMIT_EMAIL:-}" ]; then
        rt_merge_ref="$(rt_delivery_merge_number)"
    else
        rt_merge_ref="$(printf '%s' "$cmd" | sed -nE 's/.*(gh[[:space:]]+pr[[:space:]]+merge)[[:space:]]+([^[:space:];&|-][^[:space:];&|]*).*/\2/p' | head -1)"
    fi
    [ -n "$rt_merge_ref" ] && command -v rt_pull_state >/dev/null 2>&1 \
        && rt_merge_pull="$(cd "$root" && rt_pull_state "$rt_merge_ref" 2>/dev/null)"
    return 0
}

rt_delivery_merge_run() {
    # An epic went into main while the run on its tip was red on the image build: the rollout fell,
    # and every next PR into main turned red. The red was on the PR page and was not read.
    #
    # A red and an unfinished run refuse. `none` passes: a PR into an epic branch gets no run at
    # all. No answer from the host — no demand here.
    local run name
    rt_delivery_merge_pull
    printf '%s' "$rt_merge_pull" | jq -e '.exists' >/dev/null 2>&1 || return 0
    run="$(printf '%s' "$rt_merge_pull" | jq -r '.run // empty' 2>/dev/null)"
    name="$(printf '%s' "$rt_merge_pull" | jq -r '.number // empty' 2>/dev/null)"
    name="${name:-$rt_merge_ref}"
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
    # `RT_MAIN_MERGE_BY_OWNER=1`. The host signs the merge commit by the merging account's primary
    # email unless the call names the author, and merges as the logged-in account without the token.
    local base
    printf '%s' "$cmd" | grep -qE '^[[:space:]]*(/[^[:space:]]*/)?gh[[:space:]]+pr[[:space:]]+merge[[:space:]]+(--help|-h)[[:space:]]*$' && return 0
    rt_delivery_merge_pull
    if [ -n "${RT_COMMIT_EMAIL:-}" ] && [ -z "$rt_merge_ref" ]; then
        unmet merge_author_declared no "the executor merges in one form only, as the whole command: ${pull_token_hint:+${pull_token_hint} }gh pr merge <number> --merge --author-email ${RT_COMMIT_EMAIL}. Without the author the host signs the merge commit by the merging account's private email; without the token it merges as the logged-in account; another form is not read, and a merge into the main branch could pass unseen."
        return 0
    fi
    [ "${RT_MAIN_MERGE_BY_OWNER:-}" = 1 ] || return 0
    base="$(printf '%s' "$rt_merge_pull" | jq -r '.base // empty' 2>/dev/null)"
    if [ -z "$base" ]; then
        unmet pr_base_known no "the base of the request${rt_merge_ref:+ ${rt_merge_ref}} is not known: the host did not answer or does not know the number. The merge into the main branch is the owner's here, and a merge with no base known may be one. Check the number; Repeat when the host answers."
    elif [ "$base" = "$main_branch" ]; then
        unmet merge_into_main yes "the request ${rt_merge_ref} goes into «${main_branch}», and here the owner merges into it by the button (RT_MAIN_MERGE_BY_OWNER=1). Tell the owner the number and that the work is ready; a task of an epic goes into the epic branch, and that merge is the executor's."
    fi
    return 0
}
