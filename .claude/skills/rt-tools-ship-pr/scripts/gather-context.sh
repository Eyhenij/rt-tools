#!/usr/bin/env bash
# Gather everything needed to push a branch, open a PR and update CHANGELOG.
# Deterministic, single call.
#
# Some setups route bare git/gh through an account-selection shim that errors;
# this script always calls them via `command` to bypass it.
#
# Usage: gather-context.sh [base-branch]   (base defaults to `main`)

set -euo pipefail

BASE="${1:-main}"
GIT="command git"
GH="command gh"

branch="$($GIT rev-parse --abbrev-ref HEAD)"

echo "=== BRANCH ==="
echo "current: $branch"
echo "base:    $BASE"

echo
echo "=== UPSTREAM ==="
if $GIT rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
    echo "tracking: $($GIT rev-parse --abbrev-ref --symbolic-full-name '@{u}')"
else
    echo "tracking: <none — needs: git push -u origin $branch>"
fi

echo
echo "=== EXISTING PR ==="
$GH pr view "$branch" --json number,url,state 2>/dev/null || echo "none"

echo
echo "=== COMMITS ($BASE..HEAD) ==="
$GIT log "$BASE..HEAD" --format='%h %s'

echo
echo "=== FULL COMMIT BODIES ==="
$GIT log "$BASE..HEAD" --format='--- %h%n%s%n%n%b'

echo
echo "=== DIFF STAT ($BASE...HEAD) ==="
$GIT diff --stat "$BASE...HEAD"

echo
echo "=== AFFECTED projects/* ==="
$GIT diff --name-only "$BASE...HEAD" \
    | grep '^projects/' | cut -d/ -f1,2 | sort -u || echo "none"

echo
echo "=== CHANGELOG FILES IN AFFECTED PROJECTS ==="
for proj in $($GIT diff --name-only "$BASE...HEAD" | grep '^projects/' | cut -d/ -f1,2 | sort -u); do
    cl="$proj/CHANGELOG.md"
    if [ -f "$cl" ]; then
        ver="$(grep -m1 '"version"' "$proj/package.json" 2>/dev/null | sed 's/[^0-9.]//g' || true)"
        echo "$cl  (package version: ${ver:-?})"
        echo "  top line: $(head -1 "$cl")"
    fi
done

echo
echo "=== UNCOMMITTED / UNTRACKED (do NOT sweep into commits) ==="
$GIT status --short || true
