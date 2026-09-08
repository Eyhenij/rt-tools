#!/usr/bin/env bash
# rt-kit v0.26.0 · hooks/git-guard-delivery-signature.sh · d23f582104b2 · правится надстройкой, не здесь
# The signature of a machine commit for the delivery guard: whose commit it is, whether it is signed
# with the right mail and what to do if it is not.
#
# There is deliberately no `# rt-hook:` line here: the event and the call pattern are declared by the
# guard itself, and a helper next to it is not registered as a hook and decides nothing alone. It is
# called from the guard and uses the guard variables — the command, the declared mail, the name of
# the main branch — and its refusal.
#
# It was moved out of there because the guard grew to the length limit: it holds five subjects, and
# the signature is the most separate of them — a check point of its own, conditions of silence of
# its own, a refusal of its own.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true
# The helper takes the start of a call from the same place as every guard. It is sourced here too,
# although the calling guard has already done it: an empty pattern would turn the sign into a search
# for a word over the whole line, that is, into a refusal on every mention of the command.
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hook-input.sh" 2>/dev/null || true

rt_delivery_signature() {
# --- the signature of a machine commit ----------------------------------------------------
#
# The service address of the hosting consists of a number, a login and a domain, and is matched by
# the number: nobody checks the login next to it. A commit with a foreign number is ascribed by the
# hosting to an outside person, and from the inside this looks right — the account name in the
# history is the very one. That is how eleven commits went into the main branch under a foreign
# signature; the owner found it, reading the history by eye.
#
# There are two points — the commit and the push, and they judge one thing: the signature of commits
# already lying in the contribution of the branch. The text of the command itself is parsed at
# neither of them: the mail is set by its variables, and parsing would catch the same line that is
# already before the eyes of whoever typed it.
#
# The commit was added because the miss is made at it and before the push it manages to settle into
# several commits in a row: each next one takes the address from the previous. A miss refused at the
# commit is fixed by rewriting the last commit in the same move; one refused at the push — by
# rewriting the history, and the executor may have no right to that at all. The first commit of the
# branch passes: there is nothing to judge, the contribution is empty.
#
# What is judged is a commit that CALLED ITSELF the machine record: its login stands as the author
# name or as the left part of the mail. Recognising it by the mail itself is impossible — in such a
# commit it is exactly the mail that is wrong, and demanding a machine signature from every commit
# would refuse work done by a person with their own hands in the same tree.
#
# The login is read from the declared mail, it is not declared as a second trait: two declarations
# of one login would diverge silently. It is not the executor of the task either — in a tree where
# the hosting has restricted the machine record, a person is set as the executor, and the commit
# stays a machine one.
#
# A push call is recognised by two signs at once — the start of a call before the word `git` and the
# word `push` as a separate word. It cannot be caught by the single substring "git push": the
# credentials helper and the request header are put between them by `-c` keys. The start of a call
# counts variable assignments as part of the command: a push of a signed commit is typed with the
# token substituted, and the sign without them let through exactly the call this helper was made
# for. A dry-run push sends nothing, and its signature is not asked for. A deferred edit likewise:
# `git stash push` puts the edit into the stash of this same machine, so the stash is cut out of the
# line and the sign is counted over the remainder.
# A commit is recognised by the same technique: the word `commit` as a separate word in a git call.
# A dry-run commit is not told apart here — it knows no `--dry-run` of its own.
if printf '%s' "$cmd" | grep -qE "${RT_CMD_BOUND}git([[:space:]]|\$)" \
    && { { printf '%s' "$cmd" | sed -E 's/git[[:space:]]+stash[[:space:]]+push/git stash/g' | grep -qE '(^|[[:space:]])push([[:space:]]|$)' \
        && ! printf '%s' "$cmd" | grep -q -- '--dry-run'; } \
        || printf '%s' "$cmd" | grep -qE '(^|[[:space:]])commit([[:space:]]|$)'; }; then
    # Two conditions of silence. A tree that has not named the mail of the machine record gets no
    # requirement: the package has no machine record of its own, and an invented one would refuse
    # work in someone else's tree. No tip of the main branch — there is nothing to count the
    # contribution from.
    #
    # The contribution of the branch is judged, not the whole history: what this branch has already
    # merged into the main one is no longer fixable, and a refusal for it would refuse work instead
    # of a miss.
    if [ -n "$commit_email" ] \
        && git rev-parse --verify --quiet "refs/remotes/origin/${main_branch}" >/dev/null 2>&1; then
        # The left part of the service address: `<number>+<login>` or just the login.
        bot_login="${commit_email%%@*}"
        bot_login="${bot_login##*+}"

        # The repair named in the refusal is itself a commit, and without this exception the guard
        # refused it together with everything else: the divergence is removed only by a commit,
        # and a commit is refused while the divergence is there. The circle closed, and there was
        # no way out of it by the guard's own means — the second advice, rewriting the whole
        # contribution, demands a clean working tree, and saving the work is a commit too.
        #
        # The repair is recognised not by trusting the line — the note above rightly refuses that —
        # but by the declared mail: the guard looks in the call for exactly the address it declared
        # itself, in both variables at once, next to a rewrite of the last commit. Faking that means
        # putting the right signature, that is doing precisely what the guard demands.
        #
        # The quotes are stripped before matching: the same command is typed with double quotes,
        # with single ones and without any, and a sign counting on one form stays silent on the
        # other two — that is, refuses the repair again and says nothing about why.
        # A push is never a repair, whatever stands in its variables: the divergence has to be
        # removed BEFORE the contribution leaves, and after it only a force push helps. Without
        # this line a compound call carrying both the rewrite and the push would take the whole
        # exception onto the push as well.
        repair=''
        probe="$(printf '%s' "$cmd" | tr -d "\"'")"
        if ! printf '%s' "$probe" | sed -E 's/git[[:space:]]+stash[[:space:]]+push/git stash/g' | grep -qE '(^|[[:space:]])push([[:space:]]|$)' \
            && printf '%s' "$probe" | grep -qF "GIT_AUTHOR_EMAIL=${commit_email}" \
            && printf '%s' "$probe" | grep -qF "GIT_COMMITTER_EMAIL=${commit_email}" \
            && printf '%s' "$probe" | grep -qE '(^|[[:space:]])--amend([[:space:]]|$)'; then
            repair=1
        fi

        strangers=''
        while IFS="$(printf '\t')" read -r short author email; do
            [ -z "$short" ] && continue
            login="${email%%@*}"
            login="${login##*+}"
            [ "$author" = "$bot_login" ] || [ "$login" = "$bot_login" ] || continue
            [ "$email" = "$commit_email" ] && continue
            strangers="${strangers}${strangers:+, }${short} <${email}>"
        done <<EOF
