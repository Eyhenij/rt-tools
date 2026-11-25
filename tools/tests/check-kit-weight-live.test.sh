#!/usr/bin/env bash
# The live measurement of the kit weight check: it does not depend on the directory it runs from,
# and a threshold below the measurement turns the run red. Only where the kit is built; elsewhere
# there is nothing to measure and the suite says so.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the live measurement of the kit weight"

ROOT_DIR="$(cd "$TOOLS/.." && pwd)"
WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

if [ -f "$ROOT_DIR/dist/ui-kit-v2/fesm2022/rt-tools-ui-kit-v2-menu.mjs" ] && [ -d "$ROOT_DIR/dist/ui-kit-v2/styles" ]; then
    AT_ROOT="$(cd "$ROOT_DIR" && node tools/check-kit-weight.mjs --print)"
    ELSEWHERE="$(cd "$WORK" && node "$TOOLS/check-kit-weight.mjs" --print)"
    report "the measurement from another directory equals the one at the root" "$ELSEWHERE" "$AT_ROOT"

    # A threshold lower than the measurement: the run exits 1 and names the set.
    node -e "
        const t = JSON.parse(require('fs').readFileSync('$TOOLS/kit-weight-threshold.json', 'utf8'));
        t.total -= 1000;
        require('fs').writeFileSync('$WORK/threshold.json', JSON.stringify(t));
    "
    LOWERED="$(cd "$ROOT_DIR" && RT_KIT_WEIGHT_THRESHOLD="$WORK/threshold.json" node tools/check-kit-weight.mjs 2>&1; echo "exit $?")"
    report "a threshold below the measurement exits with 1" "$(printf '%s\n' "$LOWERED" | tail -1)" "exit 1"
    report "and names the set" "$(printf '%s\n' "$LOWERED" | grep -c 'the set grew')" "1"
else
    echo "  skipped: the kit is not built here, there is nothing to measure"
fi

suite_result "check-kit-weight-live"
