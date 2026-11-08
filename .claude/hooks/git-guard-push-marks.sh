#!/usr/bin/env bash
# rt-kit v0.35.0 · hooks/git-guard-push-marks.sh · f274dd9dece7 · правится надстройкой, не здесь
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
# A stacked branch is counted against the branch it was created from, not against the main one:
# against the main one it paid for the whole stack under it, and a branch of the second kit three
# levels up did not fit the hook limit at all. The parent is read from the branch reflog — git
# writes `branch: Created from <ref>` itself at `checkout -b` — and is taken only when its remote
# copy exists and is an ancestor of the head. A parent merged and removed, rewritten or moved past
# the head gives the main branch back: the gate may turn out stricter than needed, never weaker.
rt_push_base() {
    local main="$1" branch from
    git fetch --quiet origin "$main" 2>/dev/null
    git rev-parse --verify --quiet "origin/$main" >/dev/null 2>&1 || return 0

    branch="$(git symbolic-ref --quiet --short HEAD 2>/dev/null)"
    if [ -n "$branch" ]; then
        from="$(git reflog show --format=%gs "refs/heads/$branch" 2>/dev/null \
            | sed -n 's/^branch: Created from //p' | tail -n 1)"
        from="${from#refs/remotes/}"
        from="${from#refs/heads/}"
        from="${from#origin/}"
        case "$from" in
            '' | HEAD | "$main" | "$branch") ;;
            *)
                if git fetch --quiet origin "$from" 2>/dev/null &&
                    git rev-parse --verify --quiet "origin/$from" >/dev/null 2>&1 &&
                    git merge-base --is-ancestor "origin/$from" HEAD 2>/dev/null; then
                    printf 'origin/%s' "$from"
                    return 0
                fi
                ;;
        esac
    fi

    printf 'origin/%s' "$main"
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
