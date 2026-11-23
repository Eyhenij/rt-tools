#!/usr/bin/env bash
# The sign of RT-3466 on a real push: a clone of this copy, a fresh commit, the git hook before a
# push with node 20 first in PATH. Prints how many lines of a wrong node the hook's output holds.
# Run from the root of the copy. An empty or missing temporary path stops the script before git
# and before the removal: `cd ""` stays in the copy, and the removal would take the copy itself.
set -u
root="$(pwd -P)"
d="$(mktemp -d)"
case "$d" in /?*) [ -d "$d" ] || exit 1 ;; *) exit 1 ;; esac
d="$(cd "$d" && pwd -P)"
case "$d" in "$root" | "$root"/* | /) exit 1 ;; esac
git clone -q "$root" "$d/t" || exit 1
ln -s "$root/node_modules" "$d/t/node_modules"
cd "$d/t" || exit 1
printf 'probe %s\n' "$(date +%s)" > probe.txt
git add probe.txt
git -c user.name=probe -c user.email=probe@example.com -c commit.gpgsign=false \
    commit -q -m 'chore: probe'
old="$(printf '%040d' 0)"
printf 'refs/heads/P %s refs/heads/P %s\n' "$(git rev-parse HEAD)" "$old" \
    | PATH="${HOME}/.nvm/versions/node/v20.11.0/bin:${PATH}" bash .claude/hooks/pre-push.sh origin x 2>&1 \
    | grep -c -E 'Expected node|ERR_REQUIRE_ESM|ERR_PNPM_UNSUPPORTED_ENGINE|styleText is not a function'
rm -rf "$d"
