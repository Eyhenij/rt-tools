#!/usr/bin/env bash
# The runner of the sets: what its last line says and under which locale the sets run. The runner is
# called on a copy with sets of its own — the real ones judge the live tree.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the runner of the sets"

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT
cp "$TOOLS/tests/run.sh" "$dir/"
printf 'exit 0\n' > "$dir/good.test.sh"

runner() { (cd "$dir" && env -u RT_SUITES_BASE LC_ALL="${1:-C}" bash run.sh 2>&1); }

report "green sets leave the line of green" "$(runner | tail -1)" "ALL SETS ARE GREEN"

printf 'exit 3\n' > "$dir/bad.test.sh"
report "a red set is named with its code" "$(runner | tail -1)" "SETS WITH FAILURES: 1 — bad.test.sh (code 3)"

# A set that takes its own runner down leaves no code file: it is named too, not lost.
printf 'kill -9 "$PPID"\n' > "$dir/lost.test.sh"
report "a set that left no code is named so" \
    "$(runner | tail -1)" "SETS WITH FAILURES: 2 — bad.test.sh (code 3), lost.test.sh (no code)"
runner > /dev/null
report "a red run ends with a nonzero code" "$?" 1
rm -f "$dir/bad.test.sh" "$dir/lost.test.sh"

# The push guard runs the steps under this locale, and a terminal run sees what the guard sees.
printf 'printf "%%s\\n" "$LC_ALL" > seen.txt\n' > "$dir/good.test.sh"
runner C > /dev/null
report "the sets run under the locale of the push guard" "$(cat "$dir/seen.txt")" "C.UTF-8"

suite_result "the runner of the sets"
