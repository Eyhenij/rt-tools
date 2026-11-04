#!/usr/bin/env bash
# The gate set before a push, one way for both who run it. NOT a guard: it has no `rt-hook:`
# declaration and hooks into no agent event. The session guard of the push and the git hook
# `pre-push` source it and call its functions.
#
# Two copies of the same loop drifted apart in their first week: the hook started the heavy checks
# after a red one, said nothing about a skipped check and wrote the mark of green when nothing had
# been checked at all. Here lives the single one.
#
#   rt_push_set_profile <hooks dir> <tree root> — the package default and the tree override
#   rt_push_set_base                            — the main branch of the remote, or empty
#   rt_push_set_run <base>                      — every line of `rt_push_checks <base>`
#   rt_push_mark_path / rt_push_mark_covers <commit> / rt_push_mark_write — the mark of green
#
# What `rt_push_set_run` found is left in the variables `rt_push_set_failed`, `_output`, `_skipped`
# and `_held` (one check per line) and in the counters `rt_push_set_ran` and `rt_push_set_passed`.

# The tree profile: first the package default, over it the project override. A function declared in
# the override replaces the default whole and may call it back by the `_default` suffix. The root is
# exported, because the profile functions find the tree files by it: a root inherited from another
# session reads that session's tree, and the set comes out narrower without a word.
rt_push_set_profile() {
    local hooks_dir="$1" root="$2" profile
    export CLAUDE_PROJECT_DIR="$root"
    for profile in "$hooks_dir/../rt-kit/defaults/project.sh" "$hooks_dir/../defaults/project.sh" \
        "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
        # shellcheck disable=SC1090
        [ -f "$profile" ] && . "$profile" 2>/dev/null
    done
    return 0
}

rt_push_set_base() {
    local main_branch="${RT_MAIN_BRANCH:-main}"
    if git fetch --quiet origin "$main_branch" 2>/dev/null && git rev-parse --verify --quiet "origin/$main_branch" >/dev/null 2>&1; then
        printf 'origin/%s' "$main_branch"
    fi
    return 0
}

# Every red among the light checks is named by one refusal. After the first red a heavy check is not
# started: the push is refused anyway, and its minutes buy nothing.
#
# The code by which a check declares that there was nothing to look at does not refuse the push, and
# it is counted apart from a passed one. A skip code of 0 or 1 is no skip code: 1 is the exit of any
# failure, and every red check would read as skipped.
rt_push_set_run() {
    local base="$1" check out status skip_code="${RT_SKIP_CODE:-7}"
    case "$skip_code" in '' | 0 | 1 | *[!0-9]*) skip_code=7 ;; esac
    command -v rt_push_check_heavy >/dev/null 2>&1 || rt_push_check_heavy() { return 1; }

    rt_push_set_failed=""
    rt_push_set_output=""
    rt_push_set_skipped=""
    rt_push_set_held=""
    rt_push_set_ran=0
    rt_push_set_passed=0
    while IFS= read -r check; do
        [ -z "$check" ] && continue
        if [ -n "$rt_push_set_failed" ] && rt_push_check_heavy "$check"; then
            rt_push_set_held="${rt_push_set_held}${rt_push_set_held:+
}${check}"
            continue
        fi
        rt_push_set_ran=$((rt_push_set_ran + 1))
        out="$(eval "$check" 2>&1 </dev/null)"
        status=$?
        if [ "$status" -eq 0 ]; then
            rt_push_set_passed=$((rt_push_set_passed + 1))
            continue
        fi
        if [ "$status" -eq "$skip_code" ]; then
            rt_push_set_skipped="${rt_push_set_skipped}${rt_push_set_skipped:+
}${check}"
            continue
        fi
        rt_push_set_failed="${rt_push_set_failed}${rt_push_set_failed:+
}${check}"
        rt_push_set_output="${rt_push_set_output}${rt_push_set_output:+

}── ${check}
$(printf '%s' "$out" | tail -n 25)"
    done <<EOF
$(rt_push_checks "$base")
EOF
    return 0
}

# The mark of green: the commit a green set judged, one line. It lies in the shared git directory, not
# in that of a working copy: a push from a session through `git -C` into a second copy would
# otherwise not see the mark the guard just wrote and run the set a second time.
rt_push_mark_path() {
    local common
    common="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 0
    [ -n "$common" ] && printf '%s/rt-kit-push-green' "$common"
    return 0
}

rt_push_mark_covers() {
    local commit="$1" mark
    mark="$(rt_push_mark_path)"
    [ -n "$commit" ] && [ -n "$mark" ] && [ -f "$mark" ] && [ "$(head -n 1 "$mark" 2>/dev/null)" = "$commit" ]
}

# The mark is written only for a set that judged the commit itself. A set where every check was
# skipped judged nothing. A working copy with uncommitted edits to tracked files was judged
# together with them, so the commit alone was never judged. Files outside the history do not count:
# a working copy keeps folders of other tasks, and the mark would never be written.
rt_push_mark_write() {
    local mark tip
    [ "${rt_push_set_passed:-0}" -gt 0 ] || return 0
    [ -z "$(git status --porcelain --untracked-files=no 2>/dev/null)" ] || return 0
    mark="$(rt_push_mark_path)"
    tip="$(git rev-parse --verify --quiet HEAD 2>/dev/null)"
    [ -n "$mark" ] && [ -n "$tip" ] && printf '%s\n' "$tip" >"$mark" 2>/dev/null
    return 0
}
