#!/usr/bin/env bash
# rt-kit v0.42.0 · hooks/git-guard-delivery-identity.sh · 23759600da94 · правится надстройкой, не здесь
# The identity of the call that opens a PR, for the delivery guard: who will open it and whether that
# account is its own reviewer.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The delivery guard
# sources it and calls `rt_delivery_identity` on a PR opening — one tier of its verdict, moved out when
# the guard reached its length limit. It uses the guard's own variables — the command, the machine
# account, the token variable and the ready substitution — and the guard's `unmet_class`.
#
# The hosting client holds two accounts — the logged-in one and the one whose token stands in the call
# environment; which of them opens the PR is visible from the command only through an explicit
# substitution.
#
# What is judged is the clash with the reviewer: the author of a PR is never its reviewer, the hosting
# silently drops such a review request, and the author cannot be changed afterwards. A PR opened by any
# other account is lawful while its reviewer is somebody else — judging the name alone leaves a machine
# that holds no token with no way to deliver at all. A command that substitutes the token says it opens
# the PR by the machine account: an answer of the hosting that names another one means the substitution
# came out empty, and that is refused.
#
# FAIL-OPEN: no helper to ask the hosting with and no token variable named — not judged.

rt_delivery_identity() {
    local pull_reviewer token_login substituted=''
    # The value is taken as one word up to the next space: a login has no spaces in it, and an alphabet
    # listed by ranges would silently not recognise a neighbouring one — the value then reads as absent,
    # and the clash with the reviewer goes unnoticed.
    pull_reviewer="$(printf '%s' "$cmd" | sed -n "s/.*--reviewer[= ]\{1,\}['\"]\{0,1\}\([^[:space:]'\"]\{1,\}\).*/\1/p" | head -1)"
    # The same words in quotes, in a comment and in a heredoc are text: the body of a request names the
    # variable and substitutes nothing. A script may substitute it on a line of its own.
    command -v rt_bare >/dev/null 2>&1 || rt_bare() { cat; }
    command -v rt_no_heredocs >/dev/null 2>&1 || rt_no_heredocs() { cat; }
    [ -n "$pull_token_var" ] \
        && printf '%s\n%s\n' "$cmd" "${script_text:-}" | rt_no_heredocs | rt_bare | grep -qE "(^|[;&|(]|&&|\|\||[[:space:]])${pull_token_var}=" \
        && substituted=1

    # Who will open the PR is asked of the hosting by the tree: the hosting, the client and the path to
    # the token are each their own. The answer covers both accounts at once — the substitution reads a
    # file that may not be on the machine, and then the client answers from the logged-in one.
    token_login=''
    command -v rt_pull_token_login >/dev/null 2>&1 && token_login="$(rt_pull_token_login 2>/dev/null)"

    if [ -n "$token_login" ]; then
        if [ -n "$pull_reviewer" ] && [ "$token_login" = "$pull_reviewer" ]; then
            unmet_class pr_create_self_review "the request would be opened by the account «${token_login}», and the same one is named as its reviewer. The hosting accepts such a review request and silently does not create it, and the author of a request cannot be changed — it is fixed only by reopening. Open it by another account${pull_token_hint:+, substituting the token: ${pull_token_hint} …}, or name another reviewer."
        elif [ -n "$task_bot" ] && [ "$token_login" != "$task_bot" ] && [ -n "$substituted" ]; then
            unmet_class pr_create_self_review "the command substitutes «${pull_token_var}», and the hosting answers as «${token_login}», not as the machine account «${task_bot}»: the substitution came out empty or carries a foreign token. The author of a request cannot be changed — it is fixed only by reopening. Check the file the token is read from and repeat${pull_token_hint:+: ${pull_token_hint} …}"
        elif [ -n "$task_bot" ] && [ "$token_login" != "$task_bot" ]; then
            # Not a refusal: the command promises no machine account, the reviewer is somebody else, and
            # the review will be created. But silence about a foreign account is indistinguishable from
            # a check that did not fire at all.
            printf 'the delivery guard: the request will come out from the account «%s», not the machine one «%s». The reviewer is another one, so the review will be created.\n' "$token_login" "$task_bot" >&2
        fi
    elif [ -n "$pull_token_var" ] && [ -z "$substituted" ]; then
        # There is nothing to learn the author by — no helper, or an empty answer from it. Then the only
        # lawful call is the one that names the account in its own text.
        unmet_class pr_create_self_review "who will open the request cannot be learned: the hosting was not asked, and the command carries no substitution of «${pull_token_var}». Opened by the logged-in account, the request may come out from the very person named as its reviewer, and that is fixed only by reopening.${pull_token_hint:+ Substitute the token: ${pull_token_hint} …}"
    fi
    return 0
}
