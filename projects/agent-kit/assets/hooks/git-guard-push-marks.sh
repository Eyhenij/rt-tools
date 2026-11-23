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
# remote refs of the working copy after one fetch, and it works on the first push, when no request
# is open yet. A head that is no branch gets the main branch.
#
# A ref of the copy is a candidate only while the host still holds its branch: one call of
# `git ls-remote --heads` per call of this function, the name matched whole. The fetch keeps
# `--no-prune` — a prune in one copy changes what a neighbouring copy measures — so a branch the
# host removed after its merge stays as a ref here. Taken as the base, it gave the set one base and
# the push another once a neighbour pruned the copy: a green set of half an hour was refused as
# «No green mark». With no answer from the host the refs of the copy decide, and a line on stderr
# says so.
rt_push_base() {
    local main="$1" branch own ref name count best best_count merge merged='' host live answered=1
    host="${RT_PUSH_HOST_COMMITTER:-GitHub <noreply@github.com>}"
    git fetch --quiet --no-prune origin 2>/dev/null
    git rev-parse --verify --quiet "refs/remotes/origin/$main" >/dev/null 2>&1 || return 0
    live="$(git ls-remote --heads origin 2>/dev/null)" || answered=0
    live="$(printf '%s\n' "$live" | cut -f2)"
    [ "$answered" = 1 ] ||
        printf 'push base: the host did not answer — the base is taken from the refs of the copy\n' >&2

    best="origin/$main"
    best_count="$(git rev-list --count "refs/remotes/origin/$main..HEAD" 2>/dev/null)"
    case "$best_count" in '' | *[!0-9]*) printf '%s' "$best" && return 0 ;; esac
    # shellcheck disable=SC1091
    command -v rt_fact_branch >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
    branch="$(rt_fact_branch)"
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
        # A branch the host no longer holds is no base: its ref outlives it in the copy.
        [ "$answered" = 0 ] || printf '%s\n' "$live" | grep -qxF -- "refs/heads/$name" || continue
        # A branch stands on this one when the own copy lies on its first-parent line: it was taken
        # from this one and went on by plain commits. A copy brought in by a merge — of the host or
        # of anyone — does not drop it, nor does the branch lying under the head or at it: what
        # the head holds already passed the set. A branch at the commit of the copy stays too: a
        # branch pushed before its first commit still lies at the tip it was taken from.
        [ -n "$own" ] && [ "$(git rev-parse "$own")" != "$(git rev-parse "$ref")" ] &&
            ! git merge-base --is-ancestor "$ref" HEAD 2>/dev/null &&
            git rev-list --first-parent "$ref" --not "$own^@" 2>/dev/null |
            grep -qxF -- "$(git rev-parse "$own")" && continue
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
# forty minutes for a tree equal to the main one. The base is a remote ref, or the ref the run ahead
# pinned at the commit of one; a base that is neither answers «it adds».
rt_push_adds_nothing() {
    local base="$1" ref count
    [ -n "$base" ] || return 1
    case "$base" in refs/rt-kit/push-base/*) ref="$base" ;; *) ref="refs/remotes/$base" ;; esac
    git rev-parse --verify --quiet "$ref" >/dev/null 2>&1 || return 1
    count="$(git rev-list --count "$ref..HEAD" 2>/dev/null)"
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

# The base of the run ahead, pinned for the branch. The run ahead picks the base, puts a ref of its
# own at its commit and gives the steps of the set that ref, not the remote one: a remote ref moves
# with every fetch and vanishes with a prune, the pinned one stands until the next run ahead of the
# branch. A record next to it keeps the tree of the head, the name of the base, its commit and the
# head commit. The push guard and the git hook take the pinned ref while the record fits the head,
# and pick the base anew otherwise. A record fits a head with the same tree or a head that lies over
# the recorded one: a commit after the set — the task folder taken apart, a line in a plan — keeps
# the marks of the steps that do not read it.
#
# Without the record the push picked its base by itself. On 21.11 a set of half an hour took the
# ref of a branch the host had removed as its base; a neighbouring copy pruned the refs, the push
# picked the main branch and refused as «No green mark». Records and refs are kept per branch: the
# branches of a chain run ahead one after another in one copy. The records lie in the directory of
# the working copy, the refs in the shared refs — a branch is worked in one copy at a time.
rt_push_base_branch() {
    # shellcheck disable=SC1091
    command -v rt_fact_branch >/dev/null 2>&1 || . "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/facts.sh" 2>/dev/null
    rt_fact_branch 2>/dev/null
}

# The pinned ref of a branch. It is named by a number, not by the branch: the ref stands in every
# line of the set that names the base, and the profile reads those lines by words — `visual-gate`,
# `e2e` — that a branch name may carry. A line of light checks then passed for a heavy one, and its
# mark outlived a commit of the paths a heavy step does not read.
rt_push_base_ref() {
    [ -n "$1" ] || return 1
    printf 'refs/rt-kit/push-base/%s' "$(printf '%s' "$1" | cksum | cut -d' ' -f1)"
}

# Removes the records and the refs of branches the copy no longer holds: nothing else removes them,
# and a pinned ref keeps its commits from the collection of garbage.
rt_push_base_sweep() {
    local dir file branch
    dir="$(git rev-parse --path-format=absolute --git-dir 2>/dev/null)/rt-kit/push-base.d"
    [ -d "$dir" ] || return 0
    find "$dir" -type f 2>/dev/null | while IFS= read -r file; do
        branch="${file#"$dir"/}"
        git show-ref --verify --quiet "refs/heads/$branch" 2>/dev/null && continue
        git update-ref -d "$(rt_push_base_ref "$branch")" 2>/dev/null
        rm -f "$file" 2>/dev/null
    done
    return 0
}

rt_push_base_record_path() {
    local dir branch
    dir="$(git rev-parse --path-format=absolute --git-dir 2>/dev/null)" || return 1
    branch="$(rt_push_base_branch)"
    [ -n "$branch" ] || return 1
    printf '%s/rt-kit/push-base.d/%s' "$dir" "$branch"
}

# Pins the base `$1` for the branch: writes the record and the ref, prints the ref. No branch, or a
# base with no commit — prints `$1` itself, and the set runs against the remote ref as before.
rt_push_base_pin() {
    local path tree sha head branch ref
    [ -n "$1" ] || return 0
    branch="$(rt_push_base_branch)"
    tree="$(git rev-parse --verify --quiet 'HEAD^{tree}' 2>/dev/null)"
    head="$(git rev-parse --verify --quiet HEAD 2>/dev/null)"
    sha="$(git rev-parse --verify --quiet "$1^{commit}" 2>/dev/null)"
    path="$(rt_push_base_record_path)"
    ref="$(rt_push_base_ref "$branch")"
    rt_push_base_sweep
    if [ -z "$branch" ] || [ -z "$tree" ] || [ -z "$head" ] || [ -z "$sha" ] || [ -z "$path" ] ||
        ! mkdir -p "${path%/*}" 2>/dev/null ||
        ! git update-ref "$ref" "$sha" 2>/dev/null ||
        ! printf '%s\n%s\n%s\n%s\n' "$tree" "$1" "$sha" "$head" > "$path" 2>/dev/null; then
        printf '%s' "$1"
        return 0
    fi
    printf '%s' "$ref"
}

# Whether the record of the branch fits the head: the same tree, or a head that lies over the
# recorded one by plain commits. A merge over the recorded head brings content of other branches —
# the branch of the epic moved and taken in — and the base is picked anew: counted from the old
# base, that content would pass for this branch's own. Prints the name of the base and its commit
# on two lines.
rt_push_base_fits() {
    local path tree name sha head
    path="$(rt_push_base_record_path)" || return 1
    [ -f "$path" ] || return 1
    { IFS= read -r tree && IFS= read -r name && IFS= read -r sha && IFS= read -r head; } < "$path" || return 1
    case "$name" in origin/?*) ;; *) return 1 ;; esac
    git cat-file -e "$sha^{commit}" 2>/dev/null || return 1
    if [ "$tree" != "$(git rev-parse --verify --quiet 'HEAD^{tree}' 2>/dev/null)" ]; then
        git merge-base --is-ancestor "$head" HEAD 2>/dev/null || return 1
        [ "$(git rev-list --merges --count "$head..HEAD" 2>/dev/null)" = 0 ] || return 1
    fi
    printf '%s\n%s\n' "$name" "$sha"
}

# Prints the pinned ref of the branch when the record fits the head, with the ref put back at the
# recorded commit if anything moved it. The remote refs are fetched first, as a pick does: light
# steps read the main branch by its remote ref. No record, or one that does not fit — no answer.
rt_push_base_recorded() {
    local fit sha ref
    fit="$(rt_push_base_fits)" || return 1
    sha="$(printf '%s\n' "$fit" | sed -n 2p)"
    ref="$(rt_push_base_ref "$(rt_push_base_branch)")" || return 1
    git fetch --quiet --no-prune origin 2>/dev/null
    [ "$(git rev-parse --verify --quiet "$ref" 2>/dev/null)" = "$sha" ] ||
        git update-ref "$ref" "$sha" 2>/dev/null || return 1
    printf '%s' "$ref"
}

# The base `$1` picked anew, or the pinned ref when the record names that very base at the commit
# it stands on now: a record that stopped fitting — an amended commit of unread paths — keeps its
# marks while the base did not move.
rt_push_base_same() {
    local path name sha ref
    path="$(rt_push_base_record_path)" || { printf '%s' "$1"; return 0; }
    name="$(sed -n 2p "$path" 2>/dev/null)"
    sha="$(sed -n 3p "$path" 2>/dev/null)"
    ref="$(rt_push_base_ref "$(rt_push_base_branch)")"
    if [ -n "$1" ] && [ "$name" = "$1" ] && [ -n "$sha" ] &&
        [ "$(git rev-parse --verify --quiet "$1^{commit}" 2>/dev/null)" = "$sha" ] &&
        { [ "$(git rev-parse --verify --quiet "$ref" 2>/dev/null)" = "$sha" ] ||
            git update-ref "$ref" "$sha" 2>/dev/null; }; then
        printf '%s' "$ref"
        return 0
    fi
    printf '%s' "$1"
}

# A base as a person reads it: a pinned ref is named by the remote branch it stands for and its
# commit, any other base by itself.
rt_push_base_label() {
    local path
    case "$1" in
        refs/rt-kit/push-base/*)
            path="$(rt_push_base_record_path)" && [ -f "$path" ] &&
                printf '%s pinned at %s' "$(sed -n 2p "$path")" "$(sed -n 3p "$path" | cut -c1-9)" && return 0
            ;;
    esac
    printf '%s' "${1:-none}"
}

# The base the last run ahead of this branch judged, for the refusal: the base, and «another
# history» when the record does not fit the head. No record — nothing.
rt_push_base_last() {
    local path name
    path="$(rt_push_base_record_path)" || return 0
    [ -f "$path" ] || return 0
    name="$(sed -n 2p "$path" 2>/dev/null)"
    [ -n "$name" ] || return 0
    if rt_push_base_fits >/dev/null; then
        printf '%s pinned at %s' "$name" "$(sed -n 3p "$path" | cut -c1-9)"
    else
        printf '%s (another history)' "$name"
    fi
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

# The steps of the set on stdin, the ones the change reaches on stdout, a line per step with its
# reason to stderr. What a step reads is taken from the table `push-inputs.mjs record` wrote from
# the step's own calls; a step absent from the table runs. No program, no table or a failure of the
# program — every step goes through, as before.
rt_push_select() {
    local steps root program chosen
    steps="$(cat)"
    root="${CLAUDE_PROJECT_DIR:-.}"
    program="$root/${RT_CHECKS_DIR:-tools}/push-inputs.mjs"
    if [ -n "$1" ] && [ -f "$program" ] && [ -f "$root/.claude/rt-kit/push-inputs.json" ] &&
        chosen="$(printf '%s\n' "$steps" | (cd "$root" && node "$program" select "$1"))"; then
        printf '%s\n' "$chosen"
        return 0
    fi
    printf '%s\n' "$steps"
}

# Whether the change touched the subject of each step: a line `<mark><TAB><step>` per step on stdin,
# the mark one of `touched`, `idle`, `unknown`, `not-run`. A step of the table of reads is judged by
# the rule `rt_push_select` uses; for the rest the tree declares the paths by `rt_push_subject`. No
# program or a failure of it — every step is `unknown`: the metrics report says so instead of zero.
rt_push_subjects() {
    local steps root program declared step path marks
    steps="$(cat)"
    root="${CLAUDE_PROJECT_DIR:-.}"
    program="$root/${RT_CHECKS_DIR:-tools}/push-inputs.mjs"
    if [ -n "$1" ] && [ -f "$program" ]; then
        declared="$(mktemp 2>/dev/null)"
        if [ -n "$declared" ]; then
            if command -v rt_push_subject >/dev/null 2>&1; then
                while IFS= read -r step; do
                    [ -n "$step" ] || continue
                    rt_push_subject "$step" | while IFS= read -r path; do
                        [ -n "$path" ] && printf '%s\t%s\n' "$path" "$step"
                    done
                done <<<"$steps" >"$declared"
            fi
            marks="$(printf '%s\n' "$steps" | (cd "$root" && node "$program" subject "$1" --declared "$declared" 2>/dev/null))"
            rm -f "$declared"
            if [ -n "$marks" ]; then
                printf '%s\n' "$marks"
                return 0
            fi
        fi
    fi
    printf '%s\n' "$steps" | while IFS= read -r step; do [ -n "$step" ] && printf 'unknown\t%s\n' "$step"; done
    return 0
}

# The subject mark of one step from the lines `rt_push_subjects` printed; `unknown` when absent.
rt_push_subject_of() {
    local mark
    mark="$(printf '%s\n' "$1" | awk -F '\t' -v step="$2" '$2 == step { print $1; exit }')"
    printf '%s' "${mark:-unknown}"
}

# The steps `rt_push_select` dropped leave a run line of their own: zero seconds, `not-run`. The
# report counts them apart from the idle runs — such a step cannot run idle.
rt_push_note_not_run() {
    local sign="$1" base="$2" subjects="$3" step
    command -v rt_run_note >/dev/null 2>&1 || return 0
    printf '%s\n' "$subjects" | awk -F '\t' '$1 == "not-run" { print $2 }' | while IFS= read -r step; do
        [ -n "$step" ] && rt_run_note "$sign" "$(date +%s 2>/dev/null)" not-run "$step" "$base" not-run
    done
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
