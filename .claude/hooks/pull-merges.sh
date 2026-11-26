#!/usr/bin/env bash
# rt-kit v0.41.0 · hooks/pull-merges.sh · ac6cf4167215 · правится надстройкой, не здесь
# The merges of requests and the editions of packages, read from the hosting and the registry into
# the observations. NOT a guard: it has no `rt-hook:` declaration and hooks into no agent event. The
# sending calls it.
#
#   bash pull-merges.sh [YYYY-MM-DD]
#
# A day named on the command line reads from it, past the mark: a fact read before is replaced, so a
# read that judges it anew corrects the observation.
# The hosting side lives in the tree profile: `rt_merge_facts <day>` prints the requests merged since
# the day and the open ones, `{number, state, headRefName, baseRefName, title, mergedAt, files}` one
# per line, `rt_package_dirs` names the package directories and `rt_package_ignored` the pattern of
# the files under them that are never published. A package is published when the
# registry knows an edition of it; one the registry does not know is not a package of an epic.
#
# The reading has a mark of its own, the day of the last read: the next read starts from it. A first
# read starts from the keeping term of the observations, not from the mark of the outcomes. A broken
# answer of the hosting or the registry writes nothing and keeps the day: the next read takes it again.
#
# Exit code 3 — nobody to ask: no profile function, no hosting client. Code 4 — a broken read.

hooks_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="${CLAUDE_PROJECT_DIR:-$PWD}"
export CLAUDE_PROJECT_DIR="$root"
cd "$root" 2>/dev/null || exit 3

for profile in "$hooks_dir/../rt-kit/defaults/project.sh" "$hooks_dir/../defaults/project.sh" \
    "$root/.claude/rt-kit/defaults/project.sh" "$root/.claude/rt-kit/project.sh"; do
    # shellcheck disable=SC1090
    [ -f "$profile" ] && . "$profile" 2>/dev/null
done

. "$hooks_dir/metric-marks.sh" 2>/dev/null || exit 3
command -v rt_merge_facts >/dev/null 2>&1 || exit 3
command -v jq >/dev/null 2>&1 || exit 3
command -v node >/dev/null 2>&1 || exit 3

reader=''
for candidate in "$hooks_dir/../../tools/merge-read.mjs" "$hooks_dir/../checks/merge-read.mjs"; do
    [ -f "$candidate" ] && reader="$candidate" && break
done
[ -n "$reader" ] || exit 3

dir="$(rt_observe_dir)"
marks="$(rt_marks_dir)"
[ -n "$dir" ] && [ -n "$marks" ] || exit 3

today="$(date -u +%Y-%m-%d)"
since="${1:-$(cat "$marks/merges-read-day" 2>/dev/null)}"
if [ -z "$since" ]; then
    since="$(node -e 'console.log(new Date(Date.now() - Number(process.argv[1]) * 86400000).toISOString().slice(0, 10))' "${RT_MARKS_KEEP_DAYS:-30}")"
fi

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

rt_merge_facts "$since" > "$work/pulls.jsonl" 2>/dev/null
code=$?
[ "$code" = 3 ] && exit 3
[ "$code" = 0 ] || exit 4

packages=''
editions=()
for pkg_dir in $(rt_package_dirs 2>/dev/null); do
    name="$(jq -r '.name // empty' "$pkg_dir/package.json" 2>/dev/null)"
    [ -n "$name" ] || continue
    times="$work/$(basename "$pkg_dir").json"
    npm view "$name" time --json > "$times" 2>/dev/null || continue
    packages="${packages:+$packages,}$pkg_dir"
    editions+=(--editions "$(basename "$pkg_dir")=$times")
done

node "$reader" --pulls "$work/pulls.jsonl" --observations "$dir" \
    --packages "$packages" --ignore "$(rt_package_ignored 2>/dev/null)" "${editions[@]}" || exit 4
printf '%s\n' "$today" > "$marks/merges-read-day"
exit 0
