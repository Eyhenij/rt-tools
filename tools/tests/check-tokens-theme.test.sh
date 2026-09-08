#!/usr/bin/env bash
# The scenarios of the theme check's contrast measurement: the looks a pair is counted in and what
# the refusal names.
#
# Covers SC-UKV-107 of the agreement `docs/specs/ui-kit-v2/proposed/material-preset`. The check does
# more than the contrast — the completeness of the dark answers, the scale, the component styles —
# and those articles were written before the preset; here only what the preset added is judged.
. "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

echo "the contrast of the pairs in four looks"

WORK="$(fixture_tree)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT

cp "$TOOLS/check-tokens-theme.mjs" "$TOOLS/tokens-looks.mjs" "$WORK/tools/"

STYLES="$WORK/projects/ui-kit-v2/src/styles"
mkdir -p "$STYLES" "$WORK/projects/ui-kit-v2/src/lib"

: > "$STYLES/_primitives.scss"
printf '{\n  "pairs": [\n    { "text": "--rt-color-text-primary", "bg": "--rt-color-bg-page", "where": "the page text" }\n  ]\n}\n' \
    > "$WORK/tools/tokens-contrast-pairs.json"

# The three layers of the fixture, each the body of its mixin. The base set is written whole every
# time: a mark of a shared colour is lawful only while the dark theme stays silent about the name,
# and the cases below differ by exactly that.
layers() {
    printf '@mixin rt-theme-light-tokens {\n%b}\n' "$1" > "$STYLES/_semantic.scss"
    printf '@mixin rt-theme-dark-tokens {\n%b}\n' "$2" > "$STYLES/_theme-dark.scss"
    printf '@mixin rt-preset-material-tokens {\n%b}\n' "$3" > "$STYLES/_preset-material.scss"
}

# Both names shared with the dark theme: it says nothing, and the marks are honest.
SHARED='    --rt-color-bg-page: #ffffff; /* rt-theme-shared: one colour in both themes */\n    --rt-color-text-primary: #767676; /* rt-theme-shared: one colour in both themes */\n'
# The same two names with the dark theme answering both: no marks, or they would be lies.
ANSWERED='    --rt-color-bg-page: #ffffff;\n    --rt-color-text-primary: #767676;\n'
DARK='    --rt-color-bg-page: #111111;\n    --rt-color-text-primary: #eeeeee;\n'

verdict() {
    local label="$1" want="$2" got
    if node "$WORK/tools/check-tokens-theme.mjs" >/dev/null 2>&1; then got="green"; else got="red"; fi
    report "$label" "$got" "$want"
}

says() {
    local label="$1" pattern="$2" got
    if node "$WORK/tools/check-tokens-theme.mjs" 2>&1 | grep -qE -- "$pattern"; then got="yes"; else got="no"; fi
    report "$label" "$got" "yes"
}

counts() {
    local label="$1" pattern="$2" want="$3"
    report "$label" "$(node "$WORK/tools/check-tokens-theme.mjs" 2>&1 | grep -c -- "$pattern")" "$want"
}

# --- the preset keeps the pair over the threshold ---------------------------------------------
# `#767676` on white is 4.55:1, `#6f6f6f` a shade darker — both over the threshold of 4.5:1.
layers "$SHARED" '' '    --rt-color-text-primary: #6f6f6f;\n'
verdict "a pair over the threshold in every look passes" "green"

# --- SC-UKV-107: the preset drops the pair under the threshold ---------------------------------
layers "$SHARED" '' '    --rt-color-text-primary: #999999;\n'
verdict "a pair the preset drops under the threshold is refused" "red"
says "and the refusal names both names" -- '--rt-color-text-primary on --rt-color-bg-page'
says "and it names the ratio and the threshold" '2\.8[0-9]:1 at the threshold 4\.5:1'
says "and it names the look, not the theme" 'in the material look'
counts "and the base set's own looks stay out of it" 'in the light look' "0"

# --- the fourth look is not a repetition of the second -----------------------------------------
# The dark theme answers the ink and the page, so under the preset the pair stays the dark one and
# holds; without the dark answer the same preset ink falls on the light page. That is the whole
# difference between the third look and the fourth.
layers "$ANSWERED" "$DARK" '    --rt-color-text-primary: #999999;\n'
counts "the dark answer wins over the preset in the fourth look" 'in the material dark look' "0"
says "while the third look, which the dark theme does not reach, falls" 'in the material look'

suite_result "the contrast of the pairs in four looks"
