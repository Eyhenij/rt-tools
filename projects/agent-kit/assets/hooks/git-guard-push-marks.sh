#!/usr/bin/env bash
# The base of the push set and the marks of a green run, shared by the push guard and by the
# command that runs the set ahead (`git-guard-push-ahead.sh`).
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. Both callers source
# it, and it decides nothing alone — it answers "against what" and "was this already green".
#
# FAIL-OPEN: no network, no remote, no git — the base falls back to the main branch or to nothing,
# and a mark that cannot be read counts as absent. Either way the set runs, never less of it.

# The base the contribution is counted against. Prints `origin/<branch>` or nothing.
#
# The base is the remote branch the head has the fewest commits over: what the head carries past
# it is what this push adds to what the remote already holds. A stacked branch is so counted
# against the branch under it and a task branch against the branch of its epic, not against the
# main one: against the main one a branch of texts ran the snapshot sets, the end-to-end suites
# and the image builds of the whole epic.
#
# A branch that does not lie in the history of the head is a candidate only when the host moved
# it past the head by merging a request: the branch of an epic that took a neighbouring task in
# stays the base of every task standing on it, and a lower branch merged and removed is replaced
# by the branch it was merged into. A branch moved by plain commits is one that stands on this
# one, and git alone cannot tell which of two branches was taken from the other.
#
# The main branch wins a tie: another branch is taken only when it is strictly nearer.
#
# Three kinds of branches are no base, because they are this branch's own content:
#   - its own remote copy — the set answers for the whole contribution, not for the last commit;
#   - a branch that stands on that copy — it carries this branch inside itself;
#   - a branch the host merged into this one by a request. Without that the branch of an epic was
#     counted against its last merged task, and nothing checked the epic against the main branch
#     before the push. The host's merge is told by the committer of the commit: the host signs
#     its merges itself, and the subject there is the title of the request, which says nothing.
#     A tree whose host signs otherwise names the signature in `RT_PUSH_HOST_COMMITTER`.
#
# What this trusts: a branch on the remote got there through this set. The answer is read from the
# remote refs of the working copy after one fetch: no call to the host, and it works on the first
# push, when no request is open yet. A head that is no branch gets the main branch.
rt_push_base() {
    local main="$1" branch own ref name count best best_count merge merged='' host
    host="${RT_PUSH_HOST_COMMITTER:-GitHub <noreply@github.com>}"
    git fetch --quiet --no-prune origin 2>/dev/null
    git rev-parse --verify --quiet "refs/remotes/origin/$main" >/dev/null 2>&1 || return 0

    best="origin/$main"
    best_count="$(git rev-list --count "refs/remotes/origin/$main..HEAD" 2>/dev/null)"
    case "$best_count" in '' | *[!0-9]*) printf '%s' "$best" && return 0 ;; esac
    branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null)"
    [ -n "$branch" ] || { printf '%s' "$best" && return 0; }

    own="refs/remotes/origin/$branch"
    # The copy is told by the name alone: a branch taken straight from a remote one tracks that
    # one, and by the tracking the branch of the epic would pass for this branch's own copy.
    git rev-parse --verify --quiet "$own" >/dev/null 2>&1 || own=''

    # The refs the host merged into this line: reachable from the merged side of a request merge
    # on the first-parent line of the head and not from the side it was merged into.
    for merge in $(git rev-list --first-parent --merges --fixed-strings \
        --committer="$host" "refs/remotes/origin/$main..HEAD" 2>/dev/null); do
        merged="$merged
