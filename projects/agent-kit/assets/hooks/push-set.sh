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
#   rt_push_set_base                            — the nearest remote branch, or empty
#   rt_push_set_run <base>                      — every line of `rt_push_checks <base>`
#   rt_push_mark_path / rt_push_mark_covers <commit> / rt_push_mark_write — the mark of green
#
# What `rt_push_set_run` found is left in the variables `rt_push_set_failed`, `_output`, `_skipped`,
# `_held` and `_ahead` (one check per line) and in the counters `rt_push_set_ran` and
# `rt_push_set_passed`.

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
    # The base of the branch and the marks of a green run. No helper — the base is the main
    # branch, no mark is read and none is written: the set runs whole.
    # shellcheck disable=SC1091
    [ -f "$hooks_dir/git-guard-push-marks.sh" ] && . "$hooks_dir/git-guard-push-marks.sh" 2>/dev/null
    command -v rt_push_mark_has >/dev/null 2>&1 || rt_push_mark_has() { return 1; }
    command -v rt_push_mark_put >/dev/null 2>&1 || rt_push_mark_put() { return 0; }
    command -v rt_push_mark_clean >/dev/null 2>&1 || rt_push_mark_clean() { return 1; }
    command -v rt_push_mark_key >/dev/null 2>&1 || rt_push_mark_key() { return 1; }
    command -v rt_push_heavy_ahead >/dev/null 2>&1 || rt_push_heavy_ahead() { return 1; }
    command -v rt_push_over_budget >/dev/null 2>&1 || rt_push_over_budget() { return 0; }
    command -v rt_push_set_over_budget >/dev/null 2>&1 || rt_push_set_over_budget() { return 0; }
    # The line of a run for the metrics. No file — the set runs and records nothing.
    # shellcheck disable=SC1091
    [ -f "$hooks_dir/metric-marks.sh" ] && . "$hooks_dir/metric-marks.sh" 2>/dev/null
    command -v rt_run_note >/dev/null 2>&1 || rt_run_note() { return 0; }
    command -v rt_tree_sign >/dev/null 2>&1 || rt_tree_sign() { return 0; }
    return 0
}

rt_push_set_base() {
    local main_branch="${RT_MAIN_BRANCH:-main}"
    if command -v rt_push_base >/dev/null 2>&1; then
        rt_push_base "$main_branch"
        return 0
    fi
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
#
# A check green on this very tree against this very base is not run again. A caller under the hook
# limit sets `rt_push_set_ask_ahead=1`: in a tree that runs its heavy steps ahead such a step is then
# named in `rt_push_set_ahead` instead of being started. The git hook has no such limit, leaves the
# variable empty and runs the step itself.
rt_push_set_run() {
    local base="$1" check out status key_before skip_code="${RT_SKIP_CODE:-7}" sign started set_started set_took set_over over
    case "$skip_code" in '' | 0 | 1 | *[!0-9]*) skip_code=7 ;; esac
    command -v rt_push_check_heavy >/dev/null 2>&1 || rt_push_check_heavy() { return 1; }
    sign="$(rt_tree_sign .)"

    rt_push_set_failed=""
    rt_push_set_output=""
    rt_push_set_skipped=""
    rt_push_set_held=""
    rt_push_set_ahead=""
    rt_push_set_ran=0
    rt_push_set_passed=0
    set_started="$(date +%s 2>/dev/null)"
    while IFS= read -r check; do
        [ -z "$check" ] && continue
        if rt_push_mark_has "$check" "$base"; then
            rt_push_set_ran=$((rt_push_set_ran + 1))
            rt_push_set_passed=$((rt_push_set_passed + 1))
            continue
        fi
        if [ "${rt_push_set_ask_ahead:-}" = 1 ] && rt_push_heavy_ahead && rt_push_check_heavy "$check"; then
            rt_push_set_ahead="${rt_push_set_ahead}${rt_push_set_ahead:+
}${check}"
            continue
        fi
        if [ -n "$rt_push_set_failed" ] && rt_push_check_heavy "$check"; then
            rt_push_set_held="${rt_push_set_held}${rt_push_set_held:+
}${check}"
            continue
        fi
        rt_push_set_ran=$((rt_push_set_ran + 1))
        key_before=""
        rt_push_mark_clean && key_before="$(rt_push_mark_key "$check" "$base" 2>/dev/null)"
        started="$(date +%s 2>/dev/null)"
        out="$(eval "$check" 2>&1 </dev/null)"
        status=$?
        over="$(rt_push_over_budget "$check" "$(($(date +%s 2>/dev/null) - started))")"
        if [ "$status" -eq 0 ] && [ -n "$over" ]; then
            status=1
            out="$over"
        fi
        if [ "$status" -eq 0 ]; then
            rt_push_set_passed=$((rt_push_set_passed + 1))
            rt_push_mark_put "$check" "$base" "$key_before"
            rt_run_note "$sign" "$started" green "$check"
            continue
        fi
        if [ "$status" -eq "$skip_code" ]; then
            rt_push_set_skipped="${rt_push_set_skipped}${rt_push_set_skipped:+
}${check}"
            rt_run_note "$sign" "$started" skipped "$check"
            continue
        fi
        rt_run_note "$sign" "$started" red "$check"
        rt_push_set_failed="${rt_push_set_failed}${rt_push_set_failed:+
}${check}"
        rt_push_set_output="${rt_push_set_output}${rt_push_set_output:+

}── ${check}
$(printf '%s' "$out" | tail -n 25)"
    done <<EOF
$(rt_push_checks "$base")
EOF
    set_took=$(($(date +%s 2>/dev/null) - set_started))
    set_over="$(rt_push_set_over_budget "$set_took")"
    if [ -n "$set_over" ]; then
        rt_push_set_failed="${rt_push_set_failed}${rt_push_set_failed:+
}the whole set: ${set_took}s"
        rt_push_set_output="${rt_push_set_output}${rt_push_set_output:+

}── the whole set
${set_over}"
    fi
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
