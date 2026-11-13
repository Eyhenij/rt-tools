#!/usr/bin/env bash
# The push set run ahead of the push: every check of `rt_push_checks <base>`, a green mark for each
# that passed. The push guard then reads the marks instead of running the steps again.
#
# NOT a guard: it has no `rt-hook:` declaration and is called by hand or by the agent —
# `bash .claude/hooks/git-guard-push-ahead.sh`, in the background. The guard cannot run a step
# longer than its hook limit, and a guard cut by the limit lets the call through with no verdict;
# here no limit cuts the run.
#
# The base, the profile and the marks are the guard's own — the helper `git-guard-push-marks.sh`
# and the same profile files — so a mark written here answers exactly the line the guard asks
# about. A check already green on this tree and base is not run again.
#
# Exit codes: 0 — the set is green; 1 — a check is red; 3 — the run did not start (no profile, no
# repository, edits outside the index). Not 2: to a hook that code means "refuse", and this command
# refuses nothing.
not_started=3

rt_hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

root="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    printf 'push ahead: not a repository\n' >&2
    exit "$not_started"
}
cd "$root" || exit "$not_started"

for profile in "$rt_hooks_dir/../rt-kit/defaults/project.sh" "$rt_hooks_dir/../defaults/project.sh" "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
# shellcheck disable=SC1090
. "$rt_hooks_dir/git-guard-push-marks.sh" 2>/dev/null || {
    printf 'push ahead: the helper git-guard-push-marks.sh is not laid out\n' >&2
    exit "$not_started"
}
command -v rt_push_checks >/dev/null 2>&1 || {
    printf 'push ahead: the tree profile declares no rt_push_checks\n' >&2
    exit "$not_started"
}
command -v rt_push_check_heavy >/dev/null 2>&1 || rt_push_check_heavy() { return 1; }
command -v rt_push_over_budget >/dev/null 2>&1 || rt_push_over_budget() { return 0; }
command -v rt_push_set_over_budget >/dev/null 2>&1 || rt_push_set_over_budget() { return 0; }
command -v rt_push_mark_drop >/dev/null 2>&1 || rt_push_mark_drop() { return 0; }
# The line of a run for the metrics. No file — the checks run and record nothing.
# shellcheck disable=SC1091
[ -f "$rt_hooks_dir/metric-marks.sh" ] && . "$rt_hooks_dir/metric-marks.sh" 2>/dev/null
command -v rt_run_note >/dev/null 2>&1 || rt_run_note() { return 0; }
command -v rt_tree_sign >/dev/null 2>&1 || rt_tree_sign() { return 0; }

# A mark vouches for the tree of the head, and the checks run over the working copy: with edits
# outside the index the run would write marks for content that does not leave.
rt_push_mark_clean || {
    printf 'push ahead: the working copy holds edits outside the index — commit first, the marks are written only for a clean copy\n' >&2
    exit "$not_started"
}

base="$(rt_push_base "${RT_MAIN_BRANCH:-main}")"
skip_code="${RT_SKIP_CODE:-7}"

if command -v rt_push_adds_nothing >/dev/null 2>&1 && rt_push_adds_nothing "$base"; then
    printf 'push ahead: the head adds no commit to %s — there is nothing to run, the push passes\n' "$base"
    exit 0
fi

printf 'push ahead: base %s, tree %s\n' "${base:-none}" "$(git rev-parse --short 'HEAD^{tree}')"
sign="$(rt_tree_sign .)"

red=""
marked=""
set_started="$(date +%s)"
while IFS= read -r check; do
    [ -z "$check" ] && continue
    if rt_push_mark_has "$check" "$base"; then
        printf '= green already: %s\n' "$check"
        continue
    fi
    # After a red check a heavy one is not started: the push is refused anyway.
    if [ -n "$red" ] && rt_push_check_heavy "$check"; then
        printf '· held after red: %s\n' "$check"
        continue
    fi
    key_before="$(rt_push_mark_key "$check" "$base")"
    started="$(date +%s)"
    out="$(eval "$check" 2>&1)"
    status=$?
    took=$(($(date +%s) - started))
    over="$(rt_push_over_budget "$check" "$took")"
    if [ "$status" -eq 0 ] && [ -n "$over" ]; then
        status=1
        out="$over"
    fi
    if [ "$status" -eq 0 ]; then
        rt_run_note "$sign" "$started" green "$check"
        rt_push_mark_put "$check" "$base" "$key_before"
        marked="${marked}${marked:+
}${check}"
        printf '+ green in %ss: %s\n' "$took" "$check"
    elif [ "$status" -eq "$skip_code" ]; then
        rt_run_note "$sign" "$started" skipped "$check"
        printf '~ nothing to look at: %s\n' "$check"
    else
        rt_run_note "$sign" "$started" red "$check"
        red="${red}${red:+
}${check}"
        printf '✗ red in %ss: %s\n%s\n' "$took" "$check" "$(printf '%s' "$out" | tail -n 25)"
    fi
done <<EOF
$(rt_push_checks "$base")
EOF

set_took=$(($(date +%s) - set_started))
set_over="$(rt_push_set_over_budget "$set_took")"
if [ -n "$set_over" ]; then
    printf '✗ the whole set in %ss: %s\n' "$set_took" "$set_over"
    printf '%s\n' "$marked" | while IFS= read -r check; do
        [ -n "$check" ] && rt_push_mark_drop "$check" "$base"
    done
    red="${red}${red:+
}the whole set: ${set_took}s"
fi

if [ -n "$red" ]; then
    printf '\npush ahead: red —\n%s\n' "$red"
    exit 1
fi
printf '\npush ahead: the set is green, the push passes from the marks\n'
exit 0
