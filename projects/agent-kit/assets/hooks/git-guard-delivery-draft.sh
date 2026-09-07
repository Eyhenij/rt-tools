#!/usr/bin/env bash
# Leaving draft, for the delivery guard: does the PR have a review, does it conflict, and was it
# opened by the right account.
#
# There is deliberately no `# rt-hook:` line here: the event and the call pattern are declared by
# the guard itself, while a helper next to it registers as no hook and decides nothing on its own.
# It is called from the guard and uses the guard's own variables — the command, the tree root, the
# machine account — and the guard's refusal.
#
# It was moved out because the guard grew to the length limit: leaving draft is the most separate
# of its subjects — its own check point, its own network tier, its own three refusals.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_delivery_draft_ready() {
    # --- leaving draft ----------------------------------------------------------------------
    #
    # Before this edit nobody asked for a reviewer. He stood as prose in the rule, while the
    # hosting accepts a review request on oneself silently and creates none: the review looks
    # requested all the same. There is nowhere to ask earlier than leaving draft — before the PR
    # is opened there is no reviewer at all — and leaving draft is itself the move that declares
    # the work ready.
    #
    # The tier is a network one, and it stays silent the same way as the task state tier: no
    # answer — no demand.
    #
    # Returning a PR to draft does not fall under the demand: it does exactly what the guard is
    # after — it takes the look of readiness off the work.
    if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}(gh[[:space:]]+pr[[:space:]]+ready|glab[[:space:]]+mr[[:space:]]+update[^|;&]*--ready)([[:space:]]|\$)" \
        && ! printf '%s' "$cmd" | grep -q -- '--undo'; then
        # A reference to the PR is optional: without it the client takes the PR of the current
        # branch, and that is the shortest form of the call. Demanding a number would mean lifting
        # the whole demand with a single space. So the first argument is taken, whatever it is —
        # a number, an address or a branch name — and its absence means "ask about the current
        # branch".
        pull_ref="$(printf '%s' "$cmd" | sed -nE 's/.*(gh[[:space:]]+pr[[:space:]]+ready|glab[[:space:]]+mr[[:space:]]+update)[[:space:]]+([^[:space:];&|-][^[:space:];&|]*).*/\2/p' | head -1)"
        if rt_needs rt_pull_state git-guard-delivery; then
            pull="$(cd "$root" && rt_pull_state "$pull_ref" 2>/dev/null)" || pull=''
            if [ -n "$pull" ] && printf '%s' "$pull" | jq -e '.exists' >/dev/null 2>&1; then
                # The number is taken from the answer, and if it is not there — from the command
                # itself: a PR named by an address or a branch name must stay recognisable in the
                # refusal.
                pull_name="$(printf '%s' "$pull" | jq -r '.number // empty' 2>/dev/null)"
                # A number is written with a hash, and a branch name or an address in quotes: a
                # hash before an address reads as a typo, not as a reference to a PR.
                [ -z "$pull_name" ] && pull_name="$pull_ref"
                case "$pull_name" in
                    '') ;;
                    *[!0-9]*) pull_name=" «${pull_name}»" ;;
                    *) pull_name=" #${pull_name}" ;;
                esac
                printf '%s' "$pull" | jq -e '.reviewed' >/dev/null 2>&1 \
                    || fault "у заявки${pull_name} нет разбора: ревьювер не запрошен и отзыва никто не оставлял. Снятый черновик читается как «можно вливать», а вливать некому — назначь ревьювера и повтори."

                # A conflict arrives into a handed-over PR through someone else's merge, without
                # a single action by its author: the base checked at opening is yesterday's by the
                # time draft is left. A PR out of draft reads as "ready to merge", and there is
                # nothing to merge — the owner opens the PR and finds a conflict there. Silence on
                # unknown mergeability stays: the hosting recomputes it after every edit of the
                # main branch, and "not computed yet" is not "conflicts".
                printf '%s' "$pull" | jq -e '.conflicting' >/dev/null 2>&1 \
                    && fault "заявка${pull_name} конфликтует с главной веткой. Влей её в свою ветку, разбери конфликт и повтори: снятый черновик читается как «можно вливать», а слить эту заявку нельзя."

                # The author of the PR. At opening there was nothing to judge by but the text of
                # the command: the identity of the call comes from the environment. Here it is
                # already named by the hosting, and this is the last move where the miss is still
                # fixable — after draft is left the PR gets merged, and a merged one cannot be
                # reopened. A tree that named no machine account does not judge the author.
                if [ -n "$task_bot" ]; then
                    pull_author="$(printf '%s' "$pull" | jq -r '.author // empty' 2>/dev/null)"
                    [ -n "$pull_author" ] && [ "$pull_author" != "$task_bot" ] \
                        && fault "заявку${pull_name} открыла запись «${pull_author}», а не машинная «${task_bot}». Автор заявки её ревьювером не бывает, и разбор ей назначить нечем. Автора не сменить — закрой заявку и открой заново${pull_token_hint:+, подставив токен: ${pull_token_hint} …}."
                fi
            fi
        fi

        # The task folder: the same subject as at opening and at the merge, as a third line. The
        # condition is local — it reads the branch, not the hosting — and therefore stands outside
        # the network tier above.
        command -v rt_delivery_ready_folder >/dev/null 2>&1 && rt_delivery_ready_folder

        deny_faults
    fi
}