$(git for-each-ref --merged "$merge^2" --no-merged "$merge^1" --format='%(refname)' refs/remotes/origin 2>/dev/null)"
    done

    while IFS= read -r ref; do
        name="${ref#refs/remotes/origin/}"
        case "$name" in
            '' | HEAD | "$main" | "$branch" | *[!A-Za-z0-9._/-]*) continue ;;
        esac
        printf '%s\n' "$merged" | grep -qxF -- "$ref" && continue
        # A branch that carries the own copy stands on this one — unless the two are one commit:
        # a branch pushed before its first commit still lies at the tip it was taken from.
        [ -n "$own" ] && [ "$(git rev-parse "$own")" != "$(git rev-parse "$ref")" ] &&
            git merge-base --is-ancestor "$own" "$ref" 2>/dev/null && continue
        if ! git merge-base --is-ancestor "$ref" HEAD 2>/dev/null; then
            [ -n "$(git rev-list -n 1 --first-parent --merges --fixed-strings --committer="$host" \
                "HEAD..$ref" 2>/dev/null)" ] || continue
        fi
        # What the main branch already holds is not counted: a task that took the main branch in
        # would otherwise look farther from the branch of its epic than from the main one.
        count="$(git rev-list --count HEAD --not "$ref" "refs/remotes/origin/$main" 2>/dev/null)" || continue
        case "$count" in '' | *[!0-9]*) continue ;; esac
        # Strictly nearer, or equally near and lying under the one already taken: a neighbouring
        # task taken from the branch of the epic is as near as that branch, and the base is the
        # branch both stand on. The main branch is never displaced on a tie; of two unrelated
        # branches the first by name stays — the refs come sorted.
        if [ "$count" -lt "$best_count" ] ||
            { [ "$count" -eq "$best_count" ] && [ "$best" != "origin/$main" ] &&
                git merge-base --is-ancestor "$ref" "refs/remotes/$best" 2>/dev/null; }; then
            best="origin/$name"
            best_count="$count"
        fi
    done <<EOF
$(git for-each-ref --format='%(refname)' refs/remotes/origin 2>/dev/null)
EOF

    printf '%s' "$best"
}

# A mark is trusted only on a clean working copy. The checks run over the working copy, while the
# push sends commits: with an edit outside the index the two differ, and a mark would vouch for
# what does not leave. The observations record is not counted: the guard writes it itself, on every
# call, and a tree that does not ignore it would never get a single mark.
rt_push_mark_clean() {
    [ -z "$(git status --porcelain -- . ':(exclude).claude/rt-kit/observations' 2>/dev/null)" ]
}

# Whether the head adds nothing to its base: every commit of it already lies in that branch on the
# remote. Such a push sends content the set already judged there, and running the set over it costs
# its whole length and can find nothing — a branch of an epic just taken from the main branch paid
# forty minutes for a tree equal to the main one. A base that is no remote ref answers «it adds».
rt_push_adds_nothing() {
    local base="$1" count
    [ -n "$base" ] || return 1
    git rev-parse --verify --quiet "refs/remotes/$base" >/dev/null 2>&1 || return 1
    count="$(git rev-list --count "refs/remotes/$base..HEAD" 2>/dev/null)"
    [ "$count" = 0 ]
}

# The key of a mark: the check line, the tree of the head and the commit of the base. The tree and
# not the commit — an amended commit with the same content does not pay again; the base too — a
# step chosen by what the branch touched answers for that base alone.
#
# A check that reads a part of the tree only is keyed by that part. The profile names the paths the
# check does not read — `rt_push_check_unread <check>` prints path specs, one per line — and a
# commit of those paths alone leaves the mark in force. Without it the task folder taken apart by
# the last commit of a branch, or one line in a plan, ran the whole set again over code the set had
# just judged. A check the profile says nothing about is keyed by the whole tree, as before. The
# index is read rather than the head: a mark is trusted on a clean copy alone, where the two match.
rt_push_mark_key() {
    local tree base_sha='' unread=''
    command -v rt_push_check_unread >/dev/null 2>&1 && unread="$(rt_push_check_unread "$1" 2>/dev/null)"
    if [ -n "$unread" ]; then
        # shellcheck disable=SC2086
        # A listing that failed gives no key: its empty output would hash to one constant, and a
        # mark under it would outlive every edit. The listing goes from the root of the copy.
        local listed
        listed="$(IFS='
'; git -c core.quotePath=false ls-files -s -- ':(top)' $unread 2>/dev/null)" || return 1
        [ -n "$listed" ] || return 1
        tree="$(printf '%s\n' "$listed" | git hash-object --stdin 2>/dev/null)"
        [ -n "$tree" ] || return 1
    else
        tree="$(git rev-parse --verify --quiet 'HEAD^{tree}' 2>/dev/null)" || return 1
    fi
    [ -n "$2" ] && base_sha="$(git rev-parse --verify --quiet "$2" 2>/dev/null)"
    printf '%s\n%s\n%s\n' "$1" "$tree" "$base_sha" | git hash-object --stdin 2>/dev/null
}

