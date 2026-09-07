#!/usr/bin/env bash
# The shared harness of the sets over this tree's checks. It is attached by
# `. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"`.
#
# Why the sets exist: the tree's checks read its files and answer with an exit code, and they are run
# on the tree itself — that is, on one set of inputs which is green today. What a check catches on an
# input the tree does not hold nobody knows: a broken line in it stays silent exactly until the day
# such an input appears.
#
# What is checked here is the MECHANICS of a check on a one-off tree, not the state of this repository.

TOOLS="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PASSED=0
FAILED=0

report() {
    if [ "$2" = "$3" ]; then
        PASSED=$((PASSED + 1))
        [ -n "$VERBOSE" ] && printf '  ok   %-58s %s\n' "$1" "$2"
    else
        FAILED=$((FAILED + 1))
        printf '  FAIL %-58s got %s, expected %s\n' "$1" "$2" "$3"
    fi
    return 0
}

# A one-off tree with this repository's checks: the checks themselves read the root from their own
# file, so they are copied into the fixture rather than called from here. It prints the path.
fixture_tree() {
    local dir
    dir="$(mktemp -d)"
    mkdir -p "$dir/tools" "$dir/.claude/rt-kit"
    cp "$TOOLS/rt-kit-checks.config.mjs" "$dir/tools/"
    printf '{\n  "accepted": {}\n}\n' > "$dir/tools/cascade-layer-allowlist.json"
    printf '%s' "$dir"
}

suite_result() {
    printf '%s: %d ok, %d failures\n' "$1" "$PASSED" "$FAILED"
    [ "$FAILED" -eq 0 ]
}
