#!/usr/bin/env bash
# rt-kit v0.37.0 · hooks/git-guard-push-marks.sh · 5d9dc1f953f5 · правится надстройкой, не здесь
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
# The base is the nearest remote branch that lies in the history of the head: what stands between
# it and the head is exactly what this push adds to the remote. A stacked branch is so counted
# against the branch under it and a task branch against the branch of its epic, not against the
# main one: against the main one a branch of texts ran the snapshot sets, the end-to-end suites
# and the image builds of the whole epic. The branch's own remote copy is not a candidate — the
# set answers for the whole contribution of the branch, not for its last commit.
#
# The answer is read from the remote refs of the working copy after one fetch: no call to the
# host, the same answer from any directory, and it works on the first push, when no request is
# open yet. The refs of branches removed from the remote are not pruned here on purpose: a lower
# branch merged and removed stays the nearest one for the branch above it, and its content has
# already passed the set. No remote branch in the history gives the main branch: the gate may
# turn out stricter than needed, never weaker.
rt_push_base() {
    local main="$1" branch ref count best='' best_count=''
    git fetch --quiet origin 2>/dev/null
    git rev-parse --verify --quiet "origin/$main" >/dev/null 2>&1 || return 0

    branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null)"
    while IFS= read -r ref; do
        case "$ref" in
            '' | origin | origin/HEAD | "origin/$branch") continue ;;
        esac
        count="$(git rev-list --count "$ref..HEAD" 2>/dev/null)" || continue
        case "$count" in '' | *[!0-9]*) continue ;; esac
        # On a tie the main branch wins: a merged branch whose tip is the tip of the main one
        # names the same commit, and the main one is the name every reader expects.
        if [ -z "$best_count" ] || [ "$count" -lt "$best_count" ] ||
            { [ "$count" -eq "$best_count" ] && [ "$ref" = "origin/$main" ]; }; then
            best="$ref"
            best_count="$count"
        fi
    done <<EOF
$(git for-each-ref --merged HEAD --format='%(refname:short)' refs/remotes/origin 2>/dev/null)
EOF

    printf '%s' "${best:-origin/$main}"
}

# A mark is trusted only on a clean working copy. The checks run over the working copy, while the
# push sends commits: with an edit outside the index the two differ, and a mark would vouch for
# what does not leave. The observations record is not counted: the guard writes it itself, on every
# call, and a tree that does not ignore it would never get a single mark.
rt_push_mark_clean() {
    [ -z "$(git status --porcelain -- . ':(exclude).claude/rt-kit/observations' 2>/dev/null)" ]
}

# The key of a mark: the check line, the tree of the head and the commit of the base. The tree and
# not the commit — an amended commit with the same content does not pay again; the base too — a
# step chosen by what the branch touched answers for that base alone.
rt_push_mark_key() {
    local tree base_sha=''
    tree="$(git rev-parse --verify --quiet 'HEAD^{tree}' 2>/dev/null)" || return 1
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

# The tree runs its heavy steps ahead and the guard only reads their marks. Declared by the
# profile: in a tree whose heavy steps fit the hook limit a refusal for a missing mark is a new step
# for nothing, and the package does not know how long another tree's steps take.
rt_push_heavy_ahead() {
    [ "${RT_PUSH_HEAVY_AHEAD:-}" = 1 ]
}
