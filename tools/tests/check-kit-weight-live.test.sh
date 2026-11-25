#!/usr/bin/env bash
# The live measurement of the kit weight check: it does not depend on the directory it runs from.
# Run in a temporary directory, it gives the very table it gives at the root. Only where the kit is
# built; elsewhere there is nothing to measure.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the live measurement of the kit weight"

ROOT_DIR="$(cd "$TOOLS/.." && pwd)"
if [ -f "$ROOT_DIR/dist/ui-kit-v2/fesm2022/rt-tools-ui-kit-v2-menu.mjs" ] && [ -d "$ROOT_DIR/dist/ui-kit-v2/styles" ]; then
    AT_ROOT="$(cd "$ROOT_DIR" && node tools/check-kit-weight.mjs --print)"
    ELSEWHERE="$(cd "$(mktemp -d)" && node "$TOOLS/check-kit-weight.mjs" --print)"
    report "the measurement from another directory equals the one at the root" "$ELSEWHERE" "$AT_ROOT"
fi

suite_result "check-kit-weight-live"
