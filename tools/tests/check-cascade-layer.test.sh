#!/usr/bin/env bash
# The scenarios of the cascade layer check: what it catches around the wrapper and what tells a
# deliberate move out from a miss.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the cascade layer check"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-cascade-layer.mjs" "$WORK/tools/"

LIB="$WORK/projects/ui-kit-v2/src/lib/probe"
STYLES="$WORK/projects/ui-kit-v2/src/styles"
mkdir -p "$LIB" "$STYLES"
printf '@layer rt-kit.vendor, rt-kit.base, rt-kit.components;\n' > "$STYLES/_layers.scss"

# A component's style file: the body inside the wrapper, the tail past it.
probe_file() {
    printf '@layer rt-kit.components {\n    .rt-probe {\n        color: var(--rt-text);\n    }\n}\n%s' "$1" \
        > "$LIB/probe.component.scss"
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-cascade-layer.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-cascade-layer.mjs" 2>&1 | grep -qE "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

# --- the wrapper ---------------------------------------------------------------------------
probe_file ''
verdict "a wrapped file without a tail passes" "green"

printf '.rt-probe {\n    color: red;\n}\n' > "$LIB/probe.component.scss"
verdict "a file without the wrapper is refused" "red"
says "and the refusal names the wrapper" 'the rules stand outside the layer'

# --- a rule before the wrapper -------------------------------------------------------------
printf '.rt-early {\n    color: red;\n}\n@layer rt-kit.components {\n    .rt-probe {\n        color: red;\n    }\n}\n' \
    > "$LIB/probe.component.scss"
verdict "a rule before the wrapper is refused" "red"
says "and the refusal names it" 'before the wrapper stands'

printf "@use '../mixins';\n@layer rt-kit.components {\n    .rt-probe {\n        color: red;\n    }\n}\n" \
    > "$LIB/probe.component.scss"
verdict "a sass declaration before the wrapper is lawful" "green"

# --- a rule after the wrapper --------------------------------------------------------------
probe_file '.rt-late {
    pointer-events: none;
}
'
verdict "a rule after the wrapper without the mark is refused" "red"
says "and the refusal names the mark" 'after the wrapper stands.*rt-layer-outside'

probe_file '/* rt-layer-outside: it argues with a non-layered rule of a foreign library. */
.rt-late {
    pointer-events: none;
}
'
verdict "a rule after the wrapper with the mark passes" "green"
says "and what is moved out is named by a number" 'moved out of the layer with the mark 1'

# An explanation does not count as a rule: otherwise a file header after the wrapper would read as a
# move out.
probe_file '/* Just an explanation at the end of the file. */
'
verdict "an explanation after the wrapper does not count as a rule" "green"

# The mark is judged in the tail rather than over the whole file: a word inside the wrapper does not
# allow a move out.
printf '@layer rt-kit.components {\n    /* rt-layer-outside */\n    .rt-probe {\n        color: red;\n    }\n}\n.rt-late {\n    pointer-events: none;\n}\n' \
    > "$LIB/probe.component.scss"
verdict "the mark inside the wrapper does not justify the tail" "red"

# --- the sublayer order --------------------------------------------------------------------
probe_file ''
printf '@layer rt-kit.base, rt-kit.components;\n' > "$STYLES/_layers.scss"
verdict "the sublayer order without vendor is refused" "red"
says "and the refusal names the order line" 'the sublayer order is not declared'

suite_result "the cascade layer check"