$(git log --format='%h%x09%an%x09%ae' "origin/${main_branch}..HEAD" 2>/dev/null)
EOF

        # A commit under a record the tree has not declared used to pass silently: the helper
        # judged only a commit that called itself the machine record, and five commits in a row
        # under a foreign login did not fall under that condition at all. The hole is wider than the
        # one the helper closes.
        #
        # This half is switched on by the tree, by naming the mails of people in a profile key:
        # without it, demanding a known signature from every commit would refuse work done by a
        # person with their own hands. Named — then the machine record and the listed people are
        # known, and everything else is refused.
        unknown=''
        if [ -n "${RT_HUMAN_EMAILS:-}" ]; then
            while IFS="$(printf '\t')" read -r short author email; do
                [ -z "$short" ] && continue
                [ "$email" = "$commit_email" ] && continue
                known=''
                for one in $RT_HUMAN_EMAILS; do
                    [ "$email" = "$one" ] && known=1 && break
                done
                [ -n "$known" ] && continue
                unknown="${unknown}${unknown:+, }${short} <${email}>"
            done <<EOF
$(git log --format='%h%x09%an%x09%ae' "origin/${main_branch}..HEAD" 2>/dev/null)
EOF
        fi

        [ -n "$unknown" ] && [ -z "$repair" ] \
            && deny "BLOCKED: a commit of the contribution is signed by an account the tree never declared. Known are the machine account ${commit_email} and the emails of people named by the profile; everything else the hosting attributes to whoever owns that address, and from inside the history the miss is invisible. Diverging: ${unknown}. Rewrite the signature before the push, after it only a force push fixes this:
    the last commit — GIT_AUTHOR_EMAIL=\"${commit_email}\" GIT_COMMITTER_EMAIL=\"${commit_email}\" git commit --amend --no-edit --reset-author
    the whole contribution of the branch — git filter-branch -f --env-filter 'GIT_AUTHOR_EMAIL=\"${commit_email}\"; GIT_COMMITTER_EMAIL=\"${commit_email}\"' origin/${main_branch}..HEAD"

        [ -n "$strangers" ] && [ -z "$repair" ] \
            && deny "BLOCKED: a machine commit is signed by an email other than the one the tree declared. The hosting matches a service address by the number in it, and a commit with a foreign number it attributes to an outside person — from inside the miss is invisible, because the name of the account next to it is right. Diverging: ${strangers}. Declared: ${commit_email} — the email is taken from there, not typed from memory. Rewrite the signature before the push, after it only a force push fixes this:
    the last commit — GIT_AUTHOR_NAME=\"${bot_login}\" GIT_AUTHOR_EMAIL=\"${commit_email}\" GIT_COMMITTER_NAME=\"${bot_login}\" GIT_COMMITTER_EMAIL=\"${commit_email}\" git commit --amend --no-edit --reset-author
    the whole contribution of the branch — git filter-branch -f --env-filter 'GIT_AUTHOR_EMAIL=\"${commit_email}\"; GIT_COMMITTER_EMAIL=\"${commit_email}\"' origin/${main_branch}..HEAD"
    fi
fi
# This point has no exit of its own: a push happens to be a compound command too, and its second
# link is judged by the sections below.
}
