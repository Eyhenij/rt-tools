#!/usr/bin/env bash
# A run of the sets over this tree's checks:
# `bash tools/tests/run.sh` (with VERBOSE=1 — with every scenario).
#
# Where the push names its base in `RT_SUITES_BASE`, only the sets the change reaches run: the
# selection and its reasons are in `select.sh`. On 13.11.2026 a change of the agent's harness ran
# all 21 sets for 22–33 s, while two of them read a changed file.
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

# The locale the push guard runs the steps under: on 23.11.2026 a set failed only there, and every
# run from a terminal was green.
export LC_ALL=C.UTF-8

suites="$(ls *.test.sh)"
if [ -n "${RT_SUITES_BASE:-}" ]; then
    picked="$(git diff --name-only --no-renames "$RT_SUITES_BASE...HEAD" 2>/dev/null | bash ./select.sh)"
    case "$picked" in
        all) ;;
        '')
            echo "no set reads a file of the change against $RT_SUITES_BASE"
            exit 0
            ;;
        *)
            suites="$picked"
            echo "only the sets that read a file of the change against $RT_SUITES_BASE: $(printf '%s ' $suites)"
            ;;
    esac
fi

# The sets are independent and run side by side; each writes into a file of its own, and the
# verdict is read in the former order. One after another they took 22–33 s on 13.11.2026.
jobs="${RT_SUITES_JOBS:-8}"
outdir="$(mktemp -d)"
trap 'rm -rf "$outdir"' EXIT
printf '%s\n' $suites | xargs -P "$jobs" -I{} bash -c 'bash "$1" > "$2/$1.out" 2>&1; echo $? > "$2/$1.code"' _ {} "$outdir"

failed=0
red=""
for suite in $suites; do
    cat "$outdir/$suite.out" 2>/dev/null
    code="$(cat "$outdir/$suite.code" 2>/dev/null)"
    if [ "$code" != 0 ]; then
        failed=$((failed + 1))
        red="${red}${red:+, }${suite} (${code:+code }${code:-no code})"
    fi
    echo
done

if [ "$failed" -eq 0 ]; then
    echo "ALL SETS ARE GREEN"
    exit 0
fi

echo "SETS WITH FAILURES: $failed — $red"
exit 1
