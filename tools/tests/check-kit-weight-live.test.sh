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
    # Two empty outputs are equal too: the table must be there.
    report "and the table is printed" "$(printf '%s\n' "$AT_ROOT" | grep -c 'итого')" "1"

    # A copy of the built kit measured by its address gives the same parts and the same total.
    cp -R "$ROOT_DIR/dist/ui-kit-v2" "$WORK/package"
    COPIED="$(cd "$WORK" && node "$TOOLS/check-kit-weight.mjs" --print --package package | sed 's/  gzip .*//')"
    report "another built kit is measured by --package" "$COPIED" "$(printf '%s\n' "$AT_ROOT" | sed 's/  gzip .*//')"

    # The threshold is the weight of this tree: another directory never writes it.
    MISUSE="$(cd "$ROOT_DIR" && node tools/check-kit-weight.mjs --write --package "$WORK/package" 2>&1; echo "exit $?")"
    report "--package without --print is refused" \
        "$(printf '%s\n' "$MISUSE" | grep -c 'goes only with --print') $(printf '%s\n' "$MISUSE" | tail -1)" "1 exit 1"

    # A threshold lower than the measurement: the run exits 1 and names the set.
    node -e "
        const t = JSON.parse(require('fs').readFileSync('$TOOLS/kit-weight-threshold.json', 'utf8'));
        t.total -= 1000;
        require('fs').writeFileSync('$WORK/threshold.json', JSON.stringify(t));
    "
    LOWERED="$(cd "$ROOT_DIR" && RT_KIT_WEIGHT_THRESHOLD="$WORK/threshold.json" node tools/check-kit-weight.mjs 2>&1; echo "exit $?")"
    report "a threshold below the measurement exits with 1" "$(printf '%s\n' "$LOWERED" | tail -1)" "exit 1"
    report "and names the set" "$(printf '%s\n' "$LOWERED" | grep -c 'the set grew')" "1"

    # The same measurement with the linking switched off: unlinked files carry a second copy of every
    # component, so the run must refuse instead of printing an overstated weight.
    UNLINKED="$(cd "$ROOT_DIR" && RT_KIT_WEIGHT_NO_LINK=1 node tools/check-kit-weight.mjs --print 2>&1; echo "exit $?")"
    report "without linking the check refuses and names the leftover" \
        "$(printf '%s\n' "$UNLINKED" | grep -c 'unlinked Angular calls are left in the set: ngDeclare') $(printf '%s\n' "$UNLINKED" | tail -1)" "1 exit 1"

    # One rule of the input styles, written once in the source: the measured code holds it once.
    ONCE="$(node --input-type=module -e "
        const { measure } = await import('$TOOLS/check-kit-weight.mjs');
        // The value is left out: the build of an application rewrites the names of the variables.
        const rule = ':is(.rt-input--appearance--fill,.rt-input--appearance--pill) .rt-input__floating-label{line-height:';
        console.log((await measure()).code.split(rule).length - 1);
    ")"
    report "a style of a kit component lands in the set once" "$ONCE" "1"
else
    echo "  skipped: the kit is not built here, there is nothing to measure"
fi

suite_result "check-kit-weight-live"