# The marks live in the shared `.git` directory: every working copy of the repository sees them,
# and none of them lands in history.
rt_push_mark_dir() {
    local common
    common="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
    printf '%s/rt-kit/push-green' "$common"
}

rt_push_mark_has() {
    local key dir
    rt_push_mark_clean || return 1
    key="$(rt_push_mark_key "$1" "$2")" || return 1
    dir="$(rt_push_mark_dir)" || return 1
    [ -n "$key" ] && [ -f "$dir/$key" ]
}

# The third argument is the key taken BEFORE the check ran. A commit made while it ran — by
# another session or by hand — changes the tree, and a mark written by the new key would vouch for
# content the check never saw: such a run writes nothing.
rt_push_mark_put() {
    local key dir
    rt_push_mark_clean || return 0
    key="$(rt_push_mark_key "$1" "$2")" || return 0
    [ -n "$key" ] && [ "$key" = "$3" ] || return 0
    dir="$(rt_push_mark_dir)" || return 0
    mkdir -p "$dir" 2>/dev/null && printf '%s\n' "$1" > "$dir/$key" 2>/dev/null
    return 0
}

# Removes the mark of a check on this base, if there is one. Used when the whole set went over its
# time limit: the next run of the same code then runs every step again instead of passing by marks.
rt_push_mark_drop() {
    local key dir
    key="$(rt_push_mark_key "$1" "$2")" || return 0
    dir="$(rt_push_mark_dir)" || return 0
    [ -n "$key" ] && rm -f "$dir/$key" 2>/dev/null
    return 0
}

# The tree runs its heavy steps ahead and the guard only reads their marks. Declared by the
# profile: in a tree whose heavy steps fit the hook limit a refusal for a missing mark is a new step
# for nothing, and the package does not know how long another tree's steps take.
rt_push_heavy_ahead() {
    [ "${RT_PUSH_HEAVY_AHEAD:-}" = 1 ]
}

# The refusal of a check that passed but took longer than the profile allows it, or nothing. The
# limit is the tree's measurement of that step: over it, the set grew, and the push is refused so
# that the minutes are seen at the push that added them, not weeks later by the owner.
rt_push_over_budget() {
    local check="$1" took="$2" limit words
    command -v rt_push_check_budget >/dev/null 2>&1 || return 0
    limit="$(rt_push_check_budget "$check" 2>/dev/null)"
    case "$limit" in '' | *[!0-9]*) return 0 ;; esac
    case "$took" in '' | *[!0-9]*) return 0 ;; esac
    # No margin over the limit: a limit is only ever lowered, and a margin would raise every one.
    [ "$took" -gt "$limit" ] || return 0
    words="$(command -v rt_push_over_budget_words >/dev/null 2>&1 && rt_push_over_budget_words "$check" 2>/dev/null)"
    printf 'over the time limit: %ss against %ss measured for this step. Find what the step runs that the change does not need.%s\n' \
        "$took" "$limit" "${words:+ $words}"
}

# The refusal of a whole set that took longer than the profile allows a push, or nothing. Every
# step can stay within its own limit while the set holds steps the change did not need: only the
# sum shows it. The runners drop the marks this run put, so a second push of the same code runs
# the whole set again and does not pass by marks: the executor finds out why the set ran so long and
# makes it fit, not repeats the push.
rt_push_set_over_budget() {
    local took="$1" limit words
    command -v rt_push_set_budget >/dev/null 2>&1 || return 0
    limit="$(rt_push_set_budget 2>/dev/null)"
    case "$limit" in '' | *[!0-9]*) return 0 ;; esac
    case "$took" in '' | *[!0-9]*) return 0 ;; esac
    [ "$took" -gt "$limit" ] || return 0
    words="$(command -v rt_push_over_budget_words >/dev/null 2>&1 && rt_push_over_budget_words 'the whole set' 2>/dev/null)"
    printf 'the push went over its time limit: %ss against %ss measured for a whole set. Find out why before the next push: name every step that ran, the file of the change that called it and its minutes.%s\n' \
        "$took" "$limit" "${words:+ $words}"
}
