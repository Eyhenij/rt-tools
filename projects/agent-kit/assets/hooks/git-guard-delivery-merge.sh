#!/usr/bin/env bash
# The run on the tip of a PR being merged, its author and its base, for the delivery guard.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it and calls it on a merge command. It uses the guard's own variables — the command, the
# tree root and the token variable — and the guard's `unmet`.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

# Every merge of the command, one line each: `ref`, `author`, `repo` split by the unit separator. A merge is a call whose
# word before `pr merge` is the client by any path or a shell function wrapping it; each link of a
# chain is its own merge. The arguments are split by quotes, and only a flag names the author: an
# address inside the subject or the body is text. `--help` merges nothing.
rt_delivery_merge_calls() {
    local seg tail tok want ref author repo help
    printf '%s\n' "$cmd" | awk '{ gsub(/&&|\|\||[;|]/, "\n"); print }' | while IFS= read -r seg; do
        printf '%s' "$seg" | grep -qE '^[[:space:]]*[({]?[[:space:]]*(([A-Za-z_][A-Za-z0-9_]*=("[^"]*"|'\''[^'\'']*'\''|[^[:space:]]*))[[:space:]]+)*((command|exec|env|nohup|time)[[:space:]]+)*[^[:space:]=]+[[:space:]]+pr[[:space:]]+merge([[:space:]]|$)' || continue
        tail="$(printf '%s' "$seg" | sed -E 's/^.*[[:space:]]pr[[:space:]]+merge//')"
        ref='' author='' repo='' help='' want=''
        while IFS= read -r tok; do
            [ -n "$tok" ] || continue
            if [ -n "$want" ]; then printf -v "$want" '%s' "$tok"; want=''; continue; fi
            case "$tok" in
                --help|-h) help=1 ;;
                --author-email|-A) want=author ;;
                --author-email=*) author="${tok#*=}" ;;
                -A=*) author="${tok#-A=}" ;;
                -A?*) author="${tok#-A}" ;;
                --repo|-R) want=repo ;;
                --repo=*) repo="${tok#*=}" ;;
                -R?*) repo="${tok#-R}"; repo="${repo#=}" ;;
                --subject|-t|--body|-b|--body-file|-F|--match-head-commit) want=skip ;;
                -*) ;;
                *) [ -n "$ref" ] || ref="$tok" ;;
            esac
        done < <(printf '%s' "$tail" | xargs -n1 printf '%s\n' 2>/dev/null)
        [ -n "$help" ] || printf '%s\037%s\037%s\n' "$ref" "$author" "$repo"
    done
}

# The state of each merge, asked of the host once into `rt_merge_pulls`: `ref`, `author`, `state`.
# A number with `--repo` is asked by its address, so the base is read in that repository.
rt_delivery_merge_pulls() {
    [ -n "${rt_merge_pulls_read:-}" ] && return 0
    local ref author repo ask pull
    rt_merge_pulls=''
    while IFS=$'\037' read -r ref author repo; do
        ask="$ref"
        case "$ref" in [0-9]*) [ -n "$repo" ] && ask="https://github.com/${repo}/pull/${ref}" ;; esac
        pull=''
        [ -n "$ref" ] && command -v rt_pull_state >/dev/null 2>&1 && pull="$(cd "$root" && rt_pull_state "$ask" 2>/dev/null)"
        rt_merge_pulls="${rt_merge_pulls}${ref}"$'\037'"${author}"$'\037'"$(printf '%s' "$pull" | tr -d '\n\037')
"
    done < <(rt_delivery_merge_calls)
    rt_merge_pulls_read=1
}

rt_delivery_merge_run() {
    # An epic went into main while the run on its tip was red on the image build: the rollout fell,
    # and every next PR into main turned red. The red was on the PR page and was not read.
    #
    # A red and an unfinished run refuse. `none` passes: a PR into an epic branch gets no run at
    # all. No answer from the host — no demand here; the base below asks for one.
    local ref author pull run name
    rt_delivery_merge_pulls
    while IFS=$'\037' read -r ref author pull; do
        printf '%s' "$pull" | jq -e '.exists' >/dev/null 2>&1 || continue
        run="$(printf '%s' "$pull" | jq -r '.run // empty' 2>/dev/null)"
        name="$(printf '%s' "$pull" | jq -r '.number // empty' 2>/dev/null)"
        name="${name:-$ref}"
        case "$run" in
            failure)
                unmet pr_tip_run failure "the run on the tip of the request${name:+ #${name}} is red. A merge over red carries the breakage into the branch, and every next request into it turns red. Read the run — gh run list --commit <tip> — fix it in the branch and repeat." ;;
            running)
                unmet pr_tip_run running "the run on the tip of the request${name:+ #${name}} has not finished. A merge before its end carries what it has not checked yet. Wait for its end and read the result by a command." ;;
        esac
    done < <(printf '%s' "$rt_merge_pulls")
    return 0
}

rt_delivery_merge_who() {
    # The executor merges the PRs of a task into the epic branch by the owner's word named in
    # advance; the epic into the main branch is the owner's button where the tree says so by
    # `RT_MAIN_MERGE_BY_OWNER=1`. The host signs the merge commit by the merging account's primary
    # email unless the call names the author, and it merges as the logged-in account unless the
    # call substitutes the machine token.
    local ref author pull base token=''
    [ -n "${pull_token_var:-}" ] && printf '%s' "$cmd" | grep -qE "(^|[;&|({]|&&|\|\||[[:space:]])${pull_token_var}=" && token=1
    rt_delivery_merge_pulls
    while IFS=$'\037' read -r ref author pull; do
        if [ -n "${RT_COMMIT_EMAIL:-}" ] && { [ "$author" != "$RT_COMMIT_EMAIL" ] || { [ -n "${pull_token_var:-}" ] && [ -z "$token" ]; }; }; then
            unmet merge_author_declared no "the merge${ref:+ of ${ref}} names no author or a foreign one${author:+ (${author})}, or goes without «${pull_token_var:-the token}» of the machine account. The host signs the merge commit by the merging account's primary email, and a private address lands in the history of the branch. Name both: ${pull_token_hint:+${pull_token_hint} }gh pr merge <number> --merge --author-email ${RT_COMMIT_EMAIL}."
        fi
        [ "${RT_MAIN_MERGE_BY_OWNER:-}" = 1 ] || continue
        base="$(printf '%s' "$pull" | jq -r '.base // empty' 2>/dev/null)"
        if [ -z "$ref" ]; then
            unmet pr_base_known no "the merge names no request: the client would take the request of the current branch, and its base is not known in advance. The merge into the main branch is the owner's here. Name the number: gh pr merge <number> …"
        elif [ -n "$pull" ] && ! printf '%s' "$pull" | jq -e '.exists' >/dev/null 2>&1; then
            unmet pr_base_known no "the request ${ref} is not found on the host, and its base is not known. The merge into the main branch is the owner's here. Check the number and its repository."
        elif [ -z "$base" ]; then
            unmet pr_base_known no "the base of the request ${ref} is not known: the host did not answer. The merge into the main branch is the owner's here, and a merge with no base known may be one. Repeat when the host answers."
        elif [ "$base" = "$main_branch" ]; then
            unmet merge_into_main yes "the request ${ref} goes into «${main_branch}», and here the owner merges into it by the button (RT_MAIN_MERGE_BY_OWNER=1). Tell the owner the number and that the work is ready; a task of an epic goes into the epic branch, and that merge is the executor's."
        fi
    done < <(printf '%s' "$rt_merge_pulls")
    return 0
}
