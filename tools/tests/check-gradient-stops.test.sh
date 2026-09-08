#!/usr/bin/env bash
# The scenarios of the gradient check: what counts as a transition that draws nothing, and what the
# check keeps its hands off.
#
# Covers SC-UKV-129 of the spec `docs/specs/ui-kit-v2/tokens`.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "a gradient whose ends come out one colour"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-gradient-stops.mjs" "$TOOLS/tokens-looks.mjs" "$WORK/tools/"

STYLES="$WORK/projects/ui-kit-v2/src/styles"
COMPONENT="$WORK/projects/ui-kit-v2/src/lib/components/probe"
mkdir -p "$STYLES" "$COMPONENT"

: > "$STYLES/_primitives.scss"

# The three layers of the fixture, each the body of its mixin, and the styles of one component.
# The styling layer is written whole every time: the looks differ by exactly what stands in it.
layers() {
    printf '@mixin rt-theme-light-tokens {\n%b}\n' "$1" > "$STYLES/_semantic.scss"
    printf '@mixin rt-theme-dark-tokens {\n%b}\n' "$2" > "$STYLES/_theme-dark.scss"
    printf '@mixin rt-preset-material-tokens {\n%b}\n' "$3" > "$STYLES/_preset-material.scss"
}

styles() {
    printf '@layer rt-kit.components {\n    .rt-probe {\n        background: %b;\n    }\n}\n' "$1" \
        > "$COMPONENT/rt-probe.component.scss"
}

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-gradient-stops.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-gradient-stops.mjs" 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

counts() {
    local label="$1" pattern="$2" want="$3"
    report "$label" "$(node "$WORK/tools/check-gradient-stops.mjs" 2>&1 | grep -c -- "$pattern")" "$want"
}

# Two roles that meet on one paint in the light look and part in the dark one — the very case the
# check was created for.
MET='    --rt-color-bg-subtle: #e0e0e0;\n    --rt-color-border-default: #e0e0e0;\n'
PARTED='    --rt-color-bg-subtle: #e0e0e0;\n    --rt-color-border-default: #fafafa;\n'
DARK='    --rt-color-bg-subtle: #17181c;\n    --rt-color-border-default: #33383d;\n'

# --- the ends parted in every look -------------------------------------------------------------
layers "$PARTED" "$DARK" ''
styles 'linear-gradient(90deg, var(--rt-color-bg-subtle) 0%, var(--rt-color-border-default) 50%, var(--rt-color-bg-subtle) 100%)'
verdict "a transition parted in every look passes" "green"
says "and the count of what was judged is named" 'gradients with resolvable stops 1 in 4 looks'

# --- the ends met in the light look ------------------------------------------------------------
layers "$MET" "$DARK" ''
styles 'linear-gradient(90deg, var(--rt-color-bg-subtle) 0%, var(--rt-color-border-default) 50%, var(--rt-color-bg-subtle) 100%)'
verdict "a transition whose ends meet in one look is refused" "red"
says "and the refusal names the file and the line" 'rt-probe\.component\.scss:3'
says "and it names the look where they met" 'in the light look'
says "and it names the paint they came out as" 'rgb\(224 224 224\)'
says "and it names both ends" 'var\(--rt-color-bg-subtle\) → var\(--rt-color-border-default\)'
counts "and the dark look, where they part, stays out of it" 'in the dark look' "0"

# --- a repeated name is not two different ends -------------------------------------------------
# A wave is written as «rest, crest, rest»: the same name at both ends is the shape of a wave, not a
# flat fill. Counting the repetition as a second end would refuse every wave in the tree.
layers "$PARTED" "$DARK" ''
styles 'linear-gradient(90deg, var(--rt-color-bg-subtle) 0%, var(--rt-color-bg-subtle) 100%)'
verdict "one name at both ends is not judged at all" "green"
counts "and it does not get into the count of the judged" 'resolvable stops 1' "0"

# --- the preset brings the ends together --------------------------------------------------------
# The base set parts them, and the preset — a second layer of assignments — puts them back on one
# paint. A check that knew two themes would never see this.
layers "$PARTED" "$DARK" '    --rt-color-border-default: #e0e0e0;\n'
styles 'linear-gradient(90deg, var(--rt-color-bg-subtle) 0%, var(--rt-color-border-default) 100%)'
verdict "the ends brought together by the preset alone are refused" "red"
says "and the look named is the material one" 'in the material look'
counts "and the light look, where they part, stays out of it" 'in the light look' "0"

# --- the dark theme is stronger than the preset -------------------------------------------------
# Under the preset the dark theme keeps its answer, so the fourth look is not a repetition of the
# second: here the ends meet under the preset and part under the preset in the dark.
layers "$PARTED" "$DARK" '    --rt-color-border-default: #e0e0e0;\n'
styles 'linear-gradient(90deg, var(--rt-color-bg-subtle) 0%, var(--rt-color-border-default) 100%)'
counts "and the fourth look, which the dark theme reaches, stays out of it" 'in the material dark look' "0"

# --- a chain of references ----------------------------------------------------------------------
# An end can name an assignment that names another one. The paint lies at the end of the chain, and
# a check that stopped at the first link would let this through.
layers "$MET"'    --rt-color-probe-a: var(--rt-color-bg-subtle);\n    --rt-color-probe-b: var(--rt-color-border-default);\n' "$DARK" ''
styles 'linear-gradient(90deg, var(--rt-color-probe-a) 0%, var(--rt-color-probe-b) 100%)'
verdict "ends meeting at the end of a chain of references are refused" "red"

# --- a colour written on the spot ---------------------------------------------------------------
layers "$PARTED" "$DARK" ''
styles 'linear-gradient(90deg, #e0e0e0 0%, #e0e0e0 100%)'
verdict "a repeated literal is one end, not two" "green"
styles 'linear-gradient(90deg, #e0e0e0 0%, rgb(224, 224, 224) 100%)'
verdict "one paint written two ways is refused" "red"

# --- an end the check cannot resolve -------------------------------------------------------------
# A name nothing in the styling layer answers could well differ from its neighbour. A refusal on a
# guess would be worse than silence, so the whole gradient stays unjudged — and uncounted.
layers "$PARTED" "$DARK" ''
styles 'linear-gradient(90deg, var(--rt-color-bg-subtle) 0%, var(--rt-color-nobody-declared) 100%)'
verdict "an unresolvable end takes the whole gradient out of the judging" "green"
counts "and it does not get into the count of the judged" 'resolvable stops 1' "0"

# --- the direction is not an end ------------------------------------------------------------------
# The first argument can set the direction rather than a colour. Counted as an end, it would be
# unresolvable and would silently take every directed gradient out of the judging.
layers "$MET" "$DARK" ''
styles 'linear-gradient(to right, var(--rt-color-bg-subtle), var(--rt-color-border-default))'
verdict "the direction is dropped and the gradient is still judged" "red"
styles 'radial-gradient(circle at 50% 50%, var(--rt-color-bg-subtle), var(--rt-color-border-default))'
verdict "a round gradient with a place is judged the same" "red"

# --- a nested call ---------------------------------------------------------------------------------
# A shade counted from a colour holds a comma of its own inside. Split by every comma, its halves
# would become two ends of their own, and the gradient would be read as something it is not.
layers "$PARTED" "$DARK" ''
styles 'linear-gradient(90deg, color-mix(in srgb, var(--rt-color-bg-subtle) 50%, transparent) 0%, var(--rt-color-border-default) 100%)'
verdict "a comma inside a nested call does not split the ends" "green"

suite_result "a gradient whose ends come out one colour"
