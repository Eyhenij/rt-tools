#!/usr/bin/env bash
# rt-kit v0.33.1 · hooks/pre-push.sh · 8e55688c1558 · правится надстройкой, не здесь
# The checks before a push, as a hook of git itself, not of the agent.
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The version control
# calls it before every push, whatever sent it: the session guard of the push stands only on the
# agent's tools, and a push from a terminal outside the session, from another session through
# `git -C` or from an environment without the agent hooks used to leave with no check at all. That
# is how a kit branch left from a foreign session and broke the kit's main branch.
#
# A versioned template: the git hooks directory of the working copy is not versioned, so the tree
# wires the file to git itself — by its hooks manager, or by hand:
#   cp .claude/hooks/pre-push.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push
#
# What it runs is the same set the session guard runs: `rt_push_checks <base>` from the package
# default and the tree profile, one command per line, all of them, with every red one named.
#
# A push the session guard already judged runs no second set. The guard writes the commit it found
# green into the mark `rt-kit-push-green` of the git directory, and a push of exactly that commit
# passes here at once: a second fifteen-minute run inside a session push would cut the session off.
#
# The set judges the tree the working copy stands on, so the hook lets through only a push of that
# commit. A push of another branch, of a tag or of an older commit is refused: a green set would
# then read as a check of what left, though it checked something else. A deletion sends no tree
# and is not judged.
#
# The pipeline is its own gate: under `CI` the hook passes. A hooks manager installs the hook on
# the runner too, and the pipeline's own pushes would wait for the whole set there.
#
# FAIL-OPEN: not a repository, no profile or no `rt_push_checks`, an empty set, under `CI` — pass.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

[ -n "${CI:-}" ] && exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" 2>/dev/null || exit 0

zero='0000000000000000000000000000000000000000'
tip="$(git rev-parse --verify --quiet HEAD 2>/dev/null)"

# The refs being pushed come on the input, a line each: local ref, local sha, remote ref, remote
# sha. What is judged is the commit each one sends.
sends=0
foreign=""
while read -r local_ref local_sha _remote_ref _remote_sha; do
    [ -z "$local_sha" ] && continue
    case "$local_sha" in
        "$zero" | 0000000*) continue ;;
    esac
    sends=$((sends + 1))
    commit="$(git rev-parse --verify --quiet "${local_sha}^{commit}" 2>/dev/null)"
    [ -n "$commit" ] && [ "$commit" = "$tip" ] && continue
    foreign="${foreign}${foreign:+
}  ${local_ref}"
done

[ "$sends" -eq 0 ] && exit 0

if [ -n "$foreign" ]; then
    printf '%s\n' "pre-push: refused — the push sends a commit the working copy does not stand on:" >&2
    printf '%s\n' "$foreign" >&2
    printf '%s\n' "The checks run on the tree that lies here, so they would judge something else than what leaves. Switch to the branch and push it from there, one branch per push." >&2
    exit 1
fi

mark="$(git rev-parse --git-path rt-kit-push-green 2>/dev/null)"
if [ -n "$mark" ] && [ -f "$mark" ] && [ "$(head -n 1 "$mark" 2>/dev/null)" = "$tip" ]; then
    exit 0
fi

# The tree profile: first the package default, over it the project override. A function declared
# in the override replaces the default whole and may call it back by the `_default` suffix.
export CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$repo_root}"
for profile in "$repo_root/.claude/rt-kit/defaults/project.sh" "$repo_root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done
command -v rt_push_checks >/dev/null 2>&1 || exit 0

main_branch="${RT_MAIN_BRANCH:-main}"
base=''
if git fetch --quiet origin "$main_branch" 2>/dev/null && git rev-parse --verify --quiet "origin/$main_branch" >/dev/null 2>&1; then
    base="origin/$main_branch"
fi

# A check that exits with this code had nothing to look at: it does not refuse the push.
rt_skip_code="${RT_SKIP_CODE:-7}"

checks="$(rt_push_checks "$base")"
total="$(printf '%s\n' "$checks" | grep -c .)"
[ "${total:-0}" -eq 0 ] && exit 0

printf 'pre-push: running the checks before the push, %s of them\n' "$total" >&2

failed=""
output=""
while IFS= read -r check; do
    [ -z "$check" ] && continue
    out="$(eval "$check" 2>&1 </dev/null)"
    status=$?
    [ "$status" -eq 0 ] && continue
    [ "$status" -eq "$rt_skip_code" ] && continue
    failed="${failed}${failed:+
}${check}"
    output="${output}${output:+

}── ${check}
$(printf '%s' "$out" | tail -n 25)"
done <<EOF
$checks
EOF

if [ -z "$failed" ]; then
    [ -n "$mark" ] && printf '%s\n' "$tip" >"$mark" 2>/dev/null
    exit 0
fi

printf '\npre-push: refused — red checks: %s\n%s\n\nThe tail of every red output:\n\n%s\n' \
    "$(printf '%s\n' "$failed" | grep -c .)" "$failed" "$output" >&2
exit 1
