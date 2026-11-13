#!/usr/bin/env bash
# rt-kit v0.37.0 · hooks/pre-push.sh · f95fdd23d052 · правится надстройкой, не здесь
# The checks before a push, as a hook of git itself, not of the agent.
#
# Requires: hooks/push-set.sh, hooks/git-guard-push-marks.sh
#
# NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The version control
# calls it before every push, whatever sent it: the session guard of the push stands only on the
# agent's tools, and a push from a terminal outside the session, from another session through
# `git -C` or from an environment without the agent hooks used to leave with no check at all. That
# is how a kit branch left from a foreign session and broke the kit's main branch.
#
# A versioned template: the git hooks directory of the working copy is not versioned, so the tree
# wires the file to git itself — by its hooks manager, or by hand. The hook stays where the layout
# put it, next to `push-set.sh`, and git calls it through a line that names it:
#   printf '#!/bin/sh\nexec bash .claude/hooks/pre-push.sh "$@"\n' > .git/hooks/pre-push
#   chmod +x .git/hooks/pre-push
#
# What it runs is the same set the session guard runs, by the same code in `push-set.sh`:
# `rt_push_checks <base>` from the package default and the tree profile, every red one named, a
# skipped one named apart, no heavy one started after a red one.
#
# A push the session guard already judged runs no second set. The guard writes the commit it found
# green into the mark `rt-kit-push-green` of the shared git directory, and a push of exactly that
# commit passes here at once: a second fifteen-minute run inside a session push would cut the
# session off. The mark is written only on a working copy without uncommitted edits.
#
# A dry run is judged like a real push: git calls the hook for `--dry-run` too and does not say so.
#
# The set judges the tree the working copy stands on, so the hook lets through only a push of that
# commit. A push of another branch, of a tag or of an older commit is refused: a green set would
# then read as a check of what left, though it checked something else. A deletion sends no tree
# and is not judged.
#
# The pipeline is its own gate: under `CI` the hook passes. A hooks manager installs the hook on
# the runner too, and the pipeline's own pushes would wait for the whole set there.
#
# FAIL-OPEN: not a repository, no file `push-set.sh`, no profile or no `rt_push_checks`, an empty
# set, under `CI` — pass.

. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utf8.sh" 2>/dev/null || true

[ -n "${CI:-}" ] && exit 0

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" 2>/dev/null || exit 0

tip="$(git rev-parse --verify --quiet HEAD 2>/dev/null)"

# The refs being pushed come on the input, a line each: local ref, local sha, remote ref, remote
# sha. What is judged is the commit each one sends. A deletion comes with a sha of zeros only, of
# any length; a real commit that merely starts with zeros is judged like any other.
sends=0
foreign=""
while read -r local_ref local_sha _remote_ref _remote_sha; do
    [ -z "$local_sha" ] && continue
    [ -z "$(printf '%s' "$local_sha" | tr -d 0)" ] && continue
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

hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
if ! . "$hooks_dir/push-set.sh" 2>/dev/null; then
    printf '%s\n' "pre-push: no file push-set.sh next to the hook in ${hooks_dir} — no check ran. The hook is called where the layout put it, not copied away from it." >&2
    exit 0
fi

rt_push_mark_covers "$tip" && exit 0

# The root is this repository's, whatever the caller exported: a push through `git -C` from a session
# of another copy carries that copy's root, and the profile would read its files instead.
rt_push_set_profile "$hooks_dir" "$repo_root"
command -v rt_push_checks >/dev/null 2>&1 || exit 0

base="$(rt_push_set_base)"

if command -v rt_push_adds_nothing >/dev/null 2>&1 && rt_push_adds_nothing "$base"; then
    printf 'pre-push: the head adds no commit to %s — the set is not run\n' "$base" >&2
    exit 0
fi

total="$(rt_push_checks "$base" | grep -c .)"
[ "${total:-0}" -eq 0 ] && exit 0

printf 'pre-push: running the checks before the push, %s of them\n' "$total" >&2

rt_push_set_run "$base"

[ -n "$rt_push_set_skipped" ] && printf 'pre-push: these checks had nothing to look at:\n%s\n' "$rt_push_set_skipped" >&2

if [ -z "$rt_push_set_failed" ]; then
    if [ "$rt_push_set_passed" -eq 0 ]; then
        printf '%s\n' "pre-push: no check of the set judged the tree — the push passes, and no mark of green is written." >&2
    fi
    rt_push_mark_write
    exit 0
fi

held_line=""
[ -n "$rt_push_set_held" ] && held_line="

Not started after the red ones — heavy, and the push is refused anyway:
${rt_push_set_held}"

printf '\npre-push: refused — red checks: %s\n%s%s\n\nThe tail of every red output:\n\n%s\n' \
    "$(printf '%s\n' "$rt_push_set_failed" | grep -c .)" "$rt_push_set_failed" "$held_line" "$rt_push_set_output" >&2
exit 1
